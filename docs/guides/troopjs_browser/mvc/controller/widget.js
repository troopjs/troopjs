/**
 * TroopJS browser/mvc/controller/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../../component/widget",
	"../../hash/widget",
	"poly/object",
	"poly/array"
], function (Widget, Hash) {
	"use strict";

	var CACHE = "_cache";
	var DISPLAYNAME = "displayName";
	var ARRAY_SLICE = Array.prototype.slice;
	var currTaskNo = 0;

	function extend() {
		var me = this;

		ARRAY_SLICE.call(arguments).forEach(function (arg) {
			Object.keys(arg).forEach(function (key) {
				me[key] = arg[key];
			});
		});

		return me;
	}

	var indexes = {};
	// Check if the object has changed since the last retrieval.
	function checkChanged(key, val) {
		var curr = this[CACHE][key], hash = this.hash(val);
		var ischanged = !(curr === val && indexes[key] === hash );
		ischanged && (indexes[key] = hash);
		return ischanged;
	}

	function handleRequests(requests) {
		var me = this;
		var displayName = me[DISPLAYNAME];

		return me.task(function (resolve, reject) {
			// Track this task.
			var taskNo = ++currTaskNo;

			me.request(extend.call({}, me[CACHE], requests))
				.then(function (results) {
					// Reject if this promise is not the current pending task.
					if (taskNo == currTaskNo) {
						// Get old cache
						var cache = me[CACHE];

						// Calculate updates
						var updates = {};
						var updated = Object.keys(results).reduce(function (update, key) {
							if (checkChanged.apply(me, [key, results[key]])) {
								updates[key] = results[key];
								update = true;
							}

							return update;
						}, false);

						// Update cache
						me[CACHE] = results;

						resolve(me.publish(displayName + "/results", results)
							.then(function () {
								return updated && me.publish(displayName + "/updates", updates);
							})
							.then(function () {
								// Trigger `hashset`
								me.$element.trigger("hashset", me.data2uri(results), true);
							})
							.yield(results));
					}
				});
		});
	}

	return Widget.extend(function () {
		this[CACHE] = {};
	}, {
		"displayName": "browser/mvc/controller/widget",

		"sig/initialize": function () {
			var me = this;

			me.subscribe(me[DISPLAYNAME] + "/requests", handleRequests);
		},

		"sig/finalize": function () {
			var me = this;

			me.unsubscribe(me[DISPLAYNAME]+ "/requests", handleRequests);
		},

		"dom/urichange": function ($event, uri) {
			var me = this;

			me.publish(me[DISPLAYNAME] + "/requests", me.uri2data(uri));
		},

		"request" : function (/* requests */) {
			throw new Error("request is not implemented");
		},

		"uri2data" : function (/* uri */) {
			throw new Error("uri2data is not implemented");
		},

		"data2uri" : function (/* data */) {
			throw new Error("data2uri is not implemented");
		},

		// Override me to compute the data hash.
		"hash" : function (data) { return ""; }
	}, Hash);
});
