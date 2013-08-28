/**
 * troopjs - 2.0.2-2+7bf18d2 © Mikael Karon mailto:mikael@karon.se
 * @license MIT http://troopjs.mit-license.org/
 */

/**
 * TroopJS utils/unique
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/unique',[],function UniqueModule() {
	"use strict";

	var LENGTH = "length";

	/**
	 * Reduces array to only contain unique values (evals left-right)
	 * @returns {Number} New length of array
	 */
	return function unique(comparator) {
		var arg;
		var args = this;
		var i;
		var j;
		var k;
		var iMax = args[LENGTH];

		// Did we provide a comparator?
		if (comparator) {
			comparator_outer: for (i = k = 0; i < iMax; i++) {
				arg = args[i];

				for (j = 0; j < i; j++) {
					if (comparator.call(args, arg, [j]) === true) {
						continue comparator_outer;
					}
				}

				args[k++] = arg;
			}
		}
		// Otherwise use strict equality
		else {
			outer: for (i = k = 0; i < iMax; i++) {
				arg = args[i];

				for (j = 0; j < i; j++) {
					if (arg === args[j]) {
						continue outer;
					}
				}

				args[k++] = arg;
			}
		}

		// Assign new length
		args[LENGTH] = k;

		// Return new length
		return k;
	};
});
/**
 * TroopJS core/component/factory
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/factory',[ "troopjs-utils/unique", "poly/object" ], function ComponentFactoryModule(unique) {
	"use strict";

	var PROTOTYPE = "prototype";
	var TOSTRING = "toString";
	var ARRAY_PROTO = Array[PROTOTYPE];
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_UNSHIFT = ARRAY_PROTO.unshift;
	var OBJECT_TOSTRING = Object[PROTOTYPE][TOSTRING];
	var TYPEOF_FUNCTION = "function";
	var DISPLAYNAME = "displayName";
	var LENGTH = "length";
	var EXTEND = "extend";
	var CREATE = "create";
	var DECORATE = "decorate";
	var DECORATED = "decorated";
	var BEFORE = "before";
	var AFTER = "after";
	var AROUND = "around";
	var CONSTRUCTOR = "constructor";
	var CONSTRUCTORS = "constructors";
	var SPECIALS = "specials";
	var GROUP = "group";
	var VALUE = "value";
	var FEATURES = "features";
	var TYPE = "type";
	var NAME = "name";
	var RE_SPECIAL = /^(\w+)(?::(.+?))?\/([-_./\d\w\s]+)$/;
	var NOOP = function noop () {};
	var factoryDescriptors = {};

	/**
	 * Create a component
	 * @returns {*}
	 */
	function create() {
		/*jshint validthis:true*/
		return extend.apply(this, arguments)();
	}

	/**
	 * Extends a component
	 * @returns {*} New component
	 */
	function extend() {
		/*jshint validthis:true*/
		var args = [ this ];
		ARRAY_PUSH.apply(args, arguments);
		return Factory.apply(null, args);
	}

	/**
	 * Creates new Decorator
	 * @param {Function} decorated Original function
	 * @param {Function} decorate Function to re-write descriptor
	 * @constructor
	 */
	function Decorator(decorated, decorate) {
		var descriptor = {};

		// Add DECORATED to descriptor
		descriptor[DECORATED] = {
			"value" : decorated
		};

		// Add DECORATE to descriptor
		descriptor[DECORATE] = {
			"value" : decorate
		};

		// Define properties
		Object.defineProperties(this, descriptor);
	}

	/**
	 * Before advise
	 * @param {Function} decorated Original function
	 * @returns {ComponentFactoryModule.Decorator}
	 */
	function before(decorated) {
		return new Decorator(decorated, before[DECORATE]);
	}

	/**
	 * Describe before
	 * @param descriptor
	 * @returns {*}
	 */
	before[DECORATE] = function (descriptor) {
		var previous = this[DECORATED];
		var next = descriptor[VALUE];

		descriptor[VALUE] = next
			? function () {
			var me = this;
			var args = arguments;
			return next.apply(me, args = previous.apply(me, args) || args);
		}
			: previous;

		return descriptor;
	};

	/**
	 * After decorator
	 * @param decorated
	 * @returns {ComponentFactoryModule.Decorator}
	 */
	function after(decorated) {
		return new Decorator(decorated, after[DECORATE]);
	}

	/**
	 * Decorate after
	 * @param descriptor
	 * @returns {*}
	 */
	after[DECORATE] = function (descriptor) {
		var previous = descriptor[VALUE];
		var next = this[DECORATED];


		descriptor[VALUE] = previous
			? function () {
				var me = this;
				var args = arguments;
				return next.apply(me, args = previous.apply(me, args) || args);
			}
			: next;

		return descriptor;
	};

	/**
	 * Around decorator
	 * @param decorated
	 * @returns {ComponentFactoryModule.Decorator}
	 */
	function around(decorated) {
		return new Decorator(decorated, around[DECORATE]);
	}

	/**
	 * Decorate around
	 * @param descriptor
	 * @returns {*}
	 */
	around[DECORATE] = function (descriptor) {
		descriptor[VALUE] = this[DECORATED](descriptor[VALUE] || NOOP);

		return descriptor;
	};

	/**
	 * Returns a string representation of this constructor
	 * @returns {String}
	 */
	function ConstructorToString() {
		var me = this;
		var prototype = me[PROTOTYPE];

		return DISPLAYNAME in prototype
			? prototype[DISPLAYNAME]
			: OBJECT_TOSTRING.call(me);
	}

	/**
	 * Creates components
	 * @returns {*} New component
	 * @constructor
	 */
	function Factory () {
		var special;
		var specials = [];
		var specialsLength;
		var arg;
		var args = arguments;
		var argsLength = args[LENGTH];
		var constructors = [];
		var constructorsLength;
		var name;
		var names;
		var namesLength;
		var i;
		var j;
		var group;
		var type;
		var matches;
		var value;
		var descriptor;
		var prototype = {};
		var prototypeDescriptors = {};
		var constructorDescriptors = {};

		// Iterate arguments
		for (i = 0; i < argsLength; i++) {
			// Get arg
			arg = args[i];

			// If this is a function we're going to add it as a constructor candidate
			if(typeof arg === TYPEOF_FUNCTION) {
				// If this is a synthetic constructor then add (child) constructors
				if (CONSTRUCTORS in arg) {
					ARRAY_PUSH.apply(constructors, arg[CONSTRUCTORS]);
				}
				// Otherwise add as usual
				else {
					ARRAY_PUSH.call(constructors, arg);
				}

				// If we have SPECIALS then unshift arg[SPECIALS] onto specials
				if (SPECIALS in arg) {
					ARRAY_UNSHIFT.apply(specials, arg[SPECIALS]);
				}

				// Continue if this is a dead cause
				if (arg === arg[PROTOTYPE][CONSTRUCTOR]) {
					continue;
				}

				// Arg is now arg prototype
				arg = arg[PROTOTYPE];
			}

			// Get arg names
			names = Object.getOwnPropertyNames(arg);

			// Iterate names
			for (j = 0, namesLength = names[LENGTH]; j < namesLength; j++) {
				// Get name
				name = names[j];

				// Check if this matches a SPECIAL signature
				if ((matches = RE_SPECIAL.exec(name))) {
					// Create special
					special = {};

					// Set special properties
					special[GROUP] = group = matches[1];
					special[FEATURES] = matches[2];
					special[TYPE] = type = matches[3];
					special[NAME] = group + "/" + type;
					special[VALUE] = arg[name];

					// Unshift special onto specials
					ARRAY_UNSHIFT.call(specials, special);
				}
				// Otherwise just add to prototypeDescriptors
				else {
					// Get descriptor for arg
					descriptor = Object.getOwnPropertyDescriptor(arg, name);

					// Get value
					value = descriptor[VALUE];

					// If value is instanceof Advice, we should re-describe, otherwise just use the original desciptor
					prototypeDescriptors[name] = value instanceof Decorator
						? value[DECORATE](prototypeDescriptors[name] || {
							"enumerable" : true,
							"configurable" : true,
							"writable" : true
						})
						: descriptor;
				}
			}
		}

		// Define properties on prototype
		Object.defineProperties(prototype, prototypeDescriptors);

		// Reduce constructors to unique values
		constructorsLength = unique.call(constructors);

		// Reduce specials to unique values
		specialsLength = unique.call(specials);

		// Iterate specials
		for (i = 0; i < specialsLength; i++) {
			// Get special
			special = specials[i];

			// Get special properties
			group = special[GROUP];
			type = special[TYPE];
			name = special[NAME];

			// Get or create group object
			group = group in specials
				? specials[group]
				: specials[group] = [];

			// Get or create type object
			type = type in group
				? group[type]
				: group[type] = specials[name] = [];

			// Store special in group/type
			group[group[LENGTH]] = type[type[LENGTH]] = special;
		}

		/**
		 * Component constructor
		 * @returns {Constructor} Constructor
		 * @constructor
		 */
		function Constructor () {
			// Allow to be created either via 'new' or direct invocation
			var instance = this instanceof Constructor
				? this
				: Object.create(prototype);

			var _args = arguments;
			var _i;

			// Set the constructor on instance
			Object.defineProperty(instance, CONSTRUCTOR, {
				"value" : Constructor
			});

			// Iterate constructors
			for (_i = 0; _i < constructorsLength; _i++) {
				// Capture result as _args to pass to next constructor
				_args = constructors[_i].apply(instance, _args) || _args;
			}

			return instance;
		}

		// Add PROTOTYPE to constructorDescriptors
		constructorDescriptors[PROTOTYPE] = {
			"value" : prototype
		};

		// Add CONSTRUCTORS to constructorDescriptors
		constructorDescriptors[CONSTRUCTORS] = {
			"value" : constructors
		};

		// Add SPECIALS to constructorDescriptors
		constructorDescriptors[SPECIALS] = {
			"value" : specials
		};

		constructorDescriptors[TOSTRING] = {
			"value" : ConstructorToString
		};

		// Add EXTEND to constructorDescriptors
		constructorDescriptors[EXTEND] = {
			"value" : extend
		};

		// Add CREATE to constructorDescriptors
		constructorDescriptors[CREATE] = {
			"value" : create
		};

		// Define prototypeDescriptors on Constructor
		Object.defineProperties(Constructor, constructorDescriptors);

		// Return Constructor
		return Constructor;
	}

	// Add CREATE to factoryDescriptors
	factoryDescriptors[CREATE] = {
		"value" : function FactoryCreate() {
			return Factory.apply(null, arguments)();
		}
	};

	// Add BEFORE to factoryDescriptors
	factoryDescriptors[BEFORE] = {
		"value" : before
	};

	// Add AFTER to factoryDescriptors
	factoryDescriptors[AFTER] = {
		"value" : after
	};

	// Add AROUND to factoryDescriptors
	factoryDescriptors[AROUND] = {
		"value" : around
	};

	// Define factoryDescriptors on Factory
	Object.defineProperties(Factory, factoryDescriptors);

	// Return Factory
	return Factory;
});
/**
 * TroopJS utils/merge module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/merge',[ "poly/object" ], function MergeModule() {
	"use strict";

	var LENGTH = "length";
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_CONCAT = ARRAY_PROTO.concat;
	var OBJECT_PROTO = Object.prototype;
	var OBJECT_TOSTRING = OBJECT_PROTO.toString;
	var TOSTRING_OBJECT = OBJECT_TOSTRING.call(OBJECT_PROTO);
	var TOSTRING_ARRAY = OBJECT_TOSTRING.call(ARRAY_PROTO);

	return function merge(source) {
		var target = this;
		var key;
		var keys;
		var i;
		var j;
		var iMax;
		var jMax;
		var source_value;
		var target_value;
		var source_tostring;
		var target_tostring;

		// Iterate arguments
		for (i = 0, iMax = arguments[LENGTH]; i < iMax; i++) {
			// Get source
			source = arguments[i];

			// Get source keys
			keys = Object.keys(source);

			// Iterate keys
			for (j = 0, jMax = keys[LENGTH]; j < jMax; j++) {
				key = keys[j];
				source_value = source[key];
				target_value = target[key];

				// No merge - copy source_value
				if (!(key in target)) {
					target[key] = source_value;
					continue;
				}

				// Get 'types'
				source_tostring = OBJECT_TOSTRING.call(source_value);
				target_tostring = OBJECT_TOSTRING.call(target_value);

				// Can we merge objects?
				if (target_tostring === TOSTRING_OBJECT && source_tostring === TOSTRING_OBJECT) {
					merge.call(target_value, source_value);
				}
				// Can we merge arrays?
				else if (target_tostring === TOSTRING_ARRAY && source_tostring === TOSTRING_ARRAY) {
					target[key] = ARRAY_CONCAT.call(target_value, source_value);
				}
				// No merge - override target[key]
				else {
					target[key] = source_value;
				}
			}
		}

		return target;
	};
});
/**
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/base',[ "./factory", "when", "troopjs-utils/merge" ], function ComponentModule(Factory, when, merge) {
	"use strict";

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var INSTANCE_COUNT = "instanceCount";
	var CONFIGURATION = "configuration";
	var CONTEXT = "context";
	var ID = "id";
	var NAME = "name";
	var VALUE = "value";
	var PHASE = "phase";
	var STARTED = "started";
	var FINISHED = "finished";
	var INITIALIZE = "initialize";
	var STOP = "stop";
	var SIG = "sig";
	var INSTANCE_COUNTER = 0;
	var TASK_COUNTER = 0;

	return Factory(
	/**
	 * Creates a new component
	 * @constructor
	 */
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
		 * Start the component
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
		 * Stops the component
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
		 * Creates new task
		 * @param {Function} resolver
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

			promise[ID] = ++TASK_COUNTER;
			promise[CONTEXT] = me;
			promise[STARTED] = new Date();
			promise[NAME] = name;

			return me.signal("task", promise).then(function () {
				return promise;
			});
		},

		/**
		 * Generates string representation of this object
		 * @returns {string} displayName and instanceCount
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});

/**
 * TroopJS core/logger/console
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/logger/console',[ "../component/base", "poly/function" ], function ConsoleLogger(Component) {
	"use strict";

	/*jshint devel:true*/
	var CONSOLE = console;

	function noop() {}

	return Component.create({
			"displayName" : "core/logger/console"
		},
		CONSOLE
			? {
			"log" : CONSOLE.log.bind(CONSOLE),
			"warn" : CONSOLE.warn.bind(CONSOLE),
			"debug" : CONSOLE.debug.bind(CONSOLE),
			"info" : CONSOLE.info.bind(CONSOLE),
			"error" : CONSOLE.error.bind(CONSOLE)
		}
			: {
			"log" : noop,
			"warn" : noop,
			"debug" : noop,
			"info" : noop,
			"error" : noop
		});
});
/**
 * TroopJS core/event/emitter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/event/emitter',[ "../component/base", "when", "poly/array" ], function EventEmitterModule(Component, when) {
	"use strict";

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
			/*jshint curly:false*/
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
			/*jshint curly:false*/
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
			var me = this;
			var args = arguments;
			var handlers = me[HANDLERS];
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

			return me;
		},

		/**
		 * Remove a listener for the specified event.
		 * @param {String} event to remove callback from
		 * @param {Object} [context] to scope callback to
		 * @param {...Function} [callback] to remove
		 * @returns {Object} instance of this
		 */
		"off" : function off(event, context, callback) {
			var me = this;
			var args = arguments;
			var argsLength = args[LENGTH];
			var handlers = me[HANDLERS];
			var handler;
			var head;
			var tail;
			var offset;
			var found;

			// Return fast if we don't have subscribers
			if (!(event in handlers)) {
				return me;
			}

			// Get handlers
			handlers = handlers[event];

			// Return fast if there's no HEAD
			if (!(HEAD in handlers)) {
				return me;
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

			return me;
		},

		/**
		 * Execute each of the listeners in order with the supplied arguments
		 * @param {String} event to emit
		 * @returns {Promise} promise that resolves with results from all listeners
		 */
		"emit" : function emit(event) {
			var me = this;
			var args = ARRAY_SLICE.call(arguments, 1);
			var handlers = me[HANDLERS];
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
			var me = this;
			var args = arguments;
			var argsLength = args[LENGTH];
			var handlers = me[HANDLERS];
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

/**
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/pubsub/hub',[ "../event/emitter" ], function HubModule(Emitter) {
	"use strict";

	var COMPONENT_PROTOTYPE = Emitter.prototype;

	return Emitter.create({
		"displayName": "core/pubsub/hub",
		"subscribe" : COMPONENT_PROTOTYPE.on,
		"unsubscribe" : COMPONENT_PROTOTYPE.off,
		"publish" : COMPONENT_PROTOTYPE.emit,
		"republish" : COMPONENT_PROTOTYPE.reemit
	});
});

/**
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/logger/pubsub',[ "../component/base", "../pubsub/hub" ], function PubSubLogger(Component, hub) {
	"use strict";

	var ARRAY_PUSH = Array.prototype.push;
	var PUBLISH = hub.publish;

	return Component.create({
		"displayName" : "core/logger/pubsub",

		"log": function log() {
			var args = [ "logger/log" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		"warn" : function warn() {
			var args = [ "logger/warn" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		"debug" : function debug() {
			var args = [ "logger/debug" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		"info" : function info() {
			var args = [ "logger/info" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		"error" : function info() {
			var args = [ "logger/error" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		}
	});
});
/**
 * TroopJS core/component/gadget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/gadget',[ "../event/emitter", "when", "../pubsub/hub" ], function GadgetModule(Emitter, when, hub) {
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
		}
	});
});

/**
 * TroopJS core/component/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/service',[ "./gadget" ], function ServiceModule(Gadget) {
	"use strict";

	return Gadget.extend({
		"displayName" : "core/component/service",

		"sig/initialize" : function onStart() {
			var me = this;

			return me.publish("registry/add", me);
		},

		"sig/finalize" : function onFinalize() {
			var me = this;

			return me.publish("registry/remove", me);
		}
	});
});
/**
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/logger/service',[ "../component/service", "troopjs-utils/merge", "when" ], function logger(Service, merge, when) {
	"use strict";

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_OBJECT = "[object Object]";
	var LENGTH = "length";
	var APPENDERS = "appenders";

	function forward(_signal, _args) {
		/*jshint validthis:true*/
		var me = this;
		var signal = me.signal;
		var args = [ _signal ];
		var appenders = me[APPENDERS];
		var index = 0;

		ARRAY_PUSH.apply(args, _args);

		var next = function () {
			var appender;

			return (appender = appenders[index++])
				? when(signal.apply(appender, args), next)
				: when.resolve(_args);
		};

		return next();
	}

	function convert(cat, message) {
		var result = {
			"cat" : cat,
			"time": new Date().getTime()
		};

		if (OBJECT_TOSTRING.call(message) === TOSTRING_OBJECT) {
			merge.call(result, message);
		}
		else {
			result.msg = message;
		}

		return result;
	}

	function append(obj) {
		/*jshint validthis:true*/
		var me = this;
		var appenders = me[APPENDERS];
		var i;
		var iMax;

		for (i = 0, iMax = appenders[LENGTH]; i < iMax; i++) {
			appenders[i].append(obj);
		}
	}

	return Service.extend(function LoggerService() {
		this[APPENDERS] = ARRAY_SLICE.call(arguments);
	}, {
		displayName : "core/logger/service",

		"sig/initialize" : function onInitialize() {
			return forward.call(this, "initialize", arguments);
		},
		"sig/start" : function onStart() {
			return forward.call(this, "start", arguments);
		},
		"sig/stop" : function onStop() {
			return forward.call(this, "stop", arguments);
		},
		"sig/finalize" : function onFinalize() {
			return forward.call(this, "finalize", arguments);
		},

		"hub/logger/log" : function onLog(message) {
			append.call(this, convert("log", message));
		},

		"hub/logger/warn" : function onWarn(message) {
			append.call(this, convert("warn", message));
		},

		"hub/logger/debug" : function onDebug(message) {
			append.call(this, convert("debug", message));
		},

		"hub/logger/info" : function onInfo(message) {
			append.call(this, convert("info", message));
		},

		"hub/logger/error" : function onError(message) {
			append.call(this, convert("error", message));
		}
	});
});

