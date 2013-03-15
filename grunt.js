/*global module:false*/
module.exports = function(grunt) {

	grunt.loadNpmTasks("grunt-contrib");
	grunt.loadNpmTasks("grunt-buster");
	grunt.loadNpmTasks("grunt-git-describe");

	grunt.registerTask("test", "lint buster");
	grunt.registerTask("dist", "describe requirejs concat min");
	grunt.registerTask("default", "test clean dist");

	grunt.config.init({
		"meta" : {
			"package" : "<json:package.json>",
			"version" : "<config:meta.package.version>",
			"banner" : "/*!\n" +
				"* TroopJS Bundle - <%= meta.version %>\n" +
				"* http://troopjs.com/\n" +
				"* Copyright (c) <%= grunt.template.today('yyyy') %> " + "Mikael Karon <mikael@karon.se>\n" +
				"* Licensed MIT\n" +
				"*/",
			"dist" : {
				"max" : "dist/troopjs-bundle.js",
				"min" : "dist/troopjs-bundle.min.js"
			}
		},
		"clean" : "<config:meta.dist>",
		"lint" : {
			"src" : [ "grunt.js", "src/lib/troopjs-*/src/**/*.js" ]
		},
		"requirejs" : {
			"dist" : {
				"options" : {
					"out" : "<config:meta.dist.max>",
					"baseUrl" : "src",
					"paths" : {
						"compose" : "lib/composejs/compose",
						"jquery" : "empty:",
						"config" : "empty:",
						"troopjs-core" : "lib/troopjs-core/src",
						"troopjs-utils" : "lib/troopjs-utils/src",
						"troopjs-jquery" : "lib/troopjs-jquery/src",
						"troopjs-requirejs" : "lib/troopjs-requirejs/src"
					},
					"include" : grunt.file.expandFiles("src/lib/troopjs-*/src/**/*.js").map(function (file) {
						return file.replace(/.*\/(troopjs-\w+)\/src\/(.+)\.js$/, "$1/$2");
					}),
					"optimize" : "none"
				}
			}
		},
		"concat" : {
			"dist" : {
				"src" : [ "<banner>", "<config:requirejs.dist.options.out>" ],
				"dest" : "<config:meta.dist.max>"
			}
		},
		"min" : {
			"dist" : {
				"src" : [ "<banner>", "<config:concat.dist.dest>" ],
				"dest" : "<config:meta.dist.min>"
			}
		}
	});
};
