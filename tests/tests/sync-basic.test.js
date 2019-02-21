
const { createTestChainSync, setChainProps } = require('../../dist/test-scenarii.esm.js')
const { wait } = require('./utils.js')


describe(`Synchronous Chains`, () =>
{
	describe.skip(`Basic Tests`, () =>
	{
		test(`accessing prop`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChainSync(getProps)
			
			testChain(
				(context) =>
				{
					expect(context.props).toMatchObject({ someProperty : 'some value' })
				}
			)
		})

		test(`updating existing prop`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChainSync(getProps)
			
			testChain(
				(context) =>
				{
					return { someProperty : 'some other value' }
				},

				(context) =>
				{
					expect(context.props).toMatchObject({ someProperty : 'some other value' })
				}
			)
		})

		test(`updating non-existing prop`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChainSync(getProps)

			expect( () =>
			{
				return testChain( () => ({ someOtherProperty : 'some other value' }) )

			}).toThrowError(/Attempting to toggle non-existing prop/i)
		})

		test(`using a test step which throws an error`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChainSync(getProps)

			try
			{
				testChain( (context) => (undefinedVariable + 5) ) // eslint-disable-line no-magic-numbers, no-undef
			}
			catch (error)
			{
				expect(error).not.toBeInstanceOf(UnauthorizedPropChangeError) // eslint-disable-line
				expect(error.message).toMatch(/test-scenarii caught an error while attempting to run user-provided test step #\d+:/)
			}
		})
	})
})