/**
 * TroopJS browser/ajax/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/ajax/service',[ "troopjs-core/component/service", "jquery", "troopjs-utils/merge", "when" ], function AjaxModule(Service, $, merge, when) {
	"use strict";

	var ARRAY_SLICE = Array.prototype.slice;

	return Service.extend({
		"displayName" : "browser/ajax/service",

		"hub/ajax" : function ajax(settings) {
			// Request
			var request = $.ajax(merge.call({
				"headers": {
					"x-request-id": new Date().getTime()
				}
			}, settings));

			// Wrap and return
			return when(request, function () {
				return ARRAY_SLICE.call(arguments);
			});
		}
	});
});
/**
 * TroopJS browser/loom/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/config',[ "module", "troopjs-utils/merge" ], function LoomConfigModule(module, merge) {
	"use strict";

	return merge.call({
		"$warp" : "$warp",
		"$weft" : "$weft",
		"weave" : "data-weave",
		"unweave" : "data-unweave",
		"woven" : "data-woven"
	}, module.config());
});
/**
 * TroopJS utils/getargs
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/getargs',[],function GetArgsModule() {
	"use strict";

	var PUSH = Array.prototype.push;
	var SUBSTRING = String.prototype.substring;
	var RE_BOOLEAN = /^(?:false|true)$/i;
	var RE_BOOLEAN_TRUE = /^true$/i;
	var RE_DIGIT = /^\d+$/;

	return function getargs() {
		var me = this;
		var result = [];
		var length;
		var from;
		var to;
		var i;
		var c;
		var a;
		var q = false;

		// Iterate over string
		for (from = to = i = 0, length = me.length; i < length; i++) {
			// Get char
			c = me.charAt(i);

			switch(c) {
				case "\"" :
				/* falls through */
				case "'" :
					// If we are currently quoted...
					if (q === c) {
						// Stop quote
						q = false;

						// Store result (no need to convert, we know this is a string)
						PUSH.call(result, SUBSTRING.call(me, from, to));
					}
					// Otherwise
					else {
						// Start quote
						q = c;
					}

					// Update from/to
					from = to = i + 1;
					break;

				case "," :
					// Continue if we're quoted
					if (q) {
						to = i + 1;
						break;
					}

					// If we captured something...
					if (from !== to) {
						a = SUBSTRING.call(me, from, to);

						if (RE_BOOLEAN.test(a)) {
							a = RE_BOOLEAN_TRUE.test(a);
						}
						else if (RE_DIGIT.test(a)) {
							a = +a;
						}

						// Store result
						PUSH.call(result, a);
					}

					// Update from/to
					from = to = i + 1;
					break;

				case " " :
				/* falls through */
				case "\t" :
					// Continue if we're quoted
					if (q) {
						to = i + 1;
						break;
					}

					// Update from/to
					if (from === to) {
						from = to = i + 1;
					}
					break;

				default :
					// Update to
					to = i + 1;
			}
		}

		// If we captured something...
		if (from !== to) {
			a = SUBSTRING.call(me, from, to);

			if (RE_BOOLEAN.test(a)) {
				a = RE_BOOLEAN_TRUE.test(a);
			}
			else if (RE_DIGIT.test(a)) {
				a = +a;
			}

			// Store result
			PUSH.call(result, a);
		}

		return result;
	};
});
/**
 * TroopJS browser/loom/weave
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/weave',[ "./config", "require", "when", "jquery", "troopjs-utils/getargs", "poly/array" ], function WeaveModule(config, parentRequire, when, $, getargs) {
	"use strict";

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var WEAVE = "weave";
	var WOVEN = "woven";
	var $WARP = config["$warp"];
	var $WEFT = config["$weft"];
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var RE_SEPARATOR = /[\s,]+/;

	/**
	 * Weaves elements
	 * @returns {Promise} of weaving
	 */
	return function weave() {
		// Store start_args for later
		var start_args = arguments;

		// Map elements
		return when.all(ARRAY_MAP.call(this, function (element) {
			var $element = $(element);
			var $data = $element.data();
			var $warp = $data[$WARP] || ($data[$WARP] = []);
			var $weave = [];
			var weave_attr = $element.attr(ATTR_WEAVE) || "";
			var weave_args;
			var re = /[\s,]*(([\w_\-\/\.]+)(?:\(([^\)]+)\))?)/g;
			var matches;

			/**
			 * Updated attributes
			 * @param {object} widget Widget
			 * @private
			 */
			var update_attr = function (widget) {
				var woven = widget[$WEFT][WOVEN];

				$element.attr(ATTR_WOVEN, function (index, attr) {
					var result = [ woven ];

					if (attr !== UNDEFINED) {
						ARRAY_PUSH.apply(result, attr.split(RE_SEPARATOR));
					}

					return result.join(" ");
				});
			};

			// Make sure to remove ATTR_WEAVE (so we don't try processing this again)
			$element.removeAttr(ATTR_WEAVE);

			// Iterate weave_attr (while re matches)
			// matches[1] : widget name and arguments - "widget/name(1, 'string', false)"
			// matches[2] : widget name - "widget/name"
			// matches[3] : widget arguments - "1, 'string', false"
			while ((matches = re.exec(weave_attr)) !== NULL) {
				/*jshint loopfunc:true*/
				// Create weave_args
				weave_args = [ $element, matches[2] ];

				// Store matches[1] as WEAVE on weave_args
				weave_args[WEAVE] = matches[1];

				// If there were additional arguments
				if (matches[3] !== UNDEFINED) {
					// Parse matches[2] using getargs, map the values and append to weave_args
					ARRAY_PUSH.apply(weave_args, getargs.call(matches[3]).map(function (value) {
						// If value from $data if key exist
						return value in $data
							? $data[value]
							: value;
					}));
				}

				// Push on $weave
				ARRAY_PUSH.call($weave, weave_args);
			}

			// Return promise of mapped $weave
			return when.map($weave, function (widget_args) {
				// Create deferred
				var deferred = when.defer();
				var resolver = deferred.resolver;
				var promise = deferred.promise;

				// Copy WEAVE
				promise[WEAVE] = widget_args[WEAVE];

				// Add promise to $warp
				ARRAY_PUSH.call($warp, promise);

				// Add deferred update of attr
				when(promise, update_attr);

				// Require module, add error handler
				parentRequire([ widget_args[1] ], function (Widget) {
					var widget;

					try {
						// Create widget instance
						widget = Widget.apply(Widget, widget_args);

						// Add $WEFT to widget
						widget[$WEFT] = promise;

						// Add WOVEN to promise
						promise[WOVEN] = widget.toString();

						// Resolve with start yielding widget
						resolver.resolve(widget.start.apply(widget, start_args).yield(widget));
					}
					catch (e) {
						resolver.reject(e);
					}
				}, resolver.reject);

				// Return promise
				return promise;
			});
		}));
	};
});
/**
 * TroopJS browser/loom/unweave
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/unweave',[ "./config", "when", "jquery", "poly/array" ], function UnweaveModule(config, when, $) {
	"use strict";

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var WEAVE = "weave";
	var UNWEAVE = "unweave";
	var WOVEN = "woven";
	var LENGTH = "length";
	var $WARP = config["$warp"];
	var $WEFT = config["$weft"];
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var ATTR_UNWEAVE = config[UNWEAVE];
	var RE_SEPARATOR = /[\s,]+/;

	/**
	 * Unweaves elements
	 * @returns {Promise} of unweaving
	 */
	return function unweave() {
		// Store stop_args for later
		var stop_args = arguments;

		// Map elements
		return when.all(ARRAY_MAP.call(this, function (element) {
			var $element = $(element);
			var $data = $element.data();
			var $warp = $data[$WARP] || ($data[$WARP] = []);
			var $unweave = [];
			var unweave_attr = $element.attr(ATTR_UNWEAVE);
			var unweave_re = [];
			var re = /[\s,]*([\w_\-\/\.]+)(?:@(\d+))?/g;
			var matches;
			var $weft;
			var iMax;
			var i;
			var j;

			/**
			 * Updated attributes
			 * @param {object} widget Widget
			 * @private
			 */
			var update_attr = function (widget) {
				var $promise = widget[$WEFT];
				var woven = $promise[WOVEN];
				var weave = $promise[WEAVE];

				$element
					.attr(ATTR_WOVEN, function (index, attr) {
						var result = [];

						if (attr !== UNDEFINED) {
							ARRAY_PUSH.apply(result, attr.split(RE_SEPARATOR).filter(function (part) {
								return part !== woven;
							}));
						}

						return result[LENGTH] === 0
							? null
							: result.join(" ");
					})
					.attr(ATTR_WEAVE, function (index, attr) {
						var result = [ weave ];

						if (attr !== UNDEFINED) {
							ARRAY_PUSH.apply(result, attr.split(RE_SEPARATOR));
						}

						return result.join(" ");
					});
			};

			// Make sure to remove ATTR_UNWEAVE (so we don't try processing this again)
			$element.removeAttr(ATTR_UNWEAVE);

			// Check if we should remove all widgets
			if (unweave_attr === UNDEFINED) {
				// Copy from $warp to $unweave
				ARRAY_PUSH.apply($unweave, $warp);

				// Truncate $warp
				$warp[LENGTH] = 0;
			} else {
				// Iterate unweave_attr (while re matches)
				// matches[1] : widget name - "widget/name"
				// matches[2] : widget instance id - "123"
				while ((matches = re.exec(unweave_attr)) !== NULL) {
					ARRAY_PUSH.call(unweave_re, "^" + matches[1] + "@" + (matches[2] || "\\d+") + "$");
				}

				// Redefine unweave_re as a regexp
				unweave_re = new RegExp(unweave_re.join("|"));

				// Move matching promises from $warp to $unweave
				for (i = j = 0, iMax = $warp[LENGTH]; i < iMax; i++) {
					$weft = $warp[i];

					if (!unweave_re.test($weft[WOVEN])) {
						// Move to new index
						$warp[j++] = $weft;
					}
					else {
						// Push on $weave
						ARRAY_PUSH.call($unweave, $weft);
					}
				}

				// Truncate $warp
				$warp[LENGTH] = j;
			}

			// Return promise of mapped $unweave
			return when.map($unweave, function (widget) {
				// Store promise of stop yielding widget
				var promise = widget.stop.apply(widget, stop_args).yield(widget);

				// Add deferred update of attr
				when(promise, update_attr);

				// Return promise
				return promise;
			});
		}));
	};
});
/**
 * TroopJS jquery/destroy
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-jquery/destroy',[ "jquery" ], function DestroyModule($) {
	"use strict";

	var DESTROY = "destroy";

	$.event.special[DESTROY] = {
		"noBubble" : true,

		"trigger" : function () {
			return false;
		},

		"remove" : function onDestroyRemove(handleObj) {
			var me = this;

			if (handleObj) {
				handleObj.handler.call(me, $.Event({
					"type" : handleObj.type,
					"data" : handleObj.data,
					"namespace" : handleObj.namespace,
					"target" : me
				}));
			}
		}
	};
});

/**
 * TroopJS browser/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/component/widget',[ "troopjs-core/component/gadget", "jquery", "../loom/config", "../loom/weave", "../loom/unweave", "troopjs-jquery/destroy" ], function WidgetModule(Gadget, $, config, weave, unweave) {
	"use strict";

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var TYPEOF_FUNCTION = "function";
	var $ELEMENT = "$element";
	var $HANDLERS = "$handlers";
	var FEATURES = "features";
	var TYPE = "type";
	var VALUE = "value";
	var PROXY = "proxy";
	var GUID = "guid";
	var LENGTH = "length";
	var SELECTOR_WEAVE = "[" + config["weave"] + "]";
	var SELECTOR_UNWEAVE = "[" + config["unweave"] + "]";


	/**
	 * Creates a proxy that executes 'handler' in 'widget' scope
	 * @private
	 * @param {Object} widget target widget
	 * @param {Function} handler target handler
	 * @returns {function} proxied handler
	 */
	function eventProxy(widget, handler) {
		/**
		 * Creates a proxy of the outer method 'handler' that first adds 'topic' to the arguments passed
		 * @returns result of proxied hanlder invocation
		 */
		return function handlerProxy() {
			// Apply with shifted arguments to handler
			return handler.apply(widget, arguments);
		};
	}

	/**
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @private
	 * @param $fn jQuery method
	 * @returns {Function} proxied render
	 */
	function renderProxy($fn) {
		/**
		 * Renders contents into element
		 * @private
		 * @param {Function|String} contents Template/String to render
		 * @param {Object..} [data] If contents is a template - template data
		 * @returns {Object} me
		 */
		function render(contents, data) {
			/*jshint validthis:true*/
			var me = this;
			var args = ARRAY_SLICE.call(arguments, 1);

			// Call render with contents (or result of contents if it's a function)
			return weave.call($fn.call(me[$ELEMENT], typeof contents === TYPEOF_FUNCTION ? contents.apply(me, args) : contents).find(SELECTOR_WEAVE));
		}

		return render;
	}

	return Gadget.extend(function ($element, displayName) {
		var me = this;

		if ($element === UNDEFINED) {
			throw new Error("No $element provided");
		}

		me[$ELEMENT] = $element;
		me[$HANDLERS] = [];

		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}
	}, {
		"displayName" : "browser/component/widget",

		/**
		 * Signal handler for 'initialize'
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;
			var $element = me[$ELEMENT];
			var $handler;
			var $handlers = me[$HANDLERS];
			var special;
			var specials = me.constructor.specials.dom;
			var type;
			var features;
			var value;
			var proxy;
			var i;
			var iMax;

			// Iterate specials
			for (i = 0, iMax = specials ? specials[LENGTH] : 0; i < iMax; i++) {
				// Get special
				special = specials[i];

				// Create $handler
				$handler = $handlers[i] = {};

				// Set $handler properties
				$handler[TYPE] = type = special[TYPE];
				$handler[FEATURES] = features = special[FEATURES];
				$handler[VALUE] = value = special[VALUE];
				$handler[PROXY] = proxy = eventProxy(me, value);

				// Attach proxy
				$element.on(type, features, me, proxy);

				// Copy GUID from proxy to value (so you can use .off to remove it)
				value[GUID] = proxy[GUID];
			}
		},

		/**
		 * Signal handler for 'finalize'
		 */
		"sig/finalize" : function onFinalize() {
			var me = this;
			var $element = me[$ELEMENT];
			var $handler;
			var $handlers = me[$HANDLERS];
			var i;
			var iMax;

			// Iterate $handlers
			for (i = 0, iMax = $handlers[LENGTH]; i < iMax; i++) {
				// Get $handler
				$handler = $handlers[i];

				// Detach event handler
				$element.off($handler[TYPE], $handler[FEATURES], $handler[PROXY]);
			}
		},

		/**
		 * Signal handler for 'task'
		 * @param {Promise} task
		 */
		"sig/task" : function onTask(task) {
			this[$ELEMENT].trigger("task", [ task ]);
		},

		/**
		 * Weaves all children of $element
		 * @returns {Promise} from weave
		 */
		"weave" : function () {
			return weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
		},

		/**
		 * Unweaves all children of $element _and_ me
		 * @returns {Promise} from unweave
		 */
		"unweave" : function () {
			return unweave.apply(this[$ELEMENT].find(SELECTOR_UNWEAVE).addBack(), arguments);
		},

		/**
		 * Destroy DOM handler
		 */
		"dom/destroy" : function () {
			this.unweave();
		},

		/**
		 * Renders content and inserts it before $element
		 */
		"before" : renderProxy($.fn.before),

		/**
		 * Renders content and inserts it after $element
		 */
		"after" : renderProxy($.fn.after),

		/**
		 * Renders content and replaces $element contents
		 */
		"html" : renderProxy($.fn.html),

		/**
		 * Renders content and replaces $element contents
		 */
		"text" : renderProxy($.fn.text),

		/**
		 * Renders content and appends it to $element
		 */
		"append" : renderProxy($.fn.append),

		/**
		 * Renders content and prepends it to $element
		 */
		"prepend" : renderProxy($.fn.prepend)
	});
});

