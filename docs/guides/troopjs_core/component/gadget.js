/*
 * TroopJS core/component/gadget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"./base",
	"when",
	"../pubsub/hub"
],function GadgetModule(Component, when, hub) {
	"use strict";

	/**
	 * Component that provides signal and hub features.
	 *
	 * 	var one = Gadget.create({
	 * 		"hub/kick/start": function(foo) {
	 * 			// handle kick start
	 * 		},
	 *
	 * 		"hub/piss/off": function() {
	 * 			// handle piss off
	 * 		},
	 *
	 * 		"sig/task": function() {
	 * 			// handle "bar" task.
	 * 		},
	 *
	 * 		"hub/task": function() {
	 * 			// handle both "foo" and "bar".
	 * 		}
	 * 	});
	 *
	 * 	var other = Gadget.create();
	 *
	 * 	other.publish("kick/start","foo");
	 * 	other.publish("piss/off");
	 * 	other.task("foo", function() {
	 * 		// some dirty lift.
	 * 	});
	 * 	one.task("bar", function() {
	 * 		// some dirty lift.
	 * 	});
	 *
	 * @class core.component.gadget
	 * @extends core.component.base
	 */

	var UNDEFINED;
	var LENGTH = "length";
	var FEATURES = "features";
	var TYPE = "type";
	var VALUE = "value";
	var HUB = "hub";

	return Component.extend({
		"displayName" : "core/component/gadget",

		"sig/initialize" : function onInitialize() {
			var me = this;
			var specials;
			var special;
			var i;
			var iMax;

			// Make sure we have HUB specials
			if ((specials = me.constructor.specials[HUB]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					// Subscribe
					hub.subscribe(special[TYPE], me, special[VALUE], special[FEATURES]);
				}
			}
		},

		"sig/start" : function onStart() {
			var me = this;
			var specials;
			var special;
			var results = [];
			var resultsLength = 0;
			var i;
			var iMax;

			// Make sure we have HUB specials
			if ((specials = me.constructor.specials[HUB]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					// Check if we need to republish
					if (special[FEATURES] === "memory") {
						// Republish, store result
						results[resultsLength++] = hub.republish(special[TYPE], me, special[VALUE]);
					}
				}
			}

			// Return promise that will be fulfilled when all results are
			return when.all(results);
		},

		"sig/finalize" : function onFinalize() {
			var me = this;
			var specials;
			var special;
			var i;
			var iMax;

			// Make sure we have HUB specials
			if ((specials = me.constructor.specials[HUB]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					// Unsubscribe
					me.unsubscribe(special[TYPE], special[VALUE]);
				}
			}
		},

		/*
		 * Signal handler for 'task'
		 * @param {Promise} task
		 * @returns {Promise}
		 */
		"sig/task" : function onTask(task) {
			return this.publish("task", task);
		},

		/**
		 * @inheritdoc core.pubsub.hub#publish
		 */
		"publish" : function publish() {
			return hub.publish.apply(hub, arguments);
		},

		/**
		 * @inheritdoc core.pubsub.hub#republish
		 */
		"republish" : function republish() {
			return hub.republish.apply(hub, arguments);
		},

		/**
		 * @inheritdoc core.pubsub.hub#subscribe
		 * @localdoc Subscribe to public events from this component, forcing the context of which to be this component.
		 */
		"subscribe" : function subscribe(event, callback, data) {
			var me = this;

			// Subscribe
			hub.subscribe(event, me, callback, data);

			return me;
		},

		/**
		 * @inheritdoc core.pubsub.hub#unsubscribe
		 * @localdoc Unsubscribe from public events in context of this component.
		 */
		"unsubscribe" : function unsubscribe(event, callback) {
			var me = this;

			// Unsubscribe
			hub.unsubscribe(event, me, callback);

			return me;
		},

		/**
		 * @inheritdoc core.pubsub.hub#peek
		 */
		"peek" : function peek(event) {
			return hub.peek(event);
		}
	});
});
