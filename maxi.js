/**
 *   ____ .     ____  ____  ____    ____.
 *   \   (/_\___\  (__\  (__\  (\___\  (/
 *   / ._/  ( . _   \  . /   . /  . _   \_
 * _/    ___/   /____ /  \_ /  \_    ____/
 * \   _/ \____/   \____________/   /
 *  \_t:_____r:_______o:____o:___p:/ [ troopjs - 3.0.0-3+5908d7d ]
 *
 * @license http://troopjs.mit-license.org/ © Mikael Karon
 */


define('troopjs/version',[], "3.0.0-3+5908d7d");

/*
 * TroopJS utils/unique
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/unique',[],function UniqueModule() {
	"use strict";

	var LENGTH = "length";

	/**
	 * Function that calls on an array to produces a duplicate-free version of this array, using the specified comparator otherwise
	 * strictly equals(===) to test object equality.
	 *
	 * @class utils.unique
	 * @param {Function} [fn] The comparator function.
	 * @param {Function} fn.one One element to compare.
	 * @param {Function} fn.other The other element to compare with.
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

/*
 * TroopJS composer/mixin/decorator
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-composer/mixin/decorator',[ "poly/object" ], function DecoratorModule() {
	"use strict";

	/**
	 * Decorator provides customized way to add properties/methods to object created by {@link composer.mixin.factory}.
	 * @class composer.mixin.decorator
	 * @constructor
	 * @param {Function} decorate Function that defines how to override the original one.
	 */
	return function Decorator(decorate) {

		// Define properties
		Object.defineProperties(this, {
			/**
			 * Function that decides what decoration is to make.
			 * @method decorate
			 * @param {Object} descriptor The object descriptor that is the current property.
			 * @param {String} name The property name.
			 * @param {Object} descriptors List of all property descriptors of the host object.
			 * @member composer.mixin.decorator
			 */
			"decorate": {
				"value": decorate
			}
		});
	}
});

/*
 * TroopJS composer/mixin/factory
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-composer/mixin/factory',[
	"module",
	"troopjs-utils/unique",
	"./decorator",
	"poly/object"
], function FactoryModule(module, unique, Decorator) {
	"use strict";

	/**
	 * The factory module establishes the fundamental object composition in TroopJS:
	 *
	 *  - **First-class mixin** based on prototype, that supports deterministic multiple inheritance that:
	 *  	- Eliminating the frustrating issues from multi-tiered, single-rooted ancestry;
	 *    - Avoid occasionally unexpected modification from prototype chain, from the prototype-based inheritance;
	 *    - Reduced the function creation overhead in classical inheritance pattern;
	 *  - **Advice decorator** for method overriding without the need for super call;
	 *  - **Declarative** "special" functions preserved for sending messages to object, that never overrides parent ones.
	 *
	 * Basically Factory takes objects or constructors as arguments and returns a new constructor, the arguments are
	 * composed from left to right, later arguments taken precedence (overriding) former arguments,
	 * and any functions be executed on construction from left to right.
	 *
	 *  		// Define the constructor.
	 *  		var MyClass = Factory(function() {
	 *  			// initialize the object...
	 *  			this.baz = "quz";
	 *  		},
	 *  		{
	 *  			foo: "bar",
	 *  			do: function(){
	 *  				return "work";
	 *  			},
	 *
	 *  			// a special handler for "signal" type with value "foo".
	 *  			"signal/foo": function() {}
	 *
	 *  		});
	 *
	 *  		var MyBehavior =  Factory({
	 *  			somethingElse: function(){}
	 *  		});
	 *
	 *  		// SubClass extends from MyClass and mixin MyBehavior
	 *  		var SubClass = MyClass.extend(function() {
	 *  			// initialize the object...
	 *  		},
	 *
	 *  		MyBehavior,
	 *  		{
	 *  			// Overwrite parent.
	 *  			foo: "baz",
	 *
	 *  			// Override parent with after call.
	 *  			do: Factory.after(function(retval) {
	 *  				return retval + "," + "play";
	 *  			}),
	 *
	 *  			move: function(){}
	 *  		});
	 *
	 *  		// Instantiate the subClass.
	 *  		var instance = SubClass.create({
	 *  			evenMore: function(){}
	 *  		});
	 *
	 *  		// "baz"
	 *  		instance.foo;
	 *
	 *  		// "quz"
	 *  		instance.baz;
	 *
	 *  		// "work play"
	 *  		instance.do();
	 *
	 *  		instance.somethingElse();
	 *  		instance.evenMore();
	 *
	 * @class composer.mixin.factory
	 */

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
	var CONSTRUCTOR = "constructor";
	var CONSTRUCTORS = "constructors";
	var SPECIALS = "specials";
	var GROUP = "group";
	var VALUE = "value";
	var FEATURES = "features";
	var TYPE = "type";
	var TYPES = "types";
	var NAME = "name";
	var RE_SPECIAL = /^(\w+)(?::(.+?))?\/([-_./\d\w\s]+)$/;
	var PRAGMAS = module.config().pragmas || [];
	var PRAGMAS_LENGTH = PRAGMAS[LENGTH];

	/**
	 * Sub classing from this object, and to instantiate it immediately.
	 * @member composer.mixin.factory
	 * @static
	 * @inheritdoc composer.mixin.factory#Factory
	 * @returns {Object} Instance of this class.
	 */
	function create() {
		/*jshint validthis:true*/
		return extend.apply(this, arguments)();
	}

	/**
	 * Sub classing from this object.
	 * @member composer.mixin.factory
	 * @static
	 * @inheritdoc composer.mixin.factory#Factory
	 * @returns {Function} The extended subclass.
	 */
	function extend() {
		/*jshint validthis:true*/
		var args = [ this ];
		ARRAY_PUSH.apply(args, arguments);
		return Factory.apply(null, args);
	}

	/*
	 * Returns a string representation of this constructor
	 * @member composer.mixin.factory
	 * @static
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
	 * The class composer function.
	 * @member composer.mixin.factory
	 * @method Factory
	 * @constructor
	 * @param {Function...} constructor(s) One or more function(s) to be called upon.
	 * @param {Object} spec The object specification that describes properties.
	 * @returns {Function} The constructor(class).
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
		var nameRaw;
		var names;
		var namesLength;
		var i;
		var j;
		var k;
		var pragma;
		var groups = specials[TYPES] = [];
		var group;
		var types;
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
				name = nameRaw = names[j];

				// Iterate PRAGMAS
				for (k = 0; k < PRAGMAS_LENGTH; k++) {
					// Get pragma
					pragma = PRAGMAS[k];

					// Process name with pragma, break if replacement occurred
					if ((name = name.replace(pragma.pattern, pragma.replace)) !== nameRaw) {
						break;
					}
				}

				// Check if this matches a SPECIAL signature
				if ((matches = RE_SPECIAL.exec(name))) {
					// Create special
					special = {};

					// Set special properties
					special[GROUP] = group = matches[1];
					special[FEATURES] = matches[2];
					special[TYPE] = type = matches[3];
					special[NAME] = group + "/" + type;
					special[VALUE] = arg[nameRaw];

					// Unshift special onto specials
					ARRAY_UNSHIFT.call(specials, special);
				}
				// Otherwise just add to prototypeDescriptors
				else {
					// Get descriptor for arg
					descriptor = Object.getOwnPropertyDescriptor(arg, nameRaw);

					// Get value
					value = descriptor[VALUE];

					// If value is instanceof Advice, we should re-describe, otherwise just use the original descriptor
					prototypeDescriptors[name] = value instanceof Decorator
						? value[DECORATE](prototypeDescriptors[name] || {
							"enumerable" : true,
							"configurable" : true,
							"writable" : true
						}, name, prototypeDescriptors)
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
				: specials[groups[groups[LENGTH]] = group] = [];

			// Get or create types object
			types = TYPES in group
				? group[TYPES]
				: group[TYPES] = [];

			// Get or create type object
			type = type in group
				? group[type]
				: group[types[types[LENGTH]] = type] = specials[name] = [];

			// Store special in group/type
			group[group[LENGTH]] = type[type[LENGTH]] = special;
		}

		/*
		 * Component constructor
		 * @returns {Constructor} Constructor
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
	Object.defineProperty(Factory, CREATE, {
		"value": function FactoryCreate() {
			return Factory.apply(null, arguments)();
		}
	});

	// Return Factory
	return Factory;
});

/*
 * TroopJS core/mixin/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/mixin/base',[ "troopjs-composer/mixin/factory" ], function ObjectBaseModule(Factory) {
	var INSTANCE_COUNTER = 0;
	var INSTANCE_COUNT = "instanceCount";

	/**
	 * Base object with instance count.
	 * @class core.mixin.base
	 */
	return Factory(function ObjectBase() {
		// Update instance count
		this[INSTANCE_COUNT] = ++INSTANCE_COUNTER;
	}, {
		"instanceCount" : INSTANCE_COUNTER,

		"displayName" : "core/mixin/base",

		/**
		 * Gives string representation of this component instance.
		 * @returns {String} displayName and instanceCount
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});

define('troopjs-core/event/runner/sequence',[
	"when"
], function SequenceModule(when) {
	"use strict";

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/*
	 * Runner that executes candidates in sequence without overlap
	 * @param {Object} event Event object
	 * @param {Object} handlers List of handlers
	 * @param {Array} args Initial arguments
	 * @returns {Promise}
	 */
	return function sequence(event, handlers, args) {
		var results = [];
		var resultsCount = 0;
		var candidates = [];
		var candidatesCount = 0;
		var handler;

		// Copy from handlers list to candidates array
		for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
			candidates[candidatesCount++] = handler;
		}

		// Reset candidate count
		candidatesCount = 0;

		/*
		 * Internal function for sequential execution of candidates
		 * @private
		 * @param {Array} [result] result from previous handler callback
		 * @param {Boolean} [skip] flag indicating if this result should be skipped
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (result, skip) {
			/*jshint curly:false*/
			var candidate;

			// Store result if no skip
			if (skip !== true) {
				results[resultsCount++] = result;
			}

			// Return promise of next callback, or a promise resolved with result
			return (candidate = candidates[candidatesCount++]) !== UNDEFINED
				? when(candidate[CALLBACK].apply(candidate[CONTEXT], args), next)
				: when.resolve(results);
		};

		return next(args, true);
	}
});
/*
 * TroopJS core/event/emitter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/event/emitter',[
	"../mixin/base",
	"./runner/sequence"
], function EventEmitterModule(Base, sequence) {
	"use strict";

	/**
	 * The event module of TroopJS that provides common event handling capability, and some highlights:
	 *
	 * ## Asynchronous handlers
	 * Any event handler can be asynchronous depending on the **return value**:
	 *
	 *  - a Promise value makes this handler be considered asynchronous, where the next handler will be called
	 *  upon the completion of this promise.
	 *  - any non-Promise values make it a ordinary handler, where the next handler will be invoked immediately.
	 *
	 * @class core.event.emitter
	 * @extends core.mixin.base
	 */

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var HANDLERS = "handlers";
	var LENGTH = "length";
	var TYPE = "type";
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var TAIL = "tail";
	var NEXT = "next";

	/**
	 * Helper to initialize the **handlers** object for an event type.
	 * @static
	 * @param {String} type The event type.
	 * @param {Object} [handlers] The handlers object for this event type.
	 * @return {Object} The created handlers object.
	 */
	function createHandlers(type, handlers) {
		var me = this;

		// Set default handler if needed
		handlers = handlers || {};

		// Set type
		handlers[TYPE] = type;

		// Add handler to handlers
		return me[me[LENGTH]] = me[type] = handlers;
	}

	var Emitter = Base.extend(function Emitter() {
		this[HANDLERS] = [];
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event type.
		 * @param {String} type The event type to subscribe to.
		 * @param {Object} context The context to scope the callback to.
		 * @param {Function} callback The event listener function.
		 * @param {*} [data] Handler data
		 * @returns {*} this
		 */
		"on" : function on(type, context, callback, data) {
			var me = this;
			var handlers = me[HANDLERS];
			var handler;

			// Get callback from next arg
			if (callback === UNDEFINED) {
				throw new Error("no callback provided");
			}

			// Have handlers
			if (type in handlers) {
				// Get handlers
				handlers = handlers[type];

				// Create new handler
				handler = {};

				// Prepare handler
				handler[CALLBACK] = callback;
				handler[CONTEXT] = context;
				handler[DATA] = data;

				// Set tail handler
				handlers[TAIL] = TAIL in handlers
					// Have tail, update handlers[TAIL][NEXT] to point to handler
					? handlers[TAIL][NEXT] = handler
					// Have no tail, update handlers[HEAD] to point to handler
					: handlers[HEAD] = handler;
			}
			// No handlers
			else {
				// Create type handlers
				handlers = createHandlers.call(handlers, type, {});

				// Prepare handlers
				handlers[TYPE] = type;
				handlers[HEAD] = handlers[TAIL] = handler = {};

				// Prepare handler
				handler[CALLBACK] = callback;
				handler[CONTEXT] = context;
				handler[DATA] = data;
			}

			return me;
		},

		/**
		 * Remove callback(s) from a subscribed event type, if no callback is specified,
		 * remove all callbacks of this type.
		 *
		 * @param {String} type The event type subscribed to
		 * @param {Object} [context] The context to scope the callback to remove
		 * @param {Function} [callback] The event listener function to remove
		 * @returns {*} this
		 */
		"off" : function off(type, context, callback) {
			var me = this;
			var handlers = me[HANDLERS];
			var handler;
			var head;
			var tail;

			// Have handlers
			if (type in handlers) {
				// Get handlers
				handlers = handlers[type];

				// Have HEAD in handlers
				if (HEAD in handlers) {
					// Iterate handlers
					for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
						// Should we remove?
						remove : {
							// If no context or context does not match we should break
							if (context && handler[CONTEXT] !== context) {
								break remove;
							}

							// If no callback or callback does not match we should break
							if (callback && handler[CALLBACK] !== callback) {
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
				}
			}

			return me;
		},

		/**
		 * Trigger an event which notifies each of the listeners of their subscribing,
		 * optionally pass data values to the listeners.
		 *
		 *  A sequential runner, is the default runner for this module, in which all handlers are running
		 *  with the same argument data specified by the {@link #emit} function.
		 *  Each handler will wait for the completion for the previous one if it returns a promise.
		 *
		 * @param {String|Object} event The event type to emit, or an event object
		 * @param {String} [event.type] The event type name.
		 * @param {Function} [event.runner] The runner function that determinate how the handlers are executed, overrides the
		 * default behaviour of the event emitting.
		 * @param {...*} [args] Data params that are passed to the listener function.
		 * @returns {*} Result returned from runner.
		 */
		"emit" : function emit(event, args) {
			var me = this;
			var type = event;
			var handlers = me[HANDLERS];
			var runner;

			// If event is a plain string, convert to object with props
			if (OBJECT_TOSTRING.call(event) === TOSTRING_STRING) {
				// Recreate event
				event = {};
				event[RUNNER] = runner = sequence;
				event[TYPE] = type;
			}
			// If event duck-types an event object we just override or use defaults
			else if (TYPE in event) {
				event[RUNNER] = runner = event[RUNNER] || sequence;
				type = event[TYPE];
			}
			// Otherwise something is wrong
			else {
				throw Error("first argument has to be of type '" + TOSTRING_STRING + "' or have a '" + TYPE + "' property");
			}

			// Get or createHandlers handlers[type] as handlers
			handlers = handlers[type] || createHandlers.call(handlers, type, {});

			// Return result from runner
			return runner.call(me, event, handlers, ARRAY_SLICE.call(arguments, 1));
		}
	});

	Emitter.createHandlers = createHandlers;

	return Emitter;
});

