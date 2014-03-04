/*
 * TroopJS composer/decorator/around
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../mixin/decorator" ], function AroundDecoratorModule(Decorator) {
	"use strict";

	var VALUE = "value";
	var NOOP = function () {};

	/**
	 * Create a decorator that is to override an existing method.
	 *
	 * @class composer.decorator.around
	 * @param {Function} func The decorator function which receives the original function as parameter and is supposed to
	 * return a function that is to replace the original.
	 * @returns {composer.mixin.decorator}
	 */
	return function around(func) {
		return new Decorator(function (descriptor) {
			descriptor[VALUE] = func(descriptor[VALUE] || NOOP);
			return descriptor;
		});
	}
});
