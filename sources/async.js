
export function createTestChain (initialContext, initialProps)
{
	// Return a chain
	return function testChain (...testSteps)
	{
		const seedContext =
		{
			ctx : Object.freeze( initialContext || {} ),
			props : initialProps || {}
		}

		// Execute the test steps in sequence
		return testSteps.reduce( (acc, testStep, testStepIndex) =>
		{
			return acc.then( (testContext) =>
			{
				// Start a new Promise chain because we don't know if testStep()'s return value is a Promise or a value
				return Promise.resolve().then( () =>
				{
					return testStep(testContext.ctx, testContext.props)
				})
				// Catch any error which might have have occured when executing the test test
				.catch( (error) =>
				{
					const testId = (testStep.name === '') ? `#${testStepIndex}` : `#${testStepIndex} "${testStep.name}"`
					error.message = `test-scenarii caught an error while attempting to run user-provided test step ${testId}:\n` + error.message

					// Re-throw the error in order to skip over the handling of the returned value
					throw error
				})
				// Handle the returned value, if any
				.then( (returnedProps) =>
				{
					const updatedProps = returnedProps || {}

					// If an object has been returned from the test step, we forward it as the next testContext
					if (typeof updatedProps === 'object') // fixme: make a more restrictive check to be sure it's a POO?
					{
						return {
							ctx : testContext.ctx,
							props : { ...testContext.props, ...updatedProps }
						}
					}
					
					// If nothing was returned from the test step, we forward the testContext
					return testContext
				})
			})

		}, Promise.resolve(seedContext) )
		.then( ({ props }) =>
		{
			return props
		})
	}
}

createTestChain.nested = function nestedTestChain (...testSteps)
{
	/**
	 * Context and props are inherited from the parent chain whenever the nested chain is encountered, 
	 * in order to ensure they are up-to-date
	 * @param {object} ctx
	 * @param {object} props
	 * @returns {object} The updated props
	 */
	return (ctx, props) =>
	{
		// Call createTestChain() to effectively create a test chain with the provided context and props
		// and immediately execute it with the provided test steps
		return this(ctx, props)(...testSteps)
	}
}

createTestChain.nest = createTestChain.nested