/*
 * TroopJS utils/merge module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/merge',[ "poly/object" ], function MergeModule() {
	"use strict";

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_CONCAT = ARRAY_PROTO.concat;
	var OBJECT_PROTO = Object.prototype;
	var OBJECT_TOSTRING = OBJECT_PROTO.toString;
	var TOSTRING_OBJECT = OBJECT_TOSTRING.call(OBJECT_PROTO);
	var TOSTRING_ARRAY = OBJECT_TOSTRING.call(ARRAY_PROTO);
	var LENGTH = "length";

	/**
	 * Function that calls on an Object, to augments this object with enumerable properties from the source objects,
	 * subsequent sources will overwrite property assignments of previous sources on primitive values,
	 * while object and array values will get merged recursively.
	 * @class utils.merge
	 * @param {...Object} [source] One or more source objects.
	 * @return {Object} this
	 */
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

		// Check that we can use target
		if (target !== UNDEFINED && target !== NULL) {
			// Iterate arguments
			for (i = 0, iMax = arguments[LENGTH]; i < iMax; i++) {
				// Get source, and continue if it's UNDEFINED or NULL
				if ((source = arguments[i]) === UNDEFINED || source === NULL) {
					continue;
				}

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
		}

		return target;
	};
});

/*
 * TroopJS composer/decorator/before
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-composer/decorator/before',[ "../mixin/decorator" ], function BeforeDecoratorModule(Decorator) {
	"use strict";

	var UNDEFINED;
	var VALUE = "value";

	/**
	 * Create a decorator method that is to add code that will be executed before the original method.
	 *
	 * @class composer.decorator.before
	 * @param {Function} func The decorator function which receives the same arguments as with the original, it's return
	 * value (if not undefined) will be send as the arguments of original function.
	 * @returns {composer.mixin.decorator}
	 */
	return function before(func) {
		return new Decorator(function (descriptor) {
			var next = descriptor[VALUE];

			descriptor[VALUE] = next
				? function decorated_before() {
					var me = this;
					var retval = func.apply(me, arguments);

					return next.apply(me, retval !== UNDEFINED ? retval : arguments);
				}
				: func;

			return descriptor;
		});
	}
});

/*
 * TroopJS composer/decorator/around
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-composer/decorator/around',[ "../mixin/decorator" ], function AroundDecoratorModule(Decorator) {
	"use strict";

	var VALUE = "value";
	var NOOP = function () {};

	/**
	 * Create a decorator that is to override an existing method.
	 *
	 * @class composer.decorator.around
	 * @param {Function} func The decorator function which receives the original function as parameter and is supposed to
	 * return a function that is to replace the original.
	 * @returns {composer.mixin.decorator}
	 */
	return function around(func) {
		return new Decorator(function (descriptor) {
			descriptor[VALUE] = func(descriptor[VALUE] || NOOP);
			return descriptor;
		});
	}
});

