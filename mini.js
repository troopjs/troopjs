/**
 *   ____ .     ____  ____  ____    ____.
 *   \   (/_\___\  (__\  (__\  (\___\  (/
 *   / ._/  ( . _   \  . /   . /  . _   \_
 * _/    ___/   /____ /  \_ /  \_    ____/
 * \   _/ \____/   \____________/   /
 *  \_t:_____r:_______o:____o:___p:/ [ troopjs - 3.0.0-1+e2850e9 ]
 *
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */

/**
 * TroopJS utils/unique
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/unique',[],function UniqueModule() {
	

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
/*
 * TroopJS core/component/factory
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/factory',[
	"module",
	"troopjs-utils/unique",
	"poly/object"
], function ComponentFactoryModule(module, unique) {
	

	/**
	 * The factory module establishes the fundamental object composing in TroopJS:
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
	 * @class core.component.factory
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
	var NAME = "name";
	var RE_SPECIAL = /^(\w+)(?::(.+?))?\/([-_./\d\w\s]+)$/;
	var NOOP = function noop () {};
	var PRAGMAS = module.config().pragmas || [];
	var PRAGMAS_LENGTH = PRAGMAS[LENGTH];
	var factoryDescriptors = {};

	/**
	 * Sub classing from this component, and to instantiate it immediately.
	 * @member core.component.factory
	 * @static
	 * @inheritdoc core.component.factory#Factory
	 * @returns {Object} Instance of this class.
	 */
	function create() {
		/*jshint validthis:true*/
		return extend.apply(this, arguments)();
	}

	/**
	 * Sub classing from this component.
	 * @member core.component.factory
	 * @static
	 * @inheritdoc core.component.factory#Factory
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
	 * @class core.component.factory.Decorator
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
	 * @member core.component.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the same arguments as with the original.
	 * @returns {core.component.factory.Decorator}
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
	 * @member core.component.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the return value from the original.
	 * @returns {core.component.factory.Decorator}
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
	 * @member core.component.factory
	 * @static
	 * @param {Function} decorated The decorator function which receives the original function as parameter.
	 * @returns {core.component.factory.Decorator}
	 */
	function around(decorated) {
		return new Decorator(decorated, around[DECORATE]);
	}

	/**
	 *
	 * @param {Function} descriptor
	 * @returns {Mixed}
	 */
	around[DECORATE] = function (descriptor) {
		descriptor[VALUE] = this[DECORATED](descriptor[VALUE] || NOOP);

		return descriptor;
	};

	/*
	 * Returns a string representation of this constructor
	 * @member core.component.factory
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
	 * @member core.component.factory
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
/**
 * TroopJS utils/merge module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/merge',[ "poly/object" ], function MergeModule() {
	

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
/*
 * TroopJS core/component/base
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/base',[ "./factory", "when", "troopjs-utils/merge" ], function ComponentModule(Factory, when, merge) {
	

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

/*
 * TroopJS core/event/emitter
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/event/emitter',[ "../component/base", "when", "poly/array" ], function EventEmitterModule(Component, when) {
	

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
	 * ## Mutable event data
	 * Additional event data can be passed to listeners when calling @{link #emit}, which can be further altered by the
	 * returning value of the handler, depending on **event type** we're emitting:
	 *
	 *  - **foo[:pipleline]** (default) In a piplelined event, handler shall return **an array** of params, that is the input for the next handler.
	 *  - **foo:sequence**  In a sequential event, handler shall return **a single** param, that is appended to a list of params, that forms
	 *  the input for the next handler.
	 *
	 *  On the caller side, the return value of the {@link #emit} or {@link #reemit} call also depends on the event type described above:
	 *
	 *  - **foo[:pipleline]** (default) In a piplelined event, it will be **one value** that is the return value from the last handler.
	 *  - **foo:sequence**  In a sequential event, it will be **an array** that accumulated the return value from all of the handlers.
	 *
	 * ## Memorized emitting
	 * A fired event will memorize the event data yields from the last handler, for listeners that are registered
	 * after the event emitted that thus missing from the call, {@link #reemit} will compensate the call with memorized data.
	 *
	 * @class core.event.emitter
	 * @extends core.component.base
	 */

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

	/*
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

		/*
		 * Internal function for sequential execution of handlers handlers
		 * @private
		 * @param {Array} [args] result from previous handler callback
		 * @return {Promise} promise of next handler callback execution
		 */
		var next = function (args) {
			/*jshint curly:false*/
			var context;
			var handler;

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

	/*
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

		/*
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

	return Component.extend(function EventEmitter() {
		this[HANDLERS] = {};
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event.
		 * @param {String} event The event name to subscribe to.
		 * @param {Object} [context] The context to scope callbacks to.
		 * @param {Function} [callback] The event listener function.
		 * @returns this
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
		 * Remove listener(s) from a subscribed event, if no listener is specified,
		 * remove all listeners of this event.
		 *
		 * @param {String} event The event that the listener subscribes to.
		 * @param {Object} [context] The context that bind to the listener.
		 * @param {Function...} [listener] One more more callback listeners to remove.
		 * @returns this
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
		 * Trigger an event which notifies each of the listeners in sequence of their subscribing,
		 * optionally pass data values to the listeners.
		 *
		 * @param {String} event The event name to emit
		 * @param {Mixed...} [args] Data params that are passed to the listener function.
		 * @returns {Promise} promise Promise of the return values yield from the listeners at all.
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
		 * Re-emit any event that are **previously triggered**, any (new) listeners will be called with the memorized data
		 * from the previous event emitting procedure.
		 *
		 * 	// start widget1 upon the app loaded.
		 * 	app.on('load', function(url) {
		 * 		widget1.start(url);
		 * 	});
		 *
		 * 	// Emits the load event on app.
		 * 	app.emit('load', window.location.hash);
		 *
		 * 	// start of widget2 comes too late for the app start.
		 * 	app.on('load', function(url) {
		 * 		// Widget should have with the same URL as with widget1.
		 * 		widget2.start(url);
		 * 	});
		 *
		 * 	$.ready(function() {
		 * 		// Compensate the "load" event listeners that are missed.
		 * 		app.reemit();
		 * 	});
		 *
		 * @param {String} event The event name to re-emit, dismiss if it's the first time to emit this event.
		 * @param {Boolean} senile=false Whether to trigger listeners that are already handled in previous emitting.
		 * @param {Object} [context] The context object to scope this re-emitting.
		 * @param {Function...} [callback] One or more specific listeners that should be affected in the re-emitting.
		 * @returns this
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
		},

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} event to peek at
		 * @returns {*} Value in MEMORY
		 */
		"peek": function peek(event) {
			var me = this;
			var handlers = me[HANDLERS];
			var result;

			if (event in handlers) {
				handlers = handlers[event];

				if (MEMORY in handlers) {
					result  = handlers[MEMORY];
				}
			}

			return result;
		}
	});
});

