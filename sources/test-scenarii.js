
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
		return testSteps.reduce( (acc, testStep) =>
		{
			return acc.then( (testContext) =>
			{
				const handleReturnedValue = (returnedValue) =>
				{
					// If an object has been returned from the test step, we forward it as the next testContext
					if (typeof returnedValue === 'object')
					{
						// fixme: return updateContext(testContext, returnedValue) instead ?
						// But only props are merged anyway ?
						return { props : mergeProps(testContext.props, returnedValue) }
					}
					// If nothing was returned from the test step, we forward the testContext
					else if ( (returnedValue === undefined) || (returnedValue === null) )
					{
						return testContext
					}
				}

				// Execute the test step
				const res = testStep(testContext)

				// If a Promise was returned from the middleware, we wait for it to resolve before handling the returned context; otherwise we handle it directly
				return isPromise(res) ? res.then(handleReturnedValue) : handleReturnedValue(res)
			})

		}, Promise.resolve(initialTestContext) )
	}
}


export function setChainProps (userProps)
{
	return (testContext) =>
	{
		return mergeProps(testContext.props, userProps)
	}
}





// HELPERS
//=================================================================================================

function mergeProps (previousProps, updatedProps)
{
	// Iterate on all passed properties
	const nextProps = Object.keys(updatedProps).reduce( (contextProps, propertyName) =>
	{
		// Error out if a property value is set but hasn't been initialized
		if ( typeof contextProps[propertyName] === 'undefined' )
		{
			throw new Error(`Attempting to toggle non-existing prop ${propertyName}`)
		}

		// Set the property value
		return Object.assign({}, contextProps, { [propertyName] : updatedProps[propertyName] })

	}, previousProps)

	return nextProps
}


function isPromise (obj)
{
	// fixme: error handling?
	// fixme: hack for a node 6 bug which re-appeared? See: https://discuss.newrelic.com/t/problem-with-instanceof-promise-in-node-v6-11-5/52718
	return (obj instanceof Promise) || ( obj && obj.constructor && (obj.constructor.name === 'Promise') )
}