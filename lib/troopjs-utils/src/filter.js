/**
 * TroopJS utils/filter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define(function FilterModule() {
	/*jshint strict:false */

	var LENGTH = "length";

	/**
	 * Reduces array to only contain filtered values (evals left-right)
	 * @returns {Number} New length of array
	 */
	return function filter(callback) {
		var arg;
		var args = this;
		var i;
		var j;
		var iMax = args[LENGTH];

		for (i = j = 0; i < iMax; i++) {
			arg = args[i];

			if (callback.call(args, arg, i) === false) {
				continue;
			}

			args[j++] = arg;
		}

		// Assign and return new length
		return args[LENGTH] = j;
	};
});