/**
 * TroopJS core/registry/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/registry/service',[ "../component/service", "poly/object", "poly/array" ], function RegistryServiceModule(Service) {
	"use strict";

	var SERVICES = "services";

	return Service.extend(function RegistryService() {
		var me = this;

		me[SERVICES] = {};

		me.add(me);
	},{
		"displayName" : "core/registry/service",

		"add" : function add(service) {
			this[SERVICES][service.toString()] = service;
		},

		"remove": function remove(service) {
			delete this[SERVICES][service.toString()];
		},

		"get" : function get(pattern) {
			var re = new RegExp(pattern);
			var services = this[SERVICES];

			return Object.keys(services)
				.filter(function filter(serviceName) {
					return re.test(serviceName);
				})
				.map(function map(serviceName) {
					return services[serviceName];
				});
		},

		"hub/registry/add" : function onAdd(service) {
			return this.add(service);
		},

		"hub/registry/remove" : function onRemove(service) {
			return this.remove(service);
		},

		"hub/registry/get" : function onGet(pattern) {
			return this.get(pattern);
		}
	});
});
/**
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/application/widget',[ "module", "../component/widget", "when", "troopjs-core/registry/service", "poly/array" ], function ApplicationWidgetModule(module, Widget, when, RegistryService) {
	"use strict";

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var REGISTRY = "registry";

	/**
	 * Forwards _signal to components
	 * @private
	 * @param {String} _signal Signal to forward
	 * @param {Array} _args Signal arguments
	 * @returns {Function}
	 */
	function forward(_signal, _args) {
		/*jshint validthis:true*/
		var me = this;
		var signal = me.signal;
		var args = [ _signal ];
		var components = me[REGISTRY].get();
		var index = 0;

		ARRAY_PUSH.apply(args, _args);

		var next = function () {
			var component;

			return (component = components[index++])
				? when(signal.apply(component, args), next)
				: when.resolve(_args);
		};

		return next();
	}

	return Widget.extend(function ApplicationWidget() {
		// Create registry
		var registry = this[REGISTRY] = RegistryService();

		// Slice and iterate arguments
		ARRAY_SLICE.call(arguments, 2).forEach(function (component) {
			// Register component
			registry.add(component);
		});
	}, {
		"displayName" : "browser/application/widget",

		"sig/initialize" : function onInitialize() {
			return forward.call(this, "initialize", arguments);
		},

		"sig/start" : function onStart() {
			var me = this;
			var weave = me.weave;
			var args = arguments;

			return forward.call(me, "start", args).then(function started() {
				return weave.apply(me, args);
			});
		},

		"sig/stop" : function onStop() {
			var me = this;
			var unweave = me.unweave;
			var args = arguments;

			return unweave.apply(me, args).then(function stopped() {
				return forward.call(me, "stop", args);
			});
		},

		"sig/finalize" : function onFinalize() {
			return forward.call(this, "finalize", arguments);
		}
	});
});
/**
 * TroopJS browser/route/uri
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Parts of code from parseUri 1.2.2 Copyright Steven Levithan <stevenlevithan.com>
 */
