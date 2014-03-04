/*
 * TroopJS data/store/component module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-core/mixin/base", "when", "when/apply", "poly/array" ], function StoreModule(Base, when, apply) {
	"use strict";

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARRAY = "[object Array]";
	var TOSTRING_OBJECT = "[object Object]";
	var TOSTRING_FUNCTION = "[object Function]";
	var TOSTRING_STRING = "[object String]";
	var ARRAY_SLICE = Array.prototype.slice;
	var LENGTH = "length";
	var ADAPTERS = "adapters";
	var STORAGE = "storage";
	var BEFORE_GET = "beforeGet";
	var AFTER_PUT = "afterPut";
	var CLEAR = "clear";
	var LOCKS = "locks";

	/*
	 * Applies method to this (if it exists)
	 * @param {string} method Method name
	 * @returns {boolean|*}
	 * @private
	 */
	function applyMethod(method) {
		/*jshint validthis:true*/
		var me = this;

		return method in me && me[method].apply(me, ARRAY_SLICE.call(arguments, 1));
	}

	/*
	 * Puts value
	 * @param {string|null} key Key - can be dot separated for sub keys
	 * @param {*} value Value
	 * @returns {Promise} Promise of put
	 * @private
	 */
	function put(key, value) {
		/*jshint validthis:true*/
		var me = this;
		var node = me[STORAGE];
		var parts = key
			? key.split(".")
			: [];
		var part;
		var last = parts.pop();

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = node[part] = {};
			}
		}

		// Evaluate value if needed
		if (OBJECT_TOSTRING.call(value) === TOSTRING_FUNCTION) {
			value = value.call(me, {
				"get" : function () {
					return get.apply(me, arguments);
				},
				"has" : function () {
					return has.apply(me, arguments);
				}
			}, key);
		}

		return last !== UNDEFINED
			// First store the promise, then override with the true value once resolved
			? when(value, function (result) {
				node[last] = result;

				return result;
			})
			// No key provided, just return a promise of the value
			: when(value);
	}

	/*
	 * Gets value
	 * @param {string} key Key - can be dot separated for sub keys
	 * @returns {*} Value
	 * @private
	 */
	function get(key) {
		/*jshint validthis:true*/
		var node = this[STORAGE];
		var parts = key.split(".");
		var part;

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = UNDEFINED;
			}
		}

		return node;
	}

	/*
	 * Check is key exists
	 * @param key {string} key Key - can be dot separated for sub keys
	 * @returns {boolean}
	 * @private
	 */
	function has(key) {
		/*jshint validthis:true*/
		var node = this[STORAGE];
		var parts = key.split(".");
		var part;
		var last = parts.pop();

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = UNDEFINED;
			}
		}

		return node !== UNDEFINED && last in node;
	}

	/**
	 * A simple key-value store that supports **dot separated key** format.
	 * @class data.store.component
	 * @extends core.mixin.base
	 */
	return Base.extend(function StoreComponent(adapter) {
		if (arguments[LENGTH] === 0) {
			throw new Error("No adapter(s) provided");
		}

		var me = this;

		me[ADAPTERS] = ARRAY_SLICE.call(arguments);
		me[STORAGE] = {};
		me[LOCKS] = {};
	}, {
		"displayName" : "data/store/component",

		/**
		 * Waits for store to be "locked"
		 * @param {string} key Key
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of ready
		 */
		"lock" : function (key, onFulfilled, onRejected, onProgress) {
			var locks = this[LOCKS];
			var result;

			if (OBJECT_TOSTRING.call(key) !== TOSTRING_STRING) {
				throw new Error("key has to be of type string");
			}

			result = locks[key] = when(locks[key], onFulfilled, onRejected, onProgress);

			return result;
		},

		/**
		 * Gets state value
		 * @param {String...} key Key - can be dot separated for sub keys
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of value
		 */
		"get" : function (key, onFulfilled, onRejected, onProgress) {
			/*jshint curly:false*/
			var me = this;
			var keys = ARRAY_SLICE.call(arguments);
			var i;
			var iMax;

			// Step until we hit the end or keys[i] is not a string
			for (i = 0, iMax = keys[LENGTH]; i < iMax && OBJECT_TOSTRING.call(keys[i]) === TOSTRING_STRING; i++);

			// Update callbacks
			onFulfilled = keys[i];
			onRejected = keys[i+1];
			onProgress = keys[i+2];

			// Set the new length of keys
			keys[LENGTH] = i;

			return when
				.map(keys, function (key) {
					return when
						// Map adapters and BEFORE_GET on each adapter
						.map(me[ADAPTERS], function (adapter) {
							return when(applyMethod.call(adapter, BEFORE_GET, me, key));
						})
						// Get value from STORAGE
						.then(function () {
							return get.call(me, key);
						});
				})
				// Add callbacks
				.then(onFulfilled && apply(onFulfilled), onRejected, onProgress);
		},

		/**
		 * Puts state value
		 * @param {string} key Key - can be dot separated for sub keys
		 * @param {*} value Value
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of value
		 */
		"put" : function (key, value, onFulfilled, onRejected, onProgress) {
			var me = this;

			return when(put.call(me, key, value), function (result) {
				return when
					// Map adapters and AFTER_PUT on each adapter
					.map(me[ADAPTERS], function (adapter) {
						return when(applyMethod.call(adapter, AFTER_PUT, me, key, result));
					})
					.yield(result);
			})
				// Add callbacks
				.then(onFulfilled, onRejected, onProgress);
		},

		/**
		 * Puts state value if key is UNDEFINED
		 * @param {string} key Key - can be dot separated for sub keys
		 * @param {*} value Value
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of value
		 */
		"putIfNotHas" : function (key, value, onFulfilled, onRejected, onProgress) {
			var me = this;

			return !me.has(key)
				? me.put(key, value, onFulfilled, onRejected, onProgress)
				: when(UNDEFINED, onFulfilled, onRejected, onProgress);
		},

		/**
		 * Checks if key exists
		 * @param {string} key Key - can be dot separated for sub keys
		 * @returns {boolean} True if key exists, otherwise false
		 */
		"has" : function (key) {
			return has.call(this, key);
		},

		/**
		 * Clears all adapters
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of clear
		 */
		"clear" : function (onFulfilled, onRejected, onProgress) {
			var me = this;

			return when
				.map(me[ADAPTERS], function (adapter) {
					return when(applyMethod.call(adapter, CLEAR, me));
				})
				// Add callbacks
				.then(onFulfilled && apply(onFulfilled), onRejected, onProgress);
		}
	});
});