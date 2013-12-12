/*
 * TroopJS browser/store/adapter/local module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "./base" ], function LocalAdapterModule(Store) {
	"use strict";

	/**
	 * Data stored in browser local storage.
	 * @class browser.store.adapter.local
	 * @extends browser.store.adapter.base
	 */
	return Store.extend({
		"displayName" : "browser/store/adapter/local",

		"storage" : window.localStorage
	});
});