/*
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/base',[
	"../event/emitter",
	"../event/runner/sequence",
	"troopjs/version",
	"troopjs-utils/merge",
	"troopjs-composer/decorator/before",
	"troopjs-composer/decorator/around",
	"when",
	"poly/array"
], function ComponentModule(Emitter, sequence, version, merge, before, around, when) {
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
	 * 	$(window).unload(function on_unload (argument) {\
	 * 	  app.end();
	 * 	});
	 * @class core.component.base
	 * @extends core.event.emitter
	 */

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var EMITTER_CREATEHANDLERS = Emitter.createHandlers;
	var CONFIGURATION = "configuration";
	var RUNNER = "runner";
	var HANDLERS = "handlers";
	var HEAD = "head";
	var CONTEXT = "context";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var PHASE = "phase";
	var STOP = "stop";
	var INITIALIZE = "initialize";
	var STARTED = "started";
	var FINALIZED = "finalized";
	var FINISHED = "finished";
	var SIG = "sig";
	var SIG_SETUP = SIG + "/setup";
	var SIG_TEARDOWN = SIG + "/teardown";
	var ON = "on";
	var EVENT_TYPE_SIG = new RegExp("^" + SIG + "/(.+)");

	return Emitter.extend(function Component() {
		var me = this;
		var specials = me.constructor.specials[SIG] || ARRAY_PROTO;

		// Iterate specials
		specials.forEach(function (special) {
			me.on(special[NAME], special[VALUE]);
		});

		// Set configuration
		me[CONFIGURATION] = {};
	}, {
		"version" : version,

		"displayName" : "core/component/base",

		"sig/initialize" : function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[ON] || ARRAY_PROTO, function (special) {
				return me.on(special[TYPE], special[VALUE]);
			});
		},

		"sig/finalize" : function onFinalize() {
			var me = this;

			return when.map(me[HANDLERS].reverse(), function (handlers) {
				return me.off(handlers[TYPE]);
			});
		},

		/**
		 * Add to the component configurations, possibly {@link utils.merge merge} with the existing ones.
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
		 * @param {...Object} [config] Config(s) to add.
		 * @returns {Object} The new configuration.
		 */
		"configure" : function configure(config) {
			return merge.apply(this[CONFIGURATION], arguments);
		},

		/**
		 * @method
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"on": before(function on(event, callback, data) {
			var me = this;
			var type = event;
			var all = me[HANDLERS];
			var handlers = all[type];

			// Initialize the handlers for this type of event on first subscription only.
			if (handlers === UNDEFINED) {
				handlers = EMITTER_CREATEHANDLERS.call(all, type);
			}

			// If this event is NOT a signal, send out a signal to allow setting up handlers.
			if (!(HEAD in handlers) && !EVENT_TYPE_SIG.test(type)) {
				event = {};
				event[TYPE] = SIG_SETUP;
				event[RUNNER] = sequence;
				me.emit(event, type, handlers);
			}

			// context will always be this widget.
			return [type, me, callback, data];
		}),

		/**
		 * @method
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"off": around(function(fn) {
			return function off(event, callback) {
				var me = this;
				var type = event;

				// context will always be this widget.
				fn.call(me, type, me, callback);

				var all = me[HANDLERS];
				var handlers = all[type];

				// Initialize the handlers for this type of event on first subscription only.
				if (handlers === UNDEFINED) {
					handlers = EMITTER_CREATEHANDLERS.call(all, type);
				}

				// If this event is NOT a signal, send out a signal to allow finalize handlers.
				if (!(HEAD in handlers) && !EVENT_TYPE_SIG.test(type)) {
					debugger;
					event = {};
					event[TYPE] = SIG_TEARDOWN;
					event[RUNNER] = sequence;
					me.emit(event, type, handlers);
				}

				return me;
			};
		}),

		/**
		 * Signals the component
		 * @param {String} _signal Signal
		 * @param {...*} [args] signal arguments
		 * @return {Promise}
		 */
		"signal": function signal(_signal, args) {
			var me = this;

			// Modify first argument
			arguments[0] = "sig/" + _signal;

			// Emit
			return me.emit.apply(me, arguments);
		},

		/**
		 * Start the component life-cycle.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 */
		"start" : function start(args) {
			var me = this;
			var signal = me.signal;
			var phase;

			// Check PHASE
			if ((phase = me[PHASE]) !== UNDEFINED && phase !== FINALIZED) {
				throw new Error("Can't transition phase from '" + phase + "' to '" + INITIALIZE + "'");
			}

			// Modify args to change signal (and store in PHASE)
			args = [ me[PHASE] = INITIALIZE ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function initialized(_initialized) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "start";

				return signal.apply(me, args).then(function started(_started) {
					// Update phase
					me[PHASE] = STARTED;

					// Return concatenated result
					return ARRAY_PROTO.concat(_initialized, _started);
				});
			});
		},

		/**
		 * Stops the component life-cycle.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 */
		"stop" : function stop(args) {
			var me = this;
			var signal = me.signal;
			var phase;

			// Check PHASE
			if ((phase = me[PHASE]) !== STARTED) {
				throw new Error("Can't transition phase from '" + phase + "' to '" + STOP + "'");
			}

			// Modify args to change signal (and store in PHASE)
			args = [ me[PHASE] = STOP ];

			// Add signal to arguments
			ARRAY_PUSH.apply(args, arguments);

			return signal.apply(me, args).then(function stopped(_stopped) {
				// Modify args to change signal (and store in PHASE)
				args[0] = me[PHASE] = "finalize";

				return signal.apply(me, args).then(function finalized(_finalized) {
					// Update phase
					me[PHASE] = FINALIZED;

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
		}
	});
});

define('troopjs-core/component/runner/pipeline',[ "when" ], function PipelineModule(when) {
	"use strict";

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HEAD = "head";
	var NEXT = "next";

	/*
	 * Runner that filters and executes candidates in pipeline without overlap
	 * @param {Object} event Event object
	 * @param {Object} handlers List of handlers
	 * @param {Array} args Initial arguments
	 * @returns {Promise}
	 */
	return function pipeline(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			// Filter candidate[CONTEXT] if we have context
			if (context !== UNDEFINED && candidate[CONTEXT] !== context) {
				continue;
			}

			// Filter candidate[CALLBACK] if we have callback
			if (callback && candidate[CALLBACK] !== callback) {
				continue;
			}

			// Add to candidates
			candidates[candidatesCount++] = candidate;
		}

		// Reset candidatesCount
		candidatesCount = 0;

		/*
		 * Internal function for piped execution of candidates candidates
		 * @private
		 * @param {Array} [result] result from previous candidate callback
		 * @return {Promise} promise of next candidate callback execution
		 */
		var next = function (result) {
			/*jshint curly:false*/
			var candidate;
			var type;

			// Check that result is not UNDEFINED and not equals to args
			if (result !== UNDEFINED && result !== args) {
				// Update args to either result or result wrapped in a new array
				args = (type = OBJECT_TOSTRING.call(result)) === TOSTRING_ARRAY  // if type is TOSTRING_ARRAY
					|| type === TOSTRING_ARGUMENTS                                 // or type is TOSTRING_ARGUMENTS
					? result                                                       // then result is array-like enough to be passed to .apply
					: [ result ];                                                  // otherwise we should just wrap it in a new array
			}

			// Return promise of next callback, or promise resolved with args
			return (candidate = candidates[candidatesCount++]) !== UNDEFINED
				? when(candidate[CALLBACK].apply(candidate[CONTEXT], args), next)
				: when.resolve(args);
		};

		return next(args);
	}
});
define('troopjs-core/pubsub/runner/constants',{
	"pattern" : /^(?:initi|fin)alized?$/
});
define('troopjs-core/pubsub/runner/pipeline',[
	"./constants",
	"when"
], function PipelineModule(CONSTANTS, when) {
	"use strict";

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HEAD = "head";
	var NEXT = "next";
	var PHASE = "phase";
	var MEMORY = "memory";
	var RE_PHASE = CONSTANTS["pattern"];

	/*
	 * Runner that filters and executes candidates in pipeline without overlap
	 * @param {Object} event Event object
	 * @param {Object} handlers List of handlers
	 * @param {Array} args Initial arguments
	 * @returns {Promise}
	 */
	return function pipeline(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			// Filter candidate[CONTEXT] if we have context
			if (context !== UNDEFINED && candidate[CONTEXT] !== context) {
				continue;
			}

			// Filter candidate[CALLBACK] if we have callback
			if (callback !== UNDEFINED && candidate[CALLBACK] !== callback) {
				continue;
			}

			// Add to candidates
			candidates[candidatesCount++] = candidate;
		}

		// Reset candidatesCount
		candidatesCount = 0;

		/*
		 * Internal function for piped execution of candidates candidates
		 * @private
		 * @param {Array} [result] result from previous candidate callback
		 * @return {Promise} promise of next candidate callback execution
		 */
		var next = function (result) {
			/*jshint curly:false*/
			var context;
			var candidate;
			var type;

			// Check that result is not UNDEFINED and not equals to args
			if (result !== UNDEFINED && result !== args) {
				// Update args to either result or result wrapped in a new array
				args = (type = OBJECT_TOSTRING.call(result)) === TOSTRING_ARRAY  // if type is TOSTRING_ARRAY
					|| type === TOSTRING_ARGUMENTS                                 // or type is TOSTRING_ARGUMENTS
					? result                                                       // then result is array-like enough to be passed to .apply
					: [ result ];                                                  // otherwise we should just wrap it in a new array
			}

			// TODO Needs cleaner implementation
			// Iterate until we find a candidate in a blocked phase
			while ((candidate = candidates[candidatesCount++]) // Has next candidate
				&& (context = candidate[CONTEXT])                // Has context
				&& RE_PHASE.test(context[PHASE]));               // In blocked phase

			// Return promise of next callback, or promise resolved with args
			return candidate !== UNDEFINED
				? when(candidate[CALLBACK].apply(context, args), next)
				: when.resolve(handlers[MEMORY] = args);
		};

		return next(args);
	}
});
/*
 * TroopJS composer/decorator/from
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-composer/decorator/from',[ "../mixin/decorator" ], function FromDecoratorModule(Decorator) {
	"use strict";

	var UNDEFINED;
	var VALUE = "value";
	var PROTOTYPE = "prototype";

	/**
	 * Create a decorator that is to lend from a particular property from this own or the other factory.
	 *
	 * @class composer.decorator.from
	 * @param {Function} [which] The other class from which to borrow the method, otherwise to borrow from the host class.
	 * @param {String} [prop] The property name to borrow from, otherwise to borrow the same property name.
	 * @returns {composer.mixin.decorator}
	 */
	return function from(which, prop) {
		// Shifting arguments.
		if (typeof which === "string") {
			prop = which;
			which = UNDEFINED;
		}

		return new Decorator(function (descriptor, name, descriptors) {
			// To override a specified property, otherwise simply this property.
			name = prop || name;

			// Property is from the the other's prototype, otherwise from own descriptor.
			descriptor[VALUE] = which
				? which[PROTOTYPE][name]
				: descriptors[name][VALUE];

			return descriptor;
		});
	}
});

/*
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/pubsub/hub',[
	"../event/emitter",
	"./runner/pipeline",
	"troopjs-composer/decorator/from"
], function HubModule(Emitter, pipeline, from) {
	"use strict";

	/**
	 * The centric "bus" that handlers publishing and subscription.
	 *
	 * ## Memorized emitting
	 * A fired event will memorize the "current" value of each event. Each executor may have it's own interpretation
	 * of what "current" means.
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
		"subscribe" : from("on"),

		/**
		 * Remove a public event listener.
		 * @inheritdoc #off
		 * @method
		 */
		"unsubscribe" : from("off"),

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
		 * @returns {Promise}
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
		 * Returns value in handlers MEMORY
		 * @param {String} type event type to peek at
		 * @param {*} [value] Value to use _only_ if no memory has been recorder
		 * @returns {*} Value in MEMORY
		 */
		"peek": function peek(type, value) {
			var handlers;

			return (handlers = this[HANDLERS][type]) === UNDEFINED || !(MEMORY in handlers)
				? value
				: handlers[MEMORY];
		}
	});
});

/*
 * TroopJS core/component/gadget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/gadget',[
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

/*
 * TroopJS composer/decorator/after
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-composer/decorator/after',[ "../mixin/decorator" ], function AfterDecoratorModule(Decorator) {
	"use strict";

	var UNDEFINED;
	var VALUE = "value";

	/**
	 * Create a decorator method that is to add code that will be executed after the original method.
	 *
	 * @class composer.decorator.after
	 * @param {Function} func The decorator function which receives the arguments of the original, it's return value (if
	 * not undefined) will be the used as the new return value.
	 * @returns {composer.mixin.decorator}
	 */
	return function after(func) {
		return new Decorator(function (descriptor) {
			var previous = descriptor[VALUE];

			descriptor[VALUE] = previous
				? function decorated_after() {
					var me = this;
					var retval = previous.apply(me, arguments);
					var newRet = func.apply(me, arguments);
					return newRet !== UNDEFINED ? newRet : retval;
				}
				: func;

			return descriptor;
		});
	}
});

