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
		"resources/jquery/dist/jquery.js",
		"resources/config.requirejs.js",
		"src/**/*.*"
	],

	tests : [
		"src/lib/troopjs-*/test/**/*.js"
	]
};
