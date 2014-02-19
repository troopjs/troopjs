/*
 * TroopJS utils/defer
 * when.defer patched with jQuery/deferred compatibility.
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "when", "poly/array" ], function DeferModule(when) {
	"use strict";

	var ARRAY_SLICE = Array.prototype.slice;

	/**
	 * @class utils.defer
	 * Function that creates a wrapped when.defer object, which can be send to anything that expects a jQuery/deferred.
	 */
	return function Defer() {
		// Create defer
		var defer = when.defer();

		[ "resolve", "reject", "progress" ].forEach(function (value) {
			var me = this;

			// Since the deferred implementation in jQuery (that we use in 1.x) allows
			// to resolve with optional context and multiple arguments, we monkey-patch resolve here
			var func = me.resolver[value];

			// Resolve/Reject/Progress with parameters:
			// http://api.jquery.com/deferred.resolve
			me[value] = function () {
				func.apply(me, arguments);
			};

			// Resolve/Reject/Progress with context and parameters:
			// http://api.jquery.com/deferred.resolveWith
			me[value + "With"] = function (context) {
				func.apply(context, ARRAY_SLICE.call(arguments, 1));
			};

		}, defer);

		return defer;
	};
});
