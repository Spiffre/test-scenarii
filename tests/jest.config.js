
const path = require('path')


module.exports = 
{
	transform :
	{
		'^.+\\.(js)$' : path.resolve(__dirname, 'babel.config.js')
	}
}
