
## Current

Nested workflows!!

Refactor to have named functions

Put back the prop getter in place of a prop object?
`const getProps = () => ({ someProperty : 'some value' })`
Is there a use case for this?







## Test Factory Version

testChain = createTestChain({
	runTests : true,
	testFactory : it 	// wait, testFactory isn't a prop
})

testChain = createTestChain(it, { runTests : true })
or:
testChain = createTestChain({ testFactory : it }, { runTests : true })
=> createTestChain( settings, props )

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

NEW APIs AVAILABLE AT:

const { createTestChain, setChainProps } = require('test-scenarii/async')
const { createTestChain, setChainProps } = require('test-scenarii/sync')

BUT IS THAT EVEN RELEVANT WITH THE TESTFACTORY WAY ??

// also:

Init testChain() with a { testFactory : it/test } and directly use this !
The test text will be the name of the function, which means test steps must be named functions
	=> Throw at init if function.name is empty
Prefix the name of the function with the index in the chain in case an action exists multiple times

Throw if testChain is called inside a it instead of a describe
	=> How the hell do I determine this??

That's a v1.0 right there!

See what Jest has to say when a test/it is called from within a test/it
