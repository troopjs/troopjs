/*jshint node:true*/
module.exports = function(grunt) {
	"use strict";

	var semver = require("semver");
	var path = require("path");
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
			"banner" : "/**\n\
 *   ____ .     ____  ____  ____    ____.\n\
 *   \\   (/_\\___\\  (__\\  (__\\  (\\___\\  (/\n\
 *   / ._/  ( . _   \\  . /   . /  . _   \\_\n\
 * _/    ___/   /____ /  \\_ /  \\_    ____/\n\
 * \\   _/ \\____/   \\____________/   /\n\
 *  \\_t:_____r:_______o:____o:___p:/ [ <%= pkg.name %> - <%= pkg.version %> ]\n\
 *\n\
 * @license <%= _.pluck(pkg.licenses, 'type').join(', ') %> <%= _.pluck(pkg.licenses, 'url').join(', ') %> © <%= pkg.author.name %> mailto:<%= pkg.author.email %>\n\
 */"
		},

		"requirejs" : {
			"options" : {
				"baseUrl" : "<%= build.src %>",
				"dir" : "<%= build.dist %>",
				"optimize" : "none",
				"optimizeCss" : "none",
				"skipDirOptimize" : true,
				"keepBuildDir" : true,
				"fileExclusionRegExp": /^(?:dist|node_modules|test|tasks|guides|Gruntfile\.js|jsduck\.json|\.(?!travis\.yml|gitignore))/,
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
					"location" : "bower_components/troopjs-core"
				}, {
					"name" : "troopjs-browser",
					"location" : "bower_components/troopjs-browser"
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
					"troopjs/version" : "define(function () { return <%= JSON.stringify(pkg.version) %>; });\n"
				},
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
							"troopjs/mini"
						]
					}, {
						"name" : "troopjs/mini",
						"include" : [ "troopjs/version" ],
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
				"preserveComments" : false
			},
			"dist" : {
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
			"dist" : {
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
			"dist" : {
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

	// Load all local and NPM tasks
	grunt.loadTasks("tasks");
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

	grunt.registerTask("rewrite", "Rewrite package files", function () {
		var _ = grunt.util._;
		var re = /^troopjs-\w+/;

		var replacer = function (key, value) {
			return _.isEmpty(value) ? UNDEFINED : value;
		}

		var bower_path = path.join(grunt.config("build.dist"), "bower.json");
		var package_path = path.join(grunt.config("build.dist"), "package.json");

		try {
			grunt.log.write("Reading " + bower_path + "...");
			var bower_json = grunt.file.readJSON(bower_path);
			grunt.log.ok();

			grunt.log.write("Omitting troop dependencies...");
			bower_json.dependencies = _.omit(bower_json.dependencies, function (value, key) {
				return re.test(key);
			});
			grunt.log.ok();

			grunt.log.write("Reading " + package_path + "...");
			var package_json = grunt.file.readJSON(package_path);
			grunt.log.ok();

			grunt.log.write("Updating versions...");
			package_json.version = bower_json.version = grunt.config("pkg.version");
			grunt.log.ok();

			grunt.log.write("Writing " + bower_path + "...");
			grunt.file.write(bower_path, JSON.stringify(bower_json, replacer, "\t"));
			grunt.log.ok();

			grunt.log.write("Writing " + package_path + "...");
			grunt.file.write(package_path, JSON.stringify(package_json, replacer, "\t"));
			grunt.log.ok();
		}
		catch (e) {
			grunt.fatal(e);
		}
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
				args.push("clean", "git-dist:dist:clone", "default");
				break;

			case "perform":
				grunt.log.subhead("Performing release");
				args.push("git-dist:dist:add", "git-dist:dist:commit");
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

	grunt.registerTask("compile", [ "requirejs", "git-describe", "rewrite" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("test", [ "buster" ]);
	grunt.registerTask("default", [ "compile", "compress", "usebanner" ]);
	grunt.registerTask("docs", [ "jsduck" ]);
};
