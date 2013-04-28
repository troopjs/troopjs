/**
 * TroopJS browser/store/adapter/base module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "troopjs-core/component/gadget" ], function BaseAdapterModule(Gadget) {
	var STORAGE = "storage";

	return Gadget.extend({
		"displayName" : "browser/store/adapter/base",

		"set" : function set(key, value) {
			this[STORAGE].setItem(key, JSON.stringify(value));

			return value;
		},

		"get" : function get(key) {
			return JSON.parse(this[STORAGE].getItem(key));
		},

		"remove" : function remove(key) {
			return this[STORAGE].removeItem(key);
		},

		"clear" : function clear() {
			return this[STORAGE].clear();
		}
	});
});