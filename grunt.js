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
			version : "SNAPSHOT",
			banner : "/*!\n" +
				"* TroopJS Bundle - <%= meta.version %>\n" +
				"* http://troopjs.com/\n" +
				"* Copyright (c) <%= grunt.template.today('yyyy') %> " + "Mikael Karon <mikael@karon.se>\n" +
				"* Licensed MIT\n" +
				"*/"
		},
		clean : {
			dist : [ "dist" ]
		},
		lint : {
			src: [ "grunt.js", "src/lib/troopjs-*/src/**/*.js" ]
		},
		requirejs : {
			dist : {
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
		concat : {
			dist : {
				src : [ "<banner>", "<config:requirejs.dist.options.out>" ],
				dest : "dist/troopjs-bundle.js"
			}
		},
		min : {
			dist : {
				src : [ "<banner>", "<config:concat.dist.dest>" ],
				dest : "dist/troopjs-bundle.min.js"
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib");
	grunt.loadNpmTasks("grunt-buster");

	grunt.registerTask("describe", "Describes current commit", function () {
		var done = this.async();

		grunt.utils.spawn({
			cmd : "git",
			args : [ "describe", "--always", "--long" ]
		}, function (err, result) {
			if (err) {
				grunt.log.error(err);
				return done(false);
			}

			grunt.config("meta.version", result);

			done(result);
		});
	});

	grunt.registerTask("test", "lint buster");
	grunt.registerTask("dist", "describe requirejs concat min");

	// Default task.
	grunt.registerTask("default", "test");
};
