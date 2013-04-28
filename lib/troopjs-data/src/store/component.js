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

			this[ADAPTER] = adapter;
		}
	}, {
		"displayName" : "data/store/component",

		"lock" : function lock() {
			var self = this;

			return self[LOCK] = when(self[LOCK]);
		},

		"set" : function set(key, value) {
			return when(this[ADAPTER].setItem(key, value));
		},

		"get" : function get(key) {
			return when(this[ADAPTER].getItem(key));
		},

		"remove" : function remove(key) {
			return when(this[ADAPTER].removeItem(key));
		},

		"clear" : function clear() {
			return when(this[ADAPTER].clear());
		}
	});
});