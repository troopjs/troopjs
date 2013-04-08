/**
 * TroopJS core/event/emitter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../component/base", "when", "poly/array" ], function EventEmitterModule(Component, when) {
	/*jshint laxbreak:true */

	var UNDEFINED;
	var NULL = null;
	var MEMORY = "memory";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var LENGTH = "length";
	var HEAD = "head";
	var TAIL = "tail";
	var NEXT = "next";
	var HANDLED = "handled";
	var HANDLERS = "handlers";
	var PHASE = "phase";
	var RE_HINT = /^(\w+)(?::(pipeline|sequence))/;
	var RE_PHASE = /^(?:initi|fin)alized?$/;
	var ARRAY_SLICE = Array.prototype.slice;
	var ARRAY_ISARRAY = Array.isArray;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_FUNCTION = OBJECT_TOSTRING.call(Function.prototype);

	/**
	 * Constructs a function that executes handlers in sequence without overlap
	 * @private
	 * @param {Array} handlers Array of handlers
	 * @param {Number} handled Handled counter
	 * @param {Array} [result=[]] Result array
	 * @returns {Function}
	 */
	function sequence(handlers, handled, result) {
		// Default value for result
		result = result || [];

		var handlersCount = 0;
		var resultLength = result[LENGTH];
		var resultCount = resultLength - 1;

		/**
		 * Internal function for sequential execution of handlers handlers
		 * @private
		 * @param {Array} [args] result from previous handler callback
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (args) {
			var context;
			var handler;

			// Check that args is an array
			if (!ARRAY_ISARRAY(args)) {
				throw new Error("Result from handler has to be of type array");
			}

			// Store result
			if (resultCount++ >= resultLength) {
				result[resultCount] = args;
			}

			// Iterate until we find a handler in a blocked phase
			while ((handler = handlers[handlersCount++])	// Has next handler
				&& (context = handler[CONTEXT])				// Has context
				&& RE_PHASE.test(context[PHASE]));			// In blocked phase

			// Return promise of next callback, or a promise resolved with result
			return handler
				? (handler[HANDLED] = handled) === handled && when(handler[CALLBACK].apply(context, args), next)
				: when.resolve(result);
		};

		return next;
	}

	/**
	 * Constructs a function that executes handlers in a pipeline without overlap
	 * @private
	 * @param {Array} handlers Array of handlers
	 * @param {Number} handled Handled counter
	 * @param {Object} [anchor={}] Object for saving MEMORY on
	 * @returns {Function}
	 */
	function pipeline(handlers, handled, anchor) {
		// Default value for anchor
		anchor = anchor || {};

		var handlersCount = 0;
		var result;

		/**
		 * Internal function for piped execution of handlers handlers
		 * @private
		 * @param {Array} [args] result from previous handler callback
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (args) {
			var context;
			var handler;

			// Check that we have args
			if (args !== UNDEFINED) {

				if (!ARRAY_ISARRAY(args)) {
					throw new Error("Result from handler has to be of type array");
				}

				// Update memory and result
				anchor[MEMORY] = result = args;
			}

			// Iterate until we find a handler in a blocked phase
			while ((handler = handlers[handlersCount++])	// Has next handler
				&& (context = handler[CONTEXT])				// Has context
				&& RE_PHASE.test(context[PHASE]));			// In blocked phase

			// Return promise of next callback,or promise resolved with result
			return handler
				? (handler[HANDLED] = handled) === handled && when(handler[CALLBACK].apply(context, result), next)
				: when.resolve(result);
		};

		return next;
	}

	return Component.extend(
	/**
	 * Creates a new EventEmitter
	 * @constructor
	 */
	function EventEmitter() {
		this[HANDLERS] = {};
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event.
		 * @param {String} event to subscribe to
		 * @param {Object} context to scope callbacks to
		 * @param {...Function} callback for this event
		 * @returns {Object} instance of this
		 */
		"on" : function on(event, context, callback) {
			var self = this;
			var args = arguments;
			var handlers = self[HANDLERS];
			var handler;
			var head;
			var tail;
			var offset = 2;

			// Get callback from next arg
			if ((callback = args[offset++]) === UNDEFINED) {
				throw new Error("no callback provided");
			}

			// Test if callback is a function
			if (OBJECT_TOSTRING.call(callback) !== TOSTRING_FUNCTION) {
				throw new Error(OBJECT_TOSTRING.call(callback) + " is not a function");
			}

			// Have handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Create new handler
				handler = {};

				// Set handler callback
				handler[CALLBACK] = callback;

				// Set handler context
				handler[CONTEXT] = context;

				// Get tail handler
				tail = TAIL in handlers
					// Have tail, update handlers[TAIL][NEXT] to point to handler
					? handlers[TAIL][NEXT] = handler
					// Have no tail, update handlers[HEAD] to point to handler
					: handlers[HEAD] = handler;

				// Iterate callbacks
				while ((callback = args[offset++]) !== UNDEFINED) {
					// Test if callback is a function
					if (OBJECT_TOSTRING.call(callback) !== TOSTRING_FUNCTION) {
						throw new Error(OBJECT_TOSTRING.call(callback) + " is not a function");
					}

					// Set tail -> tail[NEXT] -> handler
					tail = tail[NEXT] = handler = {};

					// Set handler callback
					handler[CALLBACK] = callback;

					// Set handler context
					handler[CONTEXT] = context;
				}

				// Set tail handler
				handlers[TAIL] = tail;
			}
			// No handlers
			else {
				// Create head and tail
				head = tail = handler = {};

				// Set handler callback
				handler[CALLBACK] = callback;

				// Set handler context
				handler[CONTEXT] = context;

				// Iterate callbacks
				while ((callback = args[offset++]) !== UNDEFINED) {
					// Test if callback is a function
					if (OBJECT_TOSTRING.call(callback) !== TOSTRING_FUNCTION) {
						throw new Error(OBJECT_TOSTRING.call(callback) + " is not a function");
					}

					// Set tail -> tail[NEXT] -> handler
					tail = tail[NEXT] = handler = {};

					// Set handler callback
					handler[CALLBACK] = callback;

					// Set handler context
					handler[CONTEXT] = context;
				}

				// Create event handlers
				handlers = handlers[event] = {};

				// Initialize event handlers
				handlers[HEAD] = head;
				handlers[TAIL] = tail;
				handlers[HANDLED] = 0;
			}

			return self;
		},

		/**
		 * Remove a listener for the specified event.
		 * @param {String} event to remove callback from
		 * @param {Object} [context] to scope callback to
		 * @param {...Function} [callback] to remove
		 * @returns {Object} instance of this
		 */
		"off" : function off(event, context, callback) {
			var self = this;
			var args = arguments;
			var argsLength = args[LENGTH];
			var handlers = self[HANDLERS];
			var handler;
			var head;
			var tail;
			var offset;
			var found;

			// Return fast if we don't have subscribers
			if (!(event in handlers)) {
				return self;
			}

			// Get handlers
			handlers = handlers[event];

			// Return fast if there's no HEAD
			if (!(HEAD in handlers)) {
				return self;
			}

			// Get first handler
			handler = handlers[HEAD];

			// Iterate handlers
			do {
				// Should we remove?
				remove : {
					// If no context or context does not match we should break
					if (context && handler[CONTEXT] && handler[CONTEXT] !== context) {
						break remove;
					}

					// Reset offset, then loop callbacks
					for (found = false, offset = 2; offset < argsLength; offset++) {
						// If handler CALLBACK matches update found and break
						if (handler[CALLBACK] === args[offset]) {
							found = true;
							break;
						}
					}

					// If nothing is found break
					if (!found) {
						break remove;
					}

					// Remove this handler, just continue
					continue;
				}

				// It there's no head - link head -> tail -> handler
				if (!head) {
					head = tail = handler;
				}
				// Otherwise just link tail -> tail[NEXT] -> handler
				else {
					tail = tail[NEXT] = handler;
				}
			}
			// While there's a next handler
			while ((handler = handler[NEXT]));

			// If we have both head and tail we should update handlers
			if (head && tail) {
				// Set handlers HEAD and TAIL
				handlers[HEAD] = head;
				handlers[TAIL] = tail;

				// Make sure to remove NEXT from tail
				delete tail[NEXT];
			}
			// Otherwise we remove the handlers list
			else {
				delete handlers[HEAD];
				delete handlers[TAIL];
			}

			return self;
		},

		/**
		 * Execute each of the listeners in order with the supplied arguments
		 * @param {String} event to emit
		 * @returns {Promise} promise that resolves with results from all listeners
		 */
		"emit" : function emit(event) {
			var self = this;
			var args = ARRAY_SLICE.call(arguments, 1);
			var handlers = self[HANDLERS];
			var handler;
			var candidates;
			var candidatesCount;
			var matches;
			var method;

			// See if we should override event and method
			if ((matches = RE_HINT.exec(event)) !== NULL) {
				event = matches[1];
				method = matches[2];
			}

			// Have event in handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Have head in handlers
				if (HEAD in handlers) {
					// Create candidates array and count
					candidates = [];
					candidatesCount = 0;

					// Get first handler
					handler = handlers[HEAD];

					// Step handlers
					do {
						// Push handler on candidates
						candidates[candidatesCount++] = handler;
					}
					// While there is a next handler
					while ((handler = handler[NEXT]));

					// Return promise
					return (method === "sequence")
						? sequence(candidates, ++handlers[HANDLED])(args)
						: pipeline(candidates, ++handlers[HANDLED], handlers)(args);
				}
			}
			// No event in handlers
			else {
				// Create handlers and store with event
				handlers[event] = handlers = {};

				// Set handled
				handlers[HANDLED] = 0;
			}

			// Remember arg
			handlers[MEMORY] = args;

			// Return promise resolved with arg
			return when.resolve(args);
		},

		/**
		 * Reemit event from memory
		 * @param {String} event to reemit
		 * @param {Boolean} senile flag to indicate if already trigger callbacks should still be called
		 * @param {Object} [context] to scope callback to
		 * @param {...Function} [callback] to reemit
		 * @returns {Object} instance of this
		 */
		"reemit" : function reemit(event, senile, context, callback) {
			var self = this;
			var args = arguments;
			var argsLength = args[LENGTH];
			var handlers = self[HANDLERS];
			var handler;
			var handled;
			var candidates;
			var candidatesCount;
			var matches;
			var method;
			var offset;
			var found;

			// See if we should override event and method
			if ((matches = RE_HINT.exec(event)) !== NULL) {
				event = matches[1];
				method = matches[2];
			}

			// Have event in handlers
			if (event in handlers) {
				// Get handlers
				handlers = handlers[event];

				// Have memory in handlers
				if (MEMORY in handlers) {
					// If we have no HEAD we can return a promise resolved with memory
					if (!(HEAD in handlers)) {
						return when.resolve(handlers[MEMORY]);
					}

					// Create candidates array and count
					candidates = [];
					candidatesCount = 0;

					// Get first handler
					handler = handlers[HEAD];

					// Get handled
					handled = handlers[HANDLED];

					// Iterate handlers
					do {
						add : {
							// If no context or context does not match we should break
							if (context && handler[CONTEXT] && handler[CONTEXT] !== context) {
								break add;
							}

							// Reset found and offset, iterate args
							for (found = false, offset = 3; offset < argsLength; offset++) {
								// If callback matches set found and break
								if (handler[CALLBACK] === args[offset]) {
									found = true;
									break;
								}
							}

							// If we found a callback and are already handled and not senile break add
							if (found && handler[HANDLED] === handled && !senile) {
								break add;
							}

							// Push handler on candidates
							candidates[candidatesCount++] = handler;
						}
					}
					// While there's a next handler
					while ((handler = handler[NEXT]));

					// Return promise
					return (method === "sequence")
						? sequence(candidates, handled)(handlers[MEMORY])
						: pipeline(candidates, handled)(handlers[MEMORY]);
				}
			}

			// Return resolved promise
			return when.resolve();
		}
	});
});
