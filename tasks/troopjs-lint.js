/*
 * Grunt task for documenting TroopJS with JSDuck.
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
module.exports = function JSDuckTask(grunt) {
	"use strict";

	var path = require("path");
	var _ = grunt.util._;

	function source() {
		// Grabbing sources from sub modules.
		// Excludes non-source files.
		var base = "bower_components/troopjs-*";
		var pkgs = grunt.file.expand(base);
		var excludes = _.reduce(pkgs,function(excludes, module_path) {
			excludes.push(path.join(module_path, "test"));	// To ignore tests.

			var git_ignore = path.join(module_path, ".gitignore");

			// inherits excludes from .gitignore.
			if (grunt.file.isFile(git_ignore)) {
				var ignores = grunt.file.read(git_ignore, {encoding: 'UTF8'});
				ignores.split('\n').forEach(function(line) {
					// Comment
					if (/^#/.test(line) || !line.trim())
						return;
					excludes.push(path.join(module_path, line));	// To ignore tests.
				});
			}

			return excludes;
		}, []).map(function(pattern) {
				// Exclude recursively under this dir.
				if (grunt.file.isDir(pattern))
					pattern += "/**/*";

				// Explanation mark.
				return "!" + pattern;
			});

		var blob = [path.join(base, "**/*.js")].concat(excludes);
		return grunt.file.expand.apply(grunt.file, blob);
	}

	grunt.registerTask("troopjs-lint", "Lint for TroopJS specific code issues.", function() {
		// Makes the task async.
		grunt.log.subhead("Running TroopJS Lint...");
		var files = source();
		files.forEach(function(path) {
			var content = grunt.file.read(path);

			// Lint for Troop component's "displayName" should match with the module name.
			content.replace(/^\s*"?displayName"?\s*:\s*"([/\w]+?)"/m, function(match, displayName) {
				if (path.indexOf(displayName) === -1)
					grunt.fail.warn('Unexpected display name ' + displayName + ' in file: ' + path + '.', displayName, path);
			});
		});
	});
};
