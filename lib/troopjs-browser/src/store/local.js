/**
 * TroopJS browser/store/local module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "./base" ], function StoreLocalModule(Store) {
	return Store.extend({
		"displayName" : "browser/store/local",

		"storage" : window.localStorage
	})();
});