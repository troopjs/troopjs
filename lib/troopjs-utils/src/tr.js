/**
 * TroopJS utils/tr
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define(function TrModule() {
	/*jshint strict:false */

	var TYPEOF_NUMBER = typeof Number();

	return function tr(callback) {
		var self = this;
		var result = [];
		var i;
		var length = self.length;
		var key;

		// Is this an array? Basically, is length a number, is it 0 or is it greater than 0 and that we have index 0 and index length-1
		if (typeof length === TYPEOF_NUMBER && length === 0 || length > 0 && 0 in self && length - 1 in self) {
			for (i = 0; i < length; i++) {
				result.push(callback.call(self, self[i], i));
			}
		// Otherwise we'll iterate it as an object
		} else if (self){
			for (key in self) {
				result.push(callback.call(self, self[key], key));
			}
		}

		return result;
	};
});