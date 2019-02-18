
## Current

But, if the context is frozend and can't be changed, and the props can, do we still need the mergeProps() check-up ?

createTestChain(context, props)
ctx.page.click(SELECTOR)
ctx.props.takeScreenshots)

Refactor to have named functions

Reconfigure tests to point to the `npm run dev` version
Is there in Rollup a write-file-devserver??

Put back the prop getter in place of a prop object?
`const getProps = () => ({ someProperty : 'some value' })`
Is there a use case for this?

Nested workflows!!


## From Before 

https://github.com/mattphillips/jest-each
https://docs.npmjs.com/misc/developers : npmignore/gitignore
https://babeljs.io/docs/usage/cli/


v2 can't work because, by relying on the underlying it/test, we save some code in terms of scheduling,
but we can't return props and update context.

Updates for test-scenarii

0.4:0: 
- Add the names function option; default to numbered log and a warning that it would be better with named functions
- Update the docs to explain naming 
- Add CHANGELOG file

v0.5.0:
- Add new API under /experimental
- Create a describe() which takes the string provided by the user. Have a beforeAll() which caries the context for the whole block and have a beforeEach() if needed.
- Most importantly: don’t call the function for each test step directly: call it via high-order function which captures the returned value and updates the context if needed, the returns the Promise if it is one. 
- Curry settings/props init because it’s not the same frequency: testChainCreator(), createTestChain() and describeTestChain() ?
- “Instead of hand-rolling our own logic, why not let the test runner do it?”
- 











// v0.2.0

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