/**
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/pubsub/hub',[ "../event/emitter" ], function HubModule(Emitter) {
	

	/**
	 * The centric "bus" that handlers publishing and subscription.
	 *
	 * **Note:** It's NOT necessarily to pub/sub on this module, prefer to
	 * use methods like {@link core.component.gadget#publish} and {@link core.component.gadget#subscribe}
	 * that are provided as shortcuts.
	 *
	 * @class core.pubsub.hub
	 * @singleton
	 * @extends core.event.emitter
	 */

	var COMPONENT_PROTOTYPE = Emitter.prototype;

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
		 * @inheritdoc #emit
		 * @method
		 */
		"publish" : COMPONENT_PROTOTYPE.emit,

		/**
		 * Re-emit a public event.
		 * @inheritdoc #reemit
		 * @method
		 */
		"republish" : COMPONENT_PROTOTYPE.reemit,

		"spy" : COMPONENT_PROTOTYPE.peek
	});
});

/*
 * TroopJS core/component/gadget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/gadget',[ "../event/emitter", "when", "../pubsub/hub" ], function GadgetModule(Emitter, when, hub) {
	

	/**
	 * Base component that provides events and subscriptions features.
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
	 * @extends core.event.emitter
	 */

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

		/*
		 * Signal handler for 'task'
		 * @param {Promise} task
		 * @returns {Promise}
		 */
		"sig/task" : function onTask(task) {
			return this.publish("task", task);
		},

		/**
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
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
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"on": function on(event) {
			var me = this;
			var args = [ event, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

			// Forward
			return ON.apply(me, args);
		},

		/**
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 */
		"off" : function off(event) {
			var me = this;
			var args = [ event, me ];

			// Add args
			ARRAY_PUSH.apply(args, ARRAY_SLICE.call(arguments, 1));

			// Forward
			return OFF.apply(me, args);
		},

		/**
		 * @inheritdoc core.pubsub.hub#publish
		 */
		"publish" : function publish() {
			return PUBLISH.apply(hub, arguments);
		},

		/**
		 * @inheritdoc core.pubsub.hub#republish
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
		 * @inheritdoc core.pubsub.hub#subscribe
		 * @localdoc Subscribe to public events from this component, forcing the context of which to be this component.
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
		 * @inheritdoc core.pubsub.hub#unsubscribe
		 * @localdoc Unsubscribe from public events in context of this component.
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

/*
 * TroopJS browser/loom/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/config',[ "module", "troopjs-utils/merge" ], function LoomConfigModule(module, merge) {
	

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
/**
 * TroopJS utils/getargs
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-utils/getargs',[],function GetArgsModule() {
	

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
/*
 * TroopJS browser/loom/weave
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/weave',[ "./config", "require", "when", "jquery", "troopjs-utils/getargs", "poly/array" ], function WeaveModule(config, parentRequire, when, $, getargs) {
	

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
			var re = /[\s,]*(([\w_\-\/\.]+)(?:\(([^\)]+)\))?)/g;
			var matches;

			/*
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
/*
 * TroopJS browser/loom/unweave
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/unweave',[ "./config", "when", "jquery", "poly/array" ], function UnweaveModule(config, when, $) {
	

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
/*
 * TroopJS browser/loom/woven
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/woven',[ "./config", "when", "jquery", "poly/array" ], function WovenModule(config, when, $) {
	
	var ARRAY_MAP = Array.prototype.map;
	var LENGTH = "length";
	var WOVEN = "woven";
	var $WARP = config["$warp"];

	/**
	 * Retrieve all or specific widget instances living on this element, that are
	 * created by {@link browser.loom.weave weaving}.
	 *
	 * @member browser.loom.woven
	 * @method woven
	 * @param {String...} [name] One or more name of the widget to narrow down.
	 * @returns {Promise} Promise to the completion of retrieving the woven widgets array.
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
 * TroopJS browser/loom/plugin
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/loom/plugin',[
	"jquery",
	"when",
	"./config",
	"./weave",
	"./unweave",
	"./woven",
	"troopjs-utils/getargs",
	"poly/array"
], function WeaveModule($, when, config, weave, unweave, woven, getargs) {
	

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

/*
 * TroopJS jquery/destroy
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-jquery/destroy',[ "jquery" ], function DestroyModule($) {
	

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

/*
 * TroopJS browser/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/component/widget',[ "troopjs-core/component/gadget", "jquery", "../loom/config", "../loom/weave", "../loom/unweave", "../loom/plugin", "troopjs-jquery/destroy" ], function WidgetModule(Gadget, $, config, weave, unweave) {
	

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


	/*
	 * Creates a proxy that executes 'handler' in 'widget' scope
	 * @private
	 * @param {Object} widget target widget
	 * @param {Function} handler target handler
	 * @returns {Function} proxied handler
	 */
	function eventProxy(widget, handler) {
		/*
		 * Creates a proxy of the outer method 'handler' that first adds 'topic' to the arguments passed
		 * @returns result of proxied hanlder invocation
		 */
		return function handlerProxy() {
			// Apply with shifted arguments to handler
			return handler.apply(widget, arguments);
		};
	}

	/*
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @private
	 * @param $fn jQuery method
	 * @returns {Function} proxied render
	 */
	function renderProxy($fn) {
		/*
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
			$fn.call(
				me[$ELEMENT],
				typeof contents === TYPEOF_FUNCTION ? contents.apply(me, args) : contents
			);
			return me.weave();
		}

		return render;
	}

	/**
	 * Base DOM component attached to an element, that takes care of widget instantiation.
	 * @class browser.component.widget
	 */
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

		"sig/task" : function onTask(task) {
			this[$ELEMENT].trigger("task", [ task ]);
		},

		/**
		 * Weaves all children of $element
		 * @returns {Promise} from weave
		 */
		"weave" : function () {
			// Publishing for weaving in, to notify parties that use a different loom configuration, e.g. other Troop versions.
			this.publish("weave", this);
			return weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
		},

		/**
		 * Unweaves all children of $element _and_ me
		 * @returns {Promise} from unweave
		 */
		"unweave" : function () {
			// Publishing for unweaveing.
			this.publish("unweave", this);
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
		 * @method
		 */
		"before" : renderProxy($.fn.before),

		/**
		 * Renders content and inserts it after $element
		 * @method
		 */
		"after" : renderProxy($.fn.after),

		/**
		 * Renders content and replaces $element contents
		 * @method
		 */
		"html" : renderProxy($.fn.html),

		/**
		 * Renders content and replaces $element contents
		 * @method
		 */
		"text" : renderProxy($.fn.text),

		/**
		 * Renders content and appends it to $element
		 * @method
		 */
		"append" : renderProxy($.fn.append),

		/**
		 * Renders content and prepends it to $element
		 * @method
		 */
		"prepend" : renderProxy($.fn.prepend)
	});
});

