
const {
	createTestChain,
	createTestChainSync,
	setChainProps,

	UnauthorizedPropChangeError

} = require('../sources/test-scenarii.js')


describe(`test-scenarii Tests`, () =>
{
	describe(`Basic Asynchronous Tests`, () =>
	{
		test(`accessing prop`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			return testChain(

				// Some async wait
				(context) =>
				{
					return wait(200)
				},

				// Actual prop checking
				(context) =>
				{
					expect( context.props ).toMatchObject({ someProperty : 'some value' })
				}
			)
		})

		test(`updating existing prop`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			return testChain(

				// Some async stuff which modifies the prop
				(context) =>
				{
					return wait(200).then( () =>
					{
						return { someProperty : 'some other value' }
					})
				},

				// Actual prop checking
				(context) =>
				{
					expect( context.props ).toMatchObject({ someProperty : 'some other value' })
				}
			)
		})

		test(`updating non-existing prop`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			return testChain(

				// Some async stuff which modifies the prop
				(context) =>
				{
					return wait(200).then( () =>
					{
						return { someOtherProperty : 'some other value' }
					})
				}
			)

			// Error checking
			.catch( (error) =>
			{
				expect(error).toBeInstanceOf(UnauthorizedPropChangeError)
			})
		})

		test(`using a test step which throws an error`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			return testChain(

				// Some async stuff which modifies the prop
				(context) =>
				{
					return wait(200).then( () =>
					{
						undefinedVariable + 5
					})
				}
			)

			// Error checking
			.catch( (error) =>
			{
				expect(error).not.toBeInstanceOf(UnauthorizedPropChangeError)
				expect(error.message).toMatch(/test-scenarii caught an error while attempting to run user-provided test step #\d+:/)
			})
		})
	})

	describe(`Sync/await Asynchronous Tests`, () =>
	{
		test(`accessing prop`, async () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			await testChain(

				// Some async wait
				async (context) =>
				{
					await wait(200)
				},

				// Actual prop checking
				(context) =>
				{
					expect( context.props ).toMatchObject({ someProperty : 'some value' })
				}
			)
		})

		test(`updating existing prop`, async () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			await testChain(

				// Some async stuff which modifies the prop
				async (context) =>
				{
					await wait(200)
					return { someProperty : 'some other value' }
				},

				// Actual prop checking
				(context) =>
				{
					expect( context.props ).toMatchObject({ someProperty : 'some other value' })
				}
			)
		})

		test(`updating non-existing prop`, async () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			await testChain(

				// Some async stuff which modifies the prop
				async (context) =>
				{
					await wait(200)
					return { someOtherProperty : 'some other value' }
				}
			)

			// Error checking
			.catch( (error) =>
			{
				expect(error).toBeInstanceOf(UnauthorizedPropChangeError)
			})
		})

		test(`using a test step which throws an error`, async () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			await testChain(

				// Some async stuff which modifies the prop
				async (context) =>
				{
					await wait(200)
					undefinedVariable + 5
				}
			)

			// Error checking
			.catch( (error) =>
			{
				expect(error).not.toBeInstanceOf(UnauthorizedPropChangeError)
				expect(error.message).toMatch(/test-scenarii caught an error while attempting to run user-provided test step #\d+:/)
			})
		})
	})

	describe(`Basic Synchronous Tests`, () =>
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

			// fixme: this expect() fails because...?
			expect( () =>
			{
				return testChain( () => ({ someOtherProperty : 'some other value' }) )

			}).toThrowError(/Attempting to toggle non-existing prop/i)
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