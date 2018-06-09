
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

    it(`must create the TodoItem from text then a datetime`, () =>
    {
        return testChain(
            workflow.openApplication(),
            workflow.clickTodoItemCreateButton(),
            workflow.clickTimeTag(),
            workflow.setTodoItemText(),
            workflow.clickValidationButton()
        )
    })

    it(`must create the TodoItem from a datetime then text`, () =>
    {
        return testChain(
            setChainProps({ runTests : false }),     // Turn testing off to prevent duplicate snapshots
            workflow.openApplication(),
            workflow.clickTodoItemCreateButton(),
            setChainProps({ runTests : true }),     // Turn testing back on
            workflow.clickTimeTag(),
            workflow.setTodoItemText(),
            workflow.clickValidationButton()
        )
    })
})
```

**GitHub coming soon**

## Table of Content

- [Installation](#installation)
- [API](#api)
    - [`createTestChain`](#createTestChain)
    - [`createTestChainSync`](#createTestChainSync)
    - [`setChainProps`](#setChainProps)
- [Workflows](#workflows)
- [How to write tests](#how-to-write-tests)
- [License](#license)

## Installation

The test-scenarii package is distributed via npm. To install it, run:

```
npm install -D test-scenarii
```

The package will be installed in the `devDependencies`, alongside the test-runner you want to use it with, whether Jest, Jasmine or Mocha.

## API

### `createTestChain`

Here's some blabla

```js
// Initialize the chain with one set of props, no matter how many times it's used
testChain = createTestChain({ runTests : true })

// or

// Initialize the chain with a prop getter, which will be called everytime the chain is started
// This allows for some room in the initialization of the props in subsequent chains // fixme: why not create a new chain?
const uuid = require('uuid/v4')
const getProps = () => ({ testRunUUID : uuid() })

let testChain = null

beforeAll( () =>
{
    testChain = createTestChain(getProps)
}

it(`uses the created chain for the first time`, () =>
{
    return testChain( (ctx) =>
    {
        console.log(ctx.props.testRunUUID)      // A v4 UUID
    })
})

it(`uses the created chain for the first time`, () =>
{
    return testChain( (ctx) =>
    {
        console.log(ctx.props.testRunUUID)      // A totally different v4 UUID
    })
})
```

### `createTestChainSync`

Exactly the same as `createTestChain()`, except it only handle synchronous test steps

```js
describe(`Setting datetime then text`, () =>
{
    // fixme: provide examples ?
}
```

### `setChainProps`

Here's some blabla

```js
describe(`Setting datetime then text`, () =>
{
    
}
```

## License

MIT