/*
 * TroopJS browser/dom/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/dom/config',[
	"module",
	"troopjs-utils/merge",
	"jquery"
], function (module, merge, $) {
	var config = {};

	config["querySelectorAll"] = $.find;

	config["matchesSelector"] = $.find.matchesSelector;

	return merge.call(config, module.config());
});
/*
 * TroopJS browser/dom/selector
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Heavily influenced by selector-set (https://github.com/josh/selector-set/) Copyright 2013 Joshua Peek
 */
define('troopjs-browser/dom/selector',[
	"troopjs-composer/mixin/factory",
	"./config"
], function (Factory, CONFIG) {
	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var LENGTH = "length";
	var INDEXES = "indexes";
	var INDEXED = "indexed";
	var INDEXER = "indexer";
	var CLASS = "class";
	var ID = "id";
	var TAG = "tag";
	var UNIVERSAL = "universal";
	var SLASH = "\\";
	var SPACE = " ";
	var STAR = "*";
	var POUND = "#";
	var PERIOD = ".";
	var COLON = ":";
	var LEFT_BRACKET = "[";
	var RIGHT_BRACKET = "]";
	var COUNT = "count";
	var BASEVAL = "baseVal";
	var RE_SPACE = /\s+/;
	var querySelectorAll = CONFIG["querySelectorAll"];
	var matchesSelector = CONFIG["matchesSelector"];

	/*
	 * Extracts key for universal indexer
	 * @private
	 * @return {String[]}
	 */
	function getElementUniversal() {
		return [ STAR ];
	}

	/*
	 * Extracts key for tag indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementTagName(element) {
		return [ element.nodeName.toUpperCase() ];
	}

	/*
	 * Extracts key for class indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementClassNames(element) {
		var className;
		var result;

		// Do we have a `className` property
		if ((className = element.className) !== UNDEFINED) {
			// DOM `className`
			if (typeof className === "string") {
				result = className.split(RE_SPACE);
			}
			// SVG `className`
			else if (typeof className === "object" && BASEVAL in className) {
				result = className[BASEVAL].split(RE_SPACE);
			}
		}

		return result;
	}

	/*
	 * Extracts key for id indexer
	 * @private
	 * @param element
	 * @return {String[]}
	 */
	function getElementId(element) {
		var id;

		return (id = element.id) !== UNDEFINED && [ id ];
	}

	/*
	 * Gets the last **SIGNIFICANT** of a CSS selector, the "significant" is defined as - any leading id, class name or
	 * tag name component of the last selector.
	 *
	 * Examples:
	 * 	tail("div.bar"); 	// "div"
	 * 	tail("#foo.bar"); 	// "#foo"
	 * 	tail("p > div.bar"); 	// "div"
	 * 	tail("p > a:active"); 	// "a"
	 * 	tail(".bar");	// ".bar"
	 * 	tail("input.foo[type='button']");	// "input"
	 * 	tail("[type='button']");	// "*"
	 *
	 * @see [CSS3 selector spec](http://www.w3.org/TR/selectors/#w3cselgrammar)
	 * @private
	 * @param {String} selector CSS selector
	 * @return {String} last token
	 */
	function tail(selector) {
		var start = selector[LENGTH];
		var stop = start;
		var c = selector.charAt(--start);
		var skip = false;

		step: while (start >= 0) {
			switch (c) {
				case SPACE:
					/* Marks EOT if:
					 * * Next c is not SLASH
					 * * Not in skip mode
					 */
					if ((c = selector.charAt(--start)) !== SLASH && !skip) {
						// We're 2 steps passed the end of the selector so we should adjust for that
						start += 2;

						// Break the outer while
						break step;
					}
					break;

				case RIGHT_BRACKET:
					/* Marks begin of skip if:
					 * * Next c is not SLASH
					 */
					skip = (c = selector.charAt(--start)) !== SLASH;
					break;

				case LEFT_BRACKET:
					/* Marks end of skip if:
					 * * Next c is not SLASH
					 */
					if (!(skip = (c = selector.charAt(--start)) === SLASH)) {
						// Compensate for start already decreased
						stop = start + 1;
					}
					break;

				case POUND:
				case COLON:
				case PERIOD:
					/* Marks stop if:
					 * * Next c is not SLASH
					 * * Next c is not SPACE
					 * * Not in skip mode
					 */
					if ((c = selector.charAt(--start)) && c!== UNDEFINED && c!== SLASH && c !== SPACE && !skip) {
						// Compensate for start already decreased
						stop = start + 1;
					}
					break;

				default:
					// Store next c
					c = selector.charAt(--start);
					break;
			}
		}

		return selector.substring(start, stop) || STAR;
	}

	/*
	 * Compares candidates (that have COUNT properties)
	 * @private
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Number}
	 */
	function compareCandidates(a, b) {
		return a[COUNT] - b[COUNT];
	}

	var Selector = Factory(function Selector() {
		var me = this;

		me[INDEXES] = [];
		me[COUNT] = 0;
	}, {
		/*
		 * Adds candidate
		 * @param {String} selector CSS selector
		 * @param {...*} [args] Additional arguments attached with candidate
		 * @return {Object} this
		 */
		"add": function add(selector, args) {
			var me = this;
			var indexes = me[INDEXES];
			var indexed;
			var indexer;
			var index;
			var name;
			var key = tail(selector);

			// Convert arguments to array
			args = ARRAY_SLICE.call(arguments);

			// Set COUNT on args
			args[COUNT] = me[COUNT]++;

			// Check the first char to determine name/indexer and transform key
			switch (key.charAt(0)) {
				case POUND:
					name = ID;
					indexer = getElementId;
					key = key.substring(1);
					break;

				case PERIOD:
					name = CLASS;
					indexer = getElementClassNames;
					key = key.substring(1);
					break;

				case STAR:
					name = UNIVERSAL;
					indexer = getElementUniversal;
					break;

				default:
					name = TAG;
					indexer = getElementTagName;
					key = key.toUpperCase();
					break;
			}

			// Get index and indexed
			if ((index = indexes[name]) !== UNDEFINED) {
				indexed = index[INDEXED];
			}
			// Or create index and indexed
			else {
				index = indexes[name] = indexes[indexes[LENGTH]] = {};
				index[INDEXER] = indexer;
				indexed = index[INDEXED] = {};
			}

			// Add args to index[key]
			if (key in indexed) {
				indexed[key].push(args);
			}
			// Or create index[key] and initialize with args
			else {
				indexed[key] = [ args ];
			}

			return me;
		},

		/*
		 * Matches candidates against element
		 * @param element DOM Element
		 * @return {Array} Matching array of candidates
		 */
		"matches": function matches(element) {
			var me = this;
			var indexer;
			var indexed;
			var indexes = me[INDEXES];
			var index;
			var indexCount = indexes[LENGTH];
			var keys;
			var keysCount;
			var candidates;
			var candidate;
			var candidateCount;
			var result = [];
			var resultCount = 0;

			if (!element) {
				return result;
			}

			while (indexCount--) {
				index = indexes[indexCount];
				indexer = index[INDEXER];
				indexed = index[INDEXED];

				keys = indexer(element);
				keysCount = keys[LENGTH];

				while (keysCount--) {

					if ((candidates = indexed[keys[keysCount]]) !== UNDEFINED) {
						candidateCount = candidates[LENGTH];

						while (candidateCount--) {
							candidate = candidates[candidateCount];

							if (matchesSelector(element, candidate[0])) {
								result[resultCount++] = candidate;
							}
						}
					}
				}
			}

			return result.sort(compareCandidates);
		}
	});

	/*
	 * @inheritdoc #tail
	 */
	Selector.tail = tail;

	return Selector;
});

define('troopjs-browser/component/runner/sequence',[
	"../../dom/selector",
	"poly/array"
], function SequenceModule(Selector) {

	var UNDEFINED;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var NEXT = "next";
	var SELECTOR = "selector";
	var MODIFIED = "modified";

	/*
	 * Runner that executes DOM candidates in sequence without overlap
	 * @param {Object} event Event object
	 * @param {Object} handlers List of handlers
	 * @param {Array} args Initial arguments
	 * @returns {*} Result from last handler
	 */
	return function sequence(event, handlers, args) {
		var modified = handlers[MODIFIED];
		var $event = args[0];
		var selector;
		var candidate;

		// Try get SELECTOR from handlers and check if MODIFIED
		if ((selector = handlers[SELECTOR]) === UNDEFINED || selector[MODIFIED] !== modified) {
			// Create and cache SELECTOR
			selector = handlers[SELECTOR] = Selector();

			// Set MODIFIED on selector
			selector[MODIFIED] = modified;

			// Iterate handlers
			for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
				// Add candidate with selector or default selector '*'
				selector.add(candidate[DATA] || "*", candidate);
			}
		}

		return selector
			// Filter to only selectors that match target
			.matches($event.target)
			// Reduce so we can catch the end value
			.reduce(function (result, selector) {
				// If immediate propagation is stopped we should just return last result
				if ($event.isImmediatePropagationStopped()) {
					return result;
				}

				// Did the previous candidate return false we should stopPropagation and preventDefault
				if (result === false) {
					$event.stopPropagation();
					$event.preventDefault();
				}

				// Get candidate from selector
				var candidate = selector[1];

				// Run candidate, provide result to next run
				return candidate[CALLBACK].apply(candidate[CONTEXT], args);
			}, UNDEFINED);
	}
});
/*
 * TroopJS browser/loom/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/config',[ "module", "troopjs-utils/merge" ], function LoomConfigModule(module, merge) {
	"use strict";

	/**
	 * This module is to provide configurations **loom** from it's AMD module config.
	 *
	 * To change the configuration, refer to RequireJS [module config API][1]:
	 *
	 * 	requirejs.config(
	 * 	{
	 * 		config: { "troopjs-browser/loom/config" : { "weave" : "data-my-weave", ...  } }
	 * 	})
	 *
	 * [1]: http://requirejs.org/docs/api.html#config-moduleconfig
	 *
	 * @class browser.loom.config
	 * @singleton
	 */
	return merge.call({
		/**
		 * @cfg {String} $warp Property of the element's data where the **warp** resides.
		 */
		"$warp" : "$warp",
		/**
		 * @cfg {String} $weft Property of the widget where the **weft** resides.
		 */
		"$weft" : "$weft",

		/**
		 * @cfg {String} weave Attribute name of the element where the **weave** resides.
		 */
		"weave" : "data-weave",

		/**
		 * @cfg {String} unweave Attribute name of the element where the **unweave** resides.
		 */
		"unweave" : "data-unweave",

		/**
		 * @cfg {String} woven Attribute name of the element where the **woven** resides.
		 */
		"woven" : "data-woven"
	}, module.config());
});
/*
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

	/**
	 * Function that calls on a String, to parses it as function parameters delimited by commas.
	 *
	 * 	" 1  , '2' , 3  ,false,5 " => [ 1, "2", 3, false, 5]
	 * 	'1, 2 ',  3,\"4\", 5  => [ "1, 2 ", 3, "4", 5 ]
	 *
	 * @class utils.getargs
	 * @return {Array} the array of parsed params.
	 */
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

