/*
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "./factory", "when", "troopjs-utils/merge" ], function ComponentModule(Factory, when, merge) {
	"use strict";

	/**
	 * Imagine component as an object that has predefined life-cycle, with the following phases:
	 *
	 *   1. initialize (signal)
	 *   1. start (signal)
	 *   1. started
	 *   1. stop (signal)
	 *   1. finalize (signal)
	 *   1. finalized
	 *
	 * Calls on {@link #start} or {@link #stop} method of the component will trigger any defined signal
	 * handlers declared.
	 *
	 * 	var app = Component.extend({
	 * 		"displayName": "my/component/app",
	 *
	 * 		// Signal handler for "start" phase
	 * 		"sig/start": function start() {
	 * 			// bind resize handler.
	 * 			$(window).on('resize.app', $.proxy(this.onResize, this));
	 * 		},
	 *
	 * 		// Signal handler for "finalize" phase
	 * 		"sig/finalize": function finalize() {
	 * 			// cleanup the handler.
	 * 			$(window).off('resize.app');
	 * 		},
	 *
	 * 		"onResize": function onResize(argument) {
	 * 			// window resized.
	 * 		}
	 * 	});
	 *
	 * 	$.ready(function on_load() {
	 * 		app.start();
	 * 	});
	 *
	 * 	$(window).unload(function on_unload (argument) {
	 * 	  app.end();
	 * 	});
	 * @class core.component.base
	 */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var INSTANCE_COUNT = "instanceCount";
	var CONFIGURATION = "configuration";
	var CONTEXT = "context";
	var NAME = "name";
	var VALUE = "value";
	var PHASE = "phase";
	var STARTED = "started";
	var FINISHED = "finished";
	var INITIALIZE = "initialize";
	var STOP = "stop";
	var SIG = "sig";
	var INSTANCE_COUNTER = 0;

	return Factory(
	function Component() {
		var me = this;

		// Update instance count
		me[INSTANCE_COUNT] = ++INSTANCE_COUNTER;

		// Set configuration
		me[CONFIGURATION] = {};
	}, {
		"instanceCount" : INSTANCE_COUNTER,

		"displayName" : "core/component/base",

		/**
		 * Add to the component configurations, possibly {@link Object#merge merge} with the existing ones.
		 *
		 * 		var List = Component.extend({
		 * 			"sig/start": function start() {
		 * 				// configure the List.
		 * 				this.configure({
		 * 					"type": "list",
		 * 					"cls": ["list"]
		 * 				});
		 * 			}
		 * 		});
		 * 		var Dropdown = List.extend({
		 * 			"sig/start": function start() {
		 * 				// configure the Dropdown.
		 * 				this.configure({
		 * 					"type": "dropdown",
		 * 					"cls": ["dropdown"],
		 * 					"shadow": true
		 * 				});
		 * 			}
		 * 		});
		 *
		 * 		var dropdown = new Dropdown();
		 *
		 * 		// Overwritten: "dropdown"
		 * 		print(dropdown.configuration.id);
		 * 		// Augmented: ["list","dropdown"]
		 * 		print(dropdown.configuration.cls);
		 * 		// Added: true
		 * 		print(dropdown.configuration.shadow);
		 *
		 * @param {Object...} [configs] Config(s) to add.
		 * @returns {Object} The new configuration.
		 */
		"configure" : function configure() {
			return merge.apply(this[CONFIGURATION], arguments);
		},

		/**
		 * Signals the component
		 * @param _signal {String} Signal
		 * @return {Promise}
		 */
		"signal" : function onSignal(_signal) {
			var me = this;
			var args = ARRAY_SLICE.call(arguments, 1);
			var specials = me.constructor.specials;
			var signals = (SIG in specials && specials[SIG][_signal]) || [];
			var signal;
			var index = 0;
			var result = [];
			var resultLength = -2;

			function next(_args) {
				// Add result if resultLength is within bounds
				if (++resultLength > -1) {
					result[resultLength] = _args;
				}

				// Return a chained promise of next callback, or a promise resolved with _signal
				return (signal = signals[index++])
					? when(signal[VALUE].apply(me, args), next)
					: when.resolve(result);
			}

			// Return promise
			return next(args);
		},

		/**
		 * Start the component life-cycle.
		 * @return {*}
		 */
		"start" : function start() {
			var me = this;
			var signal = me.signal;
			var args = [ INITIALIZE ];

			// Set phase
			me[PHASE] = INITIALIZE;

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function initialized(_initialized) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "start";

				return signal.apply(me, args).then(function started(_started) {
					// Update phase
					me[PHASE] = "started";

					// Return concatenated result
					return ARRAY_PROTO.concat(_initialized, _started);
				});
			});
		},

		/**
		 * Stops the component life-cycle.
		 * @return {*}
		 */
		"stop" : function stop() {
			var me = this;
			var signal = me.signal;
			var args = [ STOP ];

			// Set phase
			me[PHASE] = STOP;

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function stopped(_stopped) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "finalize";

				return signal.apply(me, args).then(function finalized(_finalized) {
					// Update phase
					me[PHASE] = "finalized";

					// Return concatenated result
					return ARRAY_PROTO.concat(_stopped, _finalized);
				});
			});
		},

		/**
		 * Schedule a new promise that runs on this component, sends a "task" signal once finished.
		 *
		 * **Note:** It's recommended to use **this method instead of an ad-hoc promise** to do async lift on this component,
		 * since in additional to an ordinary promise, it also helps to track the context of any running promise,
		 * including it's name, completion time and a given ID.
		 *
		 * 	var widget = Widget.create({
		 * 		"sig/task" : function(promise) {
		 * 			print('task %s started at: %s, finished at: %s', promise.name, promise.started);
		 * 		}
		 * 	});
		 *
		 * 	widget.task(function(resolve) {
		 * 		$(this.$element).fadeOut(resolve);
		 * 	}, 'animate');
		 *
		 * @param {Function} resolver The task resolver function.
		 * @param {Function} resolver.resolve Resolve the task.
		 * @param {Function} resolver.reject Reject the task.
		 * @param {Function} resolver.notify Notify the progress of this task.
		 * @param {String} [name]
		 * @returns {Promise}
		 */
		"task" : function task(resolver, name) {
			var me = this;

			var promise = when
				.promise(resolver)
				.ensure(function () {
					promise[FINISHED] = new Date();
				});

			promise[CONTEXT] = me;
			promise[STARTED] = new Date();
			promise[NAME] = name;

			return me.signal("task", promise).yield(promise);
		},

		/**
		 * Gives string representation of this component instance.
		 * @returns {string} displayName and instanceCount
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});
