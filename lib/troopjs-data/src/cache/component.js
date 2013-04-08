/**
 * TroopJS data/cache/component
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define( [ "troopjs-core/component/base" ], function CacheModule(Component) {
	/*jshint laxbreak:true */

	var UNDEFINED;
	var FALSE = false;
	var NULL = null;
	var OBJECT = Object;
	var ARRAY = Array;

	var SECOND = 1000;
	var INTERVAL = "interval";
	var GENERATIONS = "generations";
	var AGE = "age";
	var HEAD = "head";
	var NEXT = "next";
	var EXPIRES = "expires";
	var CONSTRUCTOR = "constructor";
	var LENGTH = "length";

	var _ID = "id";
	var _MAXAGE = "maxAge";
	var _EXPIRES = "expires";
	var _INDEXED = "indexed";
	var _COLLAPSED = "collapsed";

	/**
	 * Internal method to put a node in the cache
	 * @param node Node
	 * @param _constructor Constructor of value
	 * @param now Current time (seconds)
	 * @returns Cached node
	 */
	function _put(node, _constructor, now) {
		var self = this;
		var result;
		var id;
		var i;
		var iMax;
		var expires;
		var expired;
		var head;
		var current;
		var next;
		var generation;
		var generations = self[GENERATIONS];
		var property;
		var value;

		// First add node to cache (or get the already cached instance)
		cache : {
			// Can't cache if there is no _ID
			if (!(_ID in node)) {
				result = node;          // Reuse ref to node (avoids object creation)
				break cache;
			}

			// Get _ID
			id = node[_ID];

			// In cache, get it!
			if (id in self) {
				result = self[id];
				break cache;
			}

			// Not in cache, add it!
			result = self[id] = node;   // Reuse ref to node (avoids object creation)

			// Update _INDEXED
			result[_INDEXED] = now;
		}

		// We have to deep traverse the graph before we do any expiration (as more data for this object can be available)

		// Check that this is an ARRAY
		if (_constructor === ARRAY) {
			// Index all values
			for (i = 0, iMax = node[LENGTH]; i < iMax; i++) {

				// Keep value
				value = node[i];

				// Get _constructor of value (safely, falling back to UNDEFINED)
				_constructor = value === NULL || value === UNDEFINED
					? UNDEFINED
					: value[CONSTRUCTOR];

				// Do magic comparison to see if we recursively put this in the cache, or plain put
				result[i] = (_constructor === OBJECT || _constructor === ARRAY && value[LENGTH] !== 0)
					? _put.call(self, value, _constructor, now)
					: value;
			}
		}

		// Check that this is an OBJECT
		else if (_constructor === OBJECT) {
			// Index all properties
			for (property in node) {
				// Except the _ID property
				// or the _COLLAPSED property, if it's false
				if (property === _ID
					|| (property === _COLLAPSED && result[_COLLAPSED] === FALSE)) {
					continue;
				}

				// Keep value
				value = node[property];

				// Get _constructor of value (safely, falling back to UNDEFINED)
				_constructor = value === NULL || value === UNDEFINED
					? UNDEFINED
					: value[CONSTRUCTOR];

				// Do magic comparison to see if we recursively put this in the cache, or plain put
				result[property] = (_constructor === OBJECT || _constructor === ARRAY && value[LENGTH] !== 0)
					? _put.call(self, value, _constructor, now)
					: value;
			}
		}

		// Check if we need to move result between generations
		move : {
			// Break fast if id is NULL
			if (id === NULL) {
				break move;
			}

			// Calculate expiration and floor
			// '>>>' means convert anything other than posiitive integer into 0
			expires = 0 | now + (result[_MAXAGE] >>> 0);

			remove : {
				// Fail fast if there is no old expiration
				if (!(_EXPIRES in result)) {
					break remove;
				}

				// Get current expiration
				expired = result[_EXPIRES];

				// If expiration has not changed, we can continue
				if (expired === expires) {
					break move;
				}

				// Remove ref from generation (if that generation exists)
				if (expired in generations) {
					delete generations[expired][id];
				}
			}

			add : {
				// Update expiration time
				result[_EXPIRES] = expires;

				// Existing generation
				if (expires in generations) {
					// Add result to generation
					generations[expires][id] = result;
					break add;
				}

				// Create generation with expiration set
				(generation = generations[expires] = {})[EXPIRES] = expires;

				// Add result to generation
				generation[id] = result;

				// Short circuit if there is no head
				if (generations[HEAD] === UNDEFINED) {
					generations[HEAD] = generation;
					break add;
				}

				// Step through list as long as there is a next, and expiration is "older" than the next expiration
				for (current = head = generations[HEAD]; (next = current[NEXT]) !== UNDEFINED && next[EXPIRES] < expires; current = next);

				// Check if we're still on the head and if we're younger
				if (current === head && current[EXPIRES] > expires) {
					// Next generation is the current one (head)
					generation[NEXT] = current;

					// Reset head to new generation
					generations[HEAD] = generation;
					break add;
				}

				// Insert new generation between current and current.next
				generation[NEXT] = current[NEXT];
				current[NEXT] = generation;
			}
		}

		return result;
	}

	return Component.extend(function CacheComponent(age) {
		var me = this;

		me[AGE] = age || (60 * SECOND);
		me[GENERATIONS] = {};
	}, {
		"displayName" : "data/cache/component",

		"sig/start" : function start() {
			var self = this;
			var generations = self[GENERATIONS];

			// Create new sweep interval
			self[INTERVAL] = INTERVAL in self
				? self[INTERVAL]
				: setInterval(function sweep() {
				// Calculate expiration of this generation
				var expires = 0 | new Date().getTime() / SECOND;

				var property;
				var current;

				// Get head
				current = generations[HEAD];

				// Fail fast if there's no head
				if (current === UNDEFINED) {
					return;
				}

				do {
					// Exit if this generation is to young
					if (current[EXPIRES] > expires) {
						break;
					}

					// Iterate all properties on current
					for (property in current) {
						// And is it not a reserved property
						if (property === EXPIRES || property === NEXT || property === GENERATIONS) {
							continue;
						}

						// Delete from self (cache)
						delete self[property];
					}

					// Delete generation
					delete generations[current[EXPIRES]];
				}
				// While there's a next
				while ((current = current[NEXT]));

				// Reset head
				generations[HEAD] = current;
			}, self[AGE]);
		},

		"sig/stop" : function stop() {
			var self = this;

			// Only do this if we have an interval
			if (INTERVAL in self) {
				// Clear interval
				clearInterval(self[INTERVAL]);

				// Reset interval
				delete self[INTERVAL];
			}
		},

		"sig/finalize" : function finalize() {
			var self = this;
			var property;

			// Iterate all properties on self
			for (property in self) {
				// Don't delete non-objects or objects that don't ducktype cachable
				if (self[property][CONSTRUCTOR] !== OBJECT || !(_ID in self[property])) {
					continue;
				}

				// Delete from self (cache)
				delete self[property];
			}
		},

		/**
		 * Puts a node into the cache
		 * @param node Node to add (object || array)
		 * @returns Cached node (if it existed in the cache before), otherwise the node sent in
		 */
		"put" : function put(node) {
			var self = this;

			// Get _constructor of node (safely, falling back to UNDEFINED)
			var _constructor = node === NULL || node === UNDEFINED
				? UNDEFINED
				: node[CONSTRUCTOR];

			// Do magic comparison to see if we should cache this object
			return _constructor === OBJECT || _constructor === ARRAY && node[LENGTH] !== 0
				? _put.call(self, node, _constructor, 0 | new Date().getTime() / SECOND)
				: node;
		}
	});
});
