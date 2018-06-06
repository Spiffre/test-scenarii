

## Include examples from react-ataraxia

```js
    // All workflow functions are asynchronous

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

What if then you want to test a similar workflow, only with picking a timestamp first and only then entering the text? (inverting steps 3 and 4) Well, one way to do it is to duplicate all of the above and inverting the last two: 'must tag the todo with a relative timestamp' and 'must add some text for the TodoItem'  

The Problem:  
Before you reach the test you actually want to perform (the inversion of 3 and 4), you will have tested 1 and 2 again, and for nothing: they've already been tested, and you have created duplicate snapshots.  

Increase the complexity of the process ever slightly, and you will end up with *a lot* of duplicates.  

The Solution:  

```js

    describe(`Setting text then datetime`, () =>
    {
        const getProps = () => ({ runTests : true })
        let testChain = null

        beforeAll( () =>
        {
            testChain = createTestChain(getProps)
        })

        it(`must render the initial page properly`, async () =>
        {
            await testChain(
                workflow.openApplication()
            )
        })

        it('must access the TodoItem creation page', async () =>
        {
            await testChain(
                workflow.clickTodoItemCreateButton()
            )
        })

        it('must add some text for the TodoItem', async () =>
        {
            await testChain(
                workflow.setTodoItemText()
            )
        })

        it('must tag the todo with a relative timestamp', async () =>
        {
            await testChain(
                workflow.clickTimeTag()
            )
        })

        it(`must create the TodoItem`, async () =>
        {
            await testChain(
                workflow.clickValidationButton()
            )
        })
    })
```

So far, this library is pretty useless.  

But then:

```js
    describe(`Setting datetime then text`, () =>
    {
        const getProps = () => ({ runTests : false })
        let testChain = null

        beforeAll( () =>
        {
            testChain = createTestChain(getProps)
        })

        it(`must create the TodoItem`, async () =>
        {
            await testChain(
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

You can of course inline a testStep

```js
    it(`must create the TodoItem`, async () =>
    {
        await testChain(
            workflow.openApplication(),
            workflow.clickTodoItemCreateButton(),
            setChainProps({ runTests : true }),     // Turn testing back on
            workflow.clickTimeTag(),
            workflow.setTodoItemText(),

            // Inlined test step
            (testContext) =>
            {
                // fixme: do something, but what
                const someCondition = true
                
                // Optionally return updated prop values which will be merged into the context before the execution of the following test steps
                // Note: only props which existed in getProps()'s return value can be set. Others will cause an error to be thrown
                return { runTest : someCondition }
            },

            workflow.clickValidationButton()
        )
    })
```