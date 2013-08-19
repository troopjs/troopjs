/*jshint node:true*/
module.exports["troopjs"] = {
	"environment" : "browser",

	"rootPath" : "../",

	"libs" : [
		"test/require.js",
		"bower_components/requirejs/require.js"
	],

	"resources" : [
		"lib/**/*.*",
		"bower_components/jquery/jquery.js",
		"bower_components/when/when.js",
		"bower_components/requirejs/require.js",
		"bower_components/poly/*.js",
		"bower_components/poly/lib/*.js"
	],

	"tests" : [
		"lib/troopjs-*/test/**/*.js"
	]
};
