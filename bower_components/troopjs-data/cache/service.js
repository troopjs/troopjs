/*
 * TroopJS data/cache/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-core/component/service" ], function CacheServiceModule(Service) {
	"use strict";

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var CACHES = "_caches";
	var TIMEOUT = "_timeout";
	var SECOND = 1000;
	var GENERATIONS = "generations";
	var HEAD = "head";
	var NEXT = "next";
	var EXPIRES = "expires";
	var LENGTH = "length";

	function sweep(expires) {
		/*jshint forin:false*/
		var me = this;
		var generations = me[GENERATIONS];
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

				// Delete from me (cache)
				delete me[property];
			}

			// Delete generation
			delete generations[current[EXPIRES]];
		}
			// While there's a next
		while ((current = current[NEXT]));

		// Reset head
		generations[HEAD] = current;
	}

	return Service.extend(function CacheService() {
		this[CACHES] = ARRAY_SLICE.call(arguments);
	}, {
		"sig/start" : function start(delay) {
			var me = this;
			var caches = me[CACHES];

			if (delay === UNDEFINED) {
				delay = (60 * SECOND);
			}

			function loop() {
				// Calculate expiration of this generation
				var expires = 0 | new Date().getTime() / SECOND;
				var i;
				var iMax;

				//. Loop over caches
				for (i = 0, iMax = caches[LENGTH]; i < iMax; i++) {
					// Call sweep on each cache
					sweep.call(caches[i], expires);

					// Set timeout for next execution
					me[TIMEOUT] = setTimeout(loop, delay);
				}
			}

			// Start loop
			loop();
		},

		"sig/stop" : function stop() {
			var me = this;

			// Clear interval
			clearTimeout(me[TIMEOUT]);
		}
	});
});
