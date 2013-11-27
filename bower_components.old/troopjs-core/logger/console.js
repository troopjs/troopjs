/**
 * TroopJS core/logger/console
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../component/base", "poly/function" ], function ConsoleLogger(Component) {
	"use strict";

	/*jshint devel:true*/
	var CONSOLE = console;

	function noop() {}

	var spec = {};
	["info","log","debug","warn","error"].reduce(function(memo, feature) {
			memo[feature] =
				typeof CONSOLE != 'undefined' && CONSOLE[feature] ? CONSOLE[feature] : noop;
			return memo;
	}, spec);

	return Component.create({
			"displayName" : "core/logger/console"
		},
		spec);
});