/*
 * TroopJS utils/defer
 * when.defer patched with jQuery/deferred compatibility.
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/defer',[ "when", "poly/array" ], function DeferModule(when) {
	"use strict";

	var ARRAY_SLICE = Array.prototype.slice;

	/**
	 * @class utils.defer
	 * Function that creates a wrapped when.defer object, which can be send to anything that expects a jQuery/deferred.
	 */
	return function Defer() {
		// Create defer
		var defer = when.defer();

		[ "resolve", "reject", "progress" ].forEach(function (value) {
			var me = this;

			// Since the deferred implementation in jQuery (that we use in 1.x) allows
			// to resolve with optional context and multiple arguments, we monkey-patch resolve here
			var func = me.resolver[value];

			// Resolve/Reject/Progress with parameters:
			// http://api.jquery.com/deferred.resolve
			me[value] = function () {
				func.apply(me, arguments);
			};

			// Resolve/Reject/Progress with context and parameters:
			// http://api.jquery.com/deferred.resolveWith
			me[value + "With"] = function (context) {
				func.apply(context, ARRAY_SLICE.call(arguments, 1));
			};

		}, defer);

		return defer;
	};
});

/*
 * TroopJS browser/loom/weave
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/weave',[ "./config", "require", "when", "jquery", "troopjs-utils/getargs", "troopjs-utils/defer", "poly/array" ], function WeaveModule(config, parentRequire, when, $, getargs, Defer) {
	"use strict";

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SHIFT = ARRAY_PROTO.shift;
	var WEAVE = "weave";
	var WOVEN = "woven";
	var $WARP = config["$warp"];
	var $WEFT = config["$weft"];
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var RE_SEPARATOR = /[\s,]+/;

	/**
	 * Instantiate all widget instances specified in the {@link browser.loom.config#weave weave attribute}
	 * of this element, and to signal the widget for start with the arguments. The weaving will result in:
	 *
	 *  - Updates the {@link browser.loom.config#weave woven attribute} with the created widget instances names.
	 *  - The {@link browser.loom.config#$warp $warp data property} will reference the widget instances.
	 *
	 * **Note:** It's not commonly to use this method directly, use instead {@link $#weave jQuery.fn.weave}.
	 *
	 * 	// Create element for weaving.
	 * 	var $el = $('<div data-weave="my/widget(option)"></div>').data("option",{"foo":"bar"});
	 * 	// Instantiate the widget defined in "my/widget" module, with one param read from the element's custom data.
	 * 	$el.weave();
	 * @member browser.loom.weave
	 * @method weave
	 * @param {*...} [arg] The params that used to start the widget.
	 * @returns {Promise} Promise to the completion of weaving all widgets.
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
			var re = /[\s,]*(((?:\w+!)?([\w\d_\/\.\-]+)(?:#[^(\s]+)?)(?:\(([^\)]+)\))?)/g;
			var matches;

			/*
			 * Updated attributes according to what have been weaved.
			 * @param {object} widgets List of started widgets.
			 * @private
			 */
			var update_attr = function (widgets) {
				var woven = [];
				widgets.forEach(function (widget) {
					woven.push(widget[$WEFT][WOVEN]);
				});

				$element.attr(ATTR_WOVEN, function (index, attr) {
					return (attr !== UNDEFINED ? attr.split(RE_SEPARATOR) : []).concat(woven).join(" ");
				});
			};

			// Make sure to remove ATTR_WEAVE (so we don't try processing this again)
			$element.removeAttr(ATTR_WEAVE);

			var args;

			// Iterate weave_attr (while re matches)
			// matches[1] : full widget module name (could be loaded from plugin) - "mv!widget/name#1.x(1, 'string', false)"
			// matches[2] : widget name and arguments - "widget/name(1, 'string', false)"
			// matches[3] : widget name - "widget/name"
			// matches[4] : widget arguments - "1, 'string', false"
			while ((matches = re.exec(weave_attr)) !== NULL) {
				/*jshint loopfunc:true*/
				// Create weave_args
				// Require module, add error handler
				// Arguments to pass to the widget constructor.
				args = matches[4];

				// module name, DOM element, widget display name.
				weave_args = [ matches[2], $element.get(0), matches[3] ];

				// Store matches[1] as WEAVE on weave_args
				weave_args[WEAVE] = matches[1];

				// If there were additional arguments
				if (args !== UNDEFINED) {
					// Parse matches[2] using getargs, map the values and append to weave_args
					ARRAY_PUSH.apply(weave_args, getargs.call(args).map(function (value) {
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
				var module = ARRAY_SHIFT.call(widget_args);

				// Copy WEAVE
				promise[WEAVE] = widget_args[WEAVE];

				// Add promise to $warp
				ARRAY_PUSH.call($warp, promise);

				parentRequire([ module ], function (Widget) {
					var widget;
					var startPromise;

					try {
						// Create widget instance
						widget = Widget.apply(Widget, widget_args);

						// Add $WEFT to widget
						widget[$WEFT] = promise;

						// Add WOVEN to promise
						promise[WOVEN] = widget.toString();

						// TODO: Detecting TroopJS 1.x widget from *version* property.
						if (widget.trigger) {
							deferred = Defer();
							widget.start(deferred);
							startPromise = deferred.promise;
						}
						else {
							startPromise = widget.start.apply(widget, start_args);
						}

						resolver.resolve(startPromise.yield(widget));
					}
					catch (e) {
						resolver.reject(e);
					}
				}, resolver.reject);

				// Return promise
				return promise;
			})
			// Updating the element attributes with started widgets.
			.tap(update_attr);
		}));
	};
});

/*
 * TroopJS browser/loom/unweave
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/unweave',[ "./config", "when", "jquery", "poly/array", "troopjs-utils/defer" ], function UnweaveModule(config, when, $, Defer) {
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
	 * Destroy all widget instances living on this element, that are created
	 * by {@link browser.loom.weave weaving}, it is also to clean up the attributes
	 * and data references to the previously instantiated widgets.
	 *
	 * @member browser.loom.unweave
	 * @method unweave
	 * @returns {Promise} Promise to the completion of destroying all woven widgets.
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
			var re = /[\s,]*([\w_\/\.\-]+)(?:@(\d+))?/g;
			var matches;
			var $weft;
			var iMax;
			var i;
			var j;

			/*
			 * Updated attributes according to what have been unweaved.
			 * @param {object} widgets List of stopped widgets.
			 * @private
			 */
			var update_attr = function (widgets) {
				var woven = {};
				var weave = [];
				widgets.forEach(function (widget) {
					var $promise = widget[$WEFT];
					woven[$promise[WOVEN]] = 1;
					weave.push($promise[WEAVE]);
				});

				$element
					// Remove those widgets from data-woven.
					.attr(ATTR_WOVEN, function (index, attr) {
						var result = [];

						if (attr !== UNDEFINED) {
							ARRAY_PUSH.apply(result, attr.split(RE_SEPARATOR).filter(function (part) {
								return !( part in woven );
							}));
						}

						return result[LENGTH] === 0
							? null
							: result.join(" ");
					})
					// Added back those widget names to data-weave.
					.attr(ATTR_WEAVE, function (index, attr) {
							return (attr !== UNDEFINED ? attr.split(RE_SEPARATOR) : []).concat(weave).join(" ");
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
				var deferred;
				var stopPromise;

				// TODO: Detecting TroopJS 1.x widget from *version* property.
				if (widget.trigger) {
					deferred = Defer();
					widget.stop(deferred);
					stopPromise = deferred.promise;
				}
				else {
					stopPromise = widget.stop.apply(widget, stop_args);
				}

				// Add deferred update of attr
				return stopPromise.yield(widget);
			})
			// Updating the weave/woven attributes with stopped widgets.
			.tap(update_attr);
		}));
	};
});

/*
 * TroopJS jquery/destroy
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-jquery/destroy',[ "jquery" ], function DestroyModule($) {
	"use strict";

	var DESTROY = "destroy";

	/**
	 * A special jQuery event whose handler will be called, only when this handler it's removed from the element.
	 * @member $
	 * @event destroy
	 */
	$.event.special[DESTROY] = {
		"noBubble" : true,

		"trigger" : function () {
			return false;
		},

		"remove" : function onDestroyRemove(handleObj) {
			var me = this;

			if (handleObj) {
				handleObj.handler.call(me, $.Event(handleObj.type, {
					"data" : handleObj.data,
					"namespace" : handleObj.namespace,
					"target" : me
				}));
			}
		}
	};
});

