/**
 * TroopJS browser/store/adapter/local module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "./base" ], function LocalAdapterModule(Store) {
	return Store.extend({
		"displayName" : "browser/store/adapter/local",

		"storage" : window.localStorage
	});
});