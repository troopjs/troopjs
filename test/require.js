var require = {
	"packages" : [{
		"name" : "jquery",
		"location" : "bower_components/jquery",
		"main" : "jquery"
	}, {
		"name" : "when",
		"location" : "bower_components/when",
		"main" : "when"
	}, {
		"name" : "poly",
		"location" : "bower_components/poly",
		"main" : "poly"
	}, {
		"name" : "troopjs-composer",
		"location" : "bower_components/troopjs-composer"
	}, {
		"name" : "troopjs-core",
		"location" : "bower_components/troopjs-core"
	}, {
		"name" : "troopjs-data",
		"location" : "bower_components/troopjs-data"
	}, {
		"name" : "troopjs-browser",
		"location" : "bower_components/troopjs-browser"
	}, {
		"name" : "troopjs-jquery",
		"location" : "bower_components/troopjs-jquery"
	}, {
		"name" : "troopjs-requirejs",
		"location" : "bower_components/troopjs-requirejs"
	}, {
		"name" : "troopjs-utils",
		"location" : "bower_components/troopjs-utils"
	}, {
		"name" : "requirejs-text",
		"location" : "bower_components/requirejs-text"
	}],

	"map" : {
		"*" : {
			"template" : "troopjs-requirejs/template",
			"text" : "requirejs-text/text",
			"logger" : "troopjs-core/logger/console"
		}
	}
};