/*
 * TroopJS browser/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/component/widget',[
	"troopjs-core/component/gadget",
	"troopjs-composer/decorator/before",
	"troopjs-composer/decorator/after",
	"./runner/sequence",
	"jquery",
	"when",
	"troopjs-utils/merge",
	"../loom/config",
	"../loom/weave",
	"../loom/unweave",
	"troopjs-jquery/destroy"
], function WidgetModule(Gadget, before, after, sequence, $, when, merge, LOOM_CONF, loom_weave, loom_unweave) {
	"use strict";

	/**
	 * Base DOM component attached to an element, that takes care of widget instantiation.
	 * @class browser.component.widget
	 * @extends core.component.gadget
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var $GET = $.fn.get;
	var TYPEOF_FUNCTION = "function";
	var $ELEMENT = "$element";
	var MODIFIED = "modified";
	var PROXY = "proxy";
	var DOM = "dom";
	var FEATURES = "features";
	var NAME = "name";
	var VALUE = "value";
	var TYPE = "type";
	var RUNNER = "runner";
	var $WEFT = LOOM_CONF["$weft"];
	var SELECTOR_WEAVE = "[" + LOOM_CONF["weave"] + "]";
	var SELECTOR_WOVEN = "[" + LOOM_CONF["woven"] + "]";
	var RE = new RegExp("^" + DOM + "/(.+)");

	/**
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @private
	 * @param $fn jQuery method
	 * @returns {Function} proxied render
	 */
	function $render($fn) {
		/**
		 * Renders contents into element
		 * @private
		 * @param {Function|String} contents Template/String to render
		 * @param {...*} [args] Template arguments
		 * @returns {Promise} Promise of  render
		 */
		function render(contents, args) {
			/*jshint validthis:true*/
			var me = this;

			// Call render with contents (or result of contents if it's a function)
			return loom_weave.call($fn.call(me[$ELEMENT],
				typeof contents === TYPEOF_FUNCTION ? contents.apply(me, ARRAY_SLICE.call(arguments, 1)) : contents
			).find(SELECTOR_WEAVE));
		}

		return render;
	}

	/**
	 * Sets MODIFIED on handlers
	 * @private
	 * @param type {String}
	 */
	function set_modified(type) {
		if (RE.test(type)) {
			// Set modified
			this.handlers[type][MODIFIED] = new Date().getTime();
		}
	}

	/**
	 * Creates a new widget
	 * @param $element {jQuery}
	 * @param displayName {String}
	 * @constructor
	 */
	return Gadget.extend(function Widget($element, displayName) {
		var me = this;
		var $get;

		// No $element
		if ($element === UNDEFINED) {
			throw new Error("No $element provided");
		}
		// Is _not_ a jQuery element
		else if (!$element.jquery) {
			// From a plain dom node
			if ($element.nodeType) {
				$element = $($element);
			}
			else {
				throw new Error("Unsupported widget element");
			}
		}
		// From a different jQuery instance
		else if (($get = $element.get) !== $GET) {
			$element = $($get.call($element, 0));
		}

		// Store $ELEMENT
		me[$ELEMENT] = $element;

		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}

	}, {
		"displayName" : "browser/component/widget",

		"sig/initialize" : function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[DOM] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE], special[FEATURES]);
			});
		},

		/**
		 * @method
		 * @inheritdoc
		 */
		"on": after(set_modified),

		/**
		 * @method
		 * @inheritdoc
		 */
		"off": before(set_modified),

		"sig/setup": function onSetup(type, handlers) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				// $element.on handlers[PROXY]
				me[$ELEMENT].on(matches[1], NULL, me, handlers[PROXY] = function dom_proxy($event, args) {
					// Redefine args
					args = {};
					args[TYPE] = type;
					args[RUNNER] = sequence;
					args = [ args];

					// Push original arguments on args
					ARRAY_PUSH.apply(args, arguments);

					// Return result of emit
					return me.emit.apply(me, args);
				});
			}
		},

		"sig/teardown": function onTeardown(type, handlers) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				// $element.off handlers[PROXY]
				me[$ELEMENT].off(matches[1], NULL, handlers[PROXY]);
			}
		},

		"sig/task" : function onTask(task) {
			this[$ELEMENT].trigger("task", [ task ]);
		},

		/**
		 * Destroy DOM handler
		 */
		"dom/destroy" : function onDestroy() {
			this.unweave();
		},

		/**
		 * Weaves all children of $element
		 * @returns {Promise} from weave
		 */
		"weave" : function weave() {
			return loom_weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
		},

		/**
		 * Unweaves all woven children widgets including the widget itself.
		 * @returns {Promise} Promise of completeness of unweaving all widgets.
		 */
		"unweave" : function unweave() {
			var woven = this[$ELEMENT].find(SELECTOR_WOVEN);

			// Unweave myself only if I am woven.
			if(this[$WEFT]) {
				woven = woven.addBack();
			}

			return loom_unweave.apply(woven, arguments);
		},

		/**
		 * Renders content and inserts it before $element
		 * @method
		 */
		"before" : $render($.fn.before),

		/**
		 * Renders content and inserts it after $element
		 * @method
		 */
		"after" : $render($.fn.after),

		/**
		 * Renders content and replaces $element contents
		 * @method
		 */
		"html" : $render($.fn.html),

		/**
		 * Renders content and replaces $element contents
		 * @method
		 */
		"text" : $render($.fn.text),

		/**
		 * Renders content and appends it to $element
		 * @method
		 */
		"append" : $render($.fn.append),

		/**
		 * Renders content and prepends it to $element
		 * @method
		 */
		"prepend" : $render($.fn.prepend)
	});
});

/*
 * TroopJS core/component/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/service',[ "./gadget" ], function ServiceModule(Gadget) {
	"use strict";

	/**
	 * Base class for all service alike components, self-registering.
	 *
	 * @class core.component.service
	 * @extends core.component.gadget
	 */
	return Gadget.extend({
		"displayName" : "core/component/service",

		"sig/initialize" : function onInitialize() {
			var me = this;

			return me.publish("registry/add", me);
		},

		"sig/finalize" : function onFinalize() {
			var me = this;

			return me.publish("registry/remove", me);
		}
	});
});
/*
 * TroopJS core/registry/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/registry/service',[ "../component/service", "poly/object", "poly/array" ], function RegistryServiceModule(Service) {
	"use strict";

	/**
	 * A special {@link core.component.service service} presents the registry table for all
	 * other services across the application.
	 *
	 * 	// Upon instantiation this service is registered.
	 * 	Service.create({
	 *
	 * 		// This will be the service key.
	 * 		displayName: "my/provided",
	 *
	 * 		// Provide actual services on hub.
	 * 		"hub/my/provided/service" : function() {
	 * 			// Do some dirty lift.
	 * 		}
	 * 	});
	 *
	 * 	// Now we can look for it in registry.
	 * 	var service = registry.get("my/provided")[0];
	 *
	 * @class core.registry.service
	 * @extends core.component.service
	 */

	var SERVICES = "services";

	return Service.extend(function RegistryService() {
		var me = this;

		me[SERVICES] = {};

		me.add(me);
	},{
		"displayName" : "core/registry/service",

		/**
		 * Register a service.
		 * @param {core.component.service} service
		 */
		"add" : function add(service) {
			this[SERVICES][service.toString()] = service;
		},

		/**
		 * Remove a service from the registry.
		 * @param {core.component.service} service
		 */
		"remove": function remove(service) {
			delete this[SERVICES][service.toString()];
		},

		/**
		 * Find registered service(s) by service name.
		 * @param {String} pattern Regexp that matches the service name.
		 * @returns {Array|null}
		 */
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

		/**
		 * Hub event for adding service.
		 * @event
		 * @param {core.component.service} service
		 * @returns {*}
		 */
		"hub/registry/add" : function onAdd(service) {
			return this.add(service);
		},

		/**
		 * Hub event for removing service.
		 * @event
		 * @param {core.component.service} service
		 * @returns {*}
		 */
		"hub/registry/remove" : function onRemove(service) {
			return this.remove(service);
		},

		/**
		 * Hub event for finding service(s).
		 * @event
		 * @param {String} pattern
		 * @returns {*}
		 */
		"hub/registry/get" : function onGet(pattern) {
			return this.get(pattern);
		}
	});
});
/*
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/application/widget',[ "module", "../component/widget", "when", "troopjs-core/registry/service", "poly/array" ], function ApplicationWidgetModule(module, Widget, when, RegistryService) {
	"use strict";

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var REGISTRY = "registry";

	/*
	 * Forwards _signal to components
	 * @private
	 * @param {String} _signal Signal to forward
	 * @param {Array} _args Signal arguments
	 * @return {Promise} promise of next handler callback execution
	 */
	function forward(_signal, _args) {
		/*jshint validthis:true*/
		var me = this;
		var args = [ _signal ];
		var components = me[REGISTRY].get();
		var componentsCount = 0;
		var results = [];
		var resultsCount = 0;

		ARRAY_PUSH.apply(args, _args);

		var next = function (result, skip) {
			var component;

			if (skip !== true) {
				results[resultsCount++] = result;
			}

			return (component = components[componentsCount++]) !== UNDEFINED
				? when(component.signal.apply(component, args), next)
				: when.resolve(results);
		};

		return next(UNDEFINED, true);
	}

	/**
	 * The application widget serves as top-most page component
	 * that bootstrap all other components registered.
	 * @class browser.application.widget
	 * @extends browser.component.widget
	 */
	return Widget.extend(function ApplicationWidget() {
		// Create registry
		var registry = this[REGISTRY] = RegistryService();

		// TODO only register _services_
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
			var args = arguments;

			return forward.call(me, "start", args).then(function started() {
				return me.weave.apply(me, args);
			});
		},

		"sig/stop" : function onStop() {
			var me = this;
			var args = arguments;

			return me.unweave.apply(me, args).then(function stopped() {
				return forward.call(me, "stop", args);
			});
		},

		"sig/finalize" : function onFinalize() {
			return forward.call(this, "finalize", arguments);
		}
	});
});
/*
 * TroopJS core/logger/console
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/logger/console',[ "../mixin/base", "poly/function" ], function ConsoleLogger(Base) {
	"use strict";

	/**
	 * Module that provides simple logging feature as a wrapper around the "console" global ever found.
	 *
	 * @singleton
	 * @class core.logger.console
	 * @extends core.mixin.base
	 */

	/*jshint devel:true*/
	var CONSOLE = window.console;

	function noop() {}

	var spec = {};
	["info","log","debug","warn","error"].reduce(function(memo, feature) {
			memo[feature] =
				typeof CONSOLE != 'undefined' && CONSOLE[feature] ? CONSOLE[feature].bind(CONSOLE) : noop;
			return memo;
	}, spec);

	/**
	 * Writes a message to the console that is information alike,
	 * @member core.logger.console
	 * @method info
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is logging alike.
	 * @member core.logger.console
	 * @method log
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is debugging alike.
	 * @member core.logger.console
	 * @method debug
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is warning alike.
	 * @member core.logger.console
	 * @method warn
	 * @param {String} msg
	 */

	/**
	 * Writes a message to the console that is actually an error.
	 * @member core.logger.console
	 * @method error
	 * @param {String} msg
	 */

	return Base.create({
			"displayName" : "core/logger/console"
		},
		spec);
});

