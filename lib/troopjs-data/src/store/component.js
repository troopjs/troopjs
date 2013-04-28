/**
 * TroopJS data/store/component module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "troopjs-core/component/gadget", "when" ], function StoreModule(Gadget, when) {
	var UNDEFINED;
	var ADAPTER = "adapter";
	var LOCK = "lock";

	return Gadget.extend(function StoreComponent(adapter) {
		if (adapter === UNDEFINED) {
			throw new Error("No adapter provided");
		}

		this[ADAPTER] = adapter;
	}, {
		"displayName" : "data/store/component",

		"ready" : function ready(onFulfilled, onRejected, onProgress) {
			var self = this;

			return self[LOCK] = when(self[LOCK], onFulfilled, onRejected, onProgress);
		},

		"set" : function set(key, value, onFulfilled, onRejected, onProgress) {
			return when(this[ADAPTER].set(key, value), onFulfilled, onRejected, onProgress);
		},

		"get" : function get(key, onFulfilled, onRejected, onProgress) {
			return when(this[ADAPTER].get(key), onFulfilled, onRejected, onProgress);
		},

		"remove" : function remove(key, onFulfilled, onRejected, onProgress) {
			return when(this[ADAPTER].remove(key), onFulfilled, onRejected, onProgress);
		},

		"clear" : function clear(onFulfilled, onRejected, onProgress) {
			return when(this[ADAPTER].clear(), onFulfilled, onRejected, onProgress);
		}
	});
});