
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

## Why not just use functions?

Any real-life test workflow will rely on information being shared among individual tests. When using vanilla functions, this information (most of it details), will have to be lifted back up to the caller, before being passed to the next function.  
This leads to the accumulation of a lot noise at the top, right where we want a clear outline of what the test does. This clarity is needed in order to catch (at a glance) what the differences are between entiere series of similar workflows.  

`test-scenarii` offers this clarity by providing a means for tests steps to communicate with each others while only exposing crucial information at the top.  


## Table of Content

- [Installation](#installation)
- [API](#api)
    - [`createTestChain()`](#createtestchain)
    - [`createTestChainSync()`](#createtestchainsync)
    - [`setChainProps()`](#setchainprops)
    - [`.cached()`](#.cached)
- [Test Steps](#test-steps)
    - [What they are](#what-they-are)
    - [How to write one](#how-to-write-one)
- [Cookbook](#cookbook)
    - [`Prevent redundant tests`](#prevent-redundant-tests)
    - [`Communication between tests`](#communication-between-tests)
    - [`Conditional test steps`](#conditional-test-steps)
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
- The first parameter, the `context`, is the one not meant to be updated. `Object.freeze()` is used on the `context` as soon as it is passed to the chain creator. Because `Object.freeze()` only freezes shallowly, it is still possible to change context values at a deeper level. The freeze is only there to safeguard against a distraction mistake.  
- The second parameter, `props`, is meant as a channel between test steps. Its values can be updated by simply returning an object from the test step; this object is shallow merged with the exisiting props and passed to the next test step.  


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

While updating props is done primarily from inside the test steps, it can be super convenient to set some props from the outside. At the very least, it can help readability at times.  

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

    // Run the primary chain, which will execute the cached chain in between regular test steps
    return testChain(
        (ctx, props) => ({ count : props.count + 1 }),          // props.count: 0 => 1
        cachedChain,                                            // props.count: 1 => 3 => 5
        (ctx, props) => ({ count : props.count + 1 }),          // props.count: 5 => 6
        (ctx, props) => expect(props.count).toBe(6)
    )
})
```

## Test Steps

### What they are

A test step is simply a function, which accepts 2 objects as its parameters (`ctx` and `props`).  

Anything else will cause an error to be thrown, with the exception of `null`: when encountering a `null` test step, test-scenarii will silently skip it. This facilitates the use of [conditional test steps](#conditional-test-steps).  

Anonymous functions will work, but named functions are recommended: their name will appear in error messages, which improves debuggability.  

### How to write one

The way the test steps are written is key. In order to maximize flexibility and reuse, it's a good practice to separate the action they perform from the test(s). Running the tests should be conditioned via props such as `runTests` or `takeScreenshots`. This will allow high level test chains to reuse low-level ones without necessarily re-performing all the tests they list. This is of course highly dependent on the knowledge the developer has of what is susceptible to fail when performing specific actions.  

The following example use Puppeteer to navigate a project.  

```js
module.exports =
{
    clickTimeTag (timeTag)
    {
        return async function clickTimeTag (ctx, props) =>
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

    // [...] Other test steps
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

If the test steps are written properly, the testing, which is prop-controlled via `runTests`, and the screenshot-taking, which is prop-controlled via `takeScreenshots`, is going to be bypassed the second time around. Although this is a contrived example, it is clear how it will save time and resources in the case of numerous scenarii sharing a common base.

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

### Conditional test steps

When creating test chains, it can be convenient to condition some steps. It can be done easily, thanks to `null` being a valid value for a test step.  
Here's an example with a parameterized cached test chain:

```js
/**
 * Create a todo with text and a timetag. Optionally close the panel
 * @param {object} options
 * @param {string} options.text
 * @param {string} options.timeTag
 * @param {boolean} [options.validateCreation]
 */
function createTodoItem (options = {})
{
    const { text, timeTag, validateCreation : true } = options

    return createTestChain.cached(
        testStep.clickTodoItemCreateButton(),
        testStep.clickTimeTag(timeTag),
        testStep.setTodoItemText(text),
        validateCreation ? testStep.clickValidationButton() : null
    )
}
```

This cached test chain can be used in 2 different ways:

```js
it(`should create a todo item`, () =>
{
    return testChain(
        testStep.openApplication(),
        testStep.createTodoItem({ text : 'The laundry!', timetag : 'yesterday', validateCreation : true })
        (ctx, props) =>
        {
            // Perform some checks

        }
    )
}

it(`should cancel right before creating a todo item`, () =>
{
    return testChain(
        testStep.openApplication(),
        testStep.createTodoItem({ text : 'The laundry!', timetag : 'yesterday', validateCreation : false })
        testStep.clickCancelButton()
        (ctx, props) =>
        {
            // Perform some checks

        }
    )
}
```

## License

test-scenarii is distributed under MIT license