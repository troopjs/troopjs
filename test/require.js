var require = {
	waitSeconds: 0,
	// Test against all bower-installed troop modules.
	"baseUrl": "bower_components",
	"packages" : [{
		"name" : "jquery",
		"location": "jquery/dist",
		"main" : "jquery"
	}, {
		"name" : "when",
		"main" : "when"
	}, {
		"name" : "poly",
		"main" : "poly"
	}, {
		"name" : "mu-getargs",
		"location" : "mu-getargs"
	}, {
		"name" : "mu-select",
		"location" : "mu-select"
	}, {
		"name" : "mu-merge",
		"location" : "mu-merge"
	}, {
		"name" : "mu-unique",
		"location" : "mu-unique"
	}, {
		"name" : "mu-jquery-destroy",
		"location" : "mu-jquery-destroy",
		"main" : "jquery.destroy.js"
	}, {
		"name" : "troopjs",
		"location" : ".."
	}],

	"map" : {
		"*" : {
			"template" : "troopjs-requirejs/template",
			"json" : "troopjs-requirejs/json",
			"text" : "requirejs-text/text",
			"logger" : "troopjs-core/logger/console"
		}
	}
};
