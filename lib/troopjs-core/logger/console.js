/**
 * TroopJS core/logger/console
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../component/base" ], function ConsoleLogger(Component) {
	"use strict";

	/*jshint devel:true*/
	var CONSOLE = console;

	function noop() {}

	return Component.create({
			"displayName" : "core/logger/console"
		},
		CONSOLE
			? {
			"log" : CONSOLE.log.bind(CONSOLE),
			"warn" : CONSOLE.warn.bind(CONSOLE),
			"debug" : CONSOLE.debug.bind(CONSOLE),
			"info" : CONSOLE.info.bind(CONSOLE),
			"error" : CONSOLE.error.bind(CONSOLE)
		}
			: {
			"log" : noop,
			"warn" : noop,
			"debug" : noop,
			"info" : noop,
			"error" : noop
		});
});