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
				" * <%= pkg.name %> - <%= pkg.version %>\n" +
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
				"fileExclusionRegExp": /^(?:\.\w+|node_modules|support|test|dist|Gruntfile\.js)$/,
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
							"troopjse/mini",
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
					"prop" : "pkg.version"
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

		"json-replace" : {
			"options" : {
				"space" : "\t"
			},
			"package.json" : {
				"options" : {
					"replace" : {
						"version" : "<%= pkg.version %>",
						"devDependencies" : UNDEFINED
					}
				},
				"files" : {
					"<%= build.dist %>/package.json" : "<%= build.dist %>/package.json"
				}
			},
			"bower.json" : {
				"options" : {
					"replace" : {
						"version" : "<%= pkg.version %>"
					}
				},
				"files" : {
					"<%= build.dist %>/bower.json" : "<%= build.dist %>/bower.json"
				}
			}
		},

		"git-dist" : {
			"bundles" : {
				"options" : {
					"branch" : "build/2.x",
					"dir" : "<%= build.dist %>",
					"message" : "<%= pkg.name %> - <%= pkg.version %>",
					"name" : "<%= pkg.author.name %>",
					"email" : "<%= pkg.author.email %>"
				}
			}
		},

		"buster" : {
			"troopjs" : {}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-banner");
	grunt.loadNpmTasks("grunt-git-describe");
	grunt.loadNpmTasks("grunt-git-dist");
	grunt.loadNpmTasks("grunt-json-replace");
	grunt.loadNpmTasks("grunt-plugin-buster");

	grunt.registerTask("compile", [ "requirejs" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("version", [ "git-describe", "usebanner", "json-replace" ]);
	grunt.registerTask("test", [ "buster" ]);
	grunt.registerTask("dist", [ "clean", "git-dist:bundles:clone", "compile", "compress", "version", "git-dist:bundles:configure", "git-dist:bundles:commit", "git-dist:bundles:push" ]);
	grunt.registerTask("default", [ "compile", "compress" ]);
};