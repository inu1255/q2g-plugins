module.exports = {
	env: {
		es6: true,
		node: true,
		browser: true,
		mocha: true,
	},
	extends: [],
	parser: "babel-eslint",
	globals: {
		we: true,
		UI: true,
		Quasar: true,
		Vue: true,
		VueRouter: true,
	},
	plugins: [],
	rules: {
		// "semi": "warn", //["error", "never"],
		"no-unused-vars": ["warn", {vars: "all", args: "none", ignoreRestSiblings: true}],
		"no-undef": "error",
		// "indent": ["error", "tab"],
		// "quotes": ["warn", "double", { "allowTemplateLiterals": true }]
	},
};