define('troopjs-browser/route/uri',[ "troopjs-core/component/factory" ], function URIModule(Factory) {
	"use strict";

	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var OBJECT_PROTO = Object.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var STRING_SPLIT = String.prototype.split;
	var TOSTRING = OBJECT_PROTO.toString;
	var TOSTRING_OBJECT = TOSTRING.call(OBJECT_PROTO);
	var TOSTRING_ARRAY = TOSTRING.call(ARRAY_PROTO);
	var TOSTRING_FUNCTION = TOSTRING.call(Function.prototype);
	var RE_URI = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?(?:([^?#]*)(?:\?([^#]*))?(?:#(.*))?)/;

	var PROTOCOL = "protocol";
	var AUTHORITY = "authority";
	var PATH = "path";
	var QUERY = "query";
	var ANCHOR = "anchor";

	var KEYS = [ "source",
		PROTOCOL,
		AUTHORITY,
		"userInfo",
		"user",
		"password",
		"host",
		"port",
		PATH,
		QUERY,
		ANCHOR ];

	function Query(arg) {
		/*jshint forin:false*/
		var result = {};
		var matches;
		var key = NULL;
		var value;
		var re = /(?:&|^)([^&=]*)=?([^&]*)/g;

		result.toString = Query.toString;

		if (TOSTRING.call(arg) === TOSTRING_OBJECT) {
			for (key in arg) {
				result[key] = arg[key];
			}
		} else {
			while ((matches = re.exec(arg)) !== NULL) {
				key = matches[1];

				if (key in result) {
					value = result[key];

					if (TOSTRING.call(value) === TOSTRING_ARRAY) {
						value[value.length] = matches[2];
					}
					else {
						result[key] = [ value, matches[2] ];
					}
				}
				else {
					result[key] = matches[2];
				}
			}
		}

		return result;
	}

	Query.toString = function QueryToString() {
		/*jshint forin:false*/
		var me = this;
		var key;
		var value;
		var values;
		var query = [];
		var i = 0;
		var j;

		for (key in me) {
			if (TOSTRING.call(me[key]) === TOSTRING_FUNCTION) {
				continue;
			}

			query[i++] = key;
		}

		query.sort();

		while (i--) {
			key = query[i];
			value = me[key];

			if (TOSTRING.call(value) === TOSTRING_ARRAY) {
				values = value.slice(0);

				values.sort();

				j = values.length;

				while (j--) {
					value = values[j];

					values[j] = value === ""
						? key
						: key + "=" + value;
				}

				query[i] = values.join("&");
			}
			else {
				query[i] = value === ""
					? key
					: key + "=" + value;
			}
		}

		return query.join("&");
	};

	// Extend on the instance of array rather than subclass it
	function Path(arg) {
		var result = [];
		
		result.toString = Path.toString;

		ARRAY_PUSH.apply(result, TOSTRING.call(arg) === TOSTRING_ARRAY
			? arg
			: STRING_SPLIT.call(arg, "/"));

		return result;
	}

	Path.toString = function PathToString() {
		return this.join("/");
	};

	var URI = Factory(function URI(str) {
		var me = this;
		var value;
		var matches;
		var i;

		if ((matches = RE_URI.exec(str)) !== NULL) {
			i = matches.length;

			while (i--) {
				value = matches[i];

				if (value) {
					me[KEYS[i]] = value;
				}
			}
		}

		if (QUERY in me) {
			me[QUERY] = Query(me[QUERY]);
		}

		if (PATH in me) {
			me[PATH] = Path(me[PATH]);
		}
	}, {
		"displayName" : "browser/route/uri",

		"toString" : function URIToString() {
			var me = this;
			var uri = [ PROTOCOL , "://", AUTHORITY, PATH, "?", QUERY, "#", ANCHOR ];
			var i;
			var key;

			if (!(PROTOCOL in me)) {
				uri[0] = uri[1] = "";
			}

			if (!(AUTHORITY in me)) {
				uri[2] = "";
			}

			if (!(PATH in me)) {
				uri[3] = "";
			}

			if (!(QUERY in me)) {
				uri[4] = uri[5] = "";
			}

			if (!(ANCHOR in me)) {
				uri[6] = uri[7] = "";
			}

			i = uri.length;

			while (i--) {
				key = uri[i];

				if (key in me) {
					uri[i] = me[key];
				}
			}

			return uri.join("");
		}
	});

	URI.Path = Path;
	URI.Query = Query;

	return URI;
});
/**
 * TroopJS jquery/hashchange
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Normalized hashchange event, ripped a _lot_ of code from
 * https://github.com/millermedeiros/Hasher
 */
define('troopjs-jquery/hashchange',[ "jquery" ], function HashchangeModule($) {
	"use strict";

	var INTERVAL = "interval";
	var HASHCHANGE = "hashchange";
	var ONHASHCHANGE = "on" + HASHCHANGE;
	var RE_HASH = /#(.*)$/;
	var RE_LOCAL = /\?/;

	// hack based on this: http://code.google.com/p/closure-compiler/issues/detail?id=47#c13
	var _isIE = /**@preserve@cc_on !@*/0;

	function getHash(window) {
		// parsed full URL instead of getting location.hash because Firefox
		// decode hash value (and all the other browsers don't)
		// also because of IE8 bug with hash query in local file
		var result = RE_HASH.exec(window.location.href);

		return result && result[1]
			? decodeURIComponent(result[1])
			: "";
	}

	function Frame(document) {
		var me = this;
		var element;

		me.element = element = document.createElement("iframe");
		element.src = "about:blank";
		element.style.display = "none";
	}

	Frame.prototype = {
		"getElement" : function () {
			return this.element;
		},

		"getHash" : function () {
			return this.element.contentWindow.frameHash;
		},

		"update" : function (hash) {
			/*jshint evil:true*/
			var me = this;
			var document = me.element.contentWindow.document;

			// Quick return if hash has not changed
			if (me.getHash() === hash) {
				return;
			}

			// update iframe content to force new history record.
			// based on Really Simple History, SWFAddress and YUI.history.
			document.open();
			document.write("<html><head><title>' + document.title + '</title><script type='text/javascript'>var frameHash='" + hash + "';</script></head><body>&nbsp;</body></html>");
			document.close();
		}
	};

	$.event.special[HASHCHANGE] = {
		"setup" : function onHashChangeSetup() {
			var window = this;

			// Quick return if we support onHashChange natively
			// FF3.6+, IE8+, Chrome 5+, Safari 5+
			if (ONHASHCHANGE in window) {
				return false;
			}

			// Make sure we're always a window
			if (!$.isWindow(window)) {
				throw new Error("Unable to bind 'hashchange' to a non-window object");
			}

			var $window = $(window);
			var hash = getHash(window);
			var location = window.location;

			$window.data(INTERVAL, window.setInterval(_isIE
				? (function () {
					var document = window.document;
					var _isLocal = location.protocol === "file:";

					var frame = new Frame(document);
					document.body.appendChild(frame.getElement());
					frame.update(hash);

					return function () {
						var oldHash = hash;
						var newHash;
						var windowHash = getHash(window);
						var frameHash = frame.getHash();

						// Detect changes made pressing browser history buttons.
						// Workaround since history.back() and history.forward() doesn't
						// update hash value on IE6/7 but updates content of the iframe.
						if (frameHash !== hash && frameHash !== windowHash) {
							// Fix IE8 while offline
							newHash = decodeURIComponent(frameHash);

							if (hash !== newHash) {
								hash = newHash;
								frame.update(hash);
								$window.trigger(HASHCHANGE, [ newHash, oldHash ]);
							}

							// Sync location.hash with frameHash
							location.hash = "#" + encodeURI(_isLocal
								? frameHash.replace(RE_LOCAL, "%3F")
								: frameHash);
						}
						// detect if hash changed (manually or using setHash)
						else if (windowHash !== hash) {
							// Fix IE8 while offline
							newHash = decodeURIComponent(windowHash);

							if (hash !== newHash) {
								hash = newHash;
								$window.trigger(HASHCHANGE, [ newHash, oldHash ]);
							}
						}
					};
				})()
				: function () {
					var oldHash = hash;
					var newHash;
					var windowHash = getHash(window);

					if (windowHash !== hash) {
						// Fix IE8 while offline
						newHash = decodeURIComponent(windowHash);

						if (hash !== newHash) {
							hash = newHash;
							$window.trigger(HASHCHANGE, [ newHash, oldHash ]);
						}
					}
				}, 25));
		},

		"teardown" : function onHashChangeTeardown() {
			var window = this;

			// Quick return if we support onHashChange natively
			if (ONHASHCHANGE in window) {
				return false;
			}

			window.clearInterval($.data(window, INTERVAL));
		}
	};
});

/**
 * TroopJS browser/route/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/route/widget',[ "../component/widget", "./uri", "troopjs-jquery/hashchange" ], function RouteWidgetModule(Widget, URI) {
	"use strict";
	var $ELEMENT = "$element";
	var HASHCHANGE = "hashchange";
	var ROUTE = "route";
	var RE = /^#/;

	function onHashChange($event) {
		var me = $event.data;

		// Create URI
		var uri = URI($event.target.location.hash.replace(RE, ""));

		// Convert to string
		var route = uri.toString();

		// Did anything change?
		if (route !== me[ROUTE]) {
			// Store new value
			me[ROUTE] = route;

			// Publish route
			me.publish(me.displayName, uri, $event);
		}
	}

	return Widget.extend({
		"displayName" :"browser/route/widget",

		"sig/initialize" : function initialize() {
			var me = this;

			me[$ELEMENT].on(HASHCHANGE, me, onHashChange);
		},

		"sig/start" : function start() {
			this[$ELEMENT].trigger(HASHCHANGE);
		},

		"sig/finalize" : function finalize() {
			this[$ELEMENT].off(HASHCHANGE, onHashChange);
		}
	});
});
/**
 * TroopJS data/store/component module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-data/store/component',[ "troopjs-core/component/gadget", "when", "when/apply", "poly/array" ], function StoreModule(Gadget, when, apply) {
	"use strict";

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARRAY = "[object Array]";
	var TOSTRING_OBJECT = "[object Object]";
	var TOSTRING_FUNCTION = "[object Function]";
	var TOSTRING_STRING = "[object String]";
	var ARRAY_SLICE = Array.prototype.slice;
	var LENGTH = "length";
	var ADAPTERS = "adapters";
	var STORAGE = "storage";
	var BEFORE_GET = "beforeGet";
	var AFTER_PUT = "afterPut";
	var CLEAR = "clear";
	var LOCKS = "locks";

	/**
	 * Applies method to this (if it exists)
	 * @param {string} method Method name
	 * @returns {boolean|*}
	 * @private
	 */
	function applyMethod(method) {
		/*jshint validthis:true*/
		var me = this;

		return method in me && me[method].apply(me, ARRAY_SLICE.call(arguments, 1));
	}

	/**
	 * Puts value
	 * @param {string|null} key Key - can be dot separated for sub keys
	 * @param {*} value Value
	 * @returns {Promise} Promise of put
	 * @private
	 */
	function put(key, value) {
		/*jshint validthis:true*/
		var me = this;
		var node = me[STORAGE];
		var parts = key
			? key.split(".")
			: [];
		var part;
		var last = parts.pop();

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = node[part] = {};
			}
		}

		// Evaluate value if needed
		if (OBJECT_TOSTRING.call(value) === TOSTRING_FUNCTION) {
			value = value.call(me, {
				"get" : function () {
					return get.apply(me, arguments);
				},
				"has" : function () {
					return has.apply(me, arguments);
				}
			}, key);
		}

		return last !== UNDEFINED
			// First store the promise, then override with the true value once resolved
			? when(value, function (result) {
				node[last] = result;

				return result;
			})
			// No key provided, just return a promise of the value
			: when(value);
	}

	/**
	 * Gets value
	 * @param {string} key Key - can be dot separated for sub keys
	 * @returns {*} Value
	 * @private
	 */
	function get(key) {
		/*jshint validthis:true*/
		var node = this[STORAGE];
		var parts = key.split(".");
		var part;

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = UNDEFINED;
			}
		}

		return node;
	}

	/**
	 * Check is key exists
	 * @param key {string} key Key - can be dot separated for sub keys
	 * @returns {boolean}
	 * @private
	 */
	function has(key) {
		/*jshint validthis:true*/
		var node = this[STORAGE];
		var parts = key.split(".");
		var part;
		var last = parts.pop();

		while (node && (part = parts.shift())) {
			switch (OBJECT_TOSTRING.call(node)) {
				case TOSTRING_ARRAY :
				/* falls through */

				case TOSTRING_OBJECT :
					if (part in node) {
						node = node[part];
						break;
					}
				/* falls through */

				default :
					node = UNDEFINED;
			}
		}

		return node !== UNDEFINED && last in node;
	}

	return Gadget.extend(function StoreComponent(adapter) {
		if (arguments[LENGTH] === 0) {
			throw new Error("No adapter(s) provided");
		}

		var me = this;

		me[ADAPTERS] = ARRAY_SLICE.call(arguments);
		me[STORAGE] = {};
		me[LOCKS] = {};
	}, {
		"displayName" : "data/store/component",

		/**
		 * Waits for store to be "locked"
		 * @param {string} key Key
		 * @param {function} [onFulfilled] onFulfilled callback
		 * @param {function} [onRejected] onRejected callback
		 * @param {function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of ready
		 */
		"lock" : function (key, onFulfilled, onRejected, onProgress) {
			var locks = this[LOCKS];
			var result;

			if (OBJECT_TOSTRING.call(key) !== TOSTRING_STRING) {
				throw new Error("key has to be of type string");
			}

			result = locks[key] = when(locks[key], onFulfilled, onRejected, onProgress);

			return result;
		},

		/**
		 * Gets state value
		 * @param {string..} key Key - can be dot separated for sub keys
		 * @param {function} [onFulfilled] onFulfilled callback
		 * @param {function} [onRejected] onRejected callback
		 * @param {function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of value
		 */
		"get" : function (key, onFulfilled, onRejected, onProgress) {
			/*jshint curly:false*/
			var me = this;
			var keys = ARRAY_SLICE.call(arguments);
			var i;
			var iMax;

			// Step until we hit the end or keys[i] is not a string
			for (i = 0, iMax = keys[LENGTH]; i < iMax && OBJECT_TOSTRING.call(keys[i]) === TOSTRING_STRING; i++);

			// Update callbacks
			onFulfilled = keys[i];
			onRejected = keys[i+1];
			onProgress = keys[i+2];

			// Set the new length of keys
			keys[LENGTH] = i;

			return when
				.map(keys, function (key) {
					return when
						// Map adapters and BEFORE_GET on each adapter
						.map(me[ADAPTERS], function (adapter) {
							return when(applyMethod.call(adapter, BEFORE_GET, me, key));
						})
						// Get value from STORAGE
						.then(function () {
							return get.call(me, key);
						});
				})
				// Add callbacks
				.then(onFulfilled && apply(onFulfilled), onRejected, onProgress);
		},

		/**
		 * Puts state value
		 * @param {string} key Key - can be dot separated for sub keys
		 * @param {*} value Value
		 * @param {function} [onFulfilled] onFulfilled callback
		 * @param {function} [onRejected] onRejected callback
		 * @param {function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of value
		 */
		"put" : function (key, value, onFulfilled, onRejected, onProgress) {
			var me = this;

			return when(put.call(me, key, value), function (result) {
				return when
					// Map adapters and AFTER_PUT on each adapter
					.map(me[ADAPTERS], function (adapter) {
						return when(applyMethod.call(adapter, AFTER_PUT, me, key, result));
					})
					.yield(result);
			})
				// Add callbacks
				.then(onFulfilled, onRejected, onProgress);
		},

		/**
		 * Puts state value if key is UNDEFINED
		 * @param {string} key Key - can be dot separated for sub keys
		 * @param {*} value Value
		 * @param {function} [onFulfilled] onFulfilled callback
		 * @param {function} [onRejected] onRejected callback
		 * @param {function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of value
		 */
		"putIfNotHas" : function (key, value, onFulfilled, onRejected, onProgress) {
			var me = this;

			return !me.has(key)
				? me.put(key, value, onFulfilled, onRejected, onProgress)
				: when(UNDEFINED, onFulfilled, onRejected, onProgress);
		},

		/**
		 * Checks if key exists
		 * @param {string} key Key - can be dot separated for sub keys
		 * @returns {boolean} True if key exists, otherwise false
		 */
		"has" : function (key) {
			return has.call(this, key);
		},

		/**
		 * Clears all adapters
		 * @param {function} [onFulfilled] onFulfilled callback
		 * @param {function} [onRejected] onRejected callback
		 * @param {function} [onProgress] onProgress callback
		 * @returns {Promise} Promise of clear
		 */
		"clear" : function (onFulfilled, onRejected, onProgress) {
			var me = this;

			return when
				.map(me[ADAPTERS], function (adapter) {
					return when(applyMethod.call(adapter, CLEAR, me));
				})
				// Add callbacks
				.then(onFulfilled && apply(onFulfilled), onRejected, onProgress);
		}
	});
});
/**
 * TroopJS data/cache/component
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-data/cache/component',[ "troopjs-core/component/base" ], function CacheModule(Component) {
	"use strict";

	var UNDEFINED;
	var FALSE = false;
	var NULL = null;
	var OBJECT = Object;
	var ARRAY = Array;

	var SECOND = 1000;
	var INTERVAL = "interval";
	var GENERATIONS = "generations";
	var AGE = "age";
	var HEAD = "head";
	var NEXT = "next";
	var EXPIRES = "expires";
	var CONSTRUCTOR = "constructor";
	var LENGTH = "length";

	var _ID = "id";
	var _MAXAGE = "maxAge";
	var _EXPIRES = "expires";
	var _INDEXED = "indexed";
	var _COLLAPSED = "collapsed";

	/**
	 * Internal method to put a node in the cache
	 * @param node Node
	 * @param _constructor Constructor of value
	 * @param now Current time (seconds)
	 * @returns Cached node
	 */
	function _put(node, _constructor, now) {
		/*jshint validthis:true, forin:false, curly:false, -W086*/
		var me = this;
		var result;
		var id;
		var i;
		var iMax;
		var expires;
		var expired;
		var head;
		var current;
		var next;
		var generation;
		var generations = me[GENERATIONS];
		var property;
		var value;

		// First add node to cache (or get the already cached instance)
		cache : {
			// Can't cache if there is no _ID
			if (!(_ID in node)) {
				result = node;          // Reuse ref to node (avoids object creation)
				break cache;
			}

			// Get _ID
			id = node[_ID];

			// In cache, get it!
			if (id in me) {
				result = me[id];
				break cache;
			}

			// Not in cache, add it!
			result = me[id] = node;   // Reuse ref to node (avoids object creation)

			// Update _INDEXED
			result[_INDEXED] = now;
		}

		// We have to deep traverse the graph before we do any expiration (as more data for this object can be available)

		// Check that this is an ARRAY
		if (_constructor === ARRAY) {
			// Index all values
			for (i = 0, iMax = node[LENGTH]; i < iMax; i++) {

				// Keep value
				value = node[i];

				// Get _constructor of value (safely, falling back to UNDEFINED)
				_constructor = value === NULL || value === UNDEFINED
					? UNDEFINED
					: value[CONSTRUCTOR];

				// Do magic comparison to see if we recursively put this in the cache, or plain put
				result[i] = (_constructor === OBJECT || _constructor === ARRAY && value[LENGTH] !== 0)
					? _put.call(me, value, _constructor, now)
					: value;
			}
		}

		// Check that this is an OBJECT
		else if (_constructor === OBJECT) {
			// Index all properties
			for (property in node) {
				// Except the _ID property
				// or the _COLLAPSED property, if it's false
				if (property === _ID
					|| (property === _COLLAPSED && result[_COLLAPSED] === FALSE)) {
					continue;
				}

				// Keep value
				value = node[property];

				// Get _constructor of value (safely, falling back to UNDEFINED)
				_constructor = value === NULL || value === UNDEFINED
					? UNDEFINED
					: value[CONSTRUCTOR];

				// Do magic comparison to see if we recursively put this in the cache, or plain put
				result[property] = (_constructor === OBJECT || _constructor === ARRAY && value[LENGTH] !== 0)
					? _put.call(me, value, _constructor, now)
					: value;
			}
		}

		// Check if we need to move result between generations
		move : {
			// Break fast if id is NULL
			if (id === NULL) {
				break move;
			}

			// Calculate expiration and floor
			// '>>>' means convert anything other than posiitive integer into 0
			expires = 0 | now + (result[_MAXAGE] >>> 0);

			remove : {
				// Fail fast if there is no old expiration
				if (!(_EXPIRES in result)) {
					break remove;
				}

				// Get current expiration
				expired = result[_EXPIRES];

				// If expiration has not changed, we can continue
				if (expired === expires) {
					break move;
				}

				// Remove ref from generation (if that generation exists)
				if (expired in generations) {
					delete generations[expired][id];
				}
			}

			add : {
				// Update expiration time
				result[_EXPIRES] = expires;

				// Existing generation
				if (expires in generations) {
					// Add result to generation
					generations[expires][id] = result;
					break add;
				}

				// Create generation with expiration set
				(generation = generations[expires] = {})[EXPIRES] = expires;

				// Add result to generation
				generation[id] = result;

				// Short circuit if there is no head
				if (generations[HEAD] === UNDEFINED) {
					generations[HEAD] = generation;
					break add;
				}

				// Step through list as long as there is a next, and expiration is "older" than the next expiration
				for (current = head = generations[HEAD]; (next = current[NEXT]) !== UNDEFINED && next[EXPIRES] < expires; current = next);

				// Check if we're still on the head and if we're younger
				if (current === head && current[EXPIRES] > expires) {
					// Next generation is the current one (head)
					generation[NEXT] = current;

					// Reset head to new generation
					generations[HEAD] = generation;
					break add;
				}

				// Insert new generation between current and current.next
				generation[NEXT] = current[NEXT];
				current[NEXT] = generation;
			}
		}

		return result;
	}

	return Component.extend(function CacheComponent(age) {
		var me = this;

		me[AGE] = age || (60 * SECOND);
		me[GENERATIONS] = {};
	}, {
		"displayName" : "data/cache/component",

		"sig/start" : function start() {
			var me = this;
			var generations = me[GENERATIONS];

			// Create new sweep interval
			me[INTERVAL] = INTERVAL in me
				? me[INTERVAL]
				: setInterval(function sweep() {
				/*jshint forin:false*/
				// Calculate expiration of this generation
				var expires = 0 | new Date().getTime() / SECOND;

				var property;
				var current;

				// Get head
				current = generations[HEAD];

				// Fail fast if there's no head
				if (current === UNDEFINED) {
					return;
				}

				do {
					// Exit if this generation is to young
					if (current[EXPIRES] > expires) {
						break;
					}

					// Iterate all properties on current
					for (property in current) {
						// And is it not a reserved property
						if (property === EXPIRES || property === NEXT || property === GENERATIONS) {
							continue;
						}

						// Delete from me (cache)
						delete me[property];
					}

					// Delete generation
					delete generations[current[EXPIRES]];
				}
				// While there's a next
				while ((current = current[NEXT]));

				// Reset head
				generations[HEAD] = current;
			}, me[AGE]);
		},

		"sig/stop" : function stop() {
			var me = this;

			// Only do this if we have an interval
			if (INTERVAL in me) {
				// Clear interval
				clearInterval(me[INTERVAL]);

				// Reset interval
				delete me[INTERVAL];
			}
		},

		"sig/finalize" : function finalize() {
			/*jshint forin:false*/
			var me = this;
			var property;

			// Iterate all properties on me
			for (property in me) {
				// Don't delete non-objects or objects that don't ducktype cachable
				if (me[property][CONSTRUCTOR] !== OBJECT || !(_ID in me[property])) {
					continue;
				}

				// Delete from me (cache)
				delete me[property];
			}
		},

		/**
		 * Puts a node into the cache
		 * @param node Node to add (object || array)
		 * @returns Cached node (if it existed in the cache before), otherwise the node sent in
		 */
		"put" : function put(node) {
			var me = this;

			// Get _constructor of node (safely, falling back to UNDEFINED)
			var _constructor = node === NULL || node === UNDEFINED
				? UNDEFINED
				: node[CONSTRUCTOR];

			// Do magic comparison to see if we should cache this object
			return _constructor === OBJECT || _constructor === ARRAY && node[LENGTH] !== 0
				? _put.call(me, node, _constructor, 0 | new Date().getTime() / SECOND)
				: node;
		}
	});
});

