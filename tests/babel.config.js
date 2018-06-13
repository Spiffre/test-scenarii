
const babelJest = require('babel-jest')


module.exports = babelJest.createTransformer(
{
	babelrc : false,
	presets :
	[
		[ 'env',
			{
				targets :
				{
					node : 'current'
				}
			}
		]
	],

	plugins :
	[
		'transform-object-rest-spread'
	]
})