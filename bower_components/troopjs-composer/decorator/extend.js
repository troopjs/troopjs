/*
 * TroopJS composer/decorator/extend
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../mixin/decorator",
	"troopjs-utils/merge"
], function ExtendDecoratorModule(Decorator, merge) {
	"use strict";

	var UNDEFINED;
	var VALUE = "value";
	var ARRAY_CONCAT = Array.prototype.concat;

	/**
	 * Create a decorator that is to augment an existing Object property.
	 *
	 * @class composer.decorator.extend
	 * @param {Function|Object...} ext One or more objects to merge into this property, or a function that returns a new object to be used.
	 * @returns {composer.mixin.decorator}
	 */
	return function extend(ext) {
		var args = arguments;

		return new Decorator(function (descriptor, name, descriptors) {
			var previous = descriptors[name][VALUE];
			var val;

			if (typeof ext === "function") {
				val = ext(previous);
			}
			else if (previous !== UNDEFINED) {
				val = merge.apply({}, ARRAY_CONCAT.apply([ previous ], args));
			}

			descriptor[VALUE] = val;

			return descriptor;
		});
	}
});
