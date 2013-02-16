require.config({
	baseUrl : (buster.env.contextPath || "") + "src",
	"packages" : [{
		"name" : "when",
		"location" : "lib/when",
		"main" : "when"
	}, {
		"name" : "poly",
		"location" : "lib/poly",
		"main" : "poly"
	}, {
		"name" : "troopjs-core",
		"location" : "lib/troopjs-core/src"
	}, {
		"name" : "troopjs-data",
		"location" : "lib/troopjs-data/src"
	}, {
		"name" : "troopjs-browser",
		"location" : "lib/troopjs-browser/src"
	}, {
		"name" : "troopjs-jquery",
		"location" : "lib/troopjs-jquery/src"
	}, {
		"name" : "troopjs-requirejs",
		"location" : "lib/troopjs-requirejs/src"
	}, {
		"name" : "troopjs-utils",
		"location" : "lib/troopjs-utils/src"
	}],
	"map" : {
		"*" : {
			"template" : "troopjs-requirejs/template"
		}
	}
});