
# test-scenarii

This package offers a way to write scenarized tests with maximum flexibility and code reuse, while retaining great readability.  

The classic use case is to run several tests with very similar workflows — only with a twist each time.  

Here's an example with a Todo App, where the creation of a TodoItem can be done 2 different ways: by setting a timestamp first, then the text or vice versa.  

```js
const { createTestChain, setChainProps } = require('test-scenarii')

const testStep = require('./test-steps.js')

describe(`Setting datetime then text`, () =>
{
    let testChain = null

    beforeAll( () =>
    {
        const browser = /* a puppeteer browser */
        const page = /* the current page */
        const webServicesURL = /* the test-only URL for webservices */

        testChain = createTestChain({ browser, page, webServicesURL }, {})
    })

    it(`must create a TodoItem, by setting its text first, then the firedate`, () =>
    {
        return testChain(
            testStep.openApplication(),
            testStep.clickTodoItemCreateButton(),
            testStep.clickTimeTag(),
            testStep.setTodoItemText(),
            testStep.clickValidationButton()
        )
    })

    it(`must create a TodoItem, by setting its firedate first, then the text`, () =>
    {
        return testChain(
            testStep.openApplication(),
            testStep.clickTodoItemCreateButton(),
            testStep.setTodoItemText(),                     // Notice clickTimeTag() and setTodoItemText()
            testStep.clickTimeTag(),                        // are inverted here, compared to the previous test
            testStep.clickValidationButton()
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
    - [`.cached()`](#.cached)
- [Writing Test Steps](#writing-test-steps)
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

`createTestChain()` creates and initializes an asynchronous test chain with a context and a set of props. The returned chain can be run multiple times with different test steps.  

See [`createTestChainSync()`](#createTestChainSync) for the synchronous version.  

The new API acknowledges that the props passed from test to test have different update rates: some of them have no reason to change (references to the browser, the webservices URL, etc), while others are meant to be updated as a way to communicate between test steps (whether to takeScreenshots or not, to run tests, some data created in a test step reused in another, etc).  
- The first parameter, the `context`, is the one not meant to be updated. `Object.freeze()` is used on the `context` as soone as it's passed to the chain creator. Because `Object.freeze()` only freezes shallowly, it's still possible to change context values at a deeper level. The freeze is only there to safeguard against a distraction mistake.  
- The second parameter, `props`, is meant as a channel between test steps. Its values can be updated by simply returning an object from the test step; this object is shallow merged with the pre-exisiting props and passed to the next test step.  


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
Notice the absence of the `return` keyword before the call to `testChain()`: a test chain ends up returning the final value of the `props` object, possibly modified by each test step. But Jest will throw an error if anything other than `undefined` or a Promise is returned from a test.

### `setChainProps`

The `setChainProps()` helper updates prop values somewhere along the chain—but from the outside.  

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

### `.cached`

The `.cached()` helper is available on both versions: `createTestChain.cached()` and `createTestChainSync.cached()`. It creates and initializes a test chain with only a list of test steps, and doesn't run it immediately.  
Instead, it can be injected as if it were a regular test step. The `context` and `props` passed inside this cached chain are inherited from the previous test step.

```js
const testChain = createTestChain(null, { count : 0 })

it(`should run a cached test chain as if it were any other test step`, () =>
{
    // Create and cache a secondary chain. It will inherit the context and the props when the time comes
    const cachedChain = createTestChainSync.cached(
        (ctx, props) => ({ count : props.count + 2 }),
        (ctx, props) => ({ count : props.count + 2 })
    )

    // Run the primary chainm which will execute the cached chain in between regular test steps
    return testChain(
        (ctx, props) => ({ count : props.count + 1 }),          // props.count: 0 => 1
        cachedChain,                                            // props.count: 1 => 3 => 5
        (ctx, props) => ({ count : props.count + 1 }),          // props.count: 5 => 6
        (ctx, props) => expect(props.count).toBe(6)
    )
})
```

## Writing Test Steps

The way the test steps are written is key. The bare minimum they should do is separate the action they perform from the test(s), in a way to is prop-controlled.  

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

In our initial example, note that the first steps (`openApplication()` and `clickTodoItemCreateButton()`) occur in both tests. They themselves contain expect statements, possibly snapshot or screenshot comparison tests. Written as they are, those tests steps will generate identical screenshots or snapshots.  
There's an easy way to prevent that:

```js
    beforeAll( () =>
    {
        const browser = /* a puppeteer browser */
        const page = /* the current page */
        const webServicesURL = /* the test-only URL for webservices */

        testChain = createTestChain({ browser, page, webServicesURL }, { runTests : true, takeScreenshots : true })
    })

    it(`must create a TodoItem, by setting its text first, then the firedate`, () =>
    {
        return testChain(
            testStep.openApplication(),
            testStep.clickTodoItemCreateButton(),
            testStep.clickTimeTag(),
            testStep.setTodoItemText(),
            testStep.clickValidationButton()
        )
    })

    it(`must create a TodoItem, by setting its firedate first, then the text`, () =>
    {
        return testChain(
            setChainProps({ runTests : false, takeScreenshots : false })
            testStep.openApplication(),
            testStep.clickTodoItemCreateButton(),
            setChainProps({ runTests : true, takeScreenshots : true })
            testStep.setTodoItemText(),                     // Notice clickTimeTag() and setTodoItemText()
            testStep.clickTimeTag(),                        // are inverted here, compared to the previous test
            testStep.clickValidationButton()
        )
    })
```

If the test steps are written properly, the testing, which is prop-controlled via `runTests`, and the screenshot-taking, which is prop-controlled via `takeScreenshots`, is going to be bypassed the second time around. Although this is a contrieved example, it is clear how it will save time and resources in the case of numerous scenarii sharing a common base.

### Communication between tests

Often enough, a test step is going to result in applicative-side data being generated, and that information will be needed by as subsequent test step. Let's take the example of generated UUID.

```js

function createTodoItem ({ text, timestamp })
{
    return async function createTodoItem_TS (ctx, props) =>
    {
        // Create the todo item
        // [...]

        // Get the most recently created item
        const latestTodoItem = services.TodoManager.getLatest()
        
        // Return its UUID
        return {
            createdItemUUID : latestTodoItem.uuid
        }
    }
}

function selectTodoItem ()
{
    return async function selectTodoItemByUUID_TS (ctx, props) =>
    {
        const selector = `li[data-uuid=${props.createdItemUUID}`
        await ctx.page.click(selector)
    }
}
```

This lets any test chain handle a "previously created" todo item, without having itself any knowledge of the UUID.


## License

MIT