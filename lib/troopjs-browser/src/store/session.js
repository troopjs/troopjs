/**
 * TroopJS browser/store/session module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "./base" ], function StoreSessionModule(Store) {
	return Store.extend({
		"displayName" : "browser/store/session",

		"storage": window.sessionStorage
	})();
});
