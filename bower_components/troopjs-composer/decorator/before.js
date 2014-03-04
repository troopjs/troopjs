/*
 * TroopJS composer/decorator/before
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../mixin/decorator" ], function BeforeDecoratorModule(Decorator) {
	"use strict";

	var UNDEFINED;
	var VALUE = "value";

	/**
	 * Create a decorator method that is to add code that will be executed before the original method.
	 *
	 * @class composer.decorator.before
	 * @param {Function} func The decorator function which receives the same arguments as with the original, it's return
	 * value (if not undefined) will be send as the arguments of original function.
	 * @returns {composer.mixin.decorator}
	 */
	return function before(func) {
		return new Decorator(function (descriptor) {
			var next = descriptor[VALUE];

			descriptor[VALUE] = next
				? function decorated_before() {
					var me = this;
					var retval = func.apply(me, arguments);

					return next.apply(me, retval !== UNDEFINED ? retval : arguments);
				}
				: func;

			return descriptor;
		});
	}
});
