/*!
 * TroopJS store/base module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/gadget" ], function StoreModule(Compose, Gadget) {
	return Gadget.extend({
		set : Compose.required,
		get : Compose.required,
		remove : Compose.required,
		clear : Compose.required
	});
});