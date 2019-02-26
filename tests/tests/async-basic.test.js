
const { createTestChain, setChainProps } = require('../../dist/test-scenarii.esm.js')
const { wait } = require('./utils.js')

const SHORT = 100


describe(`Asynchronous Chains`, () =>
{
	describe(`Basic Use`, () =>
	{
		test(`Running a test step with empty context and prop objects`, () =>
		{
			const testChain = createTestChain({}, {})

			return testChain(

				// Some async wait
				async (ctx, props) =>
				{
					await wait(SHORT)
				},

				// Actual context and prop checking
				// fixme: this one needs to be async, otherwise it gets executed before the one before resolves...
				// That's an unpleasant surprise
				async (ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test(`Running a test step with null context and prop objects`, () =>
		{
			const testChain = createTestChain(null, null)
			
			return testChain(

				// Some async wait
				async (ctx, props) =>
				{
					await wait(SHORT)
				},

				// Actual context and prop checking
				(ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test(`Running a test step with undefined context and prop objects`, () =>
		{
			const testChain = createTestChain(undefined, undefined)
			
			return testChain(

				// Some async wait
				async (ctx, props) =>
				{
					await wait(SHORT)
				},

				// Actual context and prop checking
				(ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test.todo(`Running a test chain with null test steps`)

		test(`Running a test step with actual context and prop objects`, () =>
		{
			const testChain = createTestChain({ contextStuff : 'Some context stuff' }, { propStuff : 'Some prop stuff' })
			
			return testChain(

				// Some async wait
				async (ctx, props) =>
				{
					await wait(SHORT)
				},

				// Actual prop checking
				(ctx, props) =>
				{
					expect(props).toMatchObject({ propStuff : 'Some prop stuff' })
					expect(Object.keys(props)).toHaveLength(1)

					expect(ctx).toMatchObject({ contextStuff : 'Some context stuff' })
					expect(Object.keys(ctx)).toHaveLength(1)
				}
			)
		})

		test(`Updating prop`, () =>
		{
			const testChain = createTestChain({}, { propStuff : 'Some prop stuff' })
			
			return testChain(

				// Some async stuff which modifies the prop
				async (ctx, props) =>
				{
					await wait(SHORT)
					return { propStuff : 'Some updated prop stuff' }
				},

				// Actual prop checking
				(ctx, props) =>
				{
					expect(props).toMatchObject({ propStuff : 'Some updated prop stuff' })
				}
			)
		})
	})

	describe(`Error Handling`, () =>
	{
		test(`Using a test step which throws an error (anonymous function)`, () =>
		{
			const testChain = createTestChain()
			
			return testChain(

				async (ctx, props) =>
				{
					await wait(SHORT)
					undefinedVariable + 5 // eslint-disable-line no-magic-numbers, no-undef
				}
			)

			// Error checking
			.catch( (error) =>
			{
				expect(error).toBeInstanceOf(Error)
				expect(error.message).toMatch('test-scenarii caught an error while attempting to run user-provided test step #0:')
			})
		})

		test(`Using a test step which throws an error (named function)`, () =>
		{
			const testChain = createTestChain()
			
			return testChain(

				async function doingSomethingReprehensible (ctx, props)
				{
					await wait(SHORT)
					undefinedVariable + 5 // eslint-disable-line no-magic-numbers, no-undef
				}
			)

			// Error checking
			.catch( (error) =>
			{
				expect(error).toBeInstanceOf(Error)
				expect(error.message).toMatch('test-scenarii caught an error while attempting to run user-provided test step #0 "doingSomethingReprehensible":')
			})
		})

		test.todo(`Using a test step with anon-null, non-function test step`)
	})
})

