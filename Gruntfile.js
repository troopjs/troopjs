/*jshint node:true*/
module.exports = function(grunt) {
	"use strict";
	var UNDEFINED;

	grunt.initConfig({
		"pkg": grunt.file.readJSON("package.json"),

		"build" : {
			"src" : ".",
			"dist" : "dist",
			"banner" : "/**\n" +
				" * <%= build.pkg.name %> - <%= build.pkg.version %>\n" +
				" * @license <%= pkg.licenses[0].type %> <%= pkg.licenses[0].url %> © <%= pkg.author.name %> mailto:<%= pkg.author.email%>\n" +
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
					"location" : ".",
					"main" : "package"
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
					"troopjs/package" : "define(<%= JSON.stringify(pkg) %>);\n"
				},
				"removeCombined" : true,
				"wrap" : {
					"end" : "define(['troopjs/package'], function (main) { return main; });"
				}
			},

			"bundles" : {
				"options" : {
					"modules" : [{
						"name" : "troopjs/maxi",
						"include" : [ "troopjs/package" ],
						"excludeShallow" : [
							"troopjs/maxi",
							"troopjs/mini",
							"troopjs/micro"
						]
					}, {
						"name" : "troopjs/mini",
						"include" : [ "troopjs/package" ],
						"excludeShallow" : [
							"troopjs/mini",
							"troopjs/micro"
						]
					}, {
						"name" : "troopjs/micro",
						"include" : [ "troopjs/package" ],
						"excludeShallow" : [ "troopjs/micro" ]
					}]
				}
			}
		},

		"clean" : [ "<%= build.dist %>" ],

		"uglify" : {
			"options" : {
				"preserveComments" : false
			},
			"bundles" : {
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
			"bundles" : {
				"options" : {
					"prop" : "build.pkg.version"
				}
			}
		},

		"usebanner" : {
			"options" : {
				"position" : "top",
				"banner" : "<%= build.banner %>"
			},
			"bundles" : {
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
			"bundles" : {
				"options" : {
					"branch" : "build/2.x",
					"dir" : "<%= build.dist %>",
					"message" : "<%= pkg.name %> - <%= pkg.version %>",
					"config" : {
						"user.name" : UNDEFINED,
						"user.email" : UNDEFINED
					}
				}
			}
		},

		"buster" : {
			"troopjs" : {}
		}
	});

	function reload(version, src, dest) {
		if (grunt.file.isMatch([ grunt.config("build.dist") + "/package.json" ], [ dest ])) {
			grunt.config("build.pkg", grunt.file.readJSON(dest));
		}
	}

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-banner");
	grunt.loadNpmTasks("grunt-git-describe");
	grunt.loadNpmTasks("grunt-git-dist");
	grunt.loadNpmTasks("grunt-semver");
	grunt.loadNpmTasks("grunt-plugin-buster");

	grunt.event.on("semver.set", reload);
	grunt.event.on("semver.bump", reload);

	grunt.registerTask("version", [ "git-describe", "semver:dist:set::{%=build.pkg.version.object%}" ]);
	grunt.registerTask("compile", [ "requirejs" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("test", [ "buster" ]);
	grunt.registerTask("default", [ "compile", "compress", "version", "usebanner" ]);

	grunt.registerTask("release", "Package and release", function (phase) {
		var name = this.name;

		switch (phase) {
			case "prepare":
				grunt.log.subhead("Preparing release");
				grunt.task.run([ "clean", "git-dist:bundles:clone", "default" ]);
				break;

			case "perform":
				grunt.log.subhead("Performing release");
				grunt.task.run([ "git-dist:bundles:commit", "git-dist:bundles:push" ]);
				break;

			default:
				grunt.task.run([ name + ":prepare", name + ":perform" ]);
		}
	});
};
