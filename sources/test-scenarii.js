

// Return the test chain creator
export function createTestChainSync (getProps)
{
	const initialTestContext =
	{
		props : (typeof getProps === 'function') ? getProps() : {}
	}

	// Return a chain
	return (...testSteps) =>
	{
		// Execute the test steps in series
		return testSteps.reduce( (testContext, testStep) =>
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
				throw error
			}

		}, initialTestContext)
	}
}

// Return the test chain creator
export function createTestChain (getProps)
{
	const initialTestContext =
	{
		props : (typeof getProps === 'function') ? getProps() : {}
	}

	// Return a chain
	return (...testSteps) =>
	{
		// Execute the test steps in series
		return testSteps.reduce( (acc, testStep, testStepIndex) =>
		{
			return acc.then( (testContext) =>
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


export function setChainProps (userProps)
{
	return (testContext) =>
	{
		return updateContext(testContext, { props : userProps })
	}
}





// PRIVATE HELPERS
//=================================================================================================

function updateContext (previousContext, contextUpdate)
{
	// HANDLE PROPS

	const updatedProps = contextUpdate.props

	// Iterate on all passed properties
	const nextProps = Object.keys(contextUpdate.props).reduce( (contextProps, propName) =>
	{
		// Disallow if a prop's value is set on for a property that doesn't exist
		if ( typeof contextProps[propName] === 'undefined' )
		{
			throw new UnauthorizedPropChangeError(`Attempting to toggle non-existing prop: "${propName}"`)
		}

		// Set the property value
		return { ...contextProps, [propName] : updatedProps[propName] }

	}, previousContext.props)

	return { props : nextProps }
}


export class UnauthorizedPropChangeError extends Error
{
	constructor (message)
	{
		super(message);
		this.name = this.constructor.name;
		
		if (typeof Error.captureStackTrace === 'function')
		{
			Error.captureStackTrace(this, this.constructor);
		}
		else
		{ 
			this.stack = (new Error(message)).stack; 
		}
	}
}


/*
function isPromise (obj)
{
	// fixme: hack for a node 6 bug which re-appeared? See: https://discuss.newrelic.com/t/problem-with-instanceof-promise-in-node-v6-11-5/52718
	return (obj instanceof Promise) || ( obj && obj.constructor && (obj.constructor.name === 'Promise') )
}
*/