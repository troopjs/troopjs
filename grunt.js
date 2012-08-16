/*global module:false*/
module.exports = function(grunt) {
	var files = {
		core : [ "troopjs-core/remote/ajax",
			"troopjs-core/route/router",
			"troopjs-core/store/local",
			"troopjs-core/store/session",
			"troopjs-core/dimensions/service",
			"troopjs-core/route/router",
			"troopjs-core/route/placeholder",
			"troopjs-core/widget/application" ],
		utils : [ "troopjs-utils/each",
			"troopjs-utils/grep",
			"troopjs-utils/merge",
			"troopjs-utils/tr",
			"troopjs-utils/unique",
			"troopjs-utils/when",
			"troopjs-utils/getargs" ],
		jquery : [ "troopjs-jquery/action",
			"troopjs-jquery/destroy",
			"troopjs-jquery/resize",
			"troopjs-jquery/dimensions",
			"troopjs-jquery/hashchange",
			"troopjs-jquery/weave" ],
		requirejs : [ "troopjs-requirejs/template" ]
	};

	// Project configuration.
	grunt.config.init({
		meta : {
			version : "SNAPSHOT",
			auth : "<json:auth.json>",
			banner : "/*!\n" +
				"* TroopJS Bundle - <%= meta.version %>\n" +
				"* http://troopjs.com/\n" +
				"* Copyright (c) <%= grunt.template.today('yyyy') %> " + "Mikael Karon <mikael@karon.se>\n" +
				"* Licensed MIT\n" +
				"*/",
			path : {
				bundle : "dist/troopjs-bundle.js",
				min : "dist/troopjs-bundle.min.js"
			}
		},
		clean : {
			dist : [ "<config:meta.path.bundle>", "<config:meta.path.min>" ]
		},
		lint : {
			src: [ "grunt.js", "src/lib/troopjs-*/src/**/*.js" ]
		},
		requirejs : {
			dist : {
				options : {
					out : "<config:meta.path.bundle>",
					baseUrl : "src",
					paths : {
						"compose" : "lib/composejs/compose",
						"troopjs-core" : "lib/troopjs-core/src",
						"troopjs-utils" : "lib/troopjs-utils/src",
						"troopjs-jquery" : "lib/troopjs-jquery/src",
						"troopjs-requirejs" : "lib/troopjs-requirejs/src"
					},
					map : {
						"*" : {
							"jquery" : "empty:",
							"config" : "empty:"
						}
					},
					include : Array.prototype.concat(files.core, files.utils, files.jquery, files.requirejs),
					optimize : "none"
				}
			}
		},
		buster : {
			test : {
				config : "test/buster.js"
			}
		},
		concat : {
			dist : {
				src : [ "<banner>", "<config:requirejs.dist.options.out>" ],
				dest : "<config:meta.path.bundle>"
			}
		},
		min : {
			dist : {
				src : [ "<banner>", "<config:concat.dist.dest>" ],
				dest : "<config:meta.path.min>"
			}
		},
		upload : {
			"troopjs-bundle.js" : {
				repo : "troopjs/troopjs-bundle",
				auth : "<%= [ meta.auth.username, meta.auth.password ].join(':') %>",
				file : "<config:concat.dist.dest>",
				description : "TroopJS bundle - <%= meta.version %>"
			},
			"troopjs-bundle.min.js" : {
				repo : "troopjs/troopjs-bundle",
				auth : "<%= [ meta.auth.username, meta.auth.password ].join(':') %>",
				file : "<config:min.dist.dest>",
				description : "TroopJS bundle - <%= meta.version %> (minified)"
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib");
	grunt.loadNpmTasks("grunt-buster");
	grunt.loadNpmTasks("grunt-git-describe");
	grunt.loadNpmTasks("grunt-github-upload");

	grunt.registerTask("test", "lint buster");
	grunt.registerTask("dist", "describe requirejs concat min");
	grunt.registerTask("default", "test dist");
};
