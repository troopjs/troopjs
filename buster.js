module.exports["troopjs"] = {
	"environment" : "browser",

	"libs" : [
		"bower_components/requirejs/require.js",
		"require.js"
	],

	"resources" : [
		"*.js",
		"bower_components/troopjs-*/**/*.*",
		"bower_components/mu-*/**/*.*",
		"bower_components/requirejs/require.js",
		"bower_components/jquery/dist/jquery.js",
		"bower_components/when/**/*.js",
		"bower_components/poly/*.js",
		"bower_components/poly/lib/*.js",
		"bower_components/poly/support/*.js"
	],

	"tests" : [
		"bower_components/troopjs-*/test/**/*-test.js"
	]
};
