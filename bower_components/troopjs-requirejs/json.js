/*
* TroopJS requirejs/json
* @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
*/
define([
	"text",
	"troopjs-utils/select",
	"poly/json"
], function (text, select) {
	"use strict";

	var UNDEFINED;
	var NULL = null;
	var PATTERN = /(.+?)#(.+)$/;
	var buildMap = {};

	return {
		"load": function (name, req, load, config) {
			var key = name;
			var query = "";
			var matches;

			if ((matches = PATTERN.exec(name)) !== NULL) {
				name = matches[1];
				query = matches[2];
			}

			text.get(req.toUrl(name), function (source) {
				var compiled = select.call(JSON.parse(source), query);

				if (config.isBuild) {
					buildMap[key] = compiled;
				}

				load(compiled);
			}, load.error);
		},

		write : function (pluginName, moduleName, write) {
			if (moduleName in buildMap) {
				write.asModule(pluginName + "!" + moduleName, JSON.stringify(buildMap[moduleName]));
			}
		}
	};
});
