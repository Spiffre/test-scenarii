
module.exports = 
{
	"extends":
	[
		"./env.sources.js",
		"./rules.js"
	],

	"rules":
	{
		// Disallow use of constant expressions in conditions
		// https://eslint.org/docs/rules/no-constant-condition
		"no-constant-condition": "warn",
		
		// Disallow use of debugger
		// https://eslint.org/docs/rules/no-debugger
		"no-debugger": "warn",

		// Disallow Unnecessary Nested Blocks
		// https://eslint.org/docs/rules/no-lone-blocks
		"no-lone-blocks": "warn",

		// Disallow unreachable code (return, throw, continue, break)
		// https://eslint.org/docs/rules/no-unreachable
		"no-unreachable": "warn",

		// Disallow mixed spaces and tabs for indentation
		// https://eslint.org/docs/rules/no-mixed-spaces-and-tabs
		"no-mixed-spaces-and-tabs": [ "error", "smart-tabs" ],

		// Suggest using arrow functions as callbacks
		// https://eslint.org/docs/rules/prefer-arrow-callback
		"prefer-arrow-callback": [ "warn",
		{
			"allowNamedFunctions": true
		}],

		// Use rest parameters instead of arguments
		// https://eslint.org/docs/rules/prefer-rest-params
		"prefer-rest-params": "warn",

		// Suggest using the spread operator instead of .apply()
		// https://eslint.org/docs/rules/prefer-spread
		"prefer-spread": "warn",

		// Require method and property shorthand syntax for object literals
		// https://eslint.org/docs/rules/object-shorthand
		// "object-shorthand": [ "warn", "always",
		// {
		// 	"avoidQuotes": true,
		// }]
	}
}
