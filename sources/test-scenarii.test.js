
const { createTestChain, setChainProps } = require('../dist/test-scenarii.cjs')


describe(`test-scenarii Tests`, () =>
{
	describe(`Basic Synchronous Tests`, () =>
	{
		test(`accessing prop`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
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
			const testChain = createTestChain(getProps)
			
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

		test.skip(`updating non-existing prop`, () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)

			// fixme: this expect() fails because...?
			expect( () =>
			{
				return testChain( () => ({ someOtherProperty : 'some other value' }) )

			}).toThrowError(/Attempting to toggle non-existing propDUde/i)
		})
	})

	describe(`Basic Asynchronous Tests`, () =>
	{
		test(`accessing prop`, async () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			return testChain(
				// Some async stuff
				(context) =>
				{
					return new Promise( (resolve) => setTimeout(resolve, 200) )
				},

				// Actual prop checking
				(context) =>
				{
					expect(context.props).toMatchObject({ someProperty : 'some value' })
				}
			)
		})

		test(`updating existing prop`, async () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			return testChain(
				// Some async stuff which modifies the prop
				(context) =>
				{
					return new Promise( (resolve) => setTimeout( () =>
					{
						resolve({ someProperty : 'some other value' })
					}, 200) )
				},

				// Actual prop checking
				(context) =>
				{
					expect(context.props).toMatchObject({ someProperty : 'some other value' })
				}
			)
		})

		test.skip(`updating non-existing prop`, async () =>
		{
			const getProps = () => ({ someProperty : 'some value' })
			const testChain = createTestChain(getProps)
			
			return testChain(
				// Some async stuff which modifies the prop
				(context) =>
				{
					return new Promise( (resolve) => setTimeout( () =>
					{
						resolve({ someProperty : 'some other value' })
					}, 200) )
				},

				// Actual prop checking
				(context) =>
				{
					expect( () =>
					{
						return testChain( () => ({ someOtherProperty : 'some other value' }) )

					}).toThrowError(/Attempting to toggle non-existing propDUde/i)
				}
			)
		})
	})
})