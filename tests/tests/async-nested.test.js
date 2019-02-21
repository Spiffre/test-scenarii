
const { createTestChain, setChainProps } = require('../../dist/test-scenarii.esm.js')
const { wait } = require('./utils.js')

const SHORT = 100


describe(`Asynchronous Chains`, () =>
{
	describe(`Nested Chain Tests`, () =>
	{
		test(`Running a nested chain with 1 test step inside a primary chain`, () =>
		{
			// Create the primary/parent chain
			const primaryChain = createTestChain({ contextStuff : "value" }, { propStuff : "value", count : 0 })
			
			// Create the secondary/nested chain. It will inherit the context and the props when the time comes
			const nestedChain = createTestChain.nested(
				async (ctx, props) =>
				{
					await wait(SHORT)
					return { count : props.count + 1 }
				}
			)

			// Run the primary chainm which will execute the nested chain in between regular test steps
			return primaryChain(
				async (ctx, props) =>
				{
					await wait(SHORT)
					return { count : props.count + 1 }
				},

				nestedChain,

				async (ctx, props) =>
				{
					await wait(SHORT)
					return { count : props.count + 1 }
				},

				async (ctx, props) =>
				{
					await wait(SHORT)

					expect(props.count).toBe(3) // eslint-disable-line no-magic-numbers
					expect(ctx.contextStuff).toBe("value")
				}
			)
		})

		test(`Running a nested chain with multiple test steps inside a primary chain`, () =>
		{
			// Create the primary/parent chain
			const primaryChain = createTestChain({ contextStuff : "value" }, { propStuff : "value", count : 0 })
			
			// Create the secondary/nested chain. It will inherit the context and the props when the time comes
			const nestedChain = createTestChain.nested(
				async (ctx, props) =>
				{
					await wait(SHORT)
					return { count : props.count + 1 }
				},

				async (ctx, props) =>
				{
					await wait(SHORT)
					return { count : props.count + 1 }
				},

				async (ctx, props) =>
				{
					await wait(SHORT)
					return { count : props.count + 1 }
				}
			)

			// Run the primary chain, which will execute the nested chain in between regular test steps
			return primaryChain(
				async (ctx, props) =>
				{
					await wait(SHORT)
					return { count : props.count + 1 }
				},

				nestedChain,

				async (ctx, props) =>
				{
					await wait(SHORT)
					return { count : props.count + 1 }
				},

				async (ctx, props) =>
				{
					await wait(SHORT)

					expect(props.count).toBe(5) // eslint-disable-line no-magic-numbers
					expect(ctx.contextStuff).toBe("value")
				}
			)
		})
	})
})
