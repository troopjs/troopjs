/*jshint node:true*/
module.exports["troopjs"] = {
	"environment" : "browser",

	"rootPath" : "../",

	"libs" : [
		"test/require.js",
		"bower_components/requirejs/require.js"
	],

	"resources" : [
		"*.js",
		"bower.json",
		"bower_components/troopjs-*/**/*.*",
		"bower_components/jquery/jquery.js",
		"bower_components/when/**/*.js",
		"bower_components/requirejs/require.js",
		"bower_components/requirejs-text/text.js",
		"bower_components/poly/*.js",
		"bower_components/poly/lib/*.js",
		"bower_components/poly/support/*.js"
	],

	"tests" : [
		"bower_components/troopjs-*/test/**/*-test.js"
	]
};
