/*global module:false*/
module.exports = function(grunt) {

	grunt.initConfig({
		"pkg": grunt.file.readJSON('package.json'),

		"build" : {
			"src" : "src",
			"dist" : "dist"
		},

		"requirejs" : {
			"compile" : {
				"options" : {
					"baseUrl" : "<%= build.src %>",
					"dir" : "<%= build.dist %>",
					"optimize" : "none",
					"skipDirOptimize" : true,
					"keepBuildDir" : true,
					"fileExclusionRegExp": /^\./,

					"packages" : [{
						"name" : "jquery",
						"location" : "empty:"
					}, {
						"name" : "when",
						"location" : "lib/when",
						"main" : "when"
					}, {
						"name" : "poly",
						"location" : "lib/poly",
						"main" : "es5"
					}, {
						"name" : "troopjs-bundle",
						"location" : "."
					}, {
						"name" : "troopjs-core",
						"location" : "lib/troopjs-core/src"
					}, {
						"name" : "troopjs-browser",
						"location" : "lib/troopjs-browser/src"
					}, {
						"name" : "troopjs-data",
						"location" : "lib/troopjs-data/src"
					}, {
						"name" : "troopjs-utils",
						"location" : "lib/troopjs-utils/src"
					}, {
						"name" : "troopjs-jquery",
						"location" : "lib/troopjs-jquery/src"
					}, {
						"name" : "troopjs-requirejs",
						"location" : "lib/troopjs-requirejs/src"
					}],

					"modules" : [{
						"name" : "troopjs-bundle/micro"
					}, {
						"name" : "troopjs-bundle/mini"
					}, {
						"name" : "troopjs-bundle/maxi"
					}]
				}
			}
		},

		"uglify" : {
			"bundles" : {
				"files" : [{
					"expand" : true,
					"cwd" : "<%= build.dist %>",
					"src" : "*.js",
					"dest" : "<%= build.dist %>",
					"ext" : ".min.js"
				}]
			}
		},

		"git-describe" : {
			"me" : {
				"options" : {
					"prop" : "pkg.version"
				}
			}
		},

		"concat" : {
			"options" : {
				"stripBanners" : true,
				"banner" : "/**\n" +
					" * <%= pkg.name %> - <%= pkg.version %>\n" +
					" * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se\n" +
					" */\n"
			},
			"bundles" : {
				"files" : [{
					"expand" : true,
					"cwd" : "<%= build.dist %>",
					"src" : "*.js",
					"dest" : "<%= build.dist %>"
				}]
			}
		},

		"json-replace" : {
			"options" : {
				"space" : "\t",
				"replace" : {
					"version" : "<%= pkg.version %>"
				}
			},
			"bundles" : {
				"files" : [{
					"src" : "./package.json",
					"dest" : "<%= build.dist %>/package.json"
				}]
			}
		},

		"buster" : {
			"troopjs-bundle" : {}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-git-describe");
	grunt.loadNpmTasks("grunt-json-replace");
	grunt.loadNpmTasks("grunt-plugin-buster");

	grunt.registerTask("default", [ "requirejs", "uglify", "git-describe", "json-replace", "concat" ]);
};