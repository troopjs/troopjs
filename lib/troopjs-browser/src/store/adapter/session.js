/**
 * TroopJS browser/store/adapter/session module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "./base" ], function SessionAdapterModule(Store) {
	return Store.extend({
		"displayName" : "browser/store/adapter/session",

		"storage": window.sessionStorage
	});
});
