/**
 * TroopJS browser/store/base module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "troopjs-core/component/gadget", "when" ], function StoreModule(Gadget, when) {
	var STORAGE = "storage";

	return Gadget.extend({
		"displayName" : "browser/store/base",

		"set" : function set(key, value) {
			// JSON encoded 'value' then store as 'key'
			return when(this[STORAGE].setItem(key, JSON.stringify(value))).yield(value);
		},

		"get" : function get(key) {
			// Get value from 'key', parse JSON
			return when(JSON.parse(this[STORAGE].getItem(key)));
		},

		"remove" : function remove(key) {
			// Remove key
			return when(this[STORAGE].removeItem(key));
		},

		"clear" : function clear() {
			// Clear
			return when(this[STORAGE].clear());
		}
	});
});