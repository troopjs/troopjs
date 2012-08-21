module.exports.tests = {
	environment: "browser",

	rootPath : "./",

	libs : [
		"resources/requirejs/require.js"
	],

	sources : [
		"resources/config.requirejs.js"
	],

	resources : [
		"resources/requirejs/require.js",
		"resources/config.requirejs.js",
		"src/lib/composejs/compose.js",
		"src/lib/troopjs-*/src/**/*.js"
	],

	tests : [
		"src/lib/troopjs-*/test/**/*.js"
	]
};
