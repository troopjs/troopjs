/*global module:false*/
module.exports = function(grunt) {

	var files = {
		core : [ "troopjs-core/remote/ajax",
			"troopjs-core/route/router",
			"troopjs-core/store/local",
			"troopjs-core/store/session",
			"troopjs-core/dimensions/service",
			"troopjs-core/route/router",
			"troopjs-core/route/placeholder",
			"troopjs-core/widget/application" ],
		utils : [ "troopjs-utils/each",
			"troopjs-utils/grep",
			"troopjs-utils/merge",
			"troopjs-utils/tr",
			"troopjs-utils/unique",
			"troopjs-utils/when",
			"troopjs-utils/getargs" ],
		jquery : [ "troopjs-jquery/action",
			"troopjs-jquery/destroy",
			"troopjs-jquery/resize",
			"troopjs-jquery/dimensions",
			"troopjs-jquery/hashchange",
			"troopjs-jquery/weave" ],
		requirejs : [ "troopjs-requirejs/template" ]
	};

	// Project configuration.
	grunt.config.init({
		meta : {
			version : "1.0.2+",
			banner : "/*! troopjs-bundle - v<%= meta.version %> - " +
				"<%= grunt.template.today('yyyy-mm-dd') %>\n" +
				"* http://troopjs.com/\n" +
				"* Copyright (c) <%= grunt.template.today('yyyy') %> " +
				"Mikael Karon <mikael@karon.se>; Licensed MIT\n */"
		},
		lint : {
			files: [ "grunt.js", "src/lib/troopjs-*/src/**/*.js" ]
		},
		requirejs : {
			compile : {
				options : {
					out : "dist/troopjs-bundle.js",
					baseUrl : "src",
					paths : {
						"compose" : "lib/composejs/compose",
						"troopjs-core" : "lib/troopjs-core/src",
						"troopjs-utils" : "lib/troopjs-utils/src",
						"troopjs-jquery" : "lib/troopjs-jquery/src",
						"troopjs-requirejs" : "lib/troopjs-requirejs/src"
					},
					map : {
						"*" : {
							"jquery" : "empty:",
							"config" : "empty:"
						}
					},
					include : Array.prototype.concat(files.core, files.utils, files.jquery, files.requirejs),
					optimize : "none"
				}
			}
		},
		buster : {
			test : {
				config : "test/buster.js"
			}
		},
		min : {
			dist : {
				src : [ "<banner>", "dist/troopjs-bundle.js" ],
				dest : "dist/troopjs-bundle.min.js"
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib");
	grunt.loadNpmTasks("grunt-buster");

	grunt.registerTask("test", "lint buster");
	grunt.registerTask("dist", "requirejs min");

	// Default task.
	grunt.registerTask("default", "test dist");
};
