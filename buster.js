var config = module.exports;

config["Browser Tests"] = {
	environment: "browser",

	rootPath : "./",

	libs : [
		"lib/requirejs/require.js"
	],

	sources : [ "/configuration" ],

	resources : [{
		path : "/configuration",
		content : "require.config({\
	baseUrl : (buster.env.contextPath || \"\") + \"src\",\
	paths : {\
		\"compose\" : \"lib/composejs/compose\",\
		\"troopjs-core\" : \"lib/troopjs-core/src\",\
		\"troopjs-utils\" : \"lib/troopjs-utils/src\",\
		\"troopjs-jquery\" : \"lib/troopjs-jquery/src\",\
		\"troopjs-requirejs\" : \"lib/troopjs-requirejs/src\"\
	}\
});"
	},
		"src/lib/composejs/compose.js",
		"src/lib/troopjs-*/src/**/*.js"
	],

	tests : [
		"src/lib/troopjs-*/test/**/*.js"
	]
};