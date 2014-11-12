/**
 * @license MIT http://troopjs.mit-license.org/
 */
/*globals require:false*/
require({
	"baseUrl" : "bower_components",
	"packages" : [ "jquery", "when", "poly", "mu-getargs", "mu-select", "mu-selector-set", "mu-merge", "mu-unique", "mu-jquery-destroy", "troopjs" ].map(function (name) {
		var main;
		var location;

		switch (name) {
			case "jquery":
				location = "jquery/dist";
				/* falls through */

			case "when":
				main = name;
				break;

			case "poly":
				main = "es5";
				break;

			case "troopjs":
				location = "..";
				break;
		}

		return {
			"name": name,
			"location": location,
			"main": main
		}
	})
});