
# test-scenarii

This package offers a way to write scenarized tests with maximum flexibility and code reuse, while retaining great readability.  

The classic use case is to run several tests with very similar workflows — only with a twist each time.  

Here's an example with a Todo App, where the creation of a TodoItem can be done 2 different ways: by setting a timestamp first, then the text or vice versa.  

```js
const { createTestChain, setChainProps } = require('test-scenarii')

describe(`Setting datetime then text`, () =>
{
    let testChain = null

    beforeAll( () =>
    {
        testChain = createTestChain({ runTests : true })
    })

    it(`must create the TodoItem from text then a datetime`, async () =>
    {
        await testChain(
            testStep.openApplication(),
            testStep.clickTodoItemCreateButton(),
            testStep.clickTimeTag(),
            testStep.setTodoItemText(),
            testStep.clickValidationButton()
        )
    })

    it(`must create the TodoItem from a datetime then text`, async () =>
    {
        await testChain(
            setChainProps({ runTests : false }),     // Turn testing off to prevent duplicate snapshots
            testStep.openApplication(),
            testStep.clickTodoItemCreateButton(),
            setChainProps({ runTests : true }),     // Turn testing back on
			testStep.setTodoItemText(),             // Notice clickTimeTag() and setTodoItemText()
			testStep.clickTimeTag(),                // are inverted here, compared to the previous test
            testStep.clickValidationButton()
        )
    })
})
```

**GitHub coming soon**

## Table of Content

- [Installation](#installation)
- [API](#api)
    - [`createTestChain`](#createtestchain)
    - [`createTestChainSync`](#createtestchainsync)
    - [`setChainProps`](#setchainprops)
- [Test Steps](#test-steps)
- [License](#license)

## Installation

The test-scenarii package is distributed via npm. To install it, run:

```
npm install -D test-scenarii
```

The package will be installed in the `devDependencies`, alongside the test-runner you want to use it with, whether Jest, Jasmine or Mocha.

## API

### `createTestChain`

`createTestChain()` initializes a test chain with a set of props. The returned chain can be used several times in a row.  

It works asynchronously as a default. See [`createTestChainSync()`](#createTestChainSync) for the synchronous version.  

`createTestChain()` and `createTestChainSync()` offer 2 ways to handle prop initialization: via a simple object or a prop getter.

```js
// Initialize the chain with one set of props, no matter how many times it's used
testChain = createTestChain({ runTests : true })

// or

// Initialize the chain with a prop getter, which will be called everytime the chain is started
// This allows for some room in the initialization of the props in subsequent chains
const uuid = require('uuid/v4')
const getProps = () => ({ testRunUUID : uuid() })

let testChain = null

beforeAll( () =>
{
    testChain = createTestChain(getProps)
}

it(`uses the created chain for the first time`, async () =>
{
    await testChain( (ctx) =>
    {
        console.log(ctx.props.testRunUUID)      // A v4 UUID
    })
})

it(`uses the created chain for the second time`, async () =>
{
    await testChain( (ctx) =>
    {
        console.log(ctx.props.testRunUUID)      // A totally different v4 UUID
    })
})
```

### `createTestChainSync`

`createTestChainSync()` works exactly the same as `createTestChain()`, except it only handles synchronous test steps

```js
it(`should work exactly the same, except synchronously`, () =>
{
    testChain(
        testStep.some(),
        testStep.synchronous(),
        testStep.sequence(),
        testStep.of(),
        testStep.actions()
    )
})
```

### `setChainProps`

The `setChainProps()` helper updates prop values somewhere along the chain.  

Props can be updated by simply returning an object from any test step (it's actually how it's implemented); it improves readability however, to have them as a distinct step in the chain.

```js
it(`makes no difference whether you use setChainProps() or a regular test step`, () =>
{
    testChain(
        setChainProps({ runTests : false })
    )

    // is exactly the same as:

    testChain(
        (ctx) => ({ runTests : false })
    )
}
```

## Test Steps

The way the test steps are structure is key. The bare minimum they should do is separate the action they perform from the test they perform, in a way to is prop-controlled.  

Examples use Puppeteer to navigate a project via Chromium instance.  

Test steps can be made parametric via the following pattern:

```js
// The following test step:
export function clickTimeTag (timeTag)
{
    return async (ctx) =>
    {
        // The Action
        await ctx.props.page.click(`button[data-time-tag=${timeTag}`)
        await wait(300)

        // The Test: snapshot-test the UI (toggleable at will via context props)
        if (ctx.props.runTests)
        {
            const renderedHTML = await ctx.props.page.$eval('.whole-panel', (el) => el.outerHTML)
            expect( renderedHTML ).toMatchSnapshot()
        }

        // Another Test: screenshot-test the UI (also toggleable at will via context props)
        if (ctx.props.runTests && ctx.props.takeScreenshots)
        {
            await ctx.props.page.screenshot({ path : `clickTimeTag-${Date.now()}` })
        }
    }
}

// Can be used via the following test chain:

const page = await browser.newPage()
await page.goto('http://localhost:3000')

const testChain = createTestChain(
{
    runTests: true,
    takeScreenshots: false,
    page: page
})
```

## License

MIT