
const babelJest = require('babel-jest')


module.exports = babelJest.createTransformer(
{
	babelrc : false,
	presets :
	[
		[
			'@babel/preset-env',
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
		'@babel/plugin-proposal-object-rest-spread'
	]
})