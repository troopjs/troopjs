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
				"fileExclusionRegExp": /^(?:\.\w+|node_modules|Gruntfile\.js|support|test|dist)$/,
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
				}]
			},
			"micro" : {
				"options" : {
					"exclude" : [ "jquery", "when", "poly" ],
					"modules" : [{
						"name" : "troopjs-bundle/micro"
					}]
				}
			},
			"mini" : {
				"options" : {
					"exclude" : [ "jquery", "when" ],
					"modules" : [{
						"name" : "troopjs-bundle/mini"
					}]
				}
			},
			"maxi" : {
				"options" : {
					"exclude" : [ "jquery" ],
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

		"usebanner" : {
			"options" : {
				"position" : "top",
				"banner" : "<%= build.banner %>"
			},
			"micro" : {
				"files" : {
					"src" : [ "<%= build.dist %>/micro.js", "<%= build.dist %>/micro.min.js" ]
				}
			},
			"mini" : {
				"files" : {
					"src" : [ "<%= build.dist %>/mini.js", "<%= build.dist %>/mini.min.js" ]
				}
			},
			"maxi" : {
				"files" : {
					"src" : [ "<%= build.dist %>/maxi.js", "<%= build.dist %>/maxi.min.js" ]
				}
			}
		},

		"json-replace" : {
			"options" : {
				"space" : "  "
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
	grunt.loadNpmTasks("grunt-banner");
	grunt.loadNpmTasks("grunt-git-describe");
	grunt.loadNpmTasks("grunt-git-dist");
	grunt.loadNpmTasks("grunt-json-replace");
	grunt.loadNpmTasks("grunt-plugin-buster");

	grunt.registerTask("compile", [ "requirejs" ]);
	grunt.registerTask("compress", [ "uglify" ]);
	grunt.registerTask("version", [ "git-describe", "usebanner", "json-replace" ]);
	grunt.registerTask("dist", [ "clean", "git-dist:bundles:clone", "compile", "compress", "version", "git-dist:bundles:configure", "git-dist:bundles:commit", "git-dist:bundles:push" ]);
	grunt.registerTask("default", [ "compile" ]);
};