/*
 * Grunt task for transforming TroopJS bower/package.json files for bundle package.
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
module.exports = function TransformTask(grunt) {
	"use strict";

	var path = require("path");
	var _ = require("lodash");
	var Logger = require('bower-logger');
	var logger = new Logger();
	var Project = require('bower/lib/core/Project');
	var defaultConfig = require('bower/lib/config');

	/**
	 * Value replacer
	 * @private
	 * @param key {String}
	 * @param value {*}
	 * @return {*}
	 */
	function replacer(key, value) {
		return _.isEmpty(value) ? UNDEFINED : value;
	}

	/**
	 * Reads from and writes to passing callback
	 * @private
	 * @param from {String} From path
	 * @param to {String} To path
	 * @param callback {Function} Callback
	 */
	function transform(from, to, callback) {
		grunt.log.write("Transforming from " + from.cyan + " to " + to.cyan + "...");
		grunt.file.write(to, JSON.stringify(_.transform(grunt.file.readJSON(from), callback), replacer, "\t"));
		grunt.log.ok();
	}

	grunt.registerTask("transform", "Transform package files", function() {

		var src = grunt.config("build.src");
		var dist = grunt.config("build.dist");
		var version = grunt.config("pkg.version");

		// Transform package.json
		transform(path.join(src, "package.json"), path.join(dist, "package.json"), function(result, value, key) {
			switch (key) {
				case "version":
					result[key] = version;
					break;

				default:
					result[key] = value;
			}
		});


		// Transform bower.json
		var project = new Project(defaultConfig, logger);
		var done = this.async();
		var otherDeps = {};

		// list of peer-dependencies
		project.getTree().spread(function(tree, flattened) {
			Object.keys(flattened).forEach(function(pkg) {
				// exclude troopjs modules which are already bundled.
				if (!/^troopjs-/.exec(pkg)) {
					pkg = flattened[pkg].pkgMeta;
					// resolution tells the resolved version if there's version confliction.
					var res = pkg._resolution;
					otherDeps[pkg.name] = res.type === 'branch' ? '#' + res.branch : res.type === 'version' ? res.tag : '';
				}
			});

			transform(path.join(src, "bower.json"), path.join(dist, "bower.json"), function(result, value, key) {
				switch (key) {
					case "version":
						result[key] = version;
						break;

					case "dependencies":
						result[key] = otherDeps;
						break;

					default:
						result[key] = value;
				}
			});

			done();
		});
	});
};
