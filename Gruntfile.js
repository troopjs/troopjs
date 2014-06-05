/*global module:false*/
module.exports = function (grunt) {

	var semver = require("semver");

	// Load all grunt tasks
	require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);

	grunt.registerTask("test", ["jshint"]);
	grunt.registerTask("dist", ["git-describe", "requirejs", "concat", "uglify"]);
	grunt.registerTask("release", "package and release", function (phase) {
		var name = this.name;
		var args = [];

		switch (phase) {
			case "prepare":
				grunt.log.subhead("Preparing release");
				args.push("clean", "git-dist:dist:clone", "dist");
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
	grunt.registerTask("default", ["test", "clean", "dist"]);

	grunt.event.once("git-describe", function (git_version) {
		grunt.config("pkg.version", git_version[0]);
	});

	grunt.config.init({
		"pkg": grunt.file.readJSON("package.json"),
		"meta": {
			"banner": "/*!\n" +
				"* TroopJS Bundle - <%= pkg.version %>\n" +
				"* http://troopjs.com/\n" +
				"* Copyright (c) <%= grunt.template.today('yyyy') %> " + "Mikael Karon <mikael@karon.se>\n" +
				"* Licensed MIT\n" +
				"*/",
			dist: {
				max: "dist/troopjs-bundle.js",
				min: "dist/troopjs-bundle.min.js"
			}
		},
		clean: [ "dist" ],
		jshint: {
			src: [ "grunt.js", "src/lib/troopjs-*/src/**/*.js" ]
		},
		"requirejs": {
			"dist": {
				"options": {
					"out": "<%= meta.dist.max %>",
					"baseUrl": "src",
					"paths": {
						"compose": "lib/composejs/compose",
						"jquery": "empty:",
						"config": "empty:",
						"troopjs-core": "lib/troopjs-core/src",
						"troopjs-utils": "lib/troopjs-utils/src",
						"troopjs-jquery": "lib/troopjs-jquery/src",
						"troopjs-requirejs": "lib/troopjs-requirejs/src"
					},
					include: grunt.file.expand("src/lib/troopjs-*/src/**/*.js").map(function (file) {
						return file.replace(/.*\/(troopjs-\w+)\/src\/(.+)\.js$/, "$1/$2");
					}),
					optimize: "none"
				}
			}
		},
		concat: {
			dist: {
				src: [ "<%= meta.banner %>", "<%= meta.dist.max %>" ],
				dest: "<%= meta.dist.max %>"
			}
		},
		"uglify": {
			"dist": {
				"src": [ "<%= meta.banner %>", "<%= concat.dist.dest %>" ],
				"dest": "<%= meta.dist.min %>"
			}
		},
		"git-describe": {
			"bundle": {}
		},
		"git-dist": {
			"options": {
				"message": "TroopJS Bundle - <%= pkg.version %>",
				"tag": "<%= pkg.version %>"
			},
			dist: {
				"options": {
					"branch": "build/1.x",
					"dir": "dist"
				}
			}
		}
	});
};
