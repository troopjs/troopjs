/*!
 * TroopJS store/local module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "./base" ], function StoreLocalModule(Compose, Store) {

	// Grab local storage
	var STORAGE = window.localStorage;

	return Compose.create(Store, {
		displayName : "store/local",

		set : function set(key, value, deferred) {
			// JSON encoded 'value' then store as 'key'
			STORAGE.setItem(key, JSON.stringify(value));

			// Resolve deferred
			if (deferred && deferred.resolve instanceof Function) {
				deferred.resolve(value);
			}
		},

		get : function get(key, deferred) {
			// Get value from 'key', parse JSON
			var value = JSON.parse(STORAGE.getItem(key));

			// Resolve deferred
			if (deferred && deferred.resolve instanceof Function) {
				deferred.resolve(value);
			}
		},

		remove : function remove(key, deferred) {
			// Remove key
			STORAGE.removeItem(key);

			// Resolve deferred
			if (deferred && deferred.resolve instanceof Function) {
				deferred.resolve();
			}
		},

		clear : function clear(deferred) {
			// Clear
			STORAGE.clear();

			// Resolve deferred
			if (deferred && deferred.resolve instanceof Function) {
				deferred.resolve();
			}
		}
	});
});