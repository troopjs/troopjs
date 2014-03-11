/*
 * Grunt task for documenting TroopJS with JSDuck.
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
module.exports = function JSDuckTask(grunt) {
	"use strict";

	var path = require("path");
	var _ = grunt.util._;

	grunt.registerTask("jsduck", "Build TroopJS Documentation with JSDuck.", function() {

		var GUIDES_FILE = "grunt-jsduck-guides.json",
			CONFIG_FILE = "grunt-jsduck.json",
			GUIDES_TMP_DIR = "guides/overview";

		function generate_config_files() {

			// Generate a guides.json file that indices the markdown docs from sub modules as JSDuck guides.
			// https://github.com/senchalabs/jsduck/wiki/Guides
			(function guides_json() {

				// Skeletons.
				var FOLDER = { title: "", items: [] },
					NODE = { name: "", title: "", url: "" };

				// UI Labels.
				var ROOT_SECTION_NAME = "General",
					OVERVIEW_TITLE = "Overview",
					GUIDE_TITLE = "TroopJS Developer Guides";

				function makeFolder(spec) {
					return _.extend(_.clone(FOLDER, true), spec);
				}

				function makeNode(spec) {
					return _.extend(_.clone(NODE, true), spec);
				}

				function capitalize(string) {
					return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
				}

				function deepSortItems(entry) {
					if (entry && "items" in entry) {
						var items = entry.items;
						entry.items = _.sortBy(items, function(section) {
							var order = section.order;
							delete section.order;
							return order;
						});

						_.forEach(items, deepSortItems);
					}
				}

				// Make a copy of the root README in 'guides' directory,
				// to work around a JSDuck limitation.
				if (grunt.file.exists("README.md")) {
					grunt.file.copy("README.md", path.join(GUIDES_TMP_DIR, "README.md"));
				}

				// Blob the MD files from all sub modules.
				var module_guides = grunt.file.expand({
						// Avoid adding README files from sub module dependencies.
						filter: function(path) {
							return path.lastIndexOf("bower_components") <= 0;
						}
					},
					// Module README.
					"**/troopjs-*/**/README.md",
					// Additional Guidelines.
					"**/guides/**/README.md",
					// Excludes the dist.
					"!" + grunt.config("build.dist") + "/**/*"
				);

				var sections = {};

				grunt.util.recurse(module_guides, function(doc_path) {
					grunt.log.ok("located doc: ", doc_path);

					var section_name,
						directory,
						id, title, order;

					var parts = doc_path.split("/");

					// Where the doc file resides.
					directory = parts.slice(0, parts.length - 1).join(path.sep);

					// Is it a sub module?
					section_name = /troopjs-/.test(doc_path) ? parts[1] : ROOT_SECTION_NAME;

					// Generate titles for the menu.
					// TODO: Allow title override from markdown file meta.
					id = parts.slice(1, parts.length - 1).join("_").replace(/[-.]/g, "_");
					title = capitalize(parts[parts.length - 2].replace(/[-_]/g, " "));
					// Is it the module's root README?
					if (/troopjs-\w+$/.test(directory)) {
						title = OVERVIEW_TITLE;
					}

					// Make a folder for the section.
					if (!(section_name in sections)) {
						var module_title, match;
						match = /^troopjs-([^-]*)/.exec(section_name);
						// Is it a section for sub module?
						module_title = match ? match[1] + " module" : section_name;

						// Raise the order of generic and core sections.
						order = section_name === ROOT_SECTION_NAME ? 1 : section_name === "troopjs-core" ? 2 : 10;
						sections[section_name] = makeFolder({title: module_title, order: order});
					}

					// Put the ones from guides folder at the end, put overview at the head.
					order = /guides/.test(directory) ? 10 : 2;
					if (section_name === ROOT_SECTION_NAME && title === OVERVIEW_TITLE) {
						order = 1;
					}

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
				_.forOwn(sections, function(section) {
					items.push(section);
				});

				// Make sure entries are placed at the right order.
				grunt.file.write(GUIDES_FILE, JSON.stringify([root]));
			})();

			// Generate the JSDuck config file jsduck.json:
			// https://github.com/senchalabs/jsduck/wiki/Config-file
			(function config_json() {

				// Grabbing sources from sub modules.
				var sources = grunt.file.expand([ "jsduck", "bower_components/troopjs-*" ]);

				// Excludes non-source files from JSDuck run.
				var excludes = _.reduce(sources, function(excludes, module_path) {

					excludes.push(path.join(module_path, "test"));	// To ignore tests.

					var git_ignore = path.join(module_path, ".gitignore");

					// inherits excludes from .gitignore.
					if (grunt.file.isFile(git_ignore)) {
						var ignores = grunt.file.read(git_ignore, {encoding: 'UTF8'});
						ignores.split('\n').forEach(function (line) {
							// Comment
							if (/^#/.test(line) || !line.trim())
								return;
							excludes.push(path.join(module_path, line));	// To ignore tests.
						});
					}

					return excludes;
				}, []);

				var base_config = grunt.config("jsduck.config_file") || "jsduck.json";
				var config = _.extend(grunt.file.exists(base_config) ? grunt.file.readJSON(base_config) : {}, {
					"--": sources,
					"--exclude": excludes,
					"--guides": GUIDES_FILE,
					"--output": path.join(grunt.config("build.dist"), "/docs")
				});

				// Guarantees the existence of output folder.
				grunt.file.mkdir(config["--output"]);
				grunt.file.write(CONFIG_FILE, JSON.stringify(config, null, 2));
			})();

			// Discard the temporary files after the JSDuck run.
			return function cleanUp() {
				/*jshint -W024 */
				grunt.file.delete(GUIDES_TMP_DIR);
				grunt.file.delete(GUIDES_FILE);
				grunt.file.delete(CONFIG_FILE);
			};
		}

		var cleanup = generate_config_files();

		// Makes the task async.
		var done = this.async();
		grunt.log.subhead("Running JSDuck...");
		var jsduck = grunt.util.spawn({
			cmd: "jsduck-troopjs",
			args: ["--config", CONFIG_FILE]
		}, function(error, result, code) {

			// jsduck command not found
			if (code === 127) {
				grunt.fail.warn(
					"Check JSDuck installation:" +
					"See https://github.com/dpashkevich/grunt-jsduck for details."
				);
			}
			cleanup();
			done();
		});

		jsduck.stdout.pipe(process.stdout);
		jsduck.stderr.pipe(process.stderr);
	});
};
