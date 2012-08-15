var config = module.exports;

config["troop"] = {
	environment: "browser",

	rootPath : "../",

	libs : [
		"test/lib/requirejs/require.js"
	],

	resources : [
		"src/lib/composejs/compose.js",
		"test/lib/requirejs/require.js",
		"src/lib/troopjs-*/**/*.js"
	],

	tests : [
		"test/troopjs-bundle.js",
		"src/lib/troopjs-*/test/**/*.js"
	]
}