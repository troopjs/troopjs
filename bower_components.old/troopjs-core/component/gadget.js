/**
 * TroopJS core/component/gadget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../event/emitter", "when", "../pubsub/hub" ], function GadgetModule(Emitter, when, hub) {
	"use strict";

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var PUBLISH = hub.publish;
	var REPUBLISH = hub.republish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var LENGTH = "length";
	var FEATURES = "features";
	var TYPE = "type";
	var VALUE = "value";
	var SUBSCRIPTIONS = "subscriptions";
	var EMITTER_PROTO = Emitter.prototype;
	var ON = EMITTER_PROTO.on;
	var OFF = EMITTER_PROTO.off;
	var REEMITT = EMITTER_PROTO.reemit;
	var PEEK = EMITTER_PROTO.peek;

	return Emitter.extend(function Gadget() {
		this[SUBSCRIPTIONS] = [];
	}, {
		"displayName" : "core/component/gadget",

		/**
		 * Signal handler for 'initialize'
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;
			var subscription;
			var subscriptions = me[SUBSCRIPTIONS];
			var special;
			var specials = me.constructor.specials.hub;
			var i;
			var iMax;
			var type;
			var value;

			// Iterate specials
			for (i = 0, iMax = specials ? specials[LENGTH] : 0; i < iMax; i++) {
				// Get special
				special = specials[i];

				// Create subscription
				subscription = subscriptions[i] = {};

				// Set subscription properties
				subscription[TYPE] = type = special[TYPE];
				subscription[FEATURES] = special[FEATURES];
				subscription[VALUE] = value = special[VALUE];

				// Subscribe
				SUBSCRIBE.call(hub, type, me, value);
			}
		},

		/**
		 * Signal handler for 'start'
		 */
		"sig/start" : function onStart() {
			var me = this;
			var args = arguments;
			var subscription;
			var subscriptions = me[SUBSCRIPTIONS];
			var results = [];
			var resultsLength = 0;
			var i;
			var iMax;

			// Iterate subscriptions
			for (i = 0, iMax = subscriptions[LENGTH]; i < iMax; i++) {
				// Get subscription
				subscription = subscriptions[i];

				// If this is not a "memory" subscription - continue
				if (subscription[FEATURES] !== "memory") {
					continue;
				}

				// Republish, store result
				results[resultsLength++] = REPUBLISH.call(hub, subscription[TYPE], false, me, subscription[VALUE]);
			}

			// Return promise that will be fulfilled when all results are, and yield args
			return when.all(results).yield(args);
		},

		/**
		 * Signal handler for 'finalize'
		 */
		"sig/finalize" : function onFinalize() {
			var me = this;
			var subscription;
			var subscriptions = me[SUBSCRIPTIONS];
			var i;
			var iMax;

			// Iterate subscriptions
			for (i = 0, iMax = subscriptions[LENGTH]; i < iMax; i++) {
				// Get subscription
				subscription = subscriptions[i];

				// Unsubscribe
				UNSUBSCRIBE.call(hub, subscription[TYPE], me, subscription[VALUE]);
			}
		},

		/**
		 * Signal handler for 'task'
		 * @param {Promise} task
		 * @returns {Promise}
		 */
		"sig/task" : function onTask(task) {
			return this.publish("task", task);
		},

		/**
		 * Reemits event with forced context to this
		 * @param {String} event to publish
		 * @param {Boolean} senile flag
		 * @param {...Function} callback to limit reemit to
		 * @returns {Promise}
		 */
		"reemit" : function reemit(event, senile, callback) {
			var me = this;
			var args = [ event, senile, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 2));

			// Forward
			return REEMITT.apply(me, args);
		},

		/**
		 * Adds callback to event with forced context to this
		 * @param {String} event to publish
		 * @param {...Function} callback to add
		 * @returns {Object} instance of this
		 */
		"on": function on(event, callback) {
			var me = this;
			var args = [ event, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

			// Forward
			return ON.apply(me, args);
		},

		/**
		 * Removes callback from event with forced context to this
		 * @param {String} event to remove callback from
		 * @param {...Function} callback to remove
		 * @returns {Object} instance of this
		 */
		"off" : function off(event, callback) {
			var me = this;
			var args = [ event, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

			// Forward
			return OFF.apply(me, args);
		},

		/**
		 * Calls hub.publish
		 * @arg {String} event to publish
		 * @arg {...*} arg to pass to subscribed callbacks
		 * @returns {Promise}
		 */
		"publish" : function publish(event, arg) {
			return PUBLISH.apply(hub, arguments);
		},

		/**
		 * Calls hub.republish
		 * @param {String} event to publish
		 * @param {Boolean} senile flag
		 * @param {...Function} callback to limit republish to
		 * @returns {Promise}
		 */
		"republish" : function republish(event, senile, callback) {
			var me = this;
			var args = [ event, senile, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 2));

			// Republish
			return REPUBLISH.apply(hub, args);
		},

		/**
		 * Calls hub.subscribe
		 * @param {String} event to subscribe to
		 * @param {...Function} callback to subscribe
		 * @returns {Object} instance of this
		 */
		"subscribe" : function subscribe(event, callback) {
			var me = this;
			var args = [ event, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

			// Subscribe
			SUBSCRIBE.apply(hub, args);

			return me;
		},

		/**
		 * Calls hub.unsubscribe
		 * @param {String} event to unsubscribe from
		 * @param {...Function} callback to unsubscribe
		 * @returns {Object} instance of this
		 */
		"unsubscribe" : function unsubscribe(event, callback) {
			var me = this;
			var args = [ event, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

			// Unsubscribe
			UNSUBSCRIBE.apply(hub, args);

			return me;
		},

		/**
		 * Spies on the current value in MEMORY on the hub
		 * @param {String} event event to spy on
		 * @returns {*} Value in MEMORY
		 */
		"spy" : function (event) {
			return PEEK.call(hub, event);
		}
	});
});
