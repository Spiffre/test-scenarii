
const { createTestChainSync, setChainProps } = require('../../dist/test-scenarii.esm.js')


describe.only(`Synchronous Chains`, () =>
{
	describe(`Cached Chain Tests`, () =>
	{
		test(`Running a cached chain with 1 test step inside a primary chain`, () =>
		{
			// Create the primary/parent chain
			const primaryChain = createTestChainSync({ contextStuff : "value" }, { propStuff : "value", count : 0 })
			
			// Create the secondary/cached chain. It will inherit the context and the props when the time comes
			const cachedChain = createTestChainSync.cached(
				(ctx, props) =>
				{
					return { count : props.count + 1 }
				}
			)

			// Run the primary chain, which will execute the cached chain in between regular test steps
			primaryChain(
				(ctx, props) =>
				{
					return { count : props.count + 1 }
				},

				cachedChain,

				(ctx, props) =>
				{
					return { count : props.count + 1 }
				},

				(ctx, props) =>
				{
					expect(props.count).toBe(3) // eslint-disable-line no-magic-numbers
					expect(ctx.contextStuff).toBe("value")
				}
			)
		})

		test(`Running a cached chain with multiple test steps inside a primary chain`, () =>
		{
			// Create the primary/parent chain
			const primaryChain = createTestChainSync({ contextStuff : "value" }, { propStuff : "value", count : 0 })
			
			// Create the secondary/cached chain. It will inherit the context and the props when the time comes
			const cachedChain = createTestChainSync.cached(
				(ctx, props) =>
				{
					return { count : props.count + 1 }
				},

				(ctx, props) =>
				{
					return { count : props.count + 1 }
				},

				(ctx, props) =>
				{
					return { count : props.count + 1 }
				}
			)

			// Run the primary chain, which will execute the cached chain in between regular test steps
			primaryChain(
				(ctx, props) =>
				{
					return { count : props.count + 1 }
				},

				cachedChain,

				(ctx, props) =>
				{
					return { count : props.count + 1 }
				},

				(ctx, props) =>
				{
					expect(props.count).toBe(5) // eslint-disable-line no-magic-numbers
					expect(ctx.contextStuff).toBe("value")
				}
			)
		})

		test.todo(`Running deepling nested test chains`)
	})
})
