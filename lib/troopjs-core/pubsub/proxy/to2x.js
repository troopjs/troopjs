/**
 * TroopJS core/pubsub/proxy/to2x
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../../component/service", "poly/array", "poly/object" ], function To2xModule(Service) {
	"use strict";

	var PUBLISH = "publish";
	var SUBSCRIBE = "subscribe";
	var HUB = "hub";
	var SETTINGS = "settings";
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var OBJECT_KEYS = Object.keys;

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
				var self = this;

				// Iterate SETTINGS
				self[SETTINGS].forEach(function (setting) {
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

						// Create callback
						var callback = publish[source] = function () {
							// Initialize args with target as the first argument
							var args = [ target ];

							// Push original arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

							return hub.publish.apply(hub, args);
						};

						self.subscribe(source, callback);
					});

					// Iterate subscribe keys
					OBJECT_KEYS(subscribe).forEach(function (source) {
						// Extract target
						var target = subscribe[source];

						// Create callback
						var callback = subscribe[source] = function () {
							// Initialize args with target as the first argument
							var args = [ target ];

							// Push original arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

							// Publish and store promise as result
							return self.publish.apply(self, args);
						};

						hub.subscribe(source, self, callback);
					});
				});
			},

			"sig/finalize" : function () {
				var self = this;

				// Iterate SETTINGS
				self[SETTINGS].forEach(function (setting) {
					if (!(HUB in setting)) {
						throw new Error("'" + HUB + "' is missing from setting");
					}

					var publish = setting[PUBLISH] || {};
					var subscribe = setting[SUBSCRIBE] || {};
					var hub = setting[HUB];

					// Iterate publish keys and unsubscribe
					OBJECT_KEYS(publish).forEach(function (source) {
						self.unsubscribe(source, publish[source]);
					});

					// Iterate subscribe keys and unsubscribe
					OBJECT_KEYS(subscribe).forEach(function (source) {
						hub.unsubscribe(source, self, subscribe[source]);
					});
				});
			}
		});
});