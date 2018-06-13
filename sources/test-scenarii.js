
import {
	setChainProps,
	updateContext,
	UnauthorizedPropChangeError
} from './utils'


export function createTestChain (initialProps)
{
	// Cache initialProps directly if it's an object
	const initialTestContext =
	{
		props : (typeof initialProps === 'object') ? initialProps : {}
	}

	// Return a chain
	return (...testSteps) =>
	{
		// If initialProps is a prop getter, call it at each run of the chain
		if (typeof initialProps === 'function')
		{
			initialTestContext.props = initialProps()
		}

		// Execute the test steps in series
		return testSteps.reduce( (testContext, testStep, testStepIndex) =>
		{
			return testContext.then( (testContext) =>
			{
				const handleReturnedValue = (returnedValue) =>
				{
					// If an object has been returned from the test step, we forward it as the next testContext
					if (typeof returnedValue === 'object')
					{
						return updateContext(testContext, { props : returnedValue })
					}
					// If nothing was returned from the test step, we forward the testContext
					else if ( (returnedValue === undefined) || (returnedValue === null) )
					{
						return testContext
					}
				}

				// Start a new Promise chain because we don't know if testStep()'s return value is a Promise or a value
				return Promise.resolve().then( () =>
				{
					return testStep(testContext)
				})
				// Catch any error which might have have occured when executing the test test
				.catch( (error) =>
				{
					error.message = `test-scenarii caught an error while attempting to run user-provided test step #${testStepIndex}: ` + error.message

					// Re-throw the error in order to skip over the handling of the returned value
					throw error
				})
				// Handle the returned value, if any
				.then( (testStepReturnedValue) =>
				{
					// Return the final testContext, updated or not
					return handleReturnedValue(testStepReturnedValue)
				})
			})

		}, Promise.resolve(initialTestContext) )
	}
}


export function createTestChainSync (initialProps)
{
	// Cache initialProps directly if it's an object
	const initialTestContext =
	{
		props : (typeof initialProps === 'object') ? initialProps : {}
	}

	// Return a chain
	return (...testSteps) =>
	{
		// If initialProps is a prop getter, call it at each run of the chain
		if (typeof initialProps === 'function')
		{
			initialTestContext.props = initialProps()
		}

		// Execute the test steps in series
		return testSteps.reduce( (testContext, testStep, testStepIndex) =>
		{
			// Update the context with the returned props, if any
			const handleReturnedValue = (returnedValue) =>
			{
				// If an object has been returned from the test step, we forward it as the next testContext
				if (typeof returnedValue === 'object')
				{
					return updateContext(testContext, { props : returnedValue })
				}
				// If nothing was returned from the test step, we forward the testContext
				else if ( (returnedValue === undefined) || (returnedValue === null) )
				{
					return testContext
				}
			}

			// Execute the test step
			try
			{
				const res = testStep(testContext)
				return handleReturnedValue(res)
			}
			catch (error)
			{
				error.message = `test-scenarii caught an error while attempting to run user-provided test step #${testStepIndex}: ` + error.message

				// Re-throw the error in order to skip over the handling of the returned value
				throw error
			}

		}, initialTestContext)
	}
}


export {
	setChainProps,
	UnauthorizedPropChangeError
}

