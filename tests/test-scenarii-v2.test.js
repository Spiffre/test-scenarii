
const {
	createTestChain,
	createTestChainSync,
	setChainProps,

} = require('../dist/test-scenarii.esm.js')



describe(`test-scenarii tests`, () =>
{
	describe.only(`Basic asynchronous tests`, () =>
	{
		test(`running a test step with empty context and prop objects`, async () =>
		{
			const testChain = createTestChain({}, {})
			
			return testChain(

				// Some async wait
				async (ctx, props) =>
				{
					await wait(200)
				},

				// Actual context and prop checking
				(ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test(`running a test step with null context and prop objects`, async () =>
		{
			const testChain = createTestChain(null, null)
			
			return testChain(

				// Some async wait
				async (ctx, props) =>
				{
					await wait(200)
				},

				// Actual context and prop checking
				(ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test(`running a test step with undefined context and prop objects`, async () =>
		{
			const testChain = createTestChain(undefined, undefined)
			
			return testChain(

				// Some async wait
				async (ctx, props) =>
				{
					await wait(200)
				},

				// Actual context and prop checking
				(ctx, props) =>
				{
					expect(ctx).toMatchObject({})
					expect(props).toMatchObject({})
				}
			)
		})

		test(`accessing context and prop`, async () =>
		{
			const testChain = createTestChain({ contextStuff : 'Some context stuff' }, { propStuff : 'Some prop stuff' })
			
			return testChain(

				// Some async wait
				async (ctx, props) =>
				{
					await wait(200)
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

		test(`updating prop`, async () =>
		{
			const testChain = createTestChain({}, { propStuff : 'Some prop stuff' })
			
			return testChain(

				// Some async stuff which modifies the prop
				async (ctx, props) =>
				{
					await wait(200)
					return { propStuff : 'Some updated prop stuff' }
				},

				// Actual prop checking
				(ctx, props) =>
				{
					expect(props).toMatchObject({ propStuff : 'Some updated prop stuff' })
				}
			)
		})

		test(`using a test step which throws an error (anonymous function)`, async () =>
		{
			const testChain = createTestChain()
			
			return testChain(

				async (ctx, props) =>
				{
					await wait(200)
					undefinedVariable + 5
				}
			)

			// Error checking
			.catch( (error) =>
			{
				expect(error).toBeInstanceOf(Error)
				expect(error.message).toMatch('test-scenarii caught an error while attempting to run user-provided test step #0:')
			})
		})

		test(`using a test step which throws an error (named function)`, async () =>
		{
			const testChain = createTestChain()
			
			return testChain(

				async function doingSomethingReprehensible (ctx, props)
				{
					await wait(200)
					undefinedVariable + 5
				}
			)

			// Error checking
			.catch( (error) =>
			{
				expect(error).toBeInstanceOf(Error)
				expect(error.message).toMatch('test-scenarii caught an error while attempting to run user-provided test step #0 "doingSomethingReprehensible":')
			})
		})
	})

	describe(`Basic synchronous tests`, () =>
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
				testChain( (context) => (undefinedVariable + 5) )
			}
			catch (error)
			{
				expect(error).not.toBeInstanceOf(UnauthorizedPropChangeError)
				expect(error.message).toMatch(/test-scenarii caught an error while attempting to run user-provided test step #\d+:/)
			}
		})
	})

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
			await wait(200)

			// Store the other value of prop `now`
			await testChain( (context) => second = context.props.now )

			// Compare them
			expect(second).toBeGreaterThan(first)
		})
	})
})





// PRIVATE HELPERS
//=================================================================================================

function wait (ms)
{
	return new Promise( (resolve) =>
	{
		setTimeout(resolve, ms)
	})
}