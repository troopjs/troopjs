/**
 *   ____ .     ____  ____  ____    ____.
 *   \   (/_\___\  (__\  (__\  (\___\  (/
 *   / ._/  ( . _   \  . /   . /  . _   \_
 * _/    ___/   /____ /  \_ /  \_    ____/
 * \   _/ \____/   \____________/   /
 *  \_t:_____r:_______o:____o:___p:/ [ troopjs - 3.0.0-1+6df27e5 ]
 *
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */

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
 * TroopJS composer/mixin/factory
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-composer/mixin/factory',[
	"module",
	"troopjs-utils/unique",
	"poly/object"
], function FactoryModule(module, unique) {
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
	var TYPES = "types";
	var NAME = "name";
	var RE_SPECIAL = /^(\w+)(?::(.+?))?\/([-_./\d\w\s]+)$/;
	var NOOP = function noop () {};
	var PRAGMAS = module.config().pragmas || [];
	var PRAGMAS_LENGTH = PRAGMAS[LENGTH];
	var factoryDescriptors = {};

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

	/**
	 * Creates new Decorator
	 * @private
	 * @class composer.mixin.factory.Decorator
	 * @param {Function} decorated Original function
	 * @param {Function} decorate Function to re-write descriptor
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
	 * Create a decorator function property to override the original one from prototype, that runs before
	 * the start of the former.
	 *
	 * @member composer.mixin.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the same arguments as with the original.
	 * @returns {composer.mixin.factory.Decorator}
	 */
	function before(decorated) {
		return new Decorator(decorated, before[DECORATE]);
	}

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
	 * Create a decorator function property to override the original one from prototype, that runs after
	 * the completion of the former.
	 *
	 * @member composer.mixin.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the return value from the original.
	 * @returns {composer.mixin.factory.Decorator}
	 */
	function after(decorated) {
		return new Decorator(decorated, after[DECORATE]);
	}

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
	 * Create a decorator function property to override the original one from prototype, that get passed the original
	 * function, eventually reach the maximum flexibility on execution flow.
	 *
	 * @member composer.mixin.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the original function as parameter.
	 * @returns {composer.mixin.factory.Decorator}
	 */
	function around(decorated) {
		return new Decorator(decorated, around[DECORATE]);
	}

	/**
	 *
	 * @param {Function} descriptor
	 * @returns {*}
	 */
	around[DECORATE] = function (descriptor) {
		descriptor[VALUE] = this[DECORATED](descriptor[VALUE] || NOOP);

		return descriptor;
	};

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
	var TYPE = "type";
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var TAIL = "tail";
	var NEXT = "next";
	var MODIFIED = "modified";

	return Base.extend(function EventEmitter() {
		this[HANDLERS] = {};
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event type.
		 * @param {String} type The event type to subscribe to.
		 * @param {Object} context The context to scope the callback to.
		 * @param {Function} callback The event listener function.
		 * @param {*} [data] Handler data
		 * @returns this
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
				handlers = handlers[type] = {};

				// Create head and tail
				handlers[HEAD] = handlers[TAIL] = handler = {};

				// Prepare handler
				handler[CALLBACK] = callback;
				handler[CONTEXT] = context;
				handler[DATA] = data;
			}

			// Set MODIFIED
			handlers[MODIFIED] = new Date().getTime();

			return me;
		},

		/**
		 * Remove callback(s) from a subscribed event type, if no callback is specified,
		 * remove all callbacks of this type.
		 *
		 * @param {String} type The event type subscribed to
		 * @param {Object} [context] The context to scope the callback to remove
		 * @param {Function} [callback] The event listener function to remove
		 * @returns this
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

				// Set MODIFIED
				handlers[MODIFIED] = new Date().getTime();
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
			var runner = sequence;

			// If event is a plain string, convert to object with props
			if (OBJECT_TOSTRING.call(event) === TOSTRING_STRING) {
				event = {};
				event[RUNNER] = runner;
				event[TYPE] = type;
			}
			// If event duck-types an event object we just override or use defaults
			else if (TYPE in event) {
				event[RUNNER] = runner = event[RUNNER] || runner;
				type = event[TYPE];
			}
			// Otherwise something is wrong
			else {
				throw Error("first argument has to be of type 'String' or have a '" + TYPE + "' property");
			}

			// Get or create handlers[type] as handlers
			handlers = type in handlers
				? handlers[type]
				: handlers[type] = {};

			// Return result from runner
			return runner.call(me, event, handlers, ARRAY_SLICE.call(arguments, 1));
		}
	});
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
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/base',[
	"../event/emitter",
	"when",
	"troopjs-utils/merge",
	"poly/array"
], function ComponentModule(Emitter, when, merge) {
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
	var EMITTER_PROTO = Emitter.prototype;
	var EMITTER_ON = EMITTER_PROTO.on;
	var EMITTER_OFF = EMITTER_PROTO.off;
	var CONFIGURATION = "configuration";
	var LENGTH = "length";
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
	var ON = "on";

	return Emitter.extend(function Component() {
		var me = this;
		var specials;
		var special;
		var i;
		var iMax;

		// Make sure we have SIG specials
		if ((specials = me.constructor.specials[SIG]) !== UNDEFINED) {
			// Iterate specials
			for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
				special = specials[i];

				me.on(special[NAME], special[VALUE]);
			}
		}

		// Set configuration
		me[CONFIGURATION] = {};
	}, {
		"displayName" : "core/component/base",

		"sig/initialize" : function onInitialize() {
			var me = this;
			var specials;
			var special;
			var i;
			var iMax;

			// Make sure we have ON specials
			if ((specials = me.constructor.specials[ON]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					me.on(special[TYPE], special[VALUE]);
				}
			}
		},

		"sig/finalize" : function onFinalize() {
			var me = this;
			var specials;
			var special;
			var i;
			var iMax;

			// Make sure we have ON specials
			if ((specials = me.constructor.specials[ON]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					me.off(special[TYPE], special[VALUE]);
				}
			}
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
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"on": function on(event, callback, data) {
			var me = this;

			return EMITTER_ON.call(me, event, me, callback, data);
		},

		/**
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"off" : function off(event, callback) {
			var me = this;

			// Forward
			return EMITTER_OFF.call(me, event, me, callback);
		},

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
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/pubsub/hub',[
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

/*
 * TroopJS core/component/gadget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/gadget',[
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

/*
 * TroopJS browser/dom/constants
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/dom/constants',{
	"class" : "class",
	"id" : "id",
	"tag" : "tag",
	"universal" : "universal",
	"indexes" : "indexes",
	"indexed" : "indexed",
	"indexer" : "indexer",
	"querySelectorAll": "querySelectorAll",
	"matchesSelector": "matchesSelector"
});
/*
 * TroopJS browser/dom/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/dom/config',[ "module", "./constants", "troopjs-utils/merge", "jquery" ], function (module, CONSTANTS, merge, $) {
	var config = {};

	config[CONSTANTS["querySelectorAll"]] = $.find;

	config[CONSTANTS["matchesSelector"]] = $.find.matchesSelector;

	return merge.call(config, module.config());
});
/*
 * TroopJS browser/dom/selector
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Heavily influenced by selector-set (https://github.com/josh/selector-set/) Copyright 2013 Joshua Peek
 */
define('troopjs-browser/dom/selector',[ "troopjs-composer/mixin/factory", "./constants", "./config" ], function (Factory, CONSTANTS, CONFIG) {
	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var LENGTH = "length";
	var INDEXES = CONSTANTS["indexes"];
	var INDEXED = CONSTANTS["indexed"];
	var INDEXER = CONSTANTS["indexer"];
	var CLASS = CONSTANTS["class"];
	var ID = CONSTANTS["id"];
	var TAG = CONSTANTS["tag"];
	var UNIVERSAL = CONSTANTS["universal"];
	var SLASH = "\\";
	var SPACE = " ";
	var STAR = "*";
	var POUND = "#";
	var PERIOD = ".";
	var COUNT = "count";
	var BASEVAL = "baseVal";
	var RE_SPACE = /\s+/;
	var querySelectorAll = CONFIG[CONSTANTS["querySelectorAll"]];
	var matchesSelector = CONFIG[CONSTANTS["matchesSelector"]];

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
	 * Gets last token from selector
	 * @private
	 * @param {String} selector CSS selector
	 * @return {String} last token
	 */
	function tail(selector) {
		var start = selector[LENGTH];
		var stop = start;
		var c = selector[--start];
		var skip = false;

		step: while (start > 0) {
			switch (c) {
				case SPACE:
					/* Marks EOT if:
					 * * Next c is not SLASH
					 * * Not in skip mode
					 */
					if ((c = selector[--start]) !== SLASH && !skip) {
						// We're 2 steps passed the end of the selector so we should adjust for that
						start += 2;

						// Break the outer while
						break step;
					}
					break;

				case "]":
					/* Marks begin of skip if:
					 * * Next c is not SLASH
					 */
					skip = (c = selector[--start]) !== SLASH;
					break;

				case "[":
					/* Marks end of skip if:
					 * * Next c is not SLASH
					 */
					if (!(skip = (c = selector[--start]) === SLASH)) {
						// Compensate for start already decreased
						stop = start + 1;
					}
					break;

				case POUND:
				case PERIOD:
					/* Marks stop if:
					 * * Next c is not SLASH
					 * * Next c is not SPACE
					 * * Not in skip mode
					 */
					if ((c = selector[--start]) !== SLASH && c !== SPACE && !skip) {
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

		return selector.substring(start, stop);
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

	var Selector = Factory(function () {
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
		"matches": function (element) {
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
	var ARRAY_UNSHIFT = ARRAY_PROTO.unshift;
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
	 * @param {Mixed...} [arg] The params that used to start the widget.
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
			var re = /[\s,]*(((?:\w+!)?([\w\d_\-\/\.]+)(?:#[^(\s]+)?)(?:\(([^\)]+)\))?)/g;
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
			var re = /[\s,]*([\w_\-\/\.]+)(?:@(\d+))?/g;
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
	"jquery",
	"troopjs-core/component/gadget",
	"troopjs-utils/merge",
	"./runner/sequence",
	"../loom/config",
	"../loom/weave",
	"../loom/unweave",
	"troopjs-jquery/destroy"
], function WidgetModule($, Gadget, merge, sequence, LOOM_CONF, weave, unweave) {
	"use strict";

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var ARRAY_PUSH = Array.prototype.push;
	var $GET = $.fn.get;
	var TYPEOF_FUNCTION = "function";
	var $ELEMENT = "$element";
	var $HANDLER = "$handler";
	var DOM = "dom";
	var FEATURES = "features";
	var VALUE = "value";
	var NAME = "name";
	var TYPES = "types";
	var LENGTH = "length";
	var $WEFT = LOOM_CONF["$weft"];
	var SELECTOR_WEAVE = "[" + LOOM_CONF["weave"] + "]";
	var SELECTOR_WOVEN = "[" + LOOM_CONF["woven"] + "]";


	/*
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @private
	 * @param $fn jQuery method
	 * @returns {Function} proxied render
	 */
	function $render($fn) {
		/*
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
			return weave.call($fn.call(me[$ELEMENT],
				typeof contents === TYPEOF_FUNCTION ? contents.apply(me, ARRAY_SLICE.call(arguments, 1)) : contents
			).find(SELECTOR_WEAVE));
		}

		return render;
	}

	/**
	 * Base DOM component attached to an element, that takes care of widget instantiation.
	 * @class browser.component.widget
	 */
	return Gadget.extend(function ($element, displayName) {
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

		/*
		 * Handles DOM events by emitting them
		 * @private
		 * @param {jQuery.Event} $event jQuery Event
		 * @param {...*} [args] Additional handler arguments
		 * @returns {*} Result from last executed handler
		 */
		me[$HANDLER] = function $handler($event, args) {
			// Redefine args
			args = [ {
				"type" : "dom/" + $event.type,
				"runner" : sequence
			} ];

			// Push original arguments on args
			ARRAY_PUSH.apply(args, arguments);

			// Return result of emit
			return me.emit.apply(me, args);
		};

		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}

	}, {
		"displayName" : "browser/component/widget",

		"sig/initialize" : function onInitialize() {
			var me = this;
			var $element = me[$ELEMENT];
			var $handler = me[$HANDLER];
			var special;
			var specials;
			var i;
			var iMax;

			// Make sure we have DOM specials
			if ((specials = me.constructor.specials[DOM]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					// Add special to emitter
					me.on(special[NAME], special[VALUE], special[FEATURES]);
				}

				// Bind $handler to $element
				$element.on(specials[TYPES].join(" "), null, me, $handler);
			}
		},

		"sig/finalize" : function onFinalize() {
			var me = this;
			var $element = me[$ELEMENT];
			var $handler = me[$HANDLER];
			var special;
			var specials;
			var i;
			var iMax;

			// Make sure we have DOM specials
			if ((specials = me.constructor.specials[DOM]) !== UNDEFINED) {
				// Iterate specials
				for (i = 0, iMax = specials[LENGTH]; i < iMax; i++) {
					special = specials[i];

					// Remove special from emitter
					me.off(special[NAME], special[VALUE]);
				}

				// Unbind $handler from $element
				$element.off(specials[TYPES].join(" "), null, $handler);
			}
		},

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
		 * Unweaves all woven children widgets including the widget itself.
		 * @returns {Promise} Promise of completeness of unweaving all widgets.
		 */
		"unweave" : function () {
			var woven = this[$ELEMENT].find(SELECTOR_WOVEN);

			// Unweave myself only if I am woven.
			if(this[$WEFT]) {
				woven = woven.addBack();
			}

			return unweave.apply(woven, arguments);
		},

		/**
		 * Destroy DOM handler
		 */
		"dom/destroy" : function () {
			this.unweave();
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
		 * @returns {Mixed}
		 */
		"hub/registry/add" : function onAdd(service) {
			return this.add(service);
		},

		/**
		 * Hub event for removing service.
		 * @event
		 * @param {core.component.service} service
		 * @returns {Mixed}
		 */
		"hub/registry/remove" : function onRemove(service) {
			return this.remove(service);
		},

		/**
		 * Hub event for finding service(s).
		 * @event
		 * @param {String} pattern
		 * @returns {Mixed}
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
 * TroopJS core/net/uri
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Parts of code from parseUri 1.2.2 Copyright Steven Levithan <stevenlevithan.com>
 */
define('troopjs-core/net/uri',[ "../mixin/base" ], function URIModule(Base) {
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

	/**
	 * Parse the **query** part of an URI.
	 * @class core.net.uri.Query
	 */
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

	/**
	 * Serialize the query in url encoded format like `key1=value1&key2=value2` without having it encoded.
	 * @member core.net.uri.Query
	 */
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

	/**
	 * Parse the **path** part of an URI.
	 * @class core.net.uri.Path
	 */
	function Path(arg) {
		// Extend on the instance of array rather than subclass it
		var result = [];

		result.toString = Path.toString;

		ARRAY_PUSH.apply(result, TOSTRING.call(arg) === TOSTRING_ARRAY
			? arg
			: STRING_SPLIT.call(arg, "/"));

		return result;
	}

	/**
	 * Serialize the URI path using back-slash as delimiter.
	 * @member core.net.uri.Path
	 */
	Path.toString = function PathToString() {
		return this.join("/");
	};

	/**
	 * @class core.net.uri
	 * @extends core.mixin.base
	 * The universal URI parser and serializer.
	 */
	var URI = Base.extend(function URI(str) {
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
		"displayName" : "core/net/uri",

		/**
		 * Serialize into the URI string.
		 * @return {String}
		 */
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

/*
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

	// hack based on this: http://webreflection.blogspot.com/2009/01/32-bytes-to-know-if-your-browser-is-ie.html
	var _isIE = '\v' == 'v';

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

	/**
	 * jQuery event fired ever when the URL hash has changed.
	 * @member $
	 * @event hashchange
	 */
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

/*
 * TroopJS browser/hash/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/hash/widget',[
	"../component/widget",
	"troopjs-core/net/uri",
	"troopjs-jquery/hashchange"
], function (Widget, URI) {
	"use strict";

	/**
	 * Widget lives on the window object that handles `window.location.hash` changes.
	 * @class browser.hash.widget
	 */
	var $ELEMENT = "$element";
	var HASH = "_hash";
	var RE = /^#/;

	return Widget.extend({
		"displayName" : "browser/hash/widget",

		"sig/start" : function () {
			this[$ELEMENT].trigger("hashchange");
		},

		"dom/hashchange" : function ($event) {
			var me = this;
			var $element = me[$ELEMENT];

			// Create URI
			var uri = URI($element.get(0).location.hash.replace(RE, ""));

			// Convert to string
			var hash = uri.toString();

			// Did anything change?
			if (hash !== me[HASH]) {
				// Store new value
				me[HASH] = hash;

				// Retrigger URICHANGE event
				$element.trigger("urichange", [ uri ]);
			}
			else {
				// Prevent further hashchange handlers from receiving this
				$event.stopImmediatePropagation()
			}
		},

		/**
		 * Event that changes the URI hash of the current page.
		 * @param {Object} $event The jQuery DOM event.
		 * @param {String|core.net.uri} uri The new URI to change the hash to.
		 * @param {Boolean} silent Change the hash silently without triggering @{link #event-urichange} event.
		 */
		"dom/hashset" : function ($event, uri, silent) {
			var me = this;
			var hash = uri.toString();

			if (silent === true) {
				me[HASH] = hash;
			}

			me[$ELEMENT].get(0).location.hash = hash;
		}

		/**
		 * Custom DOM event that tells the page URI hash has changed.
		 * @event urichange
		 */

	});
});

/*
 * TroopJS browser/mvc/route/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/mvc/route/widget',[ "../../component/widget" ], function (Widget) {
	"use strict";

	var $ELEMENT = "$element";
	var DISPLAYNAME = "displayName";
	var SET = "/set";

	function setRoute(uri) {
		/* jshint validthis:true */
		this[$ELEMENT].trigger("hashset", [ uri ]);
	}

	return Widget.extend({
		"displayName" : "browser/mvc/route/widget",

		"sig/initialize" : function () {
			var me = this;

			me.subscribe(me[DISPLAYNAME] + SET, setRoute);
		},

		"sig/finalize" : function () {
			var me = this;

			me.unsubscribe(me[DISPLAYNAME] + SET, setRoute);
		},

		"dom/urichange" : function ($event, uri) {
			var me = this;

			me.publish(me[DISPLAYNAME], uri, $event);
		}
	});
});

define('troopjs/version',[],function () { return "3.0.0-1"; });
define(['troopjs/version'], function (main) { return main; });