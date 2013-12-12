/*
 * TroopJS browser/store/adapter/session module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "./base" ], function SessionAdapterModule(Store) {
	"use strict";

	/**
	 * Data stored in browser session storage.
	 * @class browser.store.adapter.session
	 * @extends browser.store.adapter.base
	 */
	return Store.extend({
		"displayName" : "browser/store/adapter/session",

		"storage": window.sessionStorage
	});
});
