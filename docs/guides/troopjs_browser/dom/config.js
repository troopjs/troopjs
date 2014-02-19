/*
 * TroopJS browser/dom/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "module", "./constants", "troopjs-utils/merge", "jquery" ], function (module, CONSTANTS, merge, $) {
	var config = {};

	config[CONSTANTS["querySelectorAll"]] = $.find;

	config[CONSTANTS["matchesSelector"]] = $.find.matchesSelector;

	return merge.call(config, module.config());
});