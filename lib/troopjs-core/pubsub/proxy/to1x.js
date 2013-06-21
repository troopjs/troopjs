/**
 * TroopJS core/pubsub/proxy/to1x
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../../component/service", "when", "when/apply", "poly/array", "poly/object" ], function To1xModule(Service, when, apply) {
	"use strict";

	var PUBLISH = "publish";
	var SUBSCRIBE = "subscribe";
	var HUB = "hub";
	var SETTINGS = "settings";
	var LENGTH = "length";
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var OBJECT_KEYS = Object.keys;

	return Service.extend(
		/**
		 * Proxies to 1.x hub
		 * @param {object..} setting Setting
		 * @constructor
		 */
		function To1xService(setting) {
			this[SETTINGS] = ARRAY_SLICE.call(arguments);
		}, {
			"displayName" : "core/pubsub/proxy/to1x",

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

							// Create deferred
							var deferred = when.defer();
							// Store original resolve method
							var resolve = deferred.resolve;

							// Since the deferred implementation in jQuery (that we use in 1.x) allows
							// to resolve with multiple arguments, we monkey-patch resolve here
							deferred.resolve = deferred.resolver.resolve = function () {
								resolve(ARRAY_SLICE.call(arguments));
							};

							// Push deferred as last argument on args
							ARRAY_PUSH.call(args, deferred);

							// Publish with args
							hub.publish.apply(hub, args);

							// Return promise
							return deferred.promise;
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
							var deferred;
							var result;

							// Push sliced (without topic) arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

							// If the last argument look like a promise we pop and store as deferred
							if (when.isPromise(args[args[LENGTH] - 1])) {
								deferred = args.pop();
							}

							// Publish and store promise as result
							result = self.publish.apply(self, args);

							// If we have a deferred we should chain it to result
							if (deferred) {
								when(result, apply(deferred.resolve), deferred.reject, deferred.progress);
							}

							// Return result
							return result;
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