/*jshint node:true*/
module.exports = function(grunt) {
	"use strict";

	var UNDEFINED;
	var semver = require("semver");
	var path = require("path");
	var _ = require("lodash");

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

	/**
	 * Reads from and writes to passing callback
	 * @param from {String} From path
	 * @param to {String} To path
	 * @param callback {Function} Callback
	 */
	function transform(from, to, callback) {
		grunt.log.write("Transforming from " + from.cyan + " to " + to.cyan + "...");
		grunt.file.write(to, JSON.stringify(_.transform(from), callback));
		grunt.log.ok();
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
				"baseUrl" : "<%= build.src %>",
				"dir" : "<%= build.dist %>",
				"optimize" : "none",
				"optimizeCss" : "none",
				"skipDirOptimize" : true,
				"keepBuildDir" : true,
				"fileExclusionRegExp": /^(?:dist|node_modules|test|tasks|guides|(?:version|Gruntfile)\.js|(?:package|bower|jsduck)\.json|\.travis\.yml|\.gitignore)/,
				"packages" : [{
					"name": "text",
					"location": "empty:"
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
					"main" : "maxi"
				}, {
					"name" : "troopjs-composer",
					"location" : "bower_components/troopjs-composer"
				}, {
					"name" : "troopjs-core",
					"location" : "bower_components/troopjs-core"
				}, {
					"name" : "troopjs-browser",
					"location" : "bower_components/troopjs-browser"
				}, {
					"name" : "troopjs-net",
					"location" : "bower_components/troopjs-net"
				}, {
					"name" : "troopjs-data",
					"location" : "bower_components/troopjs-data"
				}, {
					"name" : "troopjs-utils",
					"location" : "bower_components/troopjs-utils"
				}, {
					"name" : "troopjs-jquery",
					"location" : "bower_components/troopjs-jquery"
				}, {
					"name" : "troopjs-requirejs",
					"location" : "bower_components/troopjs-requirejs"
				}],
				"rawText" : {
					"troopjs/version" : "define([], <%= JSON.stringify(pkg.version) %>);\n"
				}
			},

			"bundles" : {
				"options" : {
					"modules" : [{
						"name" : "troopjs/maxi",
						"excludeShallow" : [
							"troopjs/maxi",
							"troopjs/mini"
						]
					}, {
						"name" : "troopjs/mini",
						"excludeShallow" : [
							"troopjs/mini"
						]
					}]
				}
			}
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
					"src" : [ "{mini,maxi}.js" ],
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
						"{mini,maxi}.js",
						"{mini,maxi}.min.js"
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

	grunt.registerTask("transform", "Transform package files", function () {
		var src = grunt.config("build.src");
		var dist = grunt.config("build.dist");
		var version = grunt.config("pkg.version");

		transform(path.join(src, "bower.json"), path.join(dist, "bower.json"), function (result, value, key) {
			switch (key) {
				case "version":
					result[key] = version;
					break;

				case "dependencies":
					result[key] = _.omit(value, function (version, name) {
						return /^troopjs-\w+$/.test(name);
					});
					break;

				default:
					result[key] = value;
			}
		});

		transform(path.join(src, "package.json"), path.join(dist, "package.json"), function (result, value, key) {
			switch (key) {
				case "version":
					result[key] = version;
					break;

				default:
					result[key] = value;
			}
		});
	});

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
				args.push("git-dist:bunles:push");
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
