/*
 * TroopJS utils/select
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define(function SelectModule() {
	"use strict";

	var UNDEFINED;
	var FALSE = false;
	var PERIOD = ".";
	var LEFT_BRACKET = "[";
	var RIGHT_BRACKET = "]";
	var SINGLE_QUOTE = "'";
	var DOUBLE_QUOTE = "\"";

	return function select(query) {
		var node = this;
		var c;
		var m;
		var i;
		var length;
		var skip = FALSE;

		for (i = m = 0, length = query.length; i < length && node !== UNDEFINED; i++) {
			switch(c = query.charAt(i)) {
				case PERIOD:
					if (skip === FALSE && i > m) {
						node = node[query.substring(m, i)];
						m = i + 1;
					}
					break;

				case LEFT_BRACKET:
					if (skip === FALSE) {
						skip = LEFT_BRACKET;
						m = i + 1;
					}
					break;

				case RIGHT_BRACKET:
					if (skip === LEFT_BRACKET && i > m) {
						node = node[query.substring(m, i)];
						skip = FALSE;
						m = i + 2;
					}
					break;

				case DOUBLE_QUOTE:
				case SINGLE_QUOTE:
					if (skip === c && i > m) {
						node = node[query.substring(m, i)];
						skip = FALSE;
						m = i + 2;
					}
					else {
						skip = c;
						m = i + 1;
					}
					break;
			}
		}

		if (i > m) {
			node = node[query.substring(m, i)];
		}

		return node;
	}
});