/*
 * TroopJS core/component/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/component/service',[ "./gadget" ], function ServiceModule(Gadget) {
	

	/**
	 * Base class for all service alike components, self-registering.
	 *
	 * @class core.component.service
	 * @extends core.component.gadget
	 */
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
/*
 * TroopJS core/registry/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-core/registry/service',[ "../component/service", "poly/object", "poly/array" ], function RegistryServiceModule(Service) {
	

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
	

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var REGISTRY = "registry";

	/*
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

	/**
	 * The application widget serves as top-most page component
	 * that bootstrap all other components registered.
	 * @class browser.application.widget
	 */
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
 * TroopJS core/net/uri
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Parts of code from parseUri 1.2.2 Copyright Steven Levithan <stevenlevithan.com>
 */
define('troopjs-core/net/uri',[ "../component/factory" ], function URIModule(Factory) {
	

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
/*
 * TroopJS jquery/hashchange
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Normalized hashchange event, ripped a _lot_ of code from
 * https://github.com/millermedeiros/Hasher
 */
define('troopjs-jquery/hashchange',[ "jquery" ], function HashchangeModule($) {
	

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

/**
 * TroopJS browser/hash/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/hash/widget',[
	"../component/widget",
	"troopjs-core/net/uri",
	"troopjs-jquery/hashchange"
], function (Widget, URI) {
	

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

		"dom/hashset" : function ($event, uri, silent) {
			var me = this;
			var hash = uri.toString();

			if (silent === true) {
				me[HASH] = hash;
			}

			me[$ELEMENT].get(0).location.hash = hash;
		}
	});
});
/**
 * TroopJS browser/mvc/route/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define('troopjs-browser/mvc/route/widget',[ "../../component/widget" ], function (Widget) {
	

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