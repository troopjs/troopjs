define([ "poly/array" ], function SequenceModule() {
	"use strict";

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/*
	 * Runner that executes candidates in sequence without overlap
	 * @param {Object} event Event object
	 * @param {Object} handlers List of handlers
	 * @param {Array} args Initial arguments
	 * @returns {Array}
	 */
	return function sequence(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			// Filter candidate[CONTEXT] if we have context
			if (context !== UNDEFINED && candidate[CONTEXT] !== context) {
				continue;
			}

			// Filter candidate[CALLBACK] if we have callback
			if (callback && candidate[CALLBACK] !== callback) {
				continue;
			}

			candidates[candidatesCount++] = candidate;
		}

		// Map and return
		return candidates.map(function (candidate) {
			return candidate[CALLBACK].apply(candidate[CONTEXT], args);
		});
	}
});