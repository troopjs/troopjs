/*
 * TroopJS browser/dom/selector
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Heavily influenced by selector-set (https://github.com/josh/selector-set/) Copyright 2013 Joshua Peek
 */
define([
	"troopjs-composer/mixin/factory",
	"./config"
], function (Factory, CONFIG) {
	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var LENGTH = "length";
	var INDEXES = "indexes";
	var INDEXED = "indexed";
	var INDEXER = "indexer";
	var CLASS = "class";
	var ID = "id";
	var TAG = "tag";
	var UNIVERSAL = "universal";
	var SLASH = "\\";
	var SPACE = " ";
	var STAR = "*";
	var POUND = "#";
	var PERIOD = ".";
	var COLON = ":";
	var LEFT_BRACKET = "[";
	var RIGHT_BRACKET = "]";
	var COUNT = "count";
	var BASEVAL = "baseVal";
	var RE_SPACE = /\s+/;
	var querySelectorAll = CONFIG["querySelectorAll"];
	var matchesSelector = CONFIG["matchesSelector"];

	/*
	 * Extracts key for universal indexer
	 * @private
	 * @return {String[]}
	 */
	function getElementUniversal() {
		return [ STAR ];
	}

	/*
	 * Extracts key for tag indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementTagName(element) {
		return [ element.nodeName.toUpperCase() ];
	}

	/*
	 * Extracts key for class indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementClassNames(element) {
		var className;
		var result;

		// Do we have a `className` property
		if ((className = element.className) !== UNDEFINED) {
			// DOM `className`
			if (typeof className === "string") {
				result = className.split(RE_SPACE);
			}
			// SVG `className`
			else if (typeof className === "object" && BASEVAL in className) {
				result = className[BASEVAL].split(RE_SPACE);
			}
		}

		return result;
	}

	/*
	 * Extracts key for id indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementId(element) {
		var id;

		return (id = element.id) !== UNDEFINED && [ id ];
	}

	/*
	 * Gets the last **SIGNIFICANT** of a CSS selector, the "significant" is defined as - any leading id, class name or
	 * tag name component of the last selector.
	 *
	 * Examples:
	 * 	tail("div.bar"); 	// "div"
	 * 	tail("#foo.bar"); 	// "#foo"
	 * 	tail("p > div.bar"); 	// "div"
	 * 	tail("p > a:active"); 	// "a"
	 * 	tail(".bar");	// ".bar"
	 * 	tail("input.foo[type='button']");	// "input"
	 * 	tail("[type='button']");	// "*"
	 *
	 * @see [CSS3 selector spec](http://www.w3.org/TR/selectors/#w3cselgrammar)
	 * @private
	 * @param {String} selector CSS selector
	 * @return {String} last token
	 */
	function tail(selector) {
		var start = selector[LENGTH];
		var stop = start;
		var c = selector.charAt(--start);
		var skip = false;

		step: while (start >= 0) {
			switch (c) {
				case SPACE:
					/* Marks EOT if:
					 * * Next c is not SLASH
					 * * Not in skip mode
					 */
					if ((c = selector.charAt(--start)) !== SLASH && !skip) {
						// We're 2 steps passed the end of the selector so we should adjust for that
						start += 2;

						// Break the outer while
						break step;
					}
					break;

				case RIGHT_BRACKET:
					/* Marks begin of skip if:
					 * * Next c is not SLASH
					 */
					skip = (c = selector.charAt(--start)) !== SLASH;
					break;

				case LEFT_BRACKET:
					/* Marks end of skip if:
					 * * Next c is not SLASH
					 */
					if (!(skip = (c = selector.charAt(--start)) === SLASH)) {
						// Compensate for start already decreased
						stop = start + 1;
					}
					break;

				case POUND:
				case COLON:
				case PERIOD:
					/* Marks stop if:
					 * * Next c is not SLASH
					 * * Next c is not SPACE
					 * * Not in skip mode
					 */
					if ((c = selector.charAt(--start)) && c!== UNDEFINED && c!== SLASH && c !== SPACE && !skip) {
						// Compensate for start already decreased
						stop = start + 1;
					}
					break;

				default:
					// Store next c
					c = selector.charAt(--start);
					break;
			}
		}

		return selector.substring(start, stop) || STAR;
	}

	/*
	 * Compares candidates (that have COUNT properties)
	 * @private
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Number}
	 */
	function compareCandidates(a, b) {
		return a[COUNT] - b[COUNT];
	}

	var Selector = Factory(function Selector() {
		var me = this;

		me[INDEXES] = [];
		me[COUNT] = 0;
	}, {
		/*
		 * Adds candidate
		 * @param {String} selector CSS selector
		 * @param {...*} [args] Additional arguments attached with candidate
		 * @return {Object} this
		 */
		"add": function add(selector, args) {
			var me = this;
			var indexes = me[INDEXES];
			var indexed;
			var indexer;
			var index;
			var name;
			var key = tail(selector);

			// Convert arguments to array
			args = ARRAY_SLICE.call(arguments);

			// Set COUNT on args
			args[COUNT] = me[COUNT]++;

			// Check the first char to determine name/indexer and transform key
			switch (key.charAt(0)) {
				case POUND:
					name = ID;
					indexer = getElementId;
					key = key.substring(1);
					break;

				case PERIOD:
					name = CLASS;
					indexer = getElementClassNames;
					key = key.substring(1);
					break;

				case STAR:
					name = UNIVERSAL;
					indexer = getElementUniversal;
					break;

				default:
					name = TAG;
					indexer = getElementTagName;
					key = key.toUpperCase();
					break;
			}

			// Get index and indexed
			if ((index = indexes[name]) !== UNDEFINED) {
				indexed = index[INDEXED];
			}
			// Or create index and indexed
			else {
				index = indexes[name] = indexes[indexes[LENGTH]] = {};
				index[INDEXER] = indexer;
				indexed = index[INDEXED] = {};
			}

			// Add args to index[key]
			if (key in indexed) {
				indexed[key].push(args);
			}
			// Or create index[key] and initialize with args
			else {
				indexed[key] = [ args ];
			}

			return me;
		},

		/*
		 * Matches candidates against element
		 * @param element DOM Element
		 * @return {Array} Matching array of candidates
		 */
		"matches": function matches(element) {
			var me = this;
			var indexer;
			var indexed;
			var indexes = me[INDEXES];
			var index;
			var indexCount = indexes[LENGTH];
			var keys;
			var keysCount;
			var candidates;
			var candidate;
			var candidateCount;
			var result = [];
			var resultCount = 0;

			if (!element) {
				return result;
			}

			while (indexCount--) {
				index = indexes[indexCount];
				indexer = index[INDEXER];
				indexed = index[INDEXED];

				keys = indexer(element);
				keysCount = keys[LENGTH];

				while (keysCount--) {

					if ((candidates = indexed[keys[keysCount]]) !== UNDEFINED) {
						candidateCount = candidates[LENGTH];

						while (candidateCount--) {
							candidate = candidates[candidateCount];

							if (matchesSelector(element, candidate[0])) {
								result[resultCount++] = candidate;
							}
						}
					}
				}
			}

			return result.sort(compareCandidates);
		}
	});

	/*
	 * @inheritdoc #tail
	 */
	Selector.tail = tail;

	return Selector;
});
