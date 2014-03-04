/*
 * TroopJS composer/mixin/decorator
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "poly/object" ], function DecoratorModule() {
	"use strict";

	/**
	 * Decorator provides customized way to add properties/methods to object created by {@link composer.mixin.factory}.
	 * @class composer.mixin.decorator
	 * @constructor
	 * @param {Function} decorate Function that defines how to override the original one.
	 */
	return function Decorator(decorate) {

		// Define properties
		Object.defineProperties(this, {
			/**
			 * Function that decides what decoration is to make.
			 * @method decorate
			 * @param {Object} descriptor The object descriptor that is the current property.
			 * @param {String} name The property name.
			 * @param {Object} descriptors List of all property descriptors of the host object.
			 * @member composer.mixin.decorator
			 */
			"decorate": {
				"value": decorate
			}
		});
	}
});
