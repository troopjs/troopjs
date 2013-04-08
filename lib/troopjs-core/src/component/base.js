/**
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../component/factory", "when", "troopjs-utils/merge" ], function ComponentModule(Factory, when, merge) {
	/*jshint laxbreak:true */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var INSTANCE_COUNT = "instanceCount";
	var CONFIGURATION = "configuration";
	var PHASE = "phase";
	var VALUE = "value";
	var SIG = "sig";
	var COUNT = 0;

	return Factory(
	/**
	 * Creates a new component
	 * @constructor
	 */
	function Component() {
		var self = this;

		// Update instance count
		self[INSTANCE_COUNT] = ++COUNT;
		self[CONFIGURATION] = {};
	}, {
		"instanceCount" : COUNT,

		"displayName" : "core/component/base",

		/**
		 * Configures component
		 * @returns {Object} Updated configuration
		 */
		"configure" : function configure() {
			return merge.apply(this[CONFIGURATION], arguments);
		},

		/**
		 * Signals the component
		 * @param _signal {String} Signal
		 * @return {*}
		 */
		"signal" : function onSignal(_signal) {
			var self = this;
			var args = ARRAY_SLICE.call(arguments, 1);
			var specials = self.constructor.specials;
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
					? when(signal[VALUE].apply(self, args), next)
					: when.resolve(result);
			}

			// Return promise
			return next(args);
		},

		/**
		 * Start the component
		 * @return {*}
		 */
		"start" : function start() {
			var self = this;
			var signal = self.signal;
			var args = [ self[PHASE] = "initialize" ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(self, args).then(function initialized(_initialized) {
				// Modify args to change signal (and store in PHASE)
				args[0] = self[PHASE] = "start";

				return signal.apply(self, args).then(function started(_started) {
					// Update phase
					self[PHASE] = "started";

					// Return concatenated result
					return ARRAY_PROTO.concat(_initialized, _started);
				});
			});
		},

		/**
		 * Stops the component
		 * @return {*}
		 */
		"stop" : function stop() {
			var self = this;
			var signal = self.signal;
			var args = [ self[PHASE] = "stop" ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(self, args).then(function stopped(_stopped) {
				// Modify args to change signal (and store in PHASE)
				args[0] = self[PHASE] = "finalize";

				return signal.apply(self, args).then(function finalized(_finalized) {
					// Update phase
					self[PHASE] = "finalized";

					// Return concatenated result
					return ARRAY_PROTO.concat(_stopped, _finalized);
				});
			});
		},

		/**
		 * Generates string representation of this object
		 * @returns {string} displayName and instanceCount
		 */
		"toString" : function _toString() {
			var self = this;

			return self.displayName + "@" + self[INSTANCE_COUNT];
		}
	});
});
