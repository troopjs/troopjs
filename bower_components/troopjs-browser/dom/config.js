/*
 * TroopJS browser/dom/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"module",
	"troopjs-utils/merge",
	"jquery"
], function (module, merge, $) {
	var config = {};

	config["querySelectorAll"] = $.find;

	config["matchesSelector"] = $.find.matchesSelector;

	return merge.call(config, module.config());
});