/*
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/logger/pubsub',[ "../mixin/base", "../pubsub/hub" ], function PubSubLogger(Base, hub) {
	"use strict";

	/**
	 * This module provides a logger that simply publish logging events on hub.
	 * @class core.logger.pubsub
	 * @extends core.mixin.base
	 * @singleton
	 */

	var ARRAY_PUSH = Array.prototype.push;
	var PUBLISH = hub.publish;

	return Base.create({
		"displayName" : "core/logger/pubsub",

		/**
		 * @inheritdoc core.logger.console#log
		 */
		"log": function log() {
			var args = [ "logger/log" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		/**
		 * @inheritdoc core.logger.console#warn
		 */
		"warn" : function warn() {
			var args = [ "logger/warn" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		/**
		 * @inheritdoc core.logger.console#debug
		 */
		"debug" : function debug() {
			var args = [ "logger/debug" ];
			ARRAY_PUSH.apply(args, arguments);
			PUBLISH.apply(hub, args);
		},

		/**
		 * @inheritdoc core.logger.console#info
		 */
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
/*
 * TroopJS core/logger/pubsub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/logger/service',[ "../component/service", "troopjs-utils/merge", "when" ], function logger(Service, merge, when) {
	"use strict";

	/**
	 * Provides logging as a service, with appender support.
	 * @param {Function...} appenders One or more message appender(s).
	 * @class core.logger.service
	 * @extends core.component.service
	 */

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

		/**
		 * Log a message on hub event.
		 * @event
		 * @param message
		 */
		"hub/logger/log" : function onLog(message) {
			append.call(this, convert("log", message));
		},

		/**
		 * Log a warn on hub event.
		 * @event
		 * @param message
		 */
		"hub/logger/warn" : function onWarn(message) {
			append.call(this, convert("warn", message));
		},

		/**
		 * Log a debug on hub event.
		 * @event
		 * @param message
		 */
		"hub/logger/debug" : function onDebug(message) {
			append.call(this, convert("debug", message));
		},

		/**
		 * Log an info on hub event.
		 * @event
		 * @param message
		 */
		"hub/logger/info" : function onInfo(message) {
			append.call(this, convert("info", message));
		},

		/**
		 * Log an error on hub event.
		 * @event
		 * @param message
		 */
		"hub/logger/error" : function onError(message) {
			append.call(this, convert("error", message));
		}
	});
});

/*
 * TroopJS core/pubsub/proxy/to1x
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/pubsub/proxy/to1x',[ "../../component/service", "when", "when/apply", "poly/array", "poly/object" ], function To1xModule(Service, when, apply) {
	"use strict";

	/**
	 * Proxies to 1.x hub
	 * @class core.pubsub.proxy.to1x
	 * @extends core.component.service
	 * @param {Object...} setting Setting
	 */

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var OBJECT_KEYS = Object.keys;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var PUBLISH = "publish";
	var SUBSCRIBE = "subscribe";
	var HUB = "hub";
	var SETTINGS = "settings";
	var LENGTH = "length";
	var RESOLVE = "resolve";
	var TOPIC = "topic";
	var DEFER = "defer";
	var MEMORY = "memory";

	return Service.extend(function To1xService(setting) {
			this[SETTINGS] = ARRAY_SLICE.call(arguments);
		}, {
			"displayName" : "core/pubsub/proxy/to1x",

			/**
			 * @override
			 */
			"sig/initialize" : function () {
				var me = this;

				// Iterate SETTINGS
				me[SETTINGS].forEach(function (setting) {
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
						var topic;
						var defer;

						// If target is a string set topic to target and defer to false
						if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
							topic = target;
							defer = false;
						}
						// Otherwise just grab topic and defer from target
						else {
							// Make sure we have a topic
							if (!(TOPIC in target)) {
								throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
							}

							// Get topic
							topic = target[TOPIC];
							// Make sure defer is a boolean
							defer = !!target[DEFER];
						}

						// Create callback
						var callback = publish[source] = function () {
							// Initialize args with topic as the first argument
							var args = [ topic ];
							var deferred;
							var resolve;

							// Push original arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

							if (defer) {
								// Create deferred
								deferred = when.defer();

								// Store original resolve method
								resolve = deferred[RESOLVE];

								// Since the deferred implementation in jQuery (that we use in 1.x) allows
								// to resolve with multiple arguments, we monkey-patch resolve here
								deferred[RESOLVE] = deferred.resolver[RESOLVE] = function () {
									resolve(ARRAY_SLICE.call(arguments));
								};

								// Push deferred as last argument on args
								ARRAY_PUSH.call(args, deferred);
							}

							// Publish with args
							hub.publish.apply(hub, args);

							// Return promise
							return deferred
								? deferred.promise
								: UNDEFINED;
						};

						// Transfer topic and defer to callback
						callback[TOPIC] = topic;
						callback[DEFER] = defer;

						// Subscribe from me
						me.subscribe(source, callback);
					});

					// Iterate subscribe keys
					OBJECT_KEYS(subscribe).forEach(function (source) {
						// Extract target
						var target = subscribe[source];
						var topic;
						var memory;

						// If target is not a string, make it into an object
						if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
							topic = target;
							memory = false;
						}
						// Otherwise just grab from the properties
						else {
							// Make sure we have a topic
							if (!(TOPIC in target)) {
								throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
							}

							// Get topic
							topic = target[TOPIC];
							// Make sure memory is a boolean
							memory = !!target[MEMORY];
						}

						// Create callback
						var callback = subscribe[source] = function () {
							// Initialize args with topic as the first argument
							var args = [ topic ];
							var deferred;
							var result;

							// Push sliced (without topic) arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

							// If the last argument look like a promise we pop and store as deferred
							if (when.isPromise(args[args[LENGTH] - 1])) {
								deferred = args.pop();
							}

							// Publish and store promise as result
							result = me.publish.apply(me, args);

							// If we have a deferred we should chain it to result
							if (deferred) {
								when(result, apply(deferred.resolve), deferred.reject, deferred.progress);
							}

							// Return result
							return result;
						};

						// Transfer topic and memory to callback
						callback[TOPIC] = topic;
						callback[MEMORY] = memory;

						// Subscribe from hub,notice that since we're pushing memory there _is_ a chance that
						// we'll get a callback before sig/start
						hub.subscribe(source, me, memory, callback);
					});
				});
			},

			/**
			 * @override
			 */
			"sig/finalize" : function () {
				var me = this;

				// Iterate SETTINGS
				me[SETTINGS].forEach(function (setting) {
					if (!(HUB in setting)) {
						throw new Error("'" + HUB + "' is missing from setting");
					}

					var publish = setting[PUBLISH] || {};
					var subscribe = setting[SUBSCRIBE] || {};
					var hub = setting[HUB];

					// Iterate publish keys and unsubscribe
					OBJECT_KEYS(publish).forEach(function (source) {
						me.unsubscribe(source, publish[source]);
					});

					// Iterate subscribe keys and unsubscribe
					OBJECT_KEYS(subscribe).forEach(function (source) {
						hub.unsubscribe(source, me, subscribe[source]);
					});
				});
			}
		});
});
/*
 * TroopJS core/pubsub/proxy/to2x
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/pubsub/proxy/to2x',[ "../../component/service", "when", "poly/array", "poly/object" ], function To2xModule(Service, when) {
	"use strict";

	/**
	 * Proxies to 2.x hub
	 * @class core.pubsub.proxy.to2x
	 * @extends core.component.service
	 * @constructor
	 * @param {Object...} setting Setting
	 */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var OBJECT_KEYS = Object.keys;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";
	var PUBLISH = "publish";
	var SUBSCRIBE = "subscribe";
	var HUB = "hub";
	var SETTINGS = "settings";
	var TOPIC = "topic";
	var REPUBLISH = "republish";

	return Service.extend(function To2xService(setting) {
			this[SETTINGS] = ARRAY_SLICE.call(arguments);
		}, {
			"displayName" : "core/pubsub/proxy/to2x",

			/**
			 * @override
			 */
			"sig/initialize" : function ()  {
				var me = this;

				// Iterate SETTINGS
				me[SETTINGS].forEach(function (setting) {
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
						var topic;

						// If target is a string set topic to target
						if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
							topic = target;
						}
						// Otherwise just grab topic from target
						else {
							// Make sure we have a topic
							if (!(TOPIC in target)) {
								throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
							}

							// Get topic
							topic = target[TOPIC];
						}

						// Create callback
						var callback = publish[source] = function () {
							// Initialize args with topic as the first argument
							var args = [ topic ];

							// Push original arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

							return hub.publish.apply(hub, args);
						};

						// Transfer topic to callback
						callback[TOPIC] = topic;

						me.subscribe(source, callback);
					});

					// Iterate subscribe keys
					OBJECT_KEYS(subscribe).forEach(function (source) {
						// Extract target
						var target = subscribe[source];
						var topic;
						var republish;

						// If target is a string set topic to target and republish to false
						if (OBJECT_TOSTRING.call(target) === TOSTRING_STRING) {
							topic = target;
							republish = false;
						}
						// Otherwise just grab topic and republish from target
						else {
							// Make sure we have a topic
							if (!(TOPIC in target)) {
								throw new Error("'" + TOPIC + "' is missing from target '" + source + "'");
							}

							// Get topic
							topic = target[TOPIC];
							// Make sure republish is a boolean
							republish = !!target[REPUBLISH];
						}

						// Create callback
						var callback = subscribe[source] = function () {
							// Initialize args with topic as the first argument
							var args = [ topic ];

							// Push original arguments on args
							ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments));

							// Publish and store promise as result
							return me.publish.apply(me, args);
						};

						// Transfer topic and republish to callback
						callback[TOPIC] = topic;
						callback[REPUBLISH] = republish;

						hub.subscribe(source, me, callback);
					});
				});
			},

			/**
			 * @override
			 */
			"sig/start" : function () {
				var me = this;
				var results = [];

				// Iterate SETTINGS
				me[SETTINGS].forEach(function (setting) {
					if (!(HUB in setting)) {
						throw new Error("'" + HUB + "' is missing from setting");
					}

					var subscribe = setting[SUBSCRIBE] || {};
					var hub = setting[HUB];

					// Iterate subscribe keys
					OBJECT_KEYS(subscribe).forEach(function (source) {
						var callback = subscribe[source];

						// Check if we should republish
						if (callback[REPUBLISH] === true) {
							// Push result from republish on results
							results.push(hub.republish(source, me, callback));
						}
					});
				});

				// Return promise that will resolve once all results are resolved
				return when.all(results);
			},

			/**
			 * @override
			 */
			"sig/finalize" : function () {
				var me = this;

				// Iterate SETTINGS
				me[SETTINGS].forEach(function (setting) {
					if (!(HUB in setting)) {
						throw new Error("'" + HUB + "' is missing from setting");
					}

					var publish = setting[PUBLISH] || {};
					var subscribe = setting[SUBSCRIBE] || {};
					var hub = setting[HUB];

					// Iterate publish keys and unsubscribe
					OBJECT_KEYS(publish).forEach(function (source) {
						me.unsubscribe(source, publish[source]);
					});

					// Iterate subscribe keys and unsubscribe
					OBJECT_KEYS(subscribe).forEach(function (source) {
						hub.unsubscribe(source, me, subscribe[source]);
					});
				});
			}
		});
});
/*
 * TroopJS net/ajax/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-net/ajax/service',[
	"troopjs-core/component/service",
	"jquery",
	"troopjs-utils/merge"
], function (Service, $, merge) {
	"use strict";

	/**
	 * Provides ajax as a service
	 * @class net.ajax.service
	 * @extends core.component.service
	 */
	return Service.extend({
		"displayName" : "net/ajax/service",

		/**
		 * Make ajax request.
		 * @event
		 * @param settings
		 */
		"hub/ajax" : function ajax(settings) {
			// Request
			return $.ajax(merge.call({
				"headers": {
					"x-troopjs-request-id": new Date().getTime()
				}
			}, settings));
		}
	});
});