/**
 * TroopJS data/query/component
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-data/query/component',[ "troopjs-core/component/base" ], function QueryModule(Component) {
	"use strict";

	var UNDEFINED;
	var TRUE = true;
	var FALSE = false;
	var OBJECT = Object;
	var ARRAY = Array;
	var CONSTRUCTOR = "constructor";
	var LENGTH = "length";

	var OP = "op";
	var OP_ID = "!";
	var OP_PROPERTY = ".";
	var OP_PATH = ",";
	var OP_QUERY = "|";
	var TEXT = "text";
	var RAW = "raw";
	var RESOLVED = "resolved";
	var _ID = "id";
	var _EXPIRES = "expires";
	var _COLLAPSED = "collapsed";
	var _AST = "_ast";
	var _QUERY = "_query";

	var RE_TEXT = /("|')(.*?)\1/;
	var TO_RAW = "$2";
	var RE_RAW = /!(.*[!,|.\s]+.*)/;
	var TO_TEXT = "!'$1'";

	return Component.extend(function QueryComponent(query) {
		var me = this;

		if (query !== UNDEFINED) {
			me[_QUERY] = query;
		}
	}, {
		"displayName" : "data/query/component",

		"parse" : function parse(query) {
			var me = this;

			// Reset _AST
			delete me[_AST];

			// Set _QUERY
			query = me[_QUERY] = (query || me[_QUERY] || "");

			var i;          // Index
			var l;          // Length
			var c;          // Current character
			var m;          // Current mark
			var q;          // Current quote
			var o;          // Current operation
			var ast = [];   // _AST

			// Step through the query
			for (i = m = 0, l = query[LENGTH]; i < l; i++) {
				c = query.charAt(i);

				switch (c) {
					case "\"" : // Double quote
					/* falls through */
					case "'" :  // Single quote
						// Set / unset quote char
						q = q === c
							? UNDEFINED
							: c;
						break;

					case OP_ID :
						// Break fast if we're quoted
						if (q !== UNDEFINED) {
							break;
						}

						// Init new op
						o = {};
						o[OP] = c;
						break;

					case OP_PROPERTY :
					/* falls through */
					case OP_PATH :
						// Break fast if we're quoted
						if (q !== UNDEFINED) {
							break;
						}

						// If there's an active op, store TEXT and push on _AST
						if (o !== UNDEFINED) {
							o[RAW] = (o[TEXT] = query.substring(m, i)).replace(RE_TEXT, TO_RAW);
							ast.push(o);
						}

						// Init new op
						o = {};
						o[OP] = c;

						// Set mark
						m = i + 1;
						break;

					case OP_QUERY :
					/* falls through */
					case " " :  // Space
					/* falls through */
					case "\t" : // Horizontal tab
					/* falls through */
					case "\r" : // Carriage return
					/* falls through */
					case "\n" : // Newline
						// Break fast if we're quoted
						if (q !== UNDEFINED) {
							break;
						}

						// If there's an active op, store TEXT and push on _AST
						if (o !== UNDEFINED) {
							o[RAW] = (o[TEXT] = query.substring(m, i)).replace(RE_TEXT, TO_RAW);
							ast.push(o);
						}

						// Reset op
						o = UNDEFINED;

						// Set mark
						m = i + 1;
						break;
				}
			}

			// If there's an active op, store TEXT and push on _AST
			if (o !== UNDEFINED) {
				o[RAW] = (o[TEXT] = query.substring(m, l)).replace(RE_TEXT, TO_RAW);
				ast.push(o);
			}

			// Set _AST
			me[_AST] = ast;

			return me;
		},

		"reduce" : function reduce(cache) {
			var me = this;
			var now = 0 | new Date().getTime() / 1000;

			// If we're not parsed - parse
			if (!(_AST in me)) {
				me.parse();
			}

			var ast = me[_AST]; // _AST
			var result = [];    // Result
			var i;              // Index
			var j;
			var c;
			var l;              // Length
			var o;              // Current operation
			var x;              // Current raw
			var r;              // Current root
			var n;              // Current node
			var k = FALSE;      // Keep flag

			// First step is to resolve what we can from the _AST
			for (i = 0, l = ast[LENGTH]; i < l; i++) {
				o = ast[i];

				switch (o[OP]) {
					case OP_ID :
						// Set root
						r = o;

						// Get e from o
						x = o[RAW];

						// Do we have this item in cache
						if (x in cache) {
							// Set current node
							n = cache[x];
							// Set RESOLVED if we're not collapsed or expired
							o[RESOLVED] = n[_COLLAPSED] !== TRUE && !(_EXPIRES in n) || n[_EXPIRES] > now;
						}
						else {
							// Reset current root and node
							n = UNDEFINED;
							// Reset RESOLVED
							o[RESOLVED] = FALSE;
						}
						break;

					case OP_PROPERTY :
						// Get e from o
						x = o[RAW];

						// Do we have a node and this item in the node
						if (n && x in n) {
							// Set current node
							n = n[x];

							// Get constructor
							c = n[CONSTRUCTOR];

							// If the constructor is an array
							if (c === ARRAY) {
								// Set naive resolved
								o[RESOLVED] = TRUE;

								// Iterate backwards over n
								for (j = n[LENGTH]; j-- > 0;) {
									// Get item
									c = n[j];

									// If the constructor is not an object
									// or the object does not duck-type _ID
									// or the object is not collapsed
									// and the object does not duck-type _EXPIRES
									// or the objects is not expired
									if (c[CONSTRUCTOR] !== OBJECT
										|| !(_ID in c)
										|| c[_COLLAPSED] !== TRUE
										&& !(_EXPIRES in c)
										|| c[_EXPIRES] > now) {
										continue;
									}

									// Change RESOLVED
									o[RESOLVED] = FALSE;
									break;
								}
							}
							// If the constructor is _not_ an object or n does not duck-type _ID
							else if (c !== OBJECT || !(_ID in n)) {
								o[RESOLVED] = TRUE;
							}
							// We know c _is_ and object and n _does_ duck-type _ID
							else {
								// Change OP to OP_ID
								o[OP] = OP_ID;
								// Update RAW to _ID and TEXT to escaped version of RAW
								o[TEXT] = (o[RAW] = n[_ID]).replace(RE_RAW, TO_TEXT);
								// Set RESOLVED if we're not collapsed or expired
								o[RESOLVED] = n[_COLLAPSED] !== TRUE && !(_EXPIRES in n) || n[_EXPIRES] > now;
							}
						}
						else {
							// Reset current node and RESOLVED
							n = UNDEFINED;
							o[RESOLVED] = FALSE;
						}
						break;

					case OP_PATH :
						// Get e from r
						x = r[RAW];

						// Set current node
						n = cache[x];

						// Change OP to OP_ID
						o[OP] = OP_ID;

						// Copy properties from r
						o[TEXT] = r[TEXT];
						o[RAW] = x;
						o[RESOLVED] = r[RESOLVED];
						break;
				}
			}

			// After that we want to reduce 'dead' operations from the _AST
			while (l-- > 0) {
				o = ast[l];

				switch(o[OP]) {
					case OP_ID :
						// If the keep flag is set, or the op is not RESOLVED
						if (k || o[RESOLVED] !== TRUE) {
							result.unshift(o);
						}

						// Reset keep flag
						k = FALSE;
						break;

					case OP_PROPERTY :
						result.unshift(o);

						// Set keep flag
						k = TRUE;
						break;
				}
			}

			// Update _AST
			me[_AST] = result;

			return me;
		},

		"ast" : function ast() {
			var me = this;

			// If we're not parsed - parse
			if (!(_AST in me)) {
				me.parse();
			}

			return me[_AST];
		},

		"rewrite" : function rewrite() {
			var me = this;

			// If we're not parsed - parse
			if (!(_AST in me)) {
				me.parse();
			}

			var ast = me[_AST]; // AST
			var result = "";    // Result
			var l;              // Current length
			var i;              // Current index
			var o;              // Current operation

			// Step through AST
			for (i = 0, l = ast[LENGTH]; i < l; i++) {
				o = ast[i];

				switch(o[OP]) {
					case OP_ID :
						// If this is the first OP_ID, there's no need to add OP_QUERY
						result += i === 0
							? o[TEXT]
							: OP_QUERY + o[TEXT];
						break;

					case OP_PROPERTY :
						result += OP_PROPERTY + o[TEXT];
						break;
				}
			}

			return result;
		}
	});
});
/**
 * TroopJS data/query/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-data/query/service',[ "module", "troopjs-core/component/service", "./component", "troopjs-utils/merge", "when", "when/apply" ], function QueryServiceModule(module, Service, Query, merge, when, apply) {
	"use strict";

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_CONCAT = ARRAY_PROTO.concat;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var LENGTH = "length";
	var BATCHES = "batches";
	var INTERVAL = "interval";
	var CACHE = "cache";
	var QUERIES = "queries";
	var RESOLVED = "resolved";
	var CONFIGURATION = "configuration";
	var RAW = "raw";
	var ID = "id";
	var Q = "q";
	var MODULE_CONFIG = module.config();

	return Service.extend(function QueryService(cache) {
		var me = this;

		if (cache === UNDEFINED) {
			throw new Error("No cache provided");
		}

		me[BATCHES] = [];
		me[CACHE] = cache;

		me.configure(MODULE_CONFIG);
	}, {
		"displayName" : "data/query/service",

		"sig/start" : function start() {
			var me = this;
			var cache = me[CACHE];

			// Set interval (if we don't have one)
			me[INTERVAL] = INTERVAL in me
				? me[INTERVAL]
				: setInterval(function scan() {
				var batches = me[BATCHES];

				// Return fast if there is nothing to do
				if (batches[LENGTH] === 0) {
					return;
				}

				// Reset batches
				me[BATCHES] = [];

				function request() {
					var q = [];
					var i;

					// Iterate batches
					for (i = batches[LENGTH]; i--;) {
						// Add batch[Q] to q
						ARRAY_PUSH.apply(q, batches[i][Q]);
					}

					// Publish ajax
					return me.publish("ajax", merge.call({
						"data": {
							"q": q.join("|")
						}
					}, me[CONFIGURATION]));
				}

				function done(data) {
					var batch;
					var queries;
					var id;
					var i;
					var j;

					// Add all new data to cache
					cache.put(data);

					// Iterate batches
					for (i = batches[LENGTH]; i--;) {
						batch = batches[i];
						queries = batch[QUERIES];
						id = batch[ID];

						// Iterate queries
						for (j = queries[LENGTH]; j--;) {
							// If we have a corresponding ID, fetch from cache
							if (j in id) {
								queries[j] = cache[id[j]];
							}
						}

						// Resolve batch
						batch.resolve(queries);
					}
				}

				function fail() {
					var batch;
					var i;

					// Iterate batches
					for (i = batches[LENGTH]; i--;) {
						batch = batches[i];

						// Reject (with original queries as argument)
						batch.reject(batch[QUERIES]);
					}
				}

				// Request and handle response
				request().then(apply(done), fail);
			}, 200);
		},

		"sig/stop" : function stop() {
			var me = this;

			// Only do this if we have an interval
			if (INTERVAL in me) {
				// Clear interval
				clearInterval(me[INTERVAL]);

				// Reset interval
				delete me[INTERVAL];
			}
		},

		"hub/query" : function hubQuery(/* query, query, query, .., */) {
			var me = this;
			var batches = me[BATCHES];
			var cache = me[CACHE];
			var q = [];
			var id = [];
			var ast;
			var i;
			var j;
			var iMax;
			var queries;
			var query;

			// Create deferred batch
			var deferred = when.defer();
			var resolver = deferred.resolver;

			try {
				// Slice and flatten queries
				queries = ARRAY_CONCAT.apply(ARRAY_PROTO, ARRAY_SLICE.call(arguments));

				// Iterate queries
				for (i = 0, iMax = queries[LENGTH]; i < iMax; i++) {
					// Init Query
					query = Query(queries[i]);

					// Get AST
					ast = query.ast();

					// If we have an ID
					if (ast[LENGTH] > 0) {
						// Store raw ID
						id[i] = ast[0][RAW];
					}

					// Get reduced AST
					ast = query.reduce(cache).ast();

					// Step backwards through AST
					for (j = ast[LENGTH]; j-- > 0;) {
						// If this op is not resolved
						if (!ast[j][RESOLVED]) {
							// Add rewritten (and reduced) query to q
							ARRAY_PUSH.call(q, query.rewrite());
							break;
						}
					}
				}

				// If all queries were fully reduced, we can quick resolve
				if (q[LENGTH] === 0) {
					// Iterate queries
					for (i = 0; i < iMax; i++) {
						// If we have a corresponding ID, fetch from cache
						if (i in id) {
							queries[i] = cache[id[i]];
						}
					}

					// Resolve batch resolver
					resolver.resolve(queries);
				}
				else {
					// Store properties on batch
					resolver[QUERIES] = queries;
					resolver[ID] = id;
					resolver[Q] = q;

					// Add batch to batches
					batches.push(resolver);
				}
			}
			catch (e) {
				resolver.reject(e);
			}

			// Return promise
			return deferred.promise;
		}
	});
});

