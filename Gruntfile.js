/*jshint node:true*/
module.exports = function(grunt) {
	"use strict";

	var semver = require("semver");
	var UNDEFINED;

	/**
	 * Formats a semver
	 * @param {semver} version
	 * @return {string} Formatted semver
	 */
	function format(version) {
		var build = version.build;
		var result = version.format();

		if (build && build.length) {
			result += "+" + build.join(".");
		}

		return result;
	}

	// Configure grunt
	grunt.initConfig({
		"pkg": grunt.file.readJSON("package.json"),

		"build" : {
			"src" : ".",
			"dist" : "dist",
			"banner" : "/**\n" +
				" * <%= pkg.name %> - <%= pkg.version %> © <%= pkg.author.name %> mailto:<%= pkg.author.email %>\n" +
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
				"tag" : "<%= pkg.version %>",
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

	grunt.event.on("git-describe", function (git_version) {
		grunt.config("pkg.version", format(semver(semver.clean(grunt.config("pkg.version")) + "+" + git_version.object)));
	});

	// Load all grunt tasks
	require("matchdep")
		.filterDev("grunt-*")
		.forEach(grunt.loadNpmTasks);

	grunt.registerTask("compile", [ "git-describe", "requirejs", "semver:dist:set:{%= pkg.version %}" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("test", [ "buster" ]);
	grunt.registerTask("default", [ "compile", "compress", "usebanner" ]);

	grunt.registerTask("version", "Manage versions", function (phase, part, build) {
		var args = [ "semver", "bundles" ];

		switch (phase) {
			case "bump" :
			case "strip" :
				if (grunt.util.kindOf(part) === "undefined") {
					part = "prerelease";
				}
				/* falls through */

			case "set" :
				args.push(phase, part, build);
				break;

			default :
				grunt.warn(new Error("Unknown phase '" + phase + "'"));
		}

		grunt.task.run([ args.join(":") ]);
	});

	grunt.registerTask("release", "Package and release", function (phase) {
		var name = this.name;
		var args = [];

		switch (phase) {
			case "prepare":
				grunt.log.subhead("Preparing release");
				args.push("clean", "git-dist:dist:clone", "default");
				break;

			case "perform":
				grunt.log.subhead("Performing release");
				args.push("git-dist:dist:commit");
				if (grunt.option("no-tag")) {
					grunt.log.writeln("Not tagging as " + "--no-tag".cyan + " was passed");
				}
				else {
					args.push("git-dist:dist:tag");
				}
				args.push("git-dist:dist:push");
				break;

			default:
				args.push(name + ":prepare", name + ":perform");
		}

		grunt.task.run(args);
	});
};