/*
 * TroopJS data/cache/component
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-data/cache/component',[ "troopjs-core/component/base", "poly/object", "poly/array" ], function CacheModule(Component) {
	"use strict";

	var UNDEFINED;
	var TRUE = true;
	var FALSE = false;
	var NULL = null;
	var OBJECT = Object;
	var ARRAY = Array;

	var SECOND = 1000;
	var GENERATIONS = "generations";
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

	/*
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

			// Update _INDEXED
			node[_INDEXED] = now;

			// Get _ID
			id = node[_ID];

			// In cache, get it!
			if (id in me) {
				result = me[id];

				// Bypass collapsed object that already exists in cache.
				if(node[_COLLAPSED] === TRUE) {
					return result;
				}

				break cache;
			}

			// Not in cache, add it!
			result = me[id] = node;   // Reuse ref to node (avoids object creation)
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
			// Check if _not_ _COLLAPSED
			if (node[_COLLAPSED] === FALSE) {
				// Prune properties from result
				for (property in result) {
					// Except the _ID property
					// or the _COLLAPSED property
					// or the _EXPIRES property
					// if property is _not_ present in node
					if (property !== _ID
						&& property !== _COLLAPSED
						&& property !== _EXPIRES
						&& !(property in node)) {
						delete result[property];
					}
				}
			}

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
			// Break fast if id is UNDEFINED
			if (id === UNDEFINED) {
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
				// Collapsed object should not be collected by GC.
				if(result[_COLLAPSED] === TRUE) {
					break add;
				}

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

	/**
	 * Component for handling effective object caching with cycle references concerned.
	 * @class data.cache.component
	 * @extends core.component.base
	 */
	return Component.extend(function CacheComponent() {
		this[GENERATIONS] = {};
	}, {
		"displayName" : "data/cache/component",

		"sig/finalize" : function finalize() {
			var me = this;

			// Iterate all properties on me
			Object.keys(me).forEach(function (property) {
				var value;

				// Check if we should delete this property
				if ((value = me[property]) !== UNDEFINED // value is not UNDEFINED
					&& [CONSTRUCTOR] === OBJECT            // and value[CONSTRUCTOR] is OBJECT
					&& value.hasOwnProperty(_ID)) {        // and value ducktypes cachable
					// Delete from me (cache)
					delete me[property];
				}
			});
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

/*
 * TroopJS data/cache/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-data/cache/service',[ "troopjs-core/component/service" ], function CacheServiceModule(Service) {
	"use strict";

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var CACHES = "_caches";
	var TIMEOUT = "_timeout";
	var SECOND = 1000;
	var GENERATIONS = "generations";
	var HEAD = "head";
	var NEXT = "next";
	var EXPIRES = "expires";
	var LENGTH = "length";

	function sweep(expires) {
		/*jshint forin:false*/
		var me = this;
		var generations = me[GENERATIONS];
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
	}

	return Service.extend(function CacheService() {
		this[CACHES] = ARRAY_SLICE.call(arguments);
	}, {
		"sig/start" : function start(delay) {
			var me = this;
			var caches = me[CACHES];

			if (delay === UNDEFINED) {
				delay = (60 * SECOND);
			}

			function loop() {
				// Calculate expiration of this generation
				var expires = 0 | new Date().getTime() / SECOND;
				var i;
				var iMax;

				//. Loop over caches
				for (i = 0, iMax = caches[LENGTH]; i < iMax; i++) {
					// Call sweep on each cache
					sweep.call(caches[i], expires);

					// Set timeout for next execution
					me[TIMEOUT] = setTimeout(loop, delay);
				}
			}

			// Start loop
			loop();
		},

		"sig/stop" : function stop() {
			var me = this;

			// Clear interval
			clearTimeout(me[TIMEOUT]);
		}
	});
});

/*
 * TroopJS data/query/component
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-data/query/component',[ "troopjs-core/mixin/base" ], function QueryModule(Base) {
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

	/**
	 * Component who understands the ubiquitous data query string format.
	 * @class data.query.component
	 * @extends core.mixin.base
	 */
	return Base.extend(function QueryComponent(query) {
		var me = this;

		if (query !== UNDEFINED) {
			me[_QUERY] = query;
		}
	}, {
		"displayName" : "data/query/component",

		/**
		 * Parse the query string.
		 * @param query
		 * @returns this
		 */
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

		/**
		 * Further reduce the query string elements based on the cache content,
		 * to eliminate unnecessary queries made.
		 * @param {Object} cache The cache dictionary.
		 * @returns this
		 */
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
			var d = FALSE;      // Dead flag
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
							// Set dead and RESOLVED if we're not collapsed or expired
							d = o[RESOLVED] = n[_COLLAPSED] !== TRUE && !(_EXPIRES in n && n[_EXPIRES] < now);
						}
						else {
							// Reset current root and node
							n = UNDEFINED;
							// Reset dead and RESOLVED
							d = o[RESOLVED] = FALSE;
						}
						break;

					case OP_PROPERTY :
						// Get e from o
						x = o[RAW];

						// Was previous op dead?
						if (!d) {
							o[RESOLVED] = FALSE;
						}
						// Do we have a node and this item in the node
						else if (n && x in n) {
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
										&& !(_EXPIRES in c && c[_EXPIRES] < now)) {
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
								o[RESOLVED] = n[_COLLAPSED] !== TRUE && !(_EXPIRES in n && n[_EXPIRES] < now);
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

		/**
		 * Retrieve the AST as the parsed result.
		 * @returns {Array} the result AST.
		 */
		"ast" : function ast() {
			var me = this;

			// If we're not parsed - parse
			if (!(_AST in me)) {
				me.parse();
			}

			return me[_AST];
		},

		/**
		 * Rebuild the (reduced) query string.
		 * @returns {String}
		 */
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
/*
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

	/**
	 * Service that batch processes the query requests send to server and cache the results.
	 *
	 * ** Note ** Ajax service is used to talk to the server.
	 * @class data.query.service
	 * @extends core.component.service
	 */
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
				request().then(done, fail);
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

		/**
		 * Handle query request on hub event.
		 * @event
		 * @returns {Promise}
		 */
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

/*
* TroopJS jquery/noconflict
* @license MIT http://troopjs.mit-license.org/ © Tristan Guo mailto:tristanguo@outlook.com
*/
define('troopjs-jquery/noconflict',[ "jquery" ], function ($) {
	"use strict";

	return $.noConflict(true);
});

/*
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
/*
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

/*
 * TroopJS utils/select
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/select',[],function SelectModule() {
	"use strict";

	var UNDEFINED;
	var FALSE = false;
	var PERIOD = ".";
	var LEFT_BRACKET = "[";
	var RIGHT_BRACKET = "]";
	var SINGLE_QUOTE = "'";
	var DOUBLE_QUOTE = "\"";

	return function select(query) {
		var node = this;
		var c;
		var m;
		var i;
		var length;
		var skip = FALSE;

		for (i = m = 0, length = query.length; i < length && node !== UNDEFINED; i++) {
			switch(c = query.charAt(i)) {
				case PERIOD:
					if (skip === FALSE && i > m) {
						node = node[query.substring(m, i)];
						m = i + 1;
					}
					break;

				case LEFT_BRACKET:
					if (skip === FALSE) {
						skip = LEFT_BRACKET;
						m = i + 1;
					}
					break;

				case RIGHT_BRACKET:
					if (skip === LEFT_BRACKET && i > m) {
						node = node[query.substring(m, i)];
						skip = FALSE;
						m = i + 2;
					}
					break;

				case DOUBLE_QUOTE:
				case SINGLE_QUOTE:
					if (skip === c && i > m) {
						node = node[query.substring(m, i)];
						skip = FALSE;
						m = i + 2;
					}
					else {
						skip = c;
						m = i + 1;
					}
					break;
			}
		}

		if (i > m) {
			node = node[query.substring(m, i)];
		}

		return node;
	}
});
/*
* TroopJS requirejs/json
* @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
*/
define('troopjs-requirejs/json',[
	"text",
	"troopjs-utils/select",
	"poly/json"
], function (text, select) {
	"use strict";

	var UNDEFINED;
	var NULL = null;
	var PATTERN = /(.+?)#(.+)$/;
	var buildMap = {};

	return {
		"load": function (name, req, load, config) {
			var key = name;
			var query = "";
			var matches;

			if ((matches = PATTERN.exec(name)) !== NULL) {
				name = matches[1];
				query = matches[2];
			}

			text.get(req.toUrl(name), function (source) {
				var compiled = select.call(JSON.parse(source), query);

				if (config.isBuild) {
					buildMap[key] = compiled;
				}

				load(compiled);
			}, load.error);
		},

		write : function (pluginName, moduleName, write) {
			if (moduleName in buildMap) {
				write.asModule(pluginName + "!" + moduleName, JSON.stringify(buildMap[moduleName]));
			}
		}
	};
});
