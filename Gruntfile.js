/**
 * @license MIT http://troopjs.mit-license.org/
 */
/*globals module:false*/
module.exports = function(grunt) {
	"use strict";

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
			"banner" : "\
/**\n\
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
				"mainConfigFile": "require.js",
				"appDir" : "<%= build.src %>",
				"dir" : "<%= build.dist %>",
				"optimize" : "none",
				"optimizeCss" : "none",
				"skipDirOptimize" : true,
				"keepBuildDir" : true,
				"fileExclusionRegExp": /^(?:\.(?!travis|gitignore)|node_modules|scripts|test|tasks|guides|jsduck|(?:version|bootstrap|require|buster|Gruntfile)\.js|(?:package|bower)\.json)/,
				"rawText" : {
					"troopjs/version" : "define([], { 'toString': function () { return <%= JSON.stringify(pkg.version) %>; } });\n"
				}
			},

			"bundles" : {
				"options" : {
					"modules" : [{
						"name": "troopjs/main",
						"exclude": [
							"jquery",
							"when",
							"poly"
						],
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

	grunt.registerTask("compile", [ "git-describe", "transform", "requirejs" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("test", [ "buster" ]);
	grunt.registerTask("docs", [ "jsduck" ]);
	grunt.registerTask("default", [ "troopjs-lint", "compile", "compress", "usebanner", "docs" ]);
};
