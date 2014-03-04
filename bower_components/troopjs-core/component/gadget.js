/*
 * TroopJS core/component/gadget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"./base",
	"./runner/pipeline",
	"when",
	"../pubsub/hub"
],function GadgetModule(Component, pipeline, when, hub) {
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
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var PROXY = "proxy";
	var FEATURES = "features";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var HUB = "hub";
	var RE = new RegExp("^" + HUB + "/(.+)");

	return Component.extend({
		"displayName" : "core/component/gadget",

		"sig/initialize" : function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[HUB] || ARRAY_PROTO, function (special) {
				return me.subscribe(special[TYPE], special[VALUE], special[FEATURES]);
			});
		},

		"sig/start" : function onInitialize() {
			var me = this;
			var empty = {};
			var specials = me.constructor.specials[HUB] || ARRAY_PROTO;

			// Calculate specials
			specials = specials
				.map(function (special) {
					var memory;
					var result;

					if (special[FEATURES] === "memory" && (memory = me.peek(special[TYPE], empty)) !== empty) {
						// Redefine result
						result = {};
						result[TYPE] = special[NAME];
						result[RUNNER] = pipeline;
						result[CONTEXT] = me;
						result[CALLBACK] = special[VALUE];
						result = [ result ].concat(memory);
					}

					return result;
				})
				.filter(function (special) {
					return special !== UNDEFINED;
				});

			return when.map(specials, function (special) {
				return me.emit.apply(me, special);
			});
		},

		"sig/setup": function onSetup(type, handlers) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				hub.subscribe(matches[1], me, handlers[PROXY] = function hub_proxy(args) {
					// Redefine args
					args = {};
					args[TYPE] = type;
					args[RUNNER] = pipeline;
					args = [ args ];

					// Push original arguments on args
					ARRAY_PUSH.apply(args, arguments);

					return me.emit.apply(me, args);
				});
			}
		},

		"sig/teardown": function onTeardown(type, handlers) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				hub.unsubscribe(matches[1], me, handlers[PROXY]);
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
		 * @inheritdoc core.pubsub.hub#subscribe
		 * @localdoc Subscribe to public events from this component, forcing the context of which to be this component.
		 */
		"subscribe" : function subscribe(event, callback, data) {
			return this.on("hub/" + event, callback, data);
		},

		/**
		 * @inheritdoc core.pubsub.hub#unsubscribe
		 * @localdoc Unsubscribe from public events in context of this component.
		 */
		"unsubscribe" : function unsubscribe(event, callback) {
			return this.off("hub/" + event, callback);
		},

		/**
		 * @inheritdoc core.pubsub.hub#peek
		 */
		"peek" : function peek(event, value) {
			return hub.peek(event, value);
		}
	});
});
