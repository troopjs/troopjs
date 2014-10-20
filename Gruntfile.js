/*jshint node:true*/
module.exports = function(grunt) {
	"use strict";

	var UNDEFINED;
	var semver = require("semver");
	var path = require("path");
	var _ = require("lodash");

	/**
	 * Formats a semver
	 * @private
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
		"pkg": grunt.file.readJSON("bower.json"),

		"build" : {
			"src" : ".",
			"dist" : "dist",
			"banner" : "/**\n\
 *   ____ .     ____  ____  ____    ____.\n\
 *   \\   (/_\\___\\  (__\\  (__\\  (\\___\\  (/\n\
 *   / ._/  ( . _   \\  . /   . /  . _   \\_\n\
 * _/    ___/   /____ /  \\_ /  \\_    ____/\n\
 * \\   _/ \\____/   \\____________/   /\n\
 *  \\_t:_____r:_______o:____o:___p:/ [ <%= pkg.name %> - <%= pkg.version %> ]\n\
 *\n\
 * @license <%= pkg.license %> © <%= _.pluck(pkg.authors, 'name').join(', ') %>\n\
 */\n"
		},

		"requirejs" : {
			"options" : {
				"baseUrl" : "bower_components",
				"appDir" : "<%= build.src %>",
				"dir" : "<%= build.dist %>",
				"optimize" : "none",
				"optimizeCss" : "none",
				"skipDirOptimize" : true,
				"keepBuildDir" : true,
				"fileExclusionRegExp": /^(?:\.(?!travis|gitignore)|dist|node_modules|scripts|test|tasks|guides|jsduck|(?:version|dev|Gruntfile)\.js|(?:package|bower)\.json)/,
				"packages" : [{
					"name" : "jquery",
					"location" : "empty:"
				}, {
					"name" : "when",
					"location" : "empty:"
				}, {
					"name" : "poly",
					"location" : "empty:"
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
				"rawText" : {
					"troopjs/version" : "define([], <%= JSON.stringify(pkg.version) %>);\n"
				}
			},

			"bundles" : {
				"options" : {
					"modules" : [{
						"name": "troopjs/main",
						"excludeShallow": [
							"troopjs/main"
						]
					}]
				}
			}
		},

		eslint: {
			options: {
				// custom eslint rules configuration.
				config: '.eslintrc',
				rulesdir: ['eslint']
			},
			// including all source files.
			target: grunt.file.expand([
				'bower_components/troopjs-*/**/*.js',
				'!bower_components/troopjs-*/{test,bower_components}/**'
			])
		},

		"clean" : {
			"dist" : [ "<%= build.dist %>" ]
		},

		"uglify" : {
			"options" : {
				"report": "min",
				"preserveComments" : false
			},
			"bundles" : {
				"files" : [{
					"expand" : true,
					"dest" : "<%= build.dist %>",
					"cwd" : "<%= build.dist %>",
					"src" : [ "main.js" ],
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
			"bundles" : {
				"files" : [{
					"expand" : true,
					"cwd" : "<%= build.dist %>",
					"src" : [
						"main.js",
						"main.min.js"
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
			"bundles" : {
				"options" : {
					"branch" : "build/3.x",
					"dir" : "<%= build.dist %>"
				}
			}
		},

		"buster" : {
			"troopjs" : {}
		},

		"jsduck" : {
			"config_file" : "jsduck.json"
		}
	});

	grunt.event.on("git-describe", function (git_version) {
		grunt.config("pkg.version", format(semver(semver.clean(grunt.config("pkg.version")) + "+" + git_version.object)));
	});

	// Load all grunt tasks from package.json
	require("load-grunt-tasks")(grunt);

	//Load all local grunt tasks
	grunt.loadTasks("tasks");

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
				args.push("clean", "git-dist:bundles:clone", "default");
				break;

			case "perform":
				grunt.log.subhead("Performing release");
				args.push("git-dist:bundles:add", "git-dist:bundles:commit");
				if (grunt.option("no-tag")) {
					grunt.log.writeln("Not tagging as " + "--no-tag".cyan + " was passed");
				}
				else {
					args.push("git-dist:bundles:tag");
				}
				args.push("git-dist:bundles:push");
				break;

			default:
				args.push(name + ":prepare", name + ":perform");
		}

		grunt.task.run(args);
	});

	grunt.registerTask("compile", [ "git-describe", "transform", "requirejs" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("test", [ "buster" ]);
	grunt.registerTask("docs", [ "jsduck" ]);
	grunt.registerTask("default", [ "troopjs-lint", "compile", "compress", "usebanner", "docs" ]);
};
