/*
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../event/emitter",
	"./runner/pipeline",
	"when"
], function HubModule(Emitter, pipeline, when) {
	"use strict";

	/**
	 * The centric "bus" that handlers publishing and subscription.
	 *
	 * ## Memorized emitting
	 * A fired event will memorize the "current" value of each event. Each executor may have it's own interpretation
	 * of what "current" means.
	 *
	 * For listeners that are registered after the event emitted thus missing from the call, {@link #republish} will
	 * compensate the call with memorized data.
	 *
	 * **Note:** It's NOT necessarily to pub/sub on this module, prefer to
	 * use methods like {@link core.component.gadget#publish} and {@link core.component.gadget#subscribe}
	 * that are provided as shortcuts.
	 *
	 * @class core.pubsub.hub
	 * @singleton
	 * @extends core.event.emitter
	 */

	var UNDEFINED;
	var COMPONENT_PROTOTYPE = Emitter.prototype;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var MEMORY = "memory";
	var HANDLERS = "handlers";
	var RUNNER = "runner";
	var TYPE = "type";

	return Emitter.create({
		"displayName": "core/pubsub/hub",

		/**
		 * Listen to an event that are emitted publicly.
		 * @inheritdoc #on
		 * @method
		 */
		"subscribe" : COMPONENT_PROTOTYPE.on,

		/**
		 * Remove a public event listener.
		 * @inheritdoc #off
		 * @method
		 */
		"unsubscribe" : COMPONENT_PROTOTYPE.off,

		/**
		 * Emit a public event that can be subscribed by other components.
		 *
		 * Handlers are run in a pipeline, in which each handler will receive muted
		 * data params depending on the return value of the previous handler:
		 *
		 *   - The original data params from {@link #publish} if this's the first handler, or the previous handler returns `undefined`.
		 *   - One value as the single argument if the previous handler return a non-array.
		 *   - Each argument value deconstructed from the returning array of the previous handler.
		 *
		 * @param {String} type The topic to publish.
		 * @param {...*} [args] Additional params that are passed to the handler function.
		 * @method
		 */
		"publish" : function publish(type, args) {
			var me = this;

			// Prepare event object
			var event = {};
			event[TYPE] = type;
			event[RUNNER] = pipeline;

			// Modify first argument
			arguments[0] = event;

			// Delegate the actual emitting to event emitter.
			return me.emit.apply(me, arguments);
		},

		/**
		 * Re-publish any event that are **previously published**, any (new) listeners will be called with the memorized data
		 * from the previous event publishing procedure.
		 *
		 * @param {String} type The topic to re-publish, dismiss if it's not yet published.
		 * @param {Object} [context] The context to scope the handler to match with.
		 * @param {Function} [callback] The handler function to match with.
		 * @returns {Promise}
		 */
		"republish": function republish(type, context, callback) {
			var me = this;
			var handlers;

			// Return fast if we don't have handlers for type, or those handlers have no MEMORY
			if ((handlers = me[HANDLERS][type]) === UNDEFINED || !(MEMORY in handlers)) {
				return when.resolve(UNDEFINED);
			}

			// Prepare event object
			var event = {};
			event[TYPE] = type;
			event[RUNNER] = pipeline;
			event[CONTEXT] = context;
			event[CALLBACK] = callback;

			// Delegate the actual emitting to event emitter, with memorized list of values.
			return me.emit.apply(me, [ event ].concat(handlers[MEMORY]));
		},

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} type event type to peek at
		 * @returns {*} Value in MEMORY
		 */
		"peek": function peek(type) {
			var handlers;

			// Return handlers[type][MEMORY]
			return ((handlers = this[HANDLERS][type]) !== UNDEFINED) && handlers[MEMORY];
		}
	});
});
