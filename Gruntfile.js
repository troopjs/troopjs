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
			"banner" : "/**\n" +
				" * <%= pkg.name %> - <%= pkg.version %> © <%= pkg.author.name %> mailto:<%= pkg.author.email %>\n" +
				" * @license <%= _.pluck(pkg.licenses, 'type').join(', ') %> <%= _.pluck(pkg.licenses, 'url').join(', ') %>\n" +
				" */"
		},

		"requirejs" : {
			"options" : {
				"baseUrl" : "<%= build.src %>",
				"dir" : "<%= build.dist %>",
				"optimize" : "none",
				"optimizeCss" : "none",
				"skipDirOptimize" : true,
				"keepBuildDir" : true,
				"fileExclusionRegExp": /^(?:dist|node_modules|test|Gruntfile\.js|\.(?!travis\.yml|gitignore))/,
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
							"troopjs/mini",
							"troopjs/micro"
						]
					}, {
						"name" : "troopjs/mini",
						"include" : [ "troopjs/version" ],
						"excludeShallow" : [
							"troopjs/mini",
							"troopjs/micro"
						]
					}, {
						"name" : "troopjs/micro",
						"include" : [ "troopjs/version" ],
						"excludeShallow" : [ "troopjs/micro" ]
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
					"src" : [ "{micro,mini,maxi}.js" ],
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
						"{micro,mini,maxi}.js",
						"{micro,mini,maxi}.min.js"
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
					"branch" : "build/2.x",
					"dir" : "<%= build.dist %>"
				}
			}
		},

		"buster" : {
			"troopjs" : {}
		},

		"jsduck" : {
			"guides": "guides.json"
		}
	});

	grunt.event.on("git-describe", function (git_version) {
		grunt.config("pkg.version", format(semver(semver.clean(grunt.config("pkg.version")) + "+" + git_version.object)));
	});

	// Load all grunt tasks
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

	grunt.registerTask("jsduck", "Build API Documentation with JSDuck.",function () {

		// Makes the task async.
		var done = this.async();

		var _ = grunt.util._;

		// Generate a guides.json file that indices the markdown docs from sub modules as JSDuck guides.
		// https://github.com/senchalabs/jsduck/wiki/Guides
		function generate_guides_json() {

			// Skeletons.
			var HEADER = "// This file is generated from the grunt build, DO NOT MAKE manual modification.",
				FOLDER = { title: '',items: [] },
				NODE = { name: '',title: '',url: '' };

			// UI Labels.
			var ROOT_SECTION_NAME = "General",
				OVERVIEW_TITLE = "Overview",
				GUIDE_TITLE = "TroopJS Developer Guides";

			function makeFolder(spec) {
				return _.extend(_.clone(FOLDER,true),spec);
			}

			function makeNode(spec) {
				return _.extend(_.clone(NODE,true),spec);
			}

			function capitalize(string) {
				return string.charAt(0).toUpperCase()+string.slice(1).toLowerCase();
			}

			function deepSortItems(entry) {
				if (entry && "items" in entry) {
					var items = entry.items;
					entry.items = _.sortBy(items,function(section) {
						var order = section.order;
						delete section.order;
						return order;
					});

					items = entry.items;
					for (var i = 0, l = items.length; i < l; i++) {
						deepSortItems(items[i]);
					}
				}
			}

			// Make a copy of the root README in 'guides' directory,
			// to work around a JSDuck limitation.
			var tmp_dir = "guides/overview";
			if (grunt.file.exists("README.md"))
				grunt.file.copy("README.md",path.join(tmp_dir,"README.md"));

			// Blob the MD files from all sub modules.
			var module_guides = grunt.file.expand({
					// Avoid adding README files from sub module dependencies.
					filter: function(path) {
						return path.lastIndexOf("bower_components") <= 0;
					}
				},
				// Module README.
				'**/troopjs-*/**/README.md',
				// Additional Guidelines.
				'**/guides/**/README.md',
				// Excludes the dist.
				'!' + grunt.config('build.dist') + '/**/*'
			);

			var sections = {};

			grunt.util.recurse(module_guides,function(doc_path) {
				grunt.log.ok("located doc: ", doc_path);

				var section_name,
					directory,
					id, title, order;

				var parts = doc_path.split(path.sep);

				// Where the doc file resides.
				directory = parts.slice(0, parts.length - 1).join(path.sep);

				// Is it a sub module?
				section_name = /troopjs-/.test(doc_path) ? parts[1] : ROOT_SECTION_NAME;

				// Generate titles for the menu.
				// TODO: Allow title override from markdown file meta.
				id = parts.slice(1, parts.length - 1).join("_").replace(/[-.]/g, "_");
				title = capitalize(parts[parts.length - 2].replace(/[-_]/g, ' '));
				// Is it the module's root README?
				if (/troopjs-\w+$/.test(directory)) title = OVERVIEW_TITLE;

				// Make a folder for the section.
				if (!(section_name in sections)) {
					var module_title, match;
					match = /^troopjs-([^-]*)/.exec(section_name);
					// Is it a section for sub module?
					module_title = match ? match[1] + ' module' : section_name;

					// Raise the order of generic and core sections.
					order = section_name == ROOT_SECTION_NAME ? 1 : section_name == "troopjs-core" ? 2 : 10;
					sections[section_name] = makeFolder({title: module_title, order: order});
				}

				// Put the ones from guides folder at the end, put overview at the head.
				order = /guides/.test(directory) ? 10 : 2;
				if (section_name == ROOT_SECTION_NAME && title == OVERVIEW_TITLE)
					order = 1;

				// Make a node for the doc file.
				var section = sections[section_name].items;
				section.push(makeNode(
					{
						name: id,
						title: title,
						url: directory,
						order: order
					}
				));
			});

			var root = makeFolder({ title: GUIDE_TITLE});
			var items = root.items;
			_.forOwn(sections, function(section) { items.push(section); });

			// Make sure entries are placed at the right order.
			deepSortItems(root);

			var config_file = grunt.config("jsduck.guides");
			grunt.file.write(config_file,[HEADER,JSON.stringify([root],null,2)].join('\n'));

			// Discard the temporary files after the JSDuck run.
			return function cleanUp() {
				grunt.file.delete(tmp_dir);
				grunt.file.delete(config_file);
			};
		}

		// Check JSDuck existence.
		grunt.util.spawn({cmd: "command", args: ["-v", "jsduck"]}, function(error) {
			if (error) grunt.fail.warn("Check JSDuck installation.");

			var cleanup = generate_guides_json();
			grunt.log.subhead("Running JSDuck...");

			// Launch the JSDuck build process.
			grunt.util.spawn({cmd: "jsduck"}, function(error,result) {
				if (error) grunt.fail.warn("JSDuck run wasnt completed");

				cleanup();
				done();
			});
		});
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
	grunt.registerTask("default", [ "compile", "compress", "usebanner", "docs" ]);
	grunt.registerTask("docs", [ "jsduck" ]);
};
