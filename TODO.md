
## Current

Nested workflows!!

Put back the prop getter in place of a prop object?
`const getProps = () => ({ someProperty : 'some value' })`
Is there a use case for this?

Update docs

Write sync version !!







## Test Factory Version

```javascript

testChain = createTestChain(it, { /* context */ }{ /* props */ }) ?

// Then:

describe(`must create the TodoItem from a datetime then text`, () =>
{
	testChain(
		setChainProps({ runTests : false }),     // Turn testing off to prevent duplicate snapshots
		workflow.openApplication(),
		workflow.clickTodoItemCreateButton(),
		setChainProps({ runTests : true }),     // Turn testing back on
		workflow.clickTimeTag(),
		workflow.setTodoItemText(),
		workflow.clickValidationButton()
	)
})
```

Because each test step is a test itself, error throwing is handled by the test-runner...

Should we forbid anonymous functions?
  => Throw at init if function.name is empty??

Should we prefix the name of the function with the index in the chain, in case an action exists multiple times ?

Throw if testChain is called inside a it instead of a describe
  => How the hell do I determine this??
  => See what Jest has to say when a test/it is called from within a test/it

See how Mocha would react to this
