/*global module:false*/
module.exports = function(grunt) {
	var UNDEFINED;
	var PACKAGES = [{
		"name" : "troopjs-bundle",
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
	}];

	grunt.initConfig({
		"pkg": grunt.file.readJSON('package.json'),

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
				"fileExclusionRegExp": /^(?:.git|.gitignore|.gitmodules|node_modules|Gruntfile.js|support|test|dist)$/
			},
			"micro" : {
				"options" : {
					"packages" : PACKAGES.concat([{
						"name" : "jquery",
						"location" : "empty:"
					}, {
						"name" : "when",
						"location" : "empty:"
					}, {
						"name" : "poly",
						"location" : "empty:"
					}]),

					"modules" : [{
						"name" : "troopjs-bundle/micro"
					}]
				}
			},
			"mini" : {
				"options" : {
					"packages" : PACKAGES.concat([{
						"name" : "jquery",
						"location" : "empty:"
					}, {
						"name" : "when",
						"location" : "lib/when",
						"main" : "empty:"
					}, {
						"name" : "poly",
						"location" : "lib/poly",
						"main" : "es5"
					}]),

					"modules" : [{
						"name" : "troopjs-bundle/mini"
					}]
				}
			},
			"maxi" : {
				"options" : {
					"packages" : PACKAGES.concat([{
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
					}]),

					"modules" : [{
						"name" : "troopjs-bundle/maxi"
					}]
				}
			}
		},

		"clean" :[ "<%= build.dist %> "],

		"uglify" : {
			"options" : {
				"preserveComments" : false
			},
			"micro" : {
				"files" : {
					"<%= build.dist %>/micro.min.js" : "<%= build.dist %>/micro.js"
				}
			},
			"mini" : {
				"files" : {
					"<%= build.dist %>/mini.min.js" : "<%= build.dist %>/mini.js"
				}
			},
			"maxi" : {
				"files" : {
					"<%= build.dist %>/maxi.min.js" : "<%= build.dist %>/maxi.js"
				}
			}
		},

		"git-describe" : {
			"bundles" : {
				"options" : {
					"prop" : "pkg.version"
				}
			}
		},

		"concat" : {
			"bundles" : {
				"options" : {
					"stripBanners" : true,
					"banner" : "<%= build.banner %>"
				},
				"files" : [{
					"expand" : true,
					"cwd" : "<%= build.dist %>",
					"src" : "{maxi,mini,micro}.js",
					"dest" : "<%= build.dist %>"
				}]
			}
		},

		"json-replace" : {
			"bundles" : {
				"options" : {
					"space" : "  ",
					"replace" : {
						"version" : "<%= pkg.version %>",
						"devDependencies" : UNDEFINED
					}
				},
				"files" : [{
					"src" : "<%= build.dist %>/package.json",
					"dest" : "<%= build.dist %>/package.json"
				}]
			}
		},

		"git-dist" : {
			"bundles" : {
				"options" : {
					"url" : "<%= pkg.repository.url %>",
					"branch" : "build/2.x",
					"dir" : "<%= build.dist %>",
					"message" : "<%= pkg.name %> - <%= pkg.version %>",
					"name" : "<%= pkg.author.name %>",
					"email" : "<%= pkg.author.email %>"
				}
			}
		},

		"buster" : {
			"troopjs-bundle" : {}
		}
	});


	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-requirejs");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-git-describe");
	grunt.loadNpmTasks("grunt-git-dist");
	grunt.loadNpmTasks("grunt-json-replace");
	grunt.loadNpmTasks("grunt-plugin-buster");

	grunt.registerTask("compile", [ "requirejs", "git-describe", "concat", "json-replace" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("dist", [ "clean", "git-dist:bundles:clone", "compile", "compress", "git-dist:bundles:configure", "git-dist:bundles:commit", "git-dist:bundles:push" ]);
	grunt.registerTask("default", [ "compile" ])
};