/**
 * TroopJS data/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-data/component/widget',[ "troopjs-browser/component/widget" ], function WidgetModule(Widget) {
	"use strict";

	var ARRAY_PUSH = Array.prototype.push;

	return Widget.extend({
		"displayName" : "data/component/widget",

		/**
		 * Issues publish on query topic
		 * @returns {Promise} of query result(s)
		 */
		"query" : function query() {
			var me = this;
			var args = [ "query" ];

			ARRAY_PUSH.apply(args, arguments);

			return me.publish.apply(me, args);
		}
	});
});

/**
 * TroopJS requirejs/template
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Parts of code from require-cs 0.4.0+ Copyright (c) 2010-2011, The Dojo Foundation
 */
define('troopjs-requirejs/template',[],function TemplateModule() {
	"use strict";

	/*jshint rhino:true, node:true, wsh:true*/
	var FACTORIES = {
		"node" : function () {
			// Using special require.nodeRequire, something added by r.js.
			var fs = require.nodeRequire("fs");

			return function fetchText(path, callback) {
				var file = fs.readFileSync(path, "utf8");
				//Remove BOM (Byte Mark Order) from utf8 files if it is there.
				if (file.indexOf("\uFEFF") === 0) {
					file = file.substring(1);
				}
				callback(file);
			};
		},

		"browser" : function () {
			/*jshint nonew:false, loopfunc:true*/
			// Would love to dump the ActiveX crap in here. Need IE 6 to die first.
			var progIds = [ "Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"];
			var progId;
			var XHR;
			var i;

			if (typeof XMLHttpRequest !== "undefined") {
				XHR = XMLHttpRequest;
			}
			else {
				for (i = 0; i < 3; i++) {
					progId = progIds[i];

					try {
						new ActiveXObject(progId);
						XHR = function(){
							return new ActiveXObject(progId);
						};
						break;
					}
					catch (e) {
					}
				}

				if (!XHR){
					throw new Error("XHR: XMLHttpRequest not available");
				}
			}

			return function fetchText(url, callback) {
				var xhr = new XHR();
				xhr.open("GET", url, true);
				xhr.onreadystatechange = function () {
					// Do not explicitly handle errors, those should be
					// visible via console output in the browser.
					if (xhr.readyState === 4) {
						callback(xhr.responseText);
					}
				};
				xhr.send(null);
			};
		},

		"rhino" : function () {
			var encoding = "utf-8";
			var lineSeparator = java.lang.System.getProperty("line.separator");

			// Why Java, why is this so awkward?
			return function fetchText(path, callback) {
				var file = new java.io.File(path);
				var input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding));
				var stringBuffer = new java.lang.StringBuffer();
				var line;
				var content = "";

				try {
					line = input.readLine();

					// Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
					// http://www.unicode.org/faq/utf_bom.html

					// Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
					// http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
					if (line && line.length() && line.charAt(0) === 0xfeff) {
						// Eat the BOM, since we've already found the encoding on this file,
						// and we plan to concatenating this buffer with others; the BOM should
						// only appear at the top of a file.
						line = line.substring(1);
					}

					stringBuffer.append(line);

					while ((line = input.readLine()) !== null) {
						stringBuffer.append(lineSeparator);
						stringBuffer.append(line);
					}
					// Make sure we return a JavaScript string and not a Java string.
					content = String(stringBuffer.toString()); // String
				} finally {
					input.close();
				}

				callback(content);
			};
		},

		"borked" : function () {
			return function fetchText() {
				throw new Error("Environment unsupported.");
			};
		}
	};

	var RE_SANITIZE = /^[\n\t\r]+|[\n\t\r]+$/g;
	var RE_BLOCK = /<%(=)?([\S\s]*?)%>/g;
	var RE_TOKENS = /<%(\d+)%>/gm;
	var RE_REPLACE = /(["\n\t\r])/gm;
	var RE_CLEAN = /o \+= "";| \+ ""/gm;
	var EMPTY = "";
	var REPLACE = {
		"\"" : "\\\"",
		"\n" : "\\n",
		"\t" : "\\t",
		"\r" : "\\r"
	};

	/**
	 * Compiles template
	 *
	 * @param body Template body
	 * @returns {String}
	 */
	function compile(body) {
		var blocks = [];
		var length = 0;

		function blocksTokens(original, prefix, block) {
			blocks[length] = prefix
				? "\" +" + block + "+ \""
				: "\";" + block + "o += \"";
			return "<%" + String(length++) + "%>";
		}

		function tokensBlocks(original, token) {
			return blocks[token];
		}

		function replace(original, token) {
			return REPLACE[token] || token;
		}

		return ("function template(data) { var o = \""
		// Sanitize body before we start templating
		+ body.replace(RE_SANITIZE, "")

		// Replace script blocks with tokens
		.replace(RE_BLOCK, blocksTokens)

		// Replace unwanted tokens
		.replace(RE_REPLACE, replace)

		// Replace tokens with script blocks
		.replace(RE_TOKENS, tokensBlocks)

		+ "\"; return o; }")

		// Clean
		.replace(RE_CLEAN, EMPTY);
	}

	var buildMap = {};
	var fetchText = FACTORIES[ typeof process !== "undefined" && process.versions && !!process.versions.node
		? "node"
		: (typeof window !== "undefined" && window.navigator && window.document) || typeof importScripts !== "undefined"
			? "browser"
			: typeof Packages !== "undefined"
				? "rhino"
				: "borked" ]();

	return {
		load: function (name, parentRequire, load, config) {
			var path = parentRequire.toUrl(name);

			fetchText(path, function (text) {
				try {
					text = "define(function() { return " + compile(text, name, path, config.template) + "; })";
				}
				catch (err) {
					err.message = "In " + path + ", " + err.message;
					throw(err);
				}

				if (config.isBuild) {
					buildMap[name] = text;
				}

				// IE with conditional comments on cannot handle the
				// sourceURL trick, so skip it if enabled
				/*@if (@_jscript) @else @*/
				else {
					text += "\n//@ sourceURL='" + path +"'";
				}
				/*@end@*/

				load.fromText(name, text);

				// Give result to load. Need to wait until the module
				// is fully parse, which will happen after this
				// execution.
				parentRequire([name], function (value) {
					load(value);
				});
			});
		},

		write: function (pluginName, name, write) {
			if (buildMap.hasOwnProperty(name)) {
				write.asModule(pluginName + "!" + name, buildMap[name]);
			}
		}
	};
});

