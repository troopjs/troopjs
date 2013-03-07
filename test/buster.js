var config = module.exports;

config["troopjs-bundle"] = {
	"environment" : "browser",

	"rootPath" : "../",

	"libs" : [
		"resources/config.requirejs.js",
		"resources/requirejs/require.js"
	],

	"resources" : [
		"src/**/*.*"
	],

	"tests" : [
		"src/lib/troopjs-*/test/**/*.js"
	]
};
