var config = module.exports;

config["troopjs-bundle"] = {
	"environment" : "browser",

	"rootPath" : "../",

	"libs" : [
		"support/config.requirejs.js",
		"support/requirejs/require.js"
	],

	"resources" : [
		"lib/**/*.*"
	],

	"tests" : [
		"lib/troopjs-*/test/**/*.js"
	]
};
