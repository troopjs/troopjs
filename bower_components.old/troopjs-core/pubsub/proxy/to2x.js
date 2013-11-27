/**
 * TroopJS core/pubsub/proxy/to2x
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../../component/service", "when", "poly/array", "poly/object" ], function To2xModule(Service, when) {
	"use strict";

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var OBJECT_KEYS = Object.keys;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var PUBLISH = "publish";
	var SUBSCRIBE = "subscribe";
	var HUB = "hub";
	var SETTINGS = "settings";
	var TOPIC = "topic";
	var REPUBLISH = "republish";

	return Service.extend(
		/**
		 * Proxies to 2.x hub
		 * @param {object..} setting Setting
		 * @constructor
		 */
		function To2xService(setting) {
			this[SETTINGS] = ARRAY_SLICE.call(arguments);
		}, {
			"displayName" : "core/pubsub/proxy/to2x",

			"sig/initialize" : function ()  {
				var me = this;

				// Iterate SETTINGS
				me[SETTINGS].forEach(function (setting) {
					if (!(HUB in setting)) {
						throw new Error("'" + HUB + "' is missing from setting");
					}

					var publish = setting[PUBLISH] || {};
					var subscribe = setting[SUBSCRIBE] || {};
					var hub = setting[HUB];

					// Iterate publish keys
					OBJECT_KEYS(publish).forEach(function (source) {
						// Extract target
						var target = publish[source];
						var topic;

						// If target is a string set topic to target
						if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
							topic = target;
						}
						// Otherwise just grab topic from target
						else {
							// Make sure we have a topic
							if (!(TOPIC in target)) {
								throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
							}

							// Get topic
							topic = target[TOPIC];
						}

						// Create callback
						var callback = publish[source] = function () {
							// Initialize args with topic as the first argument
							var args = [ topic ];

							// Push original arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

							return hub.publish.apply(hub, args);
						};

						// Transfer topic to callback
						callback[TOPIC] = topic;

						me.subscribe(source, callback);
					});

					// Iterate subscribe keys
					OBJECT_KEYS(subscribe).forEach(function (source) {
						// Extract target
						var target = subscribe[source];
						var topic;
						var republish;

						// If target is a string set topic to target and republish to false
						if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
							topic = target;
							republish = false;
						}
						// Otherwise just grab topic and republish from target
						else {
							// Make sure we have a topic
							if (!(TOPIC in target)) {
								throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
							}

							// Get topic
							topic = target[TOPIC];
							// Make sure republish is a boolean
							republish = !!target[REPUBLISH];
						}

						// Create callback
						var callback = subscribe[source] = function () {
							// Initialize args with topic as the first argument
							var args = [ topic ];

							// Push original arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

							// Publish and store promise as result
							return me.publish.apply(me, args);
						};

						// Transfer topic and republish to callback
						callback[TOPIC] = topic;
						callback[REPUBLISH] = republish;

						hub.subscribe(source, me, callback);
					});
				});
			},

			"sig/start" : function () {
				var me = this;
				var results = [];

				// Iterate SETTINGS
				me[SETTINGS].forEach(function (setting) {
					if (!(HUB in setting)) {
						throw new Error("'" + HUB + "' is missing from setting");
					}

					var subscribe = setting[SUBSCRIBE] || {};
					var hub = setting[HUB];

					// Iterate subscribe keys
					OBJECT_KEYS(subscribe).forEach(function (source) {
						var callback = subscribe[source];

						// Check if we should republish
						if (callback[REPUBLISH] === true) {
							// Push result from republish on results
							results.push(hub.republish(source, false, me, callback));
						}
					});
				});

				// Return promise that will resolve once all results are resolved
				return when.all(results);
			},

			"sig/finalize" : function () {
				var me = this;

				// Iterate SETTINGS
				me[SETTINGS].forEach(function (setting) {
					if (!(HUB in setting)) {
						throw new Error("'" + HUB + "' is missing from setting");
					}

					var publish = setting[PUBLISH] || {};
					var subscribe = setting[SUBSCRIBE] || {};
					var hub = setting[HUB];

					// Iterate publish keys and unsubscribe
					OBJECT_KEYS(publish).forEach(function (source) {
						me.unsubscribe(source, publish[source]);
					});

					// Iterate subscribe keys and unsubscribe
					OBJECT_KEYS(subscribe).forEach(function (source) {
						hub.unsubscribe(source, me, subscribe[source]);
					});
				});
			}
		});
});