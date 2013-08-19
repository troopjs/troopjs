/*jshint node:true*/
module.exports = function(grunt) {
	"use strict";

	var semver = require("semver");
	var UNDEFINED;

	grunt.initConfig({
		"pkg": grunt.file.readJSON("package.json"),

		"build" : {
			"src" : ".",
			"dist" : "dist",
			"banner" : "/**\n" +
				" * <%= pkg.name %> - <%= pkg.version %> © <%= pkg.author.name %> mailto:<%= pkg.author.email%>\n" +
				" * @license <%= _.pluck(pkg.licenses, 'type').join(', ') %> <%= _.pluck(pkg.licenses, 'url').join(', ') %>\n" +
				" */"
		},

		"requirejs" : {
			"options" : {
				"baseUrl" : "<%= build.src %>",
				"dir" : "<%= build.dist %>",
				"optimize" : "none",
				"skipDirOptimize" : true,
				"keepBuildDir" : true,
				"fileExclusionRegExp": /^(?:\.\w+|Gruntfile\.js|node_modules|bower_components|test|dist)$/,
				"packages" : [{
					"name" : "text",
					"location" : "empty:"
				}, {
					"name" : "jquery",
					"location" : "empty:"
				}, {
					"name" : "when",
					"location" : "empty:"
				}, {
					"name" : "poly",
					"location" : "empty:"
				}, {
					"name" : "troopjs",
					"location" : "."
				}, {
					"name" : "troopjs-core",
					"location" : "lib/troopjs-core"
				}, {
					"name" : "troopjs-browser",
					"location" : "lib/troopjs-browser"
				}, {
					"name" : "troopjs-data",
					"location" : "lib/troopjs-data"
				}, {
					"name" : "troopjs-utils",
					"location" : "lib/troopjs-utils"
				}, {
					"name" : "troopjs-jquery",
					"location" : "lib/troopjs-jquery"
				}, {
					"name" : "troopjs-requirejs",
					"location" : "lib/troopjs-requirejs"
				}],
				"rawText" : {
					"troopjs/version" : "define(function () { return <%= JSON.stringify(pkg.version) %>; });\n"
				},
				"removeCombined" : true,
				"wrap" : {
					"end" : "define(['troopjs/version'], function (main) { return main; });"
				}
			},

			"bundles" : {
				"options" : {
					"modules" : [{
						"name" : "troopjs/maxi",
						"include" : [ "troopjs/version" ],
						"excludeShallow" : [
							"troopjs/maxi",
							"troopjs/mini",
							"troopjs/micro"
						]
					}, {
						"name" : "troopjs/mini",
						"include" : [ "troopjs/version" ],
						"excludeShallow" : [
							"troopjs/mini",
							"troopjs/micro"
						]
					}, {
						"name" : "troopjs/micro",
						"include" : [ "troopjs/version" ],
						"excludeShallow" : [ "troopjs/micro" ]
					}]
				}
			}
		},

		"clean" : {
			"dist" : [ "<%= build.dist %>" ]
		},

		"uglify" : {
			"options" : {
				"preserveComments" : false
			},
			"dist" : {
				"files" : [{
					"expand" : true,
					"dest" : "<%= build.dist %>",
					"cwd" : "<%= build.dist %>",
					"src" : [ "{micro,mini,maxi}.js" ],
					"ext" : ".min.js"
				}]
			}
		},

		"git-describe" : {
			"bundles" : {}
		},

		"usebanner" : {
			"options" : {
				"position" : "top",
				"banner" : "<%= build.banner %>"
			},
			"dist" : {
				"files" : [{
					"expand" : true,
					"cwd" : "<%= build.dist %>",
					"src" : [
						"{micro,mini,maxi}.js",
						"{micro,mini,maxi}.min.js"
					]
				}]
			}
		},

		"semver": {
			"bundles": {
				"files": [{
					"expand": true,
					"src" : [ "package.json", "bower.json" ]
				}]
			},
			"dist": {
				"files": [{
					"expand": true,
					"cwd" : "<%= build.dist %>",
					"dest" : "<%= build.dist %>",
					"src" : [ "package.json", "bower.json" ]
				}]
			}
		},

		"git-dist" : {
			"options" : {
				"message" : "<%= pkg.name %> - <%= pkg.version %>",
				"config" : {
					"user.name" : UNDEFINED,
					"user.email" : UNDEFINED
				}
			},
			"dist" : {
				"options" : {
					"branch" : "build/2.x",
					"dir" : "<%= build.dist %>"
				}
			}
		},

		"buster" : {
			"troopjs" : {}
		}
	});

	grunt.event.on("git-describe", function (version) {
		grunt.config("pkg.version", semver(grunt.config("pkg.version")) + "+" + version.object);
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-banner");
	grunt.loadNpmTasks("grunt-git-describe");
	grunt.loadNpmTasks("grunt-git-dist");
	grunt.loadNpmTasks("grunt-semver");
	grunt.loadNpmTasks("grunt-plugin-buster");

	grunt.registerTask("compile", [ "git-describe", "requirejs", "semver:dist:set:{%= pkg.version %}" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("test", [ "buster" ]);
	grunt.registerTask("default", [ "compile", "compress", "usebanner" ]);

	grunt.registerTask("release", "Package and release", function (phase) {
		var name = this.name;

		switch (phase) {
			case "prepare":
				grunt.log.subhead("Preparing release");
				grunt.task.run([ "clean", "git-dist:dist:clone", "default" ]);
				break;

			case "perform":
				grunt.log.subhead("Performing release");
				grunt.task.run([ "git-dist:dist:commit", "git-dist:dist:push" ]);
				break;

			default:
				grunt.task.run([ name + ":prepare", name + ":perform" ]);
		}
	});
};
