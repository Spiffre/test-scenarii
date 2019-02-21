
const {
	createTestChain,
	createTestChainSync,
	setChainProps,

} = require('../../dist/test-scenarii.esm.js')

const { wait } = require('./utils.js')

const SHORT = 100



describe.skip(`test-scenarii tests`, () =>
{
	describe(`Chain initialization via static props vs prop getter`, () =>
	{
		test(`single run with static props`, async () =>
		{
			const testChain = createTestChain({ someProperty : 'some value' })
			
			await testChain(
				// Actual prop checking
				(context) =>
				{
					expect( context.props ).toMatchObject({ someProperty : 'some value' })
				}
			)
		})

		test(`multiple runs with static props`, async () =>
		{
			const testChain = createTestChain({ now : Date.now() })
			let first = null, second = null
			
			// Store the value of prop `now`
			await testChain( (context) => first = context.props.now )

			// Store the other value of prop `now`
			await testChain( (context) => second = context.props.now )

			// Compare them
			expect(first).toEqual(second)
		})

		test(`single run with prop getter`, async () =>
		{
			const testChain = createTestChain( () => ({ someProperty : 'some value' }) )
			
			await testChain(
				// Actual prop checking
				(context) =>
				{
					expect( context.props ).toMatchObject({ someProperty : 'some value' })
				}
			)
		})

		test(`multiple runs with prop getter`, async () =>
		{
			const testChain = createTestChain( () => ({ now : Date.now() }) )

			let first = null, second = null
			
			// Store the value of prop `now`
			await testChain( (context) => first = context.props.now )

			// Wait a bit
			await wait(SHORT)

			// Store the other value of prop `now`
			await testChain( (context) => second = context.props.now )

			// Compare them
			expect(second).toBeGreaterThan(first)
		})
	})
})
