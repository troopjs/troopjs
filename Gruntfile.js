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

		"build": {
			"src": ".",
			"dist": "dist",
			"header": "\
/*!\n\
 *   ____ .     ____  ____  ____    ____.\n\
 *   \\   (/_\\___\\  (__\\  (__\\  (\\___\\  (/\n\
 *   / ._/  ( . _   \\  . /   . /  . _   \\_\n\
 * _/    ___/   /____ /  \\_ /  \\_    ____/\n\
 * \\   _/ \\____/   \\____________/   /\n\
 *  \\_t:_____r:_______o:____o:___p:/ [ <%= pkg.name %> - <%= pkg.version %> ]\n\
 *\n\
 * @license <%= pkg.license %> © <%= _.pluck(pkg.authors, 'name').join(', ') %>\n\
 */\n",

		"footer": "\
define(['troopjs/version'], function (version) {\n\
	return version;\n\
});"
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
				"fileExclusionRegExp": /^(?:node_modules|scripts|grunt|eslint|jsduck|test|guides|\.(?!gitignore)|package\.json|(?:version|require|buster|Gruntfile)\.js)/,
				"rawText" : {
					"troopjs/version" : "define([], { 'toString': function () { return <%= JSON.stringify(pkg.version) %>; } });\n"
				},
				"wrap": {
					"start": "<%= build.header %>",
					"end": "<%= build.footer %>"
				}
			},

			"bundle" : {
				"options" : {
					"modules" : [{
						"name": "troopjs/main",
						"exclude": [
							"jquery",
							"when/when",
							"poly/es5"
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
				config: ".eslintrc",
				rulesdir: [ "eslint" ]
			},
			// including all source files.
			target: grunt.file.expand([
				"bower_components/troopjs-*/**/*.js",
				"!bower_components/troopjs-*/{test,bower_components}/**"
			])
		},

		"clean" : {
			"dist" : [ "<%= build.dist %>" ]
		},

		"uglify" : {
			"options" : {
				"report": "min",
				"preserveComments" : function (node, comment) {
					return /^!/.test(comment.value);
				}
			},
			"bundle" : {
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
			"bundle" : {}
		},

		"buster" : {
			"bundle" : {}
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

	// Load all local grunt tasks
	grunt.loadTasks("grunt");

	// Define tasks
	grunt.registerTask("compile", [ "git-describe", "requirejs" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("test", [ "buster" ]);
	grunt.registerTask("docs", [ "jsduck" ]);
	grunt.registerTask("default", [ "compile", "compress", "docs" ]);
};
