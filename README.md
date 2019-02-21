
# test-scenarii

This package offers a way to write scenarized tests with maximum flexibility and code reuse, while retaining great readability.  

The classic use case is to run several tests with very similar workflows — only with a twist each time.  

Here's an example with a Todo App, where the creation of a TodoItem can be done 2 different ways: by setting a timestamp first, then the text or vice versa.  

```js
const { createTestChain, setChainProps } = require('test-scenarii')

const workflow = require('./workflow.js')

describe(`Setting datetime then text`, () =>
{
    let testChain = null

    beforeAll( () =>
    {
        const browser = /* a puppeteer browser */
        const page = /* the current page */
        const webServicesURL = /* the test-only URL for webservices */

        testChain = createTestChain({ browser, page, webServicesURL }, { takeScreenshots : true })
    })

    it(`must create a TodoItem, by setting its text first, then the firedate`, () =>
    {
        return testChain(
            workflow.openApplication(),
            workflow.clickTodoItemCreateButton(),
            workflow.clickTimeTag(),
            workflow.setTodoItemText(),
            workflow.clickValidationButton()
        )
    })

    it(`must create a TodoItem, by setting its firedate first, then the text`, () =>
    {
        return testChain(
            workflow.openApplication(),
            workflow.clickTodoItemCreateButton(),
            workflow.setTodoItemText(),                     // Notice clickTimeTag() and setTodoItemText()
            workflow.clickTimeTag(),                        // are inverted here, compared to the previous test
            workflow.clickValidationButton()
        )
    })
})
```


## Table of Content

- [Installation](#installation)
- [API](#api)
    - [`createTestChain()`](#createtestchain)
    - [`createTestChainSync()`](#createtestchainsync)
    - [`setChainProps()`](#setchainprops)
    - [`.nested()`](#.nested)
- [Test Steps](#test-steps)
- [Cookbook](#cookbook)
    - [`Prevent redundant tests`](#prevent-redundant-tests)
    - [`Communication between tests`](#communication-between-tests)
- [License](#license)

## Installation

The test-scenarii package is distributed via npm. To install it, run:

```
npm install -D test-scenarii
```

The package will be installed in the `devDependencies`, alongside the test-runner you want to use it with, whether Jest or Mocha.

## API

The library exposes only a few functions:  

### `createTestChain`

`createTestChain()` creates and initializes an asynchronous test chain with a context and a set of props. The returned chain can be un multiple times with different test steps.  

See [`createTestChainSync()`](#createTestChainSync) for the synchronous version.  

`createTestChain()` and `createTestChainSync()` offer 2 ways to handle prop initialization: via a simple object or a prop getter.  

The new API acknowledges that the props passed from test to test have different update rates: some of them don't have a reason to change (references to the browser, the webservices URL, etc), while others are meant to be updated as a way to communicate between test steps (whether to takeScreenshots or not).  
- The first parameter, the `context`, isn't meant to be updated, which is why `Object.freeze()` is used on the `context`. Because `Object.freeze()` only freezes shallowly, it's still possible to change context values at a deeper level. The freeze is only there to safeguard against a distraction mistake.  
- The second parameter, `props`, is meant as a high-frequency channel between test steps. Its values can be updated by simply returning an object from the test step; this object is shallow merged with the props that were passed to the test step.  


### `createTestChainSync`

`createTestChainSync()` works exactly the same as `createTestChain()`, except it only handles synchronous test steps :

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

While udpating props is done primarily from inside the test steps, it can be super convenient to set some props from the outside. At the very least, it can help readability at times.  

```js
let testChain = createTestChain({}, { runProfiling : false })

it(`makes no difference whether you use setChainProps() or a regular test step`, () =>
{
    testChain(
        (ctx, props) => console.log(props.runProfiling),         // Prints: false
        setChainProps({ runProfiling : true }),
        (ctx, props) => console.log(props.runProfiling),         // Prints: true
    )
}
```

The `setChainProps()` helper is actually implemented as an empty test step: it has no testing or action inside, but returns the new values for the passed props.

### `.nested`

The `.nested()` helper is available in both synchronous and asynchronous versions (`createTestChain.nested()` and `createTestChainSync.nested()`). It creates and initializes a test chain with a context and props, as well as a lsit of test steps, but doesn't run it immediately.  
Instead, it can be injected as if it was a regular test step.

```js
const testChain = createTestChain(null, { count : 0 })

it(`should run a nested test chain as if it was any other test step`, () =>
{
    // Create and cache a secondary chain. It will inherit the context and the props when the time comes
    const nestedChain = createTestChainSync.nested(
        (ctx, props) =>
        {
            return { count : props.count + 2 }
        },

        (ctx, props) =>
        {
            return { count : props.count + 2 }
        }
    )

    // Run the primary chainm which will execute the nested chain in between regular test steps
    return testChain(
        (ctx, props) =>
        {
            return { count : props.count + 1 }                  // props.count: 0 => 1
        }),

        nestedChain,                                            // props.count: 1 => 3 => 5

        (ctx, props) =>
        {
            return { count : props.count + 1 }                  // props.count: 5 => 6
        },

        (ctx, props) =>
        {
            expect(props.count).toBe(6)
        }
    )
})
```

## Test Steps

The way the test steps are structured is key. The bare minimum they should do is separate the action they perform from the test they perform, in a way to is prop-controlled.  

A test step should return a function which accepts 2 objects as its parameters (`ctx` and `props`). Although anonymous functions will work, named functions are recommended, as they will improve the readability of errors when they occur.

Examples use Puppeteer to navigate a project via Chromium instance.  

Test steps can be made parametric via the following pattern:

```js
function clickTimeTag (timeTag)
{
    return async function clickTimeTagAndTest (ctx, props) =>
    {
        // The Action
        await ctx.page.click(`button[data-time-tag=${timeTag}`)
        await wait(300)

        // The Test
        if (props.runTests)
        {
            // Snapshot-test the UI (toggleable at will via context props)
            const html = await ctx.page.$eval('.whole-panel', (el) => el.outerHTML)
            expect(html).toMatchSnapshot()
        }

        // Another Test
        if (props.runTests && props.takeScreenshots)
        {
            // Screenshot-test the UI (also toggleable at will via context props)
            await ctx.page.screenshot({ path : `clickTimeTag-${Date.now()}` })
        }
    }
}
```

Can be used via the following test chain:

```js
const page = await browser.newPage()
await page.goto('http://localhost:3000')

const testChain = createTestChain({ /* ctx */ page }, { /* props */ runTests : true,  takeScreenshots : false })
```

## Cookbook

###  Prevent redundant tests
Avoid duplicate snapshots or screenshots

### Communication between tests
- Communciation between tests (createEvent() adds a uuid prop, and then the next step use that uuid to do something, like selectEvent())
    - Ensure it's clear that selectEvent() can either take a uuid parmeter or find one in the props


## License

MIT