/**
 * TroopJS requirejs/multiversion
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-requirejs/multiversion',[],function MultiversionModule() {
	"use strict";

	var RE = /(.+?)#(.+)$/;
	var CONTEXTS = require.s.contexts;

	return {
		"load" : function (name, parentRequire, onload) {
			var context;
			var matches;

			// if name matches RE
			// matches[0] : module name with context - "module/name#context"
			// matches[1] : module name - "module/name"
			// matches[2] : context name - "context"
			if ((matches = RE.exec(name)) !== null) {
				name = matches[1];
				context = matches[2];

				if (context in CONTEXTS) {
					parentRequire = CONTEXTS[context].require;
				}
			}

			parentRequire([ name ], function (module) {
				onload(module);
			}, onload.error);
		}
	};
});
/**
* TroopJS requirejs/shadow
* @license MIT http://troopjs.mit-license.org/ © Tristan Guo mailto:tristanguo@outlook.com
*/
define('troopjs-requirejs/shadow',[ "text" ], function (text) {
	"use strict";

	var UNDEFINED;
	var EXPORTS = "exports";
	var EXTENSION = ".js";
	var PATTERN = /(.+?)#(.+)$/;
	var RE_EMPTY = /^empty:/;
	var REQUIRE_VERSION = require.version;
	var buildMap = {};

	function amdify (scriptText, hashVal) {
		var pattern = /([^=&]+)=([^&]+)/g;
		var m;
		var deps = [];
		var args = [];

		while (hashVal && (m = pattern.exec(hashVal))) {
			if (m[1] === EXPORTS) {
				scriptText += ";\nreturn " + m[2] + ";\n";
			}
			else {
				deps.push("'" + m[2] + "'");
				args.push(m[1]);
			}
		}

		return "define([ " + deps.join(", ") + " ], function (" + args.join(", ") + ") {\n"
			+ scriptText
			+ "});";
	}

	function cmpVersion(a, b) {
		var result;
		var len;
		var i;

		a = a.split(".");
		b = b.split(".");
		len = Math.min(a.length, b.length);

		for (i = 0; i < len; i++) {
			result = parseInt(a[i], null) - parseInt(b[i], null);
			if (result !== 0) {
				return result;
			}
		}
		return a.length - b.length;
	}

	return {
		load : function (name, req, onLoad, config) {
			var m;
			var hashVal;
			var content;
			var url;
			var realName = name;

			// The name is like 'jquery.form#$=jquery&exports=$',
			// So, if macthed, m[1] is 'jquery.form', m[2] is '$=jquery&exports=$'
			if ((m = PATTERN.exec(name))) {
				realName = m[1];
				hashVal = m[2];
			}
			url = req.toUrl(realName + EXTENSION);

			// For Optimization. The url is "empty:" if excluded.
			if (RE_EMPTY.test(url)) {
				onLoad(UNDEFINED);
			}
			else {
				text.get(url, function(data) {
					content = amdify(data, hashVal);
					if (config.isBuild) {
						buildMap[name] = content;
					}

					onLoad.fromText(name, content);  
					// On requirejs version below '2.1.0', 
					// need to manually require the module after the call to onLoad.fromText()
					if (cmpVersion(REQUIRE_VERSION, "2.1.0") < 0) {
						req([ name ], onLoad);
					}	
				});
			}
		},

		write : function (pluginName, moduleName, write) { 
			var content;

			if (moduleName in buildMap) {
				content = buildMap[moduleName];
				write.asModule(pluginName + "!" + moduleName, content);
			}
		}
	};
});

