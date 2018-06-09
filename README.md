
# test-scenarii

This package offers a way to maximize code reuse within tests, while retaining great readability.

## Installation

The test-scenarii package is distributed via npm. To install it, run:

```
    npm install -D test-scenarii
```

The package will be installed in the `devDependencies`, alongside the test-runner you want to use it with, whether Jest, Jasmine or Mocha.

## How to write tests with test-scenarii

For our example, we'll take the case of a basic todo application. To create a todo item, the user needs to:
- Get to the application
- Access the page where the todo items are created
- Add both a timestamp and some text
- Click on the creation button

It's a fair assumption that the 1st version of the tests will look like this:

```js
    // 1
    it(`must render the initial page properly`, workflow.openApplication() )

    // 2
    it(`must access the TodoItem creation page`, workflow.clickTodoItemCreateButton() )

    // 3
    it(`must add some text for the TodoItem`, workflow.setTodoItemText() )

    // 4
    it(`must tag the todo with a relative timestamp`, workflow.clickTimeTag() )

    // 5
    it(`must create the TodoItem`, workflow.clickValidationButton() )
```

Actually, the 1st version probably has the tests inlined insite the `it` statements. But step one of code reuse was to move them in functions, so we did that.  

In order to somewhat exhaustive testing, however, we also need to test the exact same workflow, only with steps 3 and 4 inverted: the user first sets the timestamp, then the text. Nothing prevents you from copy-pasting the whole block of `it` statements.  

The Problem is that, before execution reaches the parts that interests you in this new test, you will have tested 1 and 2 again, and for nothing: they've already been tested, and it created duplicate snapshots.  

Increase the complexity of the process ever slightly, and you will end up with *a lot* of duplicates.  

The Solution is to rewrite the initial test (where the user sets the text then the timestamp) as such:

```js

    const { createTestChain, setChainProps } = require('test-scenarii')

    describe(`Setting text then datetime`, () =>
    {
        let testChain = null

        beforeAll( () =>
        {
            const getProps = () => ({ runTests : true })

            testChain = createTestChain(getProps)
        })

        it(`must render the initial page properly`, () =>
        {
            return testChain(
                workflow.openApplication()
            )
        })

        it('must access the TodoItem creation page', () =>
        {
            return testChain(
                workflow.clickTodoItemCreateButton()
            )
        })

        it('must add some text for the TodoItem', () =>
        {
            return testChain(
                workflow.setTodoItemText()
            )
        })

        it('must tag the todo with a relative timestamp', () =>
        {
            return testChain(
                workflow.clickTimeTag()
            )
        })

        it(`must create the TodoItem`, () =>
        {
            return testChain(
                workflow.clickValidationButton()
            )
        })
    })
```

Okay, so far we've made that initial test longer.  

But then the second test gets to be written like this:

```js
    describe(`Setting datetime then text`, () =>
    {
        let testChain = null

        beforeAll( () =>
        {
            const getProps = () => ({ runTests : false })

            testChain = createTestChain(getProps)
        })

        it(`must create the TodoItem`, () =>
        {
            return testChain(
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

We have skipped the snapshot-testing for the first 2 steps, then resumed testing whenever it became interesting again.  

Also, the high-level vue of this second test is great.

## License

MIT