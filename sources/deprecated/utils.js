
export function updateContext (previousContext, contextUpdate)
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
	// hack for a node 6 bug which re-appeared? See: https://discuss.newrelic.com/t/problem-with-instanceof-promise-in-node-v6-11-5/52718
	return (obj instanceof Promise) || ( obj && obj.constructor && (obj.constructor.name === 'Promise') )
}
*/