/**
 * TroopJS browser/loom/woven
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/woven',[ "./config", "when", "jquery", "poly/array" ], function WovenModule(config, when, $) {
	"use strict";
	var ARRAY_MAP = Array.prototype.map;
	var LENGTH = "length";
	var WOVEN = "woven";
	var $WARP = config["$warp"];

	/**
	 * Gets woven widgets
	 * @returns {Promise} of woven widgets
	 */
	return function woven() {
		var $woven = [];
		var $wovenLength = 0;
		var re;

		// If we have arguments we have convert and filter
		if (arguments[LENGTH] > 0) {
			// Map arguments to a regexp
			re = RegExp(ARRAY_MAP.call(arguments, function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Iterate
			$(this).each(function (index, element) {
				// Filter widget promises
				var $widgets = ($.data(element, $WARP) || []).filter(function ($weft) {
					return re.test($weft[WOVEN]);
				});

				// Add promise of widgets to $woven
				$woven[$wovenLength++] = when.all($widgets);
			});
		}
		// Otherwise we can use a faster approach
		else {
			// Iterate
			$(this).each(function (index, element) {
				// Add promise of widgets to $woven
				$woven[$wovenLength++] = when.all($.data(element, $WARP));
			});
		}

		// Return promise of $woven
		return when.all($woven);
	};
});
/**
 * TroopJS jquery/loom
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-jquery/loom',[ "jquery", "when", "troopjs-browser/loom/config", "troopjs-browser/loom/weave", "troopjs-browser/loom/unweave", "troopjs-browser/loom/woven", "troopjs-utils/getargs", "poly/array" ], function WeaveModule($, when, config, weave, unweave, woven, getargs) {
	"use strict";

	var UNDEFINED;
	var $FN = $.fn;
	var $EXPR = $.expr;
	var $CREATEPSEUDO = $EXPR.createPseudo;
	var WEAVE = "weave";
	var UNWEAVE = "unweave";
	var WOVEN = "woven";
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var RE_SEPARATOR = /[\s,]+/;

	/**
	 * Tests if element has a data-weave attribute
	 * @param element to test
	 * @returns {boolean}
	 * @private
	 */
	function hasDataWeaveAttr(element) {
		return $(element).attr(ATTR_WEAVE) !== UNDEFINED;
	}

	/**
	 * Tests if element has a data-woven attribute
	 * @param element to test
	 * @returns {boolean}
	 * @private
	 */
	function hasDataWovenAttr(element) {
		return $(element).attr(ATTR_WOVEN) !== UNDEFINED;
	}

	/**
	 * :weave expression
	 * @type {*}
	 */
	$EXPR[":"][WEAVE] = $CREATEPSEUDO
		// If we have jQuery >= 1.8 we want to use .createPseudo
		? $CREATEPSEUDO(function (widgets) {
			// If we don't have widgets to test, quick return optimized expression
			if (widgets === UNDEFINED) {
				return hasDataWeaveAttr;
			}

			// Convert widgets to RegExp
			widgets = new RegExp(getargs.call(widgets).map(function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Return expression
			return function (element) {
				// Get weave attribute
				var weave = $(element).attr(ATTR_WEAVE);

				// Check that weave is not UNDEFINED, and that widgets test against a processed weave
				return weave !== UNDEFINED && widgets.test(weave.replace(RE_SEPARATOR, "\n"));
			};
		})
		// Otherwise fall back to legacy
		: function (element, index, match) {
			var weave = $(element).attr(ATTR_WEAVE);

			return weave === UNDEFINED
				? false
				: match === UNDEFINED
					? true
					: new RegExp(getargs.call(match[3]).map(function (widget) {
							return "^" + widget;
						}).join("|"), "m").test(weave.replace(RE_SEPARATOR, "\n"));
			};

	/**
	 * :woven expression
	 * @type {*}
	 */
	$EXPR[":"][WOVEN] = $CREATEPSEUDO
		// If we have jQuery >= 1.8 we want to use .createPseudo
		? $CREATEPSEUDO(function (widgets) {
			// If we don't have widgets to test, quick return optimized expression
			if (widgets === UNDEFINED) {
				return hasDataWovenAttr;
			}

			// Convert widgets to RegExp
			widgets = new RegExp(getargs.call(widgets).map(function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Return expression
			return function (element) {
				var attr_woven = $(element).attr(ATTR_WOVEN);

				// Check that attr_woven is not UNDEFINED, and that widgets test against a processed attr_woven
				return attr_woven !== UNDEFINED && widgets.test(attr_woven.replace(RE_SEPARATOR, "\n"));
			};
		})
		// Otherwise fall back to legacy
		: function (element, index, match) {
			var attr_woven = $(element).attr(ATTR_WOVEN);

			return attr_woven === UNDEFINED
				? false
				: match === UNDEFINED
					? true
					: new RegExp(getargs.call(match[3]).map(function (widget) {
						return "^" + widget;
					}).join("|"), "m").test(attr_woven.replace(RE_SEPARATOR, "\n"));
		};

	/**
	 * Weaves elements
	 * @returns {Promise} of weaving
	 */
	$FN[WEAVE] = weave;

	/**
	 * Unweaves elements
	 * @returns {Promise} of unweaving
	 */
	$FN[UNWEAVE] = unweave;

	/**
	 * Gets woven widgets
	 * @returns {Promise} of woven widgets
	 */
	$FN[WOVEN] = woven;
});

/**
* TroopJS jquery/noconflict
* @license MIT http://troopjs.mit-license.org/ © Tristan Guo mailto:tristanguo@outlook.com
*/
define('troopjs-jquery/noconflict',[ "jquery" ], function ($) {
	"use strict";

	return $.noConflict(true);
});

define('troopjs/version',[],function () { return "2.0.2-2+7bf18d2"; });
define(['troopjs/version'], function (main) { return main; });