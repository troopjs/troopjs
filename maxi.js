/**
 *   ____ .     ____  ____  ____    ____.
 *   \   (/_\___\  (__\  (__\  (\___\  (/
 *   / ._/  ( . _   \  . /   . /  . _   \_
 * _/    ___/   /____ /  \_ /  \_    ____/
 * \   _/ \____/   \____________/   /
 *  \_t:_____r:_______o:____o:___p:/ [ troopjs - 3.0.0-pr.2+fa7fcdb ]
 *
 * @license http://troopjs.mit-license.org/ © Mikael Karon
 */


define('troopjs/version',[], "3.0.0-pr.2+fa7fcdb");

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/merge',[ "poly/object" ], function MergeModule() {
	"use strict";

	/**
	 * @class util.merge
	 * @mixin Function
	 * @static
	 */

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
	 * @method constructor
	 * @param {...Object} [source] One or more source objects.
	 * @return {*} Merged object
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/mixin/config',[
	"module",
	"troopjs-util/merge"
], function (module, merge) {
	"use strict";

	/**
	 * Provides configuration for the {@link compose.mixin.factory}
	 * @class compose.mixin.config
	 * @protected
	 * @alias feature.config
	 */

	return merge.call({
		/**
		 * @cfg {Object[]} pragmas Pragmas used to rewrite methods before processing
		 * @cfg {RegExp} pragmas.pattern Matching pattern
		 * @cfg {String|Function} pragmas.replace Replacement String or function
		 * @protected
		 */
		"pragmas": []
	}, module.config());
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/mixin/decorator',[ "poly/object" ], function DecoratorModule() {
	"use strict";

	/**
	 * Decorator provides customized way to add properties/methods to object created by {@link compose.mixin.factory}.
	 * @class compose.mixin.decorator
	 */

	/**
	 * Creates a new decorator
	 * @method constructor
	 * @param {Function} decorate Function that defines how to override the original one.
	 * @param {Object} decorate.descriptor The object descriptor that is the current property.
	 * @param {String} decorate.name The property name.
	 * @param {Object} decorate.descriptors List of all property descriptors of the host object.
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
			 */
			"decorate": {
				"value": decorate
			}
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/unique',[],function UniqueModule() {
	"use strict";

	/**
	 * @class util.unique
	 * @mixin Function
	 * @static
	 */

	var LENGTH = "length";

	/**
	 * Function that calls on an array to produces a duplicate-free version of this array, using the specified comparator otherwise
	 * strictly equals(`===`) to test object equality.
	 * @method constructor
	 * @param {Function} [fn] The comparator function.
	 * @param {Function} fn.one One element to compare.
	 * @param {Function} fn.other The other element to compare with.
	 * @return {Number} New length of array
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
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/getargs',[],function GetArgsModule() {
	"use strict";

	/**
	 * @class util.getargs
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var STR_SUBSTRING = String.prototype.substring;
	var STR_SLICE = String.prototype.slice;
	var RE_STRING = /^(["']).*\1$/;
	var RE_BOOLEAN = /^(?:false|true)$/i;
	var RE_BOOLEAN_TRUE = /^true$/i;
	var RE_DIGIT = /^\d+$/;

	/**
	 * Function that calls on a String, to parses it as function parameters delimited by commas.
	 *
	 * 	" 1  , '2' , 3  ,false,5 "
	 *
	 * results in
	 *
	 * 	[ 1, "2", 3, false, 5]
	 *
	 *
	 * and
	 *
	 * 	"'1, 2 ',  3,\"4\", 5 "
	 *
	 * results in
	 *
	 * 	[ "1, 2 ", 3, "4", 5 ]
	 *
	 * Also handles named parameters.
	 *
	 * 	"1, two=2, 3, 'key.four'=4, 5"
	 *
	 * results in
	 *
	 * 	result = [1, 2, 3, 4, 5]
	 * 	result["two"] === result[1]
	 * 	result["key.four"] === result[3]
	 *
	 * @method constructor
	 * @return {Array} the array of parsed params.
	 */
	return function getargs() {
		var me = this;
		var values = [];
		var from;
		var to;
		var index;
		var length;
		var quote = false;
		var key;
		var c;

		// Try to extract value from the specified string range.
		function extract(from, to) {
			// Nothing captured.
			if (from === to)
				return;

			var value = STR_SUBSTRING.call(me, from, to);
			if (RE_STRING.test(value)) {
				value = STR_SLICE.call(value, 1, -1);
			}
			else if (RE_BOOLEAN.test(value)) {
				value = RE_BOOLEAN_TRUE.test(value);
			}
			else if (RE_DIGIT.test(value)) {
				value = +value;
			}

			// Store value by index.
			values.push(value);

			// Store value with key or just index
			if (key !== UNDEFINED) {
				values[key] = value;
				// Reset key
				key = UNDEFINED;
			}
		}

		// Iterate string
		for (index = from = to = 0, length = me.length; index < length; index++) {

			// Get char
			c = me.charAt(index);

			switch(c) {
				case "\"" :
				/* falls through */
				case "'" :
					// If we are currently quoted...
					if (quote === c) {
						// Stop quote
						quote = false;

						// Update to
						to = index + 1;
					}
					// Otherwise
					else if (quote === false) {
						// Start quote
						quote = c;

						// Update from/to
						from = to = index;
					}
					break;

				case " " :
				/* falls through */
				case "\t" :
					// Continue if we're quoted
					if (quote) {
						to = index + 1;
						break;
					}

					// Update from/to
					if (from === to) {
						from = to = index + 1;
					}
					break;

				case "=":
					// Continue if we're quoted
					if (quote) {
						to = index + 1;
						break;
					}

					// If we captured something...
					if (from !== to) {
						// Extract substring
						key = STR_SUBSTRING.call(me, from, to);

						if (RE_STRING.test(key)) {
							key = STR_SLICE.call(key, 1, -1);
						}
					}

					from = index + 1;
					break;

				case "," :
					// Continue if we're quoted
					if (quote) {
						to = index + 1;
						break;
					}

					// If we captured something...
					extract(from, to);

					// Update from/to
					from = to = index + 1;
					break;

				default :
					// Update to
					to = index + 1;
			}
		}

		// If we captured something...
		extract(from, to);

		return values;
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/mixin/factory',[
	"./config",
	"./decorator",
	"troopjs-util/unique",
	"troopjs-util/getargs",
	"poly/object"
], function FactoryModule(config, Decorator, unique, getargs) {
	"use strict";

	/**
	 * The factory module establishes the fundamental object composition in TroopJS:
	 *
	 *  - **First-class mixin** based on prototype, that supports deterministic multiple inheritance that:
	 *    - Eliminating the frustrating issues from multi-tiered, single-rooted ancestry;
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
	 * @class compose.mixin.factory
	 * @mixin compose.mixin.config
	 * @static
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
	var ARGS = "args";
	var TYPE = "type";
	var TYPES = "types";
	var NAME = "name";
	var PRAGMAS = config["pragmas"];

	// A special must be in form of a function call (ended in parenthesis), and have an optional type following a slash,
	// <special>[/<type>](<arguments>)
	// e.g. sig/start(), hub(foo/bar/baz)
	var RE = /^(.*?)(?:\/([^\(]+))?\((.*)\)$/;

	/**
	 * Instantiate immediately after extending this constructor from multiple others constructors/objects.
	 * @method create
	 * @static
	 * @param {...(Function|Object)} mixin One or more constructors or objects to be mixed in.
	 * @return {Object} Object instance created out of the mixin of constructors and objects.
	 */
	function create(mixin) {
		/*jshint validthis:true*/
		return extend.apply(this, arguments)();
	}

	function extend(mixin) {
		/*jshint validthis:true*/
		var args = [ this ];
		ARRAY_PUSH.apply(args, arguments);
		return Factory.apply(null, args);
	}

	function ConstructorToString() {
		var me = this;
		var prototype = me[PROTOTYPE];

		return DISPLAYNAME in prototype
			? prototype[DISPLAYNAME]
			: OBJECT_TOSTRING.call(me);
	}

	/**
	 * Create a new constructor or to extend an existing one from multiple others constructors/objects.
	 * @method constructor
	 * @static
	 * @param {...(Function|Object)} mixin One or more constructors or objects to be mixed in.
	 * @return {compose.mixin} Object class created out of the mixin of constructors and objects.
	 */
	function Factory (mixin) {
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
				for (k = 0; k < PRAGMAS[LENGTH]; k++) {
					// Get pragma
					pragma = PRAGMAS[k];

					// Process name with pragma, break if replacement occurred
					if ((name = name.replace(pragma.pattern, pragma.replace)) !== nameRaw) {
						break;
					}
				}

				// Check if this matches a SPECIAL signature
				if ((matches = RE.exec(name))) {
					// Create special
					special = {};

					// Set special properties
					special[GROUP] = group = matches[1];
					// An optional type.
					if (type = matches[2]) {
						special[TYPE] = type;
					}
					special[NAME] = group + (type ? "/" + type : "");
					special[ARGS] = getargs.call(matches[3] || "");

					// If the VALUE of the special does not duck-type Function, we should not store it
					if (OBJECT_TOSTRING.call(special[VALUE] = arg[nameRaw]) !== "[object Function]") {
						continue;
					}

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

			// Create an index for each type.
			// TODO: In the future we might want to index each nested sub type.
			if (type) {
				// Get or create types object
				types = TYPES in group
									? group[TYPES]
									: group[TYPES] = [];

				// Get or create type object
				type = type in group
								 ? group[type]
								 : group[types[types[LENGTH]] = type] = specials[name] = [];

				type[type[LENGTH]] = special;
			}

			// Store special in group/type
			group[group[LENGTH]] = special;
		}

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

	return Factory;
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/methods',[], function SinkMethodModule() {
	return [ "assert", "debug", "dir", "error", "info", "log", "time", "timeEnd", "trace", "warn" ]
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/console',[
	"./methods",
	"poly/array",
	"poly/function"
], function ConsoleModule(METHODS) {
	"use strict";

	/**
	 * This class implements the {@link log.console} API and can acts like a sink for {@link log.sink.forward}.
	 * @localdoc
	 * On platforms where the native `console` object doesn't support the full {@link log.console} API,
	 * this class acts like a polyfill for the missing methods.
	 * @class log.sink.console
	 * @implement log.console
	 * @singleton
	 * @alias feature.logger
	 */

	/**
	 * Creates a poly-filled version of the console object
	 * @method constructor
	 * @param {console} console Client console object
	 * @ignore
	 */
	return (function (console) {
		var me = this;
		var nop = function () {};

		METHODS.forEach(function (method) {
			me[method] = this.call(console[method] || nop, console);
		}, Function.prototype.bind);

		return me;
	}).call({}, ( this || window ).console || {});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/logger',[ "./sink/console" ], function LoggerModule(logger) {
	"use strict";

	/**
	 * This is a _virtual_ class that under normal circumstances is an alias for the {@link log.sink.console} sink.
	 *
	 * If you want to change logger sink in your application you should use the [requirejs map config](http://requirejs.org/docs/api.html#config-map)
	 * to map this class to any module that implements the {@link log.console} API.
	 *
	 * An example configuration that would change the logger to {@link log.sink.null} would look like this:
	 *
	 *     requirejs.config({
	 *       "map": {
	 *         "*": {
	 *           "troopjs-log/logger": "troopjs-log/null"
	 *         }
	 *       }
	 *     });
	 *
	 * @class log.logger
	 * @implement log.console
	 * @singleton
	 * @alias feature.logger
	 */

	return logger;
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/mixin/base',[
	"troopjs-compose/mixin/factory",
	"troopjs-log/logger"
], function ObjectBaseModule(Factory, logger) {
	var INSTANCE_COUNTER = 0;
	var INSTANCE_COUNT = "instanceCount";

	/**
	 * Base object with instance count.
	 * @class core.mixin.base
	 * @implement compose.mixin
	 * @mixin log.logger
	 */

	/**
	 * @method create
	 * @static
	 * @inheritable
	 * @inheritdoc
	 * @return {core.mixin.base} Instance of this class
	 */

	/**
	 * @method extend
	 * @static
	 * @inheritable
	 * @inheritdoc
	 * @return {core.mixin.base} The extended subclass
	 */

	/**
	 * Creates a new component instance
	 * @method constructor
	 */
	return Factory(function ObjectBase() {
		// Update instance count
		this[INSTANCE_COUNT] = ++INSTANCE_COUNTER;
	}, logger, {
		/**
		 * Instance counter
		 * @private
		 * @readonly
		 * @property {Number}
		 */
		"instanceCount" : INSTANCE_COUNTER,

		/**
		 * The hierarchical namespace for this component that indicates it's functionality.
		 * @private
		 * @readonly
		 * @property {String}
		 */
		"displayName" : "core/mixin/base",

		/**
		 * Gives string representation of this component instance.
		 * @return {String} {@link #displayName}`@`{@link #instanceCount}
		 * @protected
		 */
		"toString" : function _toString() {
			var me = this;

			return me.displayName + "@" + me[INSTANCE_COUNT];
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/event/runner/sequence',[ "when" ], function SequenceModule(when) {
	"use strict";

	/**
	 * @class core.event.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **asynchronously** in "sequence", passing to each handler the same arguments from emitting.
	 * @return {Promise}
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

		/**
		 * Internal function for sequential execution of candidates
		 * @ignore
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/event/emitter',[
	"../mixin/base",
	"./runner/sequence"
], function EventEmitterModule(Base, sequence) {
	"use strict";

	/**
	 * This event module is heart of all TroopJS event-based whistles, from the API names it's aligned with Node's events module,
	 * while behind the regularity it's powered by a highly customizable **event runner** mechanism, which makes it supports for both:
	 *
	 *  - **synchronous event**: all your event handlers are run in a single loop.
	 *  - **async event with promise**: you can return a promise where the next handler will be called upon the
	 *  completion of that promise.
	 *
	 * Event runner can even determinate the **parameters passing** strategy among handlers, which forms in two flavours:
	 *
	 *  - sequence: where each handler receives the arguments passed to {@link #method-emit}.
	 *  - pipeline: where a handler receives the return value of the previous one.
	 *
	 * @class core.event.emitter
	 * @extend core.mixin.base
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
	 * @method constructor
	 * @inheritdoc
	 */
	return Base.extend(function Emitter() {
		/**
		 * Handlers attached to this component, addressable either by key or index
		 * @protected
		 * @readonly
		 * @property {Array} handlers
		 */
		this[HANDLERS] = [];
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event type.
		 * @chainable
		 * @param {String} type The event type to subscribe to.
		 * @param {Object} context The context to scope the callback to.
		 * @param {Function} callback The event listener function.
		 * @param {*} [data] Handler data
		 */
		"on" : function on(type, context, callback, data) {
			var me = this;
			var handlers;
			var handler;

			// Get callback from next arg
			if (callback === UNDEFINED) {
				throw new Error("no callback provided");
			}

			// Have handlers
			if ((handlers = me[HANDLERS][type]) !== UNDEFINED) {
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
				// Get HANDLERS
				handlers = me[HANDLERS];

				// Create type handlers
				handlers = handlers[handlers[LENGTH]] = handlers[type] = {};

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
		 * @chainable
		 * @param {String} type The event type subscribed to
		 * @param {Object} [context] The context to scope the callback to remove
		 * @param {Function} [callback] The event listener function to remove
		 */
		"off" : function off(type, context, callback) {
			var me = this;
			var handlers;
			var handler;
			var head;
			var tail;

			// Have handlers
			if ((handlers = me[HANDLERS][type]) !== UNDEFINED) {
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
		 * @return {*} Result returned from runner.
		 */
		"emit" : function emit(event, args) {
			var me = this;
			var type = event;
			var handlers;
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

			// Get handlers[type] as handlers
			if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
				// Get HANDLERS
				handlers = me[HANDLERS];

				// Create type handlers
				handlers = handlers[handlers[LENGTH]] = handlers[type] = {};

				// Prepare handlers
				handlers[TYPE] = type;
			}

			// Return result from runner
			return runner.call(me, event, handlers, ARRAY_SLICE.call(arguments, 1));
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/runner/sequence',[ "poly/array" ], function SequenceModule() {
	"use strict";

	/**
	 * @class core.component.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var HEAD = "head";
	var NEXT = "next";
	var CALLBACK = "callback";
	var CONTEXT = "context";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **synchronously** in "sequence", passing to each handler the same arguments from emitting.
	 * @return {*[]} Result from each executed handler
	 */
	return function sequence(event, handlers, args) {
		var context = event[CONTEXT];
		var callback = event[CALLBACK];
		var candidate;
		var candidates = [];
		var candidatesCount = 0;
		var result;

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

			candidates[candidatesCount++] = candidate;
		}

		// Reduce and return
		return candidates.reduce(function (current, candidate) {
			// Store result if not UNDEFINED
			if (current !== UNDEFINED) {
				result = current;
			}

			// If result is _not_ false, return result of candidate[CALLBACK], otherwise just false
			return result !== false
				? candidate[CALLBACK].apply(candidate[CONTEXT], args)
				: result;
		}, UNDEFINED);
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/registry/component',[
	"../mixin/base",
	"poly/array"
], function RegistryModule(Base) {
	"use strict";

	/**
	 * A light weight implementation to register key/value pairs by key and index
	 * @class core.registry.component
	 * @extend core.mixin.base
	 */

	var UNDEFINED;
	var LENGTH = "length";
	var INDEX = "index";
	var KEY = "key";
	var VALUE = "value";
	var INDEX_KEY = "index_key";
	var INDEX_POS = "index_pos";
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_STRING = "[object String]";

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Base.extend(function Registry() {
		/**
		 * Registry key storage
		 * @private
		 * @readonly
		 * @property {Object[]} index_key
		 * @property {String} index_key.key Entry key
		 * @property {Number} index_key.index Entry index
		 * @property {*} index_key.value Entry value
		 */
		this[INDEX_KEY] = {};

		/**
		 * Registry pos storage
		 * @private
		 * @readonly
		 * @property {Object[]} index_pos
		 * @property {String} index_pos.key Entry key
		 * @property {Number} index_pos.index Entry index
		 * @property {*} index_pos.value Entry value
		 */
		this[INDEX_POS] = [];
	}, {
		"displayName": "core/registry/component",

		/**
		 * Either gets or puts values into the registry.
		 *
		 * - If no key is provided, all entries in the registry are returned.
		 * - If no value is provided the current value for key is returned.
		 * - If value is provided it replaces the current value for the key
		 * @param {String|Number} [key] Entry key or index
		 * @param {*} [value] Entry value
		 * @return {*} All values if no key, current value for key if no value provided, otherwise the provided value if a new entry is created
		 * @throws Error if a new entry is created and key is not of type String
		 */
		"access": function access(key, value) {
			var index_key = this[INDEX_KEY];
			var index_pos = this[INDEX_POS];
			var result;
			var argc;

			// Reading _all_
			if ((argc = arguments[LENGTH]) === 0) {
				result = index_pos.map(function (item) {
					return item[VALUE];
				});
			}
			else {
				result = (typeof key === 'number' ? index_pos : index_key)[key];

				// Reading
				if (argc === 1) {
					result = result !== UNDEFINED ? result[VALUE] : UNDEFINED;
				}
				// Writing
				else {
					// Replace existing entry
					if (result !== UNDEFINED) {
						result = result[VALUE] = value;
					}
					// Check type of key (as now we're creating a new one)
					else if (OBJECT_TOSTRING.call(key) !== TOSTRING_STRING) {
						throw Error("key has to be of type String");
					}
					// Create new entry
					else {
						result = {};
						result = index_key[result[KEY] = key] = index_pos[result[INDEX] = index_pos[LENGTH]] = result;
						result = result[VALUE] = value;
					}
				}
			}

			return result;
		},

		/**
		 * Removes entries from the registry
		 * TODO: Fixed screwed up index when item is removed from registry.
		 *
		 * - If no key is provided, all entries in the registry are removed.
		 * - Otherwise only the corresponding entry for key is removed.
		 * @param {String|Number} [key] Entry key or index
		 *
		 */
		"remove": function remove(key) {
			var me = this;
			var result;
			var index_key = me[INDEX_KEY];
			var index_pos = me[INDEX_POS];

			// Remove all entries
			if (arguments[LENGTH] === 0) {
				me[INDEX_KEY] = {};
				me[INDEX_POS] = [];
			}
			// Remove entry by key
			else if ((result = index_key[key]) !== UNDEFINED) {
				delete index_key[result[KEY]];
				delete index_pos[result[INDEX]];
			}
		},

		"compact": function compact() {

		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/runner/pattern',[], function PatternModule() {
return /^(?:initi|fin)alized?$/;
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/runner/pipeline',[
	"./pattern",
	"when"
], function PipelineModule(RE_PHASE, when) {
	"use strict";

	/**
	 * @class core.pubsub.runner.pipeline
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

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

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that filters and executes candidates in pipeline without overlap
	 * @return {Promise}
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

		/**
		 * Internal function for piped execution of candidates candidates
		 * @ignore
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
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/from',[ "../mixin/decorator" ], function FromDecoratorModule(Decorator) {
	"use strict";

	/**
	 * @class compose.decorator.from
	 * @static
	 * @alias feature.decorator
	 */

	var UNDEFINED;
	var VALUE = "value";
	var PROTOTYPE = "prototype";

	/**
	 * Create a decorator that is to lend from a particular property from this own or the other factory.
	 * @method constructor
	 * @param {Function} [which] The other class from which to borrow the method, otherwise to borrow from the host class.
	 * @param {String} [prop] The property name to borrow from, otherwise to borrow the same property name.
	 * @return {compose.mixin.decorator}
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/hub',[
	"../event/emitter",
	"./runner/pipeline",
	"troopjs-compose/decorator/from"
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
	 * use methods like {@link core.component.gadget#publish publish} and {@link core.component.gadget#subscribe subscribe}
	 * that are provided as shortcuts.
	 *
	 * @class core.pubsub.hub
	 * @extend core.event.emitter
	 * @singleton
	 */

	var UNDEFINED;
	var MEMORY = "memory";
	var HANDLERS = "handlers";
	var RUNNER = "runner";
	var TYPE = "type";

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	/**
	 * @method on
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method off
	 * @inheritdoc
	 * @private
	 */

	/**
	 * @method emit
	 * @inheritdoc
	 * @private
	 */

	return Emitter.create({
		"displayName": "core/pubsub/hub",

		/**
		 * Listen to an event that are emitted publicly.
		 * @chainable
		 * @inheritdoc #on
		 * @method
		 */
		"subscribe" : from("on"),

		/**
		 * Remove a public event listener.
		 * @chainable
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
		 * @return {Promise}
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
		 * @return {*} Value in MEMORY
		 */
		"peek": function peek(type, value) {
			var handlers;

			return (handlers = this[HANDLERS][type]) === UNDEFINED || !(MEMORY in handlers)
				? value
				: handlers[MEMORY];
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/registry',[
	"../registry/component",
	"../pubsub/hub"
], function ComponentRegistryModule(Registry, hub) {
	"use strict";

	/**
	 * @class core.component.registry
	 * @extend core.registry.component
	 * @singleton
	 */

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	return Registry.create(function ComponentRegistry() {
		var me = this;

		// Register the hub
		me.access(hub.toString(), hub);

		// Register ourselves
		me.access(me.toString(), me);
	}, {
		"displayName": "core/component/registry"
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/task/registry',[
	"../registry/component",
	"../component/registry"
], function TaskRegistryModule(Registry, componentRegistry) {
	"use strict";

	/**
	 * @class core.task.registry
	 * @extend core.registry.component
	 * @singleton
	 */

	/**
	 * @method create
	 * @static
	 * @hide
	 */

	/**
	 * @method extend
	 * @static
	 * @hide
	 */

	/**
	 * @method constructor
	 * @hide
	 */

	return Registry.create(function TaskRegistry() {
		var me = this;

		// Register ourselves
		componentRegistry.access(me.toString(), me);
	}, {
		"displayName": "core/task/registry"
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/around',[ "../mixin/decorator" ], function AroundDecoratorModule(Decorator) {
	"use strict";

	/**
	 * @class compose.decorator.around
	 * @static
	 * @alias feature.decorator
	 */

	var VALUE = "value";
	var NOP = function () {};

	/**
	 * Create a decorator that is to override an existing method.
	 * @method constructor
	 * @param {Function} func The decorator function which receives the original function as parameter and is supposed to
	 * return a function that is to replace the original.
	 * @return {compose.mixin.decorator}
	 */
	return function around(func) {
		return new Decorator(function (descriptor) {
			descriptor[VALUE] = func(descriptor[VALUE] || NOP);
			return descriptor;
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/base',[
	"../event/emitter",
	"./runner/sequence",
	"troopjs-compose/mixin/config",
	"./registry",
	"../task/registry",
	"troopjs-util/merge",
	"troopjs-compose/decorator/around",
	"when",
	"poly/array"
], function ComponentModule(Emitter, sequence, COMPOSE_CONF, componentRegistry, taskRegistry, merge, around, when) {
	"use strict";

	/**
	 * Imagine component as an object that has predefined life-cycle, with the following phases:
	 *
	 *   1. initialize
	 *   1. start
	 *   1. started
	 *   1. stop
	 *   1. finalize
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
	 *
	 * @class core.component.base
	 * @extend core.event.emitter
	 */

	var UNDEFINED;
	var FALSE = false;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var CONFIGURATION = "configuration";
	var RUNNER = "runner";
	var HANDLERS = "handlers";
	var HEAD = "head";
	var TAIL = "tail";
	var CONTEXT = "context";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var PHASE = "phase";
	var TASK = "task";
	var STOP = "stop";
	var INITIALIZE = "initialize";
	var STARTED = "started";
	var FINALIZED = "finalized";
	var FINISHED = "finished";
	var SIG = "sig";
	var SIG_SETUP = SIG + "/setup";
	var SIG_ADD = SIG + "/add";
	var SIG_REMOVE = SIG + "/remove";
	var SIG_TEARDOWN = SIG + "/teardown";
	var ON = "on";
	var EVENT_TYPE_SIG = new RegExp("^" + SIG + "/(.+)");

	/**
	 * Current lifecycle phase
	 * @readonly
	 * @protected
	 * @property {"initialized"|"started"|"stopped"|"finalized"} phase
	 */

	/**
	 * Initialize signal
	 * @event sig/initialize
	 * @localdoc Triggered when this component enters the initialize phase
	 * @param {...*} [args] Initialize arguments
	 */

	/**
	 * Start signal
	 * @event sig/start
	 * @localdoc Triggered when this component enters the start phase
	 * @param {...*} [args] Initialize arguments
	 */

	/**
	 * Stop signal
	 * @localdoc Triggered when this component enters the stop phase
	 * @event sig/stop
	 * @param {...*} [args] Stop arguments
	 */

	/**
	 * Finalize signal
	 * @event sig/finalize
	 * @localdoc Triggered when this component enters the finalize phase
	 * @param {...*} [args] Finalize arguments
	 */

	/**
	 * Setup signal
	 * @event sig/setup
	 * @localdoc Triggered when the first event handler of a particular type is added via {@link #method-on}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 * @param {*} [data]
	 */

	/**
	 * Add signal
	 * @event sig/add
	 * @localdoc Triggered when a event handler of a particular type is added via {@link #method-on}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 * @param {*} [data]
	 */

	/**
	 * Remove signal
	 * @event sig/remove
	 * @localdoc Triggered when a event handler of a particular type is removed via {@link #method-off}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 */

	/**
	 * Teardown signal
	 * @event sig/teardown
	 * @localdoc Triggered when the last event handler of type is removed for a particular type via {@link #method-off}.
	 * @since 3.0
	 * @preventable
	 * @param {Object} handlers
	 * @param {String} type
	 * @param {Function} callback
	 */

	/**
	 * Task signal
	 * @event sig/task
	 * @localdoc Triggered when this component starts a {@link #method-task}.
	 * @param {Promise} task Task
	 * @param {Object} task.context Task context
	 * @param {Date} task.started Task start date
	 * @param {String} task.name Task name
	 * @return {Promise}
	 */

	/**
	 * Handles the component start
	 * @handler sig/start
	 * @inheritdoc #event-sig/start
	 * @template
	 * @return {Promise}
	 */

	/**
	 * Handles the component stop
	 * @handler sig/stop
	 * @inheritdoc #event-sig/stop
	 * @template
	 * @return {Promise}
	 */

	/**
	 * Handles an event setup
	 * @handler sig/setup
	 * @inheritdoc #event-sig/setup
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event add
	 * @handler sig/add
	 * @inheritdoc #event-sig/add
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event remove
	 * @handler sig/remove
	 * @inheritdoc #event-sig/remove
	 * @template
	 * @return {*|Boolean}
	 */

	/**
	 * Handles an event teardown
	 * @handler sig/teardown
	 * @inheritdoc #event-sig/teardown
	 * @template
	 * @return {*|Boolean}
	 */

	// Add pragma for signals and events.
	COMPOSE_CONF.pragmas.push({
		"pattern": /^(?:sig|on)\/.+/,
		"replace": "$&()"
	});

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Emitter.extend(function Component() {
		var me = this;
		var specials = me.constructor.specials[SIG] || ARRAY_PROTO;

		// Iterate specials
		specials.forEach(function (special) {
			me.on(special[NAME], special[VALUE]);
		});

		/**
		 * Configuration for this component, access via {@link #configure}
		 * @private
		 * @readonly
		 * @property {Object} configuration
		 */
		me[CONFIGURATION] = {};
	}, {
		"displayName" : "core/component/base",

		/**
		 * Handles the component initialization.
		 * @inheritdoc #event-sig/initialize
		 * @localdoc Registers event handlers declared ON specials
		 * @handler
		 * @return {Promise}
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;

			// Register component
			componentRegistry.access(me.toString(), me);

			// Initialize ON specials
			return when.map(me.constructor.specials[ON] || ARRAY_PROTO, function (special) {
				return me.on(special[TYPE], special[VALUE]);
			});
		},

		/**
		 * Handles the component finalization.
		 * @inheritdoc #event-sig/finalize
		 * @localdoc Un-registers all handlers
		 * @handler
		 * @return {Promise}
		 */
		"sig/finalize" : function onFinalize() {
			var me = this;

			// Unregister component
			componentRegistry.remove(me.toString());

			// Finialize all handlers, in reverse
			return when.map(me[HANDLERS].reverse(), function (handlers) {
				return me.off(handlers[TYPE]);
			});
		},

		/**
		 * Handles a component task
		 * @handler sig/task
		 * @inheritdoc #event-sig/task
		 * @template
		 * @return {Promise}
		 */
		"sig/task": function onTask(task) {
			// Compute task key
			var key = task[NAME] + "@" + task[STARTED];

			// Register task with remove callback
			return taskRegistry.access(key, task.ensure(function () {
				taskRegistry.remove(key);
			}));
		},

		/**
		 * Add to the component {@link #configuration configuration}, possibly {@link util.merge merge} with the existing one.
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
		 * @return {Object} The new configuration.
		 */
		"configure" : function configure(config) {
			return merge.apply(this[CONFIGURATION], arguments);
		},

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 * @param {String} type The event type to subscribe to.
		 * @param {Function} callback The event listener function.
		 * @param {*} [data] Handler data
		 * @fires sig/setup
		 * @fires sig/add
		 */
		"on": around(function (fn) {
			return function on(type, callback, data) {
				var me = this;
				var event;
				var handlers;
				var result;

				// If this type is NOT a signal we don't have to event try
				if (!EVENT_TYPE_SIG.test(type)) {
					// Initialize the handlers for this type if they don't exist.
					if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
						handlers = {};
						handlers[TYPE] = type;
					}

					// Initialize event
					event = {};
					event[RUNNER] = sequence;

					// If this is the first handler signal SIG_SETUP
					if (!(HEAD in handlers)) {
						event[TYPE] = SIG_SETUP;
						result = me.emit(event, handlers, type, callback, data);
					}

					// If we were not interrupted
					if (result !== FALSE) {
						// Signal SIG_ADD
						event[TYPE] = SIG_ADD;
						result = me.emit(event, handlers, type, callback, data);
					}

					// If we were not interrupted and `handlers` is not the list for `type` append it
					if (result !== FALSE && me[HANDLERS][type] !== handlers) {
						ARRAY_PUSH.call(me[HANDLERS], me[HANDLERS][type] = handlers);
					}
				}

				// If we were not interrupted return result from super.on, otherwise just this
				return result !== FALSE
						? fn.call(me, type, me, callback, data)
						: me;
			};
		}),

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Context of the callback will always be **this** object.
		 * @param {String} type The event type subscribed to
		 * @param {Function} [callback] The event listener function to remove
		 * @fires sig/remove
		 * @fires sig/teardown
		 */
		"off": around(function(fn) {
			return function off(type, callback) {
				var me = this;
				var event;
				var handlers;
				var result;

				if (!EVENT_TYPE_SIG.test(type)) {
					// Initialize the handlers for this type if they don't exist.
					if ((handlers = me[HANDLERS][type]) === UNDEFINED) {
						handlers = {};
						handlers[TYPE] = type;
					}

					// Initialize event
					event = {};
					event[RUNNER] = sequence;

					// Signal SIG_REMOVE
					event[TYPE] = SIG_REMOVE;
					result = me.emit(event, handlers, type, callback);

					// If we were not interrupted and this is the last handler signal SIG_TEARDOWN
					if (result !== FALSE && handlers[HEAD] === handlers[TAIL]) {
						event[TYPE] = SIG_TEARDOWN;
						result = me.emit(event, handlers, type, callback);
					}

					// If we were not interrupted and `handlers` is not the list for `type` append it
					if (result !== FALSE && me[HANDLERS][type] !== handlers) {
						ARRAY_PUSH.call(me[HANDLERS], me[HANDLERS][type] = handlers);
					}
				}

				// If we were not interrupted return result from super.off, otherwise just this
				return result !== FALSE
					? fn.call(me, type, me, callback)
					: me;
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
		 * Start the component life-cycle, sends out {@link #event-sig/initialize} and then {@link #event-sig/start}.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 * @fires sig/initialize
		 * @fires sig/start
		 */
		"start" : function start(args) {
			var me = this;
			var signal = me.signal;
			var phase;

			// Check PHASE
			if ((phase = me[PHASE]) !== UNDEFINED && phase !== FINALIZED) {
				return when.resolve(UNDEFINED);
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
		 * @fires sig/stop
		 * @fires sig/finalize
		 */
		"stop" : function stop(args) {
			var me = this;
			var signal = me.signal;

			// Check PHASE
			if (me[PHASE] !== STARTED) {
				return when.resolve(UNDEFINED);
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
		 * Schedule a new promise that runs on this component, sends a {@link #event-sig/task} once finished.
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
		 * @param {Resolver} resolver The task resolver.
		 * @param {String} [name]
		 * @return {Promise}
		 * @fires sig/task
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
			promise[NAME] = name || TASK;

			return me.signal(TASK, promise).yield(promise);
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/runner/pipeline',[ "when" ], function PipelineModule(when) {
	"use strict";

	/**
	 * @class core.component.runner.pipeline
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var HEAD = "head";
	var NEXT = "next";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Run event handlers **asynchronously** in "pipeline", passing the resolved return value (unless it's undefined) of the previous listen to the next handler as arguments.
	 * @return {Promise}
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

		/**
		 * Internal function for piped execution of candidates candidates
		 * @ignore
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/gadget',[
	"./base",
	"./runner/pipeline",
	"troopjs-compose/mixin/config",
	"when",
	"../pubsub/hub"
],function GadgetModule(Component, pipeline, COMPOSE_CONF, when, hub) {
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
	 * @extend core.component.base
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var ARGS = "args";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var HUB = "hub";
	var RE = new RegExp("^" + HUB + "/(.+)");

	// Add pragma for HUB special
	COMPOSE_CONF.pragmas.push({
		"pattern": /^hub(?:\:(memory))?\/(.+)/,
		"replace": function ($0, $1, $2) {
			return HUB + "(\"" + $2 + "\", " + !!$1 + ")";
		}
	});

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Component.extend({
		"displayName" : "core/component/gadget",

		/**
		 * @inheritdoc
		 * @localdoc Registers event handlers declared HUB specials
		 * @handler
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[HUB] || ARRAY_PROTO, function (special) {
				return me.subscribe(special[ARGS][0], special[VALUE]);
			});
		},

		/**
		 * @inheritdoc
		 * @localdoc Triggers memorized values on HUB specials
		 * @handler
		 */
		"sig/start" : function onStart() {
			var me = this;
			var empty = {};
			var specials = me.constructor.specials[HUB] || ARRAY_PROTO;

			// Calculate specials
			specials = specials
				.map(function (special) {
					var memory;
					var result;
					var topic = special[ARGS][0];

					if (special[ARGS][1] === true && (memory = me.peek(topic, empty)) !== empty) {
						// Redefine result
						result = {};
						result[TYPE] = HUB + "/" + topic;
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

		/**
		 * @inheritdoc
		 * @localdoc Registers subscription on the {@link core.pubsub.hub hub} for matching callbacks
		 * @handler
		 */
		"sig/add": function onAdd(handlers, type, callback) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				hub.subscribe(matches[1], me, callback);
			}
		},

		/**
		 * @inheritdoc
		 * @localdoc Removes remote subscription from the {@link core.pubsub.hub hub} that was previously registered in {@link #handler-sig/add}
		 * @handler
		 */
		"sig/remove": function onRemove(handlers, type, callback) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				hub.unsubscribe(matches[1], me, callback);
			}
		},

		/**
		 * @inheritdoc
		 * @localdoc Publishes `task` on the {@link core.pubsub.hub hub} whenever a {@link #event-sig/task task} event is emitted
		 * @handler
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
		 * @chainable
		 * @inheritdoc core.pubsub.hub#subscribe
		 * @localdoc Subscribe to public events from this component, forcing the context of which to be this component.
		 */
		"subscribe" : function subscribe(event, callback, data) {
			return this.on(HUB + "/" + event, callback, data);
		},

		/**
		 * @chainable
		 * @inheritdoc core.pubsub.hub#unsubscribe
		 * @localdoc Unsubscribe from public events in context of this component.
		 */
		"unsubscribe" : function unsubscribe(event, callback) {
			return this.off(HUB + "/" + event, callback);
		},

		/**
		 * @inheritdoc core.pubsub.hub#peek
		 */
		"peek" : function peek(event, value) {
			return hub.peek(event, value);
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/css/selector',[ "troopjs-compose/mixin/factory" ], function (Factory) {
	"use strict";

	/**
	 * An optimized CSS selector matcher that {@link dom.component.runner.sequence} relies on for
	 * delegating DOM event on {@link dom.component.widget}.
	 * @class dom.css.selector
	 * @implement compose.mixin
	 * @private
	 */

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

	/**
	 * Extracts key for universal indexer
	 * @ignore
	 * @return {String[]}
	 */
	function getElementUniversal() {
		return [ STAR ];
	}

	/**
	 * Extracts key for tag indexer
	 * @ignore
	 * @param element
	 * @return {String[]}
	 */
	function getElementTagName(element) {
		return [ element.nodeName.toUpperCase() ];
	}

	/**
	 * Extracts key for class indexer
	 * @ignore
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

	/**
	 * Extracts key for id indexer
	 * @ignore
	 * @param element
	 * @return {String[]}
	 */
	function getElementId(element) {
		var id;

		return (id = element.id) !== UNDEFINED && [ id ];
	}

	/**
	 * Gets the last **SIGNIFICANT** of a CSS selector, the "significant" is defined as - any leading id, class name or
	 * tag name component of the last selector.
	 *
	 * Examples:
	 *
	 * 	tail("div.bar");                  // "div"
	 * 	tail("#foo.bar");                 // "#foo"
	 * 	tail("p > div.bar");              // "div"
	 * 	tail("p > a:active");             // "a"
	 * 	tail(".bar");                     // ".bar"
	 * 	tail("input.foo[type='button']"); // "input"
	 * 	tail("[type='button']");          // "*"
	 *
	 * For more examples see [CSS3 selector spec](http://www.w3.org/TR/selectors/#w3cselgrammar)
	 * @private
	 * @static
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

	/**
	 * Compares candidates (that have COUNT properties)
	 * @ignore
	 * @param {Object} a
	 * @param {Object} b
	 * @return {Number}
	 */
	function compareCandidates(a, b) {
		return a[COUNT] - b[COUNT];
	}

	/**
	 * @method constructor
	 */
	var Selector = Factory(function Selector() {
		var me = this;

		/**
		 * Cached indexes
		 * @protected
		 * @readonly
		 * @property {Array} indexes
		 */
		me[INDEXES] = [];

		/**
		 * Index counter
		 * @private
		 * @readonly
		 * @property {Number} count
		 */
		me[COUNT] = 0;
	}, {
		/**
		 * Adds candidate
		 * @chainable
		 * @param {String} selector CSS selector
		 * @param {...*} [args] Additional arguments attached with candidate
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

		/**
		 * Matches candidates against element
		 * @param {Function} matchesSelector `matchesSelector` function
		 * @param {HTMLElement} element DOM Element
		 * @return {Array} Matching array of candidates
		 */
		"matches": function matches(matchesSelector, element) {
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

	Selector.tail = tail;

	return Selector;
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/component/runner/sequence',[
	"../../css/selector",
	"jquery",
	"poly/array"
], function SequenceModule(Selector, $) {
	"use strict";

	/**
	 * @class dom.component.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var NEXT = "next";
	var SELECTOR = "selector";
	var MODIFIED = "modified";
	var MATCHES_SELECTOR = $.find.matchesSelector;

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that executes DOM candidates in sequence without overlap
	 * @return {*} Result from last handler
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
			.matches(MATCHES_SELECTOR, $event.target)
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
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/config',[
	"module",
	"troopjs-util/merge"
], function LoomConfigModule(module, merge) {
	"use strict";

	/**
	 * Provides configuration for the loom package
	 * @class dom.loom.config
	 * @protected
	 * @alias feature.config
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
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/defer',[
	"when",
	"poly/array"
], function DeferModule(when) {
	"use strict";

	/**
	 * `when.defer` patched with jQuery/deferred compatibility.
	 * @class util.defer
	 * @mixin Function
	 * @static
	 */

	var ARRAY_SLICE = Array.prototype.slice;

	/**
	 * Creates a wrapped when.defer object, which can be send to anything that expects a jQuery/deferred.
	 * @method constructor
	 * @return {Deferred}
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/weave',[
	"./config",
	"require",
	"when",
	"jquery",
	"troopjs-util/getargs",
	"troopjs-util/defer",
	"poly/array"
], function WeaveModule(config, parentRequire, when, $, getargs, Defer) {
	"use strict";

	/**
	 * @class dom.loom.weave
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ARRAY_SHIFT = ARRAY_PROTO.shift;
	var WEAVE = "weave";
	var WOVEN = "woven";
	var LENGTH = "length";
	var $WARP = config["$warp"];
	var $WEFT = config["$weft"];
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var RE_SEPARATOR = /[\s,]+/;
	var CANCELED = "cancel";

	// collect the list of fulfilled promise values from a list of descriptors.
	function fulfilled(descriptors) {
		return descriptors.filter(function(d) {
			// Re-throw the rejection if it's not canceled.
			if (d.state === "rejected" && d.reason !== CANCELED) {
				throw d.reason;
			}
			return d.state === "fulfilled";
		}).map(function(d) {
			return d.value;
		});
	}

	/**
	 * Instantiate all {@link dom.component.widget widgets}  specified in the {@link dom.loom.config#weave weave attribute}
	 * of this element, and to signal the widget for start with the arguments.
	 *
	 * The weaving will result in:
	 *
	 *  - Updates the {@link dom.loom.config#weave woven attribute} with the created widget instances names.
	 *  - The {@link dom.loom.config#$warp $warp data property} will reference the widget instances.
	 *
	 * @localdoc
	 *
	 * It also lives as a jquery plugin as {@link $#method-weave}.
	 *
	 * **Note:** It's not commonly to use this method directly, use instead {@link $#method-weave jQuery.fn.weave}.
	 *
	 * 	// Create element for weaving.
	 * 	var $el = $('<div data-weave="my/widget(option)"></div>').data("option",{"foo":"bar"});
	 * 	// Instantiate the widget defined in "my/widget" module, with one param read from the element's custom data.
	 * 	$el.weave();
	 *
	 * @method constructor
	 * @param {...*} [start_args] Arguments that will be passed to each widget's {@link dom.component.widget#start start} method
	 * @return {Promise} Promise for the completion of weaving all widgets.
	 */
	return function weave(start_args) {
		// Store start_args for later
		start_args = arguments;

		// Map elements
		return when.all(ARRAY_MAP.call(this, function (element) {
			var $element = $(element);
			var $data = $element.data();
			var $warp = $data[$WARP] || ($data[$WARP] = []);
			var to_weave = [];
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
				var weaved = [];

				widgets.forEach(function (widget) {
					weaved.push(widget[$WEFT][WEAVE]);
					woven.push(widget[$WEFT][WOVEN]);
				});

				$element
					// Add those widgets to data-woven.
					.attr(ATTR_WOVEN, function (index, attr) {
						attr = (attr !== UNDEFINED ? attr.split(RE_SEPARATOR) : []).concat(woven).join(" ");
						return attr || null;
					})
					// Remove only those actually woven widgets from "data-weave".
					.attr(ATTR_WEAVE, function(index, attr) {
						var result = [];
						if (attr !== UNDEFINED) {
							result = to_weave.filter(function(args) {
								return weaved.indexOf(args[WEAVE]) < 0;
							}).map(function(args) { return args[WEAVE]; });
						}
						return result[LENGTH] === 0 ? null : result.join(" ");
					});
			};

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
				ARRAY_PUSH.call(to_weave, weave_args);
			}

			// process with all successful weaving.
			return when.settle(to_weave.map(function (widget_args) {
				// Create deferred
				var deferred = when.defer();
				var resolver = deferred.resolver;
				var promise = deferred.promise;
				var module = ARRAY_SHIFT.call(widget_args);

				// Copy WEAVE
				promise[WEAVE] = widget_args[WEAVE];

				// Add promise to $warp, make sure this is called synchronously.
				ARRAY_PUSH.call($warp, promise);

				setTimeout(function() {
					parentRequire([ module ], function(Widget) {
						var widget;
						var startPromise;

						// detect if weaving has been canceled somehow.
						if ($warp.indexOf(promise) === -1) {
							resolver.reject(CANCELED);
						}

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
				}, 0);

				// Return promise
				return promise;
			})).then(fulfilled)
			// Updating the element attributes with started widgets.
			.tap(update_attr);
		}));
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/unweave',[
	"./config",
	"when",
	"jquery",
	"poly/array",
	"troopjs-util/defer"
], function UnweaveModule(config, when, $, Defer) {
	"use strict";

	/**
	 * @class dom.loom.unweave
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */

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
	var CANCELED = "cancel";

	// collect the list of fulfilled promise values from a list of descriptors.
	function fulfilled(descriptors) {
		return descriptors.filter(function(d) {
			// Re-throw the rejection if it's not canceled.
			if (d.state === "rejected" && d.reason !== CANCELED) {
				throw d.reason;
			}
			return d.state === "fulfilled";
		}).map(function(d) {
			return d.value;
		});
	}

	/**
	 * Destroy all widget instances living on this element, that are created
	 * by {@link dom.loom.weave}, it is also to clean up the attributes
	 * and data references to the previously instantiated widgets.
	 *
	 * @localdoc
	 *
	 * It also lives as a jquery plugin as {@link $#method-unweave}.
	 *
	 * @method constructor
	 * @param {...*} [stop_args] Arguments that will be passed to each widget's {@link dom.component.widget#stop stop} method
	 * @return {Promise} Promise to the completion of unweaving all woven widgets.
	 */
	return function unweave(stop_args) {
		// Store stop_args for later
		stop_args = arguments;

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
						var result = (attr !== UNDEFINED ? attr.split(RE_SEPARATOR) : []).concat(weave);
						return result[LENGTH] === 0 ? null : result.join(" ");
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

			// process with all successful  weaving.
			return when.settle($unweave).then(fulfilled).then(function unweaveWidgets(widgets) {
				return when.map(widgets, function(widget) {
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
				});
			})
			// Updating the weave/woven attributes with stopped widgets.
			.tap(update_attr);
		}));
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-jquery/destroy',[ "jquery" ], function DestroyModule($) {
	"use strict";

	/**
	 * Extends {@link jQuery} with:
	 *
	 *  - {@link $#event-destroy} event
	 *
	 * @class jquery.destroy
	 * @static
	 * @alias plugin.jquery
	 */

	var DESTROY = "destroy";

	/**
	 * @class $
	 */

	/**
	 * A special jQuery event whose handler will be called, only when this handler it's removed from the element.
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/component/widget',[
	"troopjs-core/component/gadget",
	"./runner/sequence",
	"troopjs-compose/mixin/config",
	"jquery",
	"when",
	"troopjs-util/merge",
	"../loom/config",
	"../loom/weave",
	"../loom/unweave",
	"troopjs-jquery/destroy"
], function WidgetModule(Gadget, sequence, COMPOSE_CONF, $, when, merge, LOOM_CONF, loom_weave, loom_unweave) {
	"use strict";

	/**
	 * Component that attaches to an DOM element, considerably delegates all DOM manipulations.
	 * @class dom.component.widget
	 * @extend core.component.gadget
	 * @alias widget.component
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
	var ARGS = "args";
	var NAME = "name";
	var VALUE = "value";
	var TYPE = "type";
	var RUNNER = "runner";
	var FINALIZE = "finalize";
	var SELECTOR_WEAVE = "[" + LOOM_CONF["weave"] + "]";
	var SELECTOR_WOVEN = "[" + LOOM_CONF["woven"] + "]";
	var RE = new RegExp("^" + DOM + "/(.+)");

	/**
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @ignore
	 * @param {Function} $fn jQuery method
	 * @return {Function} proxied render
	 */
	function $render($fn) {
		/**
		 * @ignore
		 * @param {Function|String|Promise} [contents] Contents to render or a Promise for contents
		 * @param {...*} [args] Template arguments
		 * @return {String|Promise} The returned content string or promise of rendering.
		 */
		function render(contents, args) {
			/*jshint validthis:true*/
			var me = this;

			// Retrieve HTML/Text.
			if (!arguments.length) {
				return $fn.call(me[$ELEMENT]);
			}

			return when
				// Wait for contents and args to resolve...
				.all(ARRAY_SLICE.call(arguments))
				.then(function (_args) {
					// First argument is the resolved value of contents
					var _contents = _args.shift();

					// If _contents is a function, apply it with _args, otherwise just pass it along to the callback
					return when(typeof _contents === TYPEOF_FUNCTION ? _contents.apply(me, _args) : contents, function (result) {
						// Call $fn in the context of me[$ELEMENT] with result as the only argument
						// Find something to weave
						// Pass it to loom_weave and return the result
						return loom_weave.call($fn.call(me[$ELEMENT], result).find(SELECTOR_WEAVE));
					});
				});
		}

		return render;
	}

	/**
	 * Sets MODIFIED on handlers
	 * @ignore
	 * @param {Object} handlers
	 * @param {String} type
	 */
	function set_modified(handlers, type) {
		if (RE.test(type)) {
			// Set modified
			handlers[MODIFIED] = new Date().getTime();
		}
	}

	// Add pragmas for DOM specials
	COMPOSE_CONF.pragmas.push({
		"pattern": /^dom(?:\:([^\/]+))?\/(.+)/,
		"replace": DOM + "/$2(\"$1\")"
	});

	/**
	 * Creates a new widget that attaches to a specified (jQuery) DOM element.
	 * @method constructor
	 * @param {jQuery|HTMLElement} $element The element that this widget should be attached to
	 * @param {String} [displayName] A friendly name for this widget
	 * @throws {Error} If no $element is provided
	 * @throws {Error} If $element is not of supported type
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

		/**
		 * jQuery element this widget is attached to
		 * @property {jQuery} $element
		 * @readonly
		 * @protected
		 */
		me[$ELEMENT] = $element;

		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}

	}, {
		"displayName" : "dom/component/widget",

		/**
		 * @handler
		 * @localdoc Registers event handlers that are declared as DOM specials.
		 * @inheritdoc
		 */
		"sig/initialize" : function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[DOM] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE], special[ARGS][0]);
			});
		},

		/**
		 * @handler
		 * @localdoc Registers for each type of DOM event a proxy function on the DOM element that
		 * re-dispatches those events.
		 * @inheritdoc
		 */
		"sig/setup": function onSetup(handlers, type) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				// $element.on handlers[PROXY]
				me[$ELEMENT].on(matches[1], NULL, me, handlers[PROXY] = function dom_proxy($event) {
					var args = {};
					args[TYPE] = type;
					args[RUNNER] = sequence;
					args = [ args ];

					// Push original arguments on args
					ARRAY_PUSH.apply(args, arguments);

					// Return result of emit
					return me.emit.apply(me, args);
				});
			}
		},

		/**
		 * @handler
		 * @localdoc Sets MODIFIED on handlers for matching types
		 * @inheritdoc
		 */
		"sig/add": set_modified,

		/**
		 * @handler
		 * @localdoc Sets MODIFIED on handlers for matching types
		 * @inheritdoc
		 */
		"sig/remove": set_modified,

		/**
		 * @handler
		 * @localdoc Remove for the DOM event handler proxies that are registered on the DOM element.
		 * @inheritdoc
		 */
		"sig/teardown": function onTeardown(handlers, type) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				// $element.off handlers[PROXY]
				me[$ELEMENT].off(matches[1], NULL, handlers[PROXY]);
			}
		},

		/**
		 * @handler
		 * @localdoc Trigger a custom DOM event "task" whenever this widget performs a task.
		 * @inheritdoc
		 */
		"sig/task" : function onTask(task) {
			this[$ELEMENT].trigger("task", [ task ]);
		},

		/**
		 * Destroy DOM event
		 * @localdoc Triggered when {@link #$element} of this widget is removed from the DOM tree.
		 * @event dom/destroy
		 * @param {jQuery} $event jQuery event object
		 * @param {...*} [args] Event arguments
		 * @preventable
		 */

		/**
		 * Handles widget destruction from a DOM perspective
		 * @handler
		 * @inheritdoc #event-dom/destroy
		 * @localdoc Triggered when this widget is removed from the DOM
		 */
		"dom/destroy" : function onDestroy() {
			if (this.phase !== FINALIZE) {
				loom_unweave.call(this[$ELEMENT]);
			}
		},

		/**
		 * @inheritdoc dom.loom.weave#constructor
		 */
		"weave" : function weave() {
			return loom_weave.apply(this[$ELEMENT].find(SELECTOR_WEAVE), arguments);
		},

		/**
		 * @inheritdoc dom.loom.unweave#constructor
		 */
		"unweave" : function unweave() {
			return loom_unweave.apply(this[$ELEMENT].find(SELECTOR_WOVEN), arguments);
		},

		/**
		 * Renders content and inserts it before {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"before" : $render($.fn.before),

		/**
		 * Renders content and inserts it after {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"after" : $render($.fn.after),

		/**
		 * Renders content and replaces {@link #$element} html contents
		 * @method
		 * @param {Function|String} contents Template/String to render
		 * @param {...*} [args] Template arguments
		 * @return {Promise} Promise of  render
		 */
		"html" : $render($.fn.html),

		/**
		 * Renders content and replaces {@link #$element} text contents
		 * @method
		 * @inheritdoc #html
		 */
		"text" : $render($.fn.text),

		/**
		 * Renders content and appends it to {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"append" : $render($.fn.append),

		/**
		 * Renders content and prepends it to {@link #$element}
		 * @method
		 * @inheritdoc #html
		 */
		"prepend" : $render($.fn.prepend)
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/application/widget',[
	"../component/widget",
	"when"
], function ApplicationWidgetModule(Widget, when) {
	"use strict";

	/**
	 * The application widget serves as a container for all troop components that bootstrap the page.
	 * @class dom.application.widget
	 * @extend dom.component.widget
	 * @alias widget.application
	 */

	var ARRAY_SLICE = Array.prototype.slice;
	var COMPONENTS = "components";

	/**
	 * @method constructor
	 * @inheritdoc
	 * @param {jQuery|HTMLElement} $element The element that this widget should be attached to
	 * @param {String} displayName A friendly name for this widget
	 * @param {...core.component.base} component List of components to start before starting the application.
	 */
	return Widget.extend(function ApplicationWidget($element, displayName, component) {
		/**
		 * Application components
		 * @private
		 * @readonly
		 * @property {core.component.base[]} components
		 */
		this[COMPONENTS] = ARRAY_SLICE.call(arguments, 2);
	}, {
		"displayName" : "dom/application/widget",

		/**
		 * @handler
		 * @localdoc Initialize all registered components (widgets and services) that are passed in from the {@link #method-constructor}.
		 * @inheritdoc
		 */
		"sig/initialize" : function onInitialize() {
			var args = arguments;

			return when.map(this[COMPONENTS], function (component) {
				return component.signal("initialize", args);
			});
		},

		/**
		 * @handler
		 * @localdoc weave all widgets that are within this element.
		 * @inheritdoc
		 */
		"sig/start" : function onStart() {
			var me = this;
			var args = arguments;

			return when
				.map(me[COMPONENTS], function (component) {
					return component.signal("start", args);
				}).then(function started() {
					return me.weave.apply(me, args);
				});
		},

		/**
		 * @handler
		 * @localdoc stop all woven widgets that are within this element.
		 * @inheritdoc
		 */
		"sig/stop": function onStop() {
			var me = this;
			var args = arguments;

			return me.unweave.apply(me, args).then(function stopped() {
				return when.map(me[COMPONENTS], function (child) {
					return child.signal("stop", args);
				});
			});
		},

		/**
		 * @handler
		 * @localdoc finalize all registered components (widgets and services) that are registered from the {@link #method-constructor}.
		 * @inheritdoc
		 */
		"sig/finalize" : function onFinalize() {
			var args = arguments;

			return when.map(this[COMPONENTS], function (component) {
				return component.signal("finalize", args);
			});
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/after',[ "../mixin/decorator" ], function AfterDecoratorModule(Decorator) {
	"use strict";

	/**
	 * @class compose.decorator.after
	 * @static
	 * @alias feature.decorator
	 */

	var UNDEFINED;
	var VALUE = "value";

	/**
	 * Create a decorator method that is to add code that will be executed after the original method.
	 * @method constructor
	 * @param {Function} func The decorator function which receives the arguments of the original, it's return value (if
	 * not undefined) will be the used as the new return value.
	 * @return {compose.mixin.decorator}
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/before',[ "../mixin/decorator" ], function BeforeDecoratorModule(Decorator) {
	"use strict";

	/**
	 * @class compose.decorator.before
	 * @static
	 * @alias feature.decorator
	 */

	var UNDEFINED;
	var VALUE = "value";

	/**
	 * Create a decorator method that is to add code that will be executed before the original method.
	 * @method constructor
	 * @param {Function} func The decorator function which receives the same arguments as with the original, it's return
	 * value (if not undefined) will be send as the arguments of original function.
	 * @return {compose.mixin.decorator}
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/extend',[
	"../mixin/decorator",
	"troopjs-util/merge"
], function ExtendDecoratorModule(Decorator, merge) {
	"use strict";

	/**
	 * @class compose.decorator.extend
	 * @static
	 * @alias feature.decorator
	 */

	var UNDEFINED;
	var VALUE = "value";
	var ARRAY_CONCAT = Array.prototype.concat;

	/**
	 * Create a decorator that is to augment an existing Object property.
	 * @method constructor
	 * @param {Function|Object...} ext One or more objects to merge into this property, or a function that returns a new object to be used.
	 * @return {compose.mixin.decorator}
	 */
	return function extend(ext) {
		var args = arguments;

		return new Decorator(function (descriptor, name, descriptors) {
			var previous = descriptors[name][VALUE];
			var val;

			if (typeof ext === "function") {
				val = ext(previous);
			}
			else if (previous !== UNDEFINED) {
				val = merge.apply({}, ARRAY_CONCAT.apply([ previous ], args));
			}

			descriptor[VALUE] = val;

			return descriptor;
		});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/config',[
	"module",
	"troopjs-util/merge"
], function ConfigModule(module, merge) {
	/**
	 * Provides configuration for the logging package
	 * @class log.config
	 * @protected
	 * @alias feature.config
	 */

	return merge.call({
		/**
		 * Sinks that the {@link log.sink.forward} logger will use
		 * @cfg {log.console[]} sinks
		 */
		"sinks": []
	}, module.config());
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/forward',[
	"./methods",
	"../config",
	"poly/array"
], function ForwardModule(METHODS, CONF) {
	"use strict";

	/**
	 * The forward log sink acts as a forwarder to other log sinks.
	 *
	 * It's mainly configured via the {@link log.config#sinks} configuration.
	 * To configure the forwarder for both the {@link log.sink.console} and the {@link log.sink.null} sink, one could
	 * do this:
	 *
	 *     require.config({
	 *       "map": {
	 *         "*": {
	 *           "troopjs-log/logger": "troopjs-log/sink/forward" // Changes the framework logger
	 *         }
	 *       },
	 *       "deps": [ "troopjs-log/config", "troopjs-log/sink/console", "troopjs-log/sink/null" ],
	 *       "callback": function (loggingConfig, consoleSink, nullSink) {
	 *         loggingConfig.sinks.push(consoleSink, nullSink); // Add sinks
	 *       }
	 *     });
	 *
	 * @class log.sink.forward
	 * @implement log.console
	 * @mixin log.config
	 * @singleton
	 * @inheritdoc log.sink.console
	 * @alias feature.logger
	 */

	var FUNCTION_APPLY = Function.apply;
	var ARRAY_SLICE = Array.prototype.slice;
	var SINKS = CONF["sinks"];

	return (function () {
		var me = this;
		var forward = function (method) {
			var args = ARRAY_SLICE.call(arguments, 1);

			SINKS.forEach(function (sink) {
				FUNCTION_APPLY.call(sink[method], me, args);
			});
		};

		METHODS.forEach(function (method) {
			me[method] = forward.bind(me, method);
		});

		return me;
	}).call({});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/null',[
	"./methods",
	"poly/array"
], function NullModule(METHODS) {
	"use strict";

	/**
	 * @class log.sink.null
	 * @implement log.console
	 * @singleton
	 * @inheritdoc log.sink.console
	 * @localdoc
	 * This class maps every log method to a [nop](https://en.wikipedia.org/wiki/NOP) function,
	 * effectively suppressing all logging.
	 * @alias feature.logger
	 */

	return (function () {
		var me = this;
		var nop = function () {};

		METHODS.forEach(function (method) {
			me[method] = nop;
		});

		return me;
	}).call({});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/service',[ "./gadget" ], function ServiceModule(Gadget) {
	"use strict";

	/**
	 * Base class for all service alike components.
	 *
	 * @class core.component.service
	 * @extend core.component.gadget
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Gadget.extend({
		"displayName" : "core/component/service"
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/pubsub/proxy/to1x',[
	"troopjs-core/component/service",
	"when",
	"poly/array",
	"poly/object"
], function To1xModule(Service, when) {
	"use strict";

	/**
	 * Proxies to 1.x hub
	 * @class opt.pubsub.proxy.to1x
	 * @extend core.component.service
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
	var ROUTES = "routes";
	var LENGTH = "length";
	var RESOLVE = "resolve";
	var TOPIC = "topic";
	var DEFER = "defer";
	var MEMORY = "memory";

	/**
	 * @method constructor
	 * @param {...Object} routes Routes
	 */
	return Service.extend(function To1xService(routes) {
		var config = {};

		config[ROUTES] = ARRAY_SLICE.call(arguments);

		this.configure(config);
	}, {
		"displayName" : "opt/pubsub/proxy/to1x",

		/**
		 * @inheritdoc
		 * @localdoc Initializes proxy topics
		 * @handler
		 */
		"sig/initialize" : function () {
			var me = this;

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var publish = routes[PUBLISH] || {};
				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

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
							when(result, when.apply(deferred.resolve), deferred.reject, deferred.progress);
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
		 * @inheritdoc
		 * @localdoc Finalizes proxy topics
		 * @handler
		 */
		"sig/finalize" : function () {
			var me = this;

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var publish = routes[PUBLISH] || {};
				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

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
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/pubsub/proxy/to2x',[
	"troopjs-core/component/service",
	"when",
	"poly/array",
	"poly/object"
], function To2xModule(Service, when) {
	"use strict";

	/**
	 * Proxies to 2.x hub
	 * @class opt.pubsub.proxy.to2x
	 * @extend core.component.service
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
	var ROUTES = "routes";
	var TOPIC = "topic";
	var REPUBLISH = "republish";

	/**
	 * @method constructor
	 * @param {...Object} routes Routes
	 */
	return Service.extend(function To2xService(routes) {
		var config = {};

		config[ROUTES] = ARRAY_SLICE.call(arguments);

		this.configure(config);
	}, {
		"displayName" : "opt/pubsub/proxy/to2x",

		/**
		 * @inheritdoc
		 * @localdoc Initializes proxy topics
		 * @handler
		 */
		"sig/initialize" : function ()  {
			var me = this;

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var publish = routes[PUBLISH] || {};
				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

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
		 * @inheritdoc
		 * @localdoc Republishes memorized values
		 * @handler
		 */
		"sig/start" : function () {
			var me = this;
			var results = [];

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

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
		 * @inheritdoc
		 * @localdoc Finalizes proxy topics
		 * @handler
		 */
		"sig/finalize" : function () {
			var me = this;

			// Iterate ROUTES
			me.configure()[ROUTES].forEach(function (routes) {
				if (!(HUB in routes)) {
					throw new Error("'" + HUB + "' is missing from routes");
				}

				var publish = routes[PUBLISH] || {};
				var subscribe = routes[SUBSCRIBE] || {};
				var hub = routes[HUB];

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
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/route/runner/sequence',[ "poly/array" ], function SequenceModule() {
	"use strict";

	/**
	 * @class opt.route.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var NULL = null;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var HEAD = "head";
	var NEXT = "next";
	var TYPE = "type";
	var TOKENS = "tokens";

	var RE_GROUP_START = /\(/g;
	var RE_TOKEN = /\:(\w+)(\?)?\/?/g;
	var RE_TOKEN_ESCAPED = /@(\w+)(\?)?\/?/g;
	var RE_COLON = /\:/g;
	var MARKER = "@";
	var RE_GROUPED_TOKEN = /\(([^)]+)\)\??\/?/g;
	var RE_ANY = /^.*$/;
	var RE_ESCAPE_REGEXP = /([\/.])/g;
	var RE_DUP_SLASH = /\/{2,}/;

	var RE_BOOLEAN = /^(?:false|true)$/i;
	var RE_BOOLEAN_TRUE = /^true$/i;
	var RE_DIGIT = /^\d+$/;

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that executes ROUTE candidates in sequence without overlap
	 * @return {*} Result from last handler
	 * @throws {Error} If `event.type` is an unknown type
	 */
	return function sequence(event, handlers, args) {
		var type = event[TYPE];
		var path = args.shift(); // Shift path and route of args
		var data;
		var matched;
		var candidate;
		var candidates = [];
		var fallbacks = [];
		var first_missed;

		// If this is a route/set we need to pre-process the path
		if (type === "route/set") {
			// route data is provided as the second arg, but we're already shifted above.
			data = args.shift() || {};

			// Populate path with data
			path = path
				// Replace grouped tokens.
				.replace(RE_GROUPED_TOKEN, function ($0, $1) {
					var group = $1.replace(RE_TOKEN, function($0, $1) {
						return $1 in data ? data[$1] + "/" : $0;
					});
					// mark the group as missed unless all params within have fulfilled.
					return !group.match(RE_COLON)? group + "/" : MARKER;
				})
				// Replace the rest of tokens.
				.replace(RE_TOKEN, function($0, $1) {
					// mark the parameters as missed.
					return $1 in data ? data[$1] + "/" : MARKER;
				})
				// Remove any duplicate slashes previously produced.
				.replace(RE_DUP_SLASH, "/");

			// Dump from before the first missed parameter.
			if ((first_missed = path.indexOf(MARKER)) > -1) {
				path = path.substring(0, first_missed);
			}
		}
		// If this is _not_ a route/change we should throw an error
		else if (type !== "route/change") {
			throw new Error("Unable to run type '" + type + "'");
		}

		// Copy handlers -> candidates
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			candidate[DATA] === "/404" ? fallbacks.push(candidate) : candidates.push(candidate);
		}

		// Run candidates and return
		var result = candidates.reduce(function(result, candidate) {
			var tokens;
			var matches;
			var re;

			// Only run if the reduced result is not `false`
			if (result !== false) {
				switch (OBJECT_TOSTRING.call(candidate[DATA])) {
					case "[object RegExp]":
						// Use cached regexp
						re = candidate[DATA];

						// Use cached tokens
						tokens = candidate[TOKENS];
						break;

					case "[object Undefined]":
					// phantom reported weird [object DOMWindow] for undefined property.
					case "[object DOMWindow]":
						// Match anything
						re = RE_ANY;

						// Empty tokens
						tokens = [];
						break;

					default:
						// Reset tokens
						tokens = candidate[TOKENS] = [];

						// Translate and cache pattern to regexp
						re = candidate[DATA] = new RegExp("^" + candidate[DATA]
							// Preserved colon to be used by regexp.
							.replace(RE_COLON, MARKER)
							// Translate grouping to non capturing regexp groups
							.replace(RE_GROUP_START, "(?:")
							// Capture tokens
							.replace(RE_TOKEN_ESCAPED, function($0, token, optional) {
								// Add token
								tokens.push(token);
								// Return replacement.
								return "(?:(\\w+)\/)" + (optional ? "?" : "");
							})
							.replace(RE_ESCAPE_REGEXP, "\\$1") + "$", "i");
				}

				// Match path
				if ((matches = re.exec(path)) !== NULL) {
					// Capture tokens in data
					tokens.forEach(function(token, index) {

						// Auto type convertion.
						var val = matches[index + 1];
						if (RE_BOOLEAN.test(val)) {
							val = RE_BOOLEAN_TRUE.test(val);
						}
						else if (RE_DIGIT.test(val)) {
							val = +val;
						}

						matches[index + 1] = matches[token] = val;
					});

					if (!matched) {
						matched = 1;
					}

					// Apply CALLBACK and store in result
					result = candidate[CALLBACK].apply(candidate[CONTEXT], [ path, matches ].concat(args));
				}
			}

			return result;
		}, UNDEFINED);

		// Run 404s if none of the candidate matches the route.
		if (!matched && type === "route/change") {
			return fallbacks.reduce(function(result, candidate) {
				result !== false ? candidate[CALLBACK].apply(candidate[CONTEXT], [ path ].concat(args)) : result;
			}, result);
		}

		return result;
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/route/gadget',[
	"troopjs-compose/mixin/config",
	"troopjs-core/component/gadget",
	"./runner/sequence",
	"when"
], function (COMPOSE_CONF, Gadget, sequence, when) {
	"use strict";

	/**
	 * @class opt.route.gadget
	 * @extend core.component.gadget
	 */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var ROUTE = "route";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var ARGS = "args";
	var RUNNER = "runner";

	/**
	 * Route set event
	 * @localdoc Triggered when a route set is requested
	 * @event route/set
	 * @param {String} route Route
	 * @param {Object} data Data
	 * @param {...*} [args] Additional arguments
	 * @preventable
	 */

	/**
	 * Route change event
	 * @localdoc Triggered when a route change is requested
	 * @event route/change
	 * @param {String} route Route
	 * @param {String[]} data Data
	 * @param {...*} [args] Additional arguments
	 * @preventable
	 */

	/**
	 * Route change handler
	 * @handler route/change
	 * @inheritdoc #event-route/change
	 * @localdoc Matches and executes route stored in data
	 * @template
	 * @return {*}
	 */

	/**
	 * To change the current route
	 * @event hub/route/set
	 * @param {String} The new uri
	 */

	/**
	 * Runs routes
	 * @ignore
	 * @param {String} op Operation
	 * @param {...*} [args] Additional arguments
	 * @return {*} Result from last handler
	 */
	function runRoute(op) {
		var me = this;

		// Prepare event object
		var event = {};
		event[TYPE] = ROUTE + "/" + op;
		event[RUNNER] = sequence;

		// Modify first argument
		arguments[0] = event;

		// Delegate the actual emitting to emit
		return me.emit.apply(me, arguments);
	}

	// Add pragma for ROUTE special
	COMPOSE_CONF.pragmas.push({
		"pattern": /^route\/(change|set)(\/.*)?$/,
		"replace": ROUTE + "/$1(\"$2\")"
	});

	return Gadget.extend({
		"displayName" : "opt/route/gadget",

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Registers event handlers declared ROUTE specials
		 */
		"sig/initialize": function onInitialize() {
			var me = this;

			return when.map(me.constructor.specials[ROUTE] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE], special[ARGS][0] || undefined);
			});
		},

		/**
		 * @handler hub/route/change
		 * @param {String} uri The new URI.
		 * Handles URI change to dispatch it to individual handlers by emitting a {@link #event-route/change} event
		 * synchronously, call each handler when the pattern matches the new URI.
		 */
		"hub:memory/route/change": function onHashChange(uri) {
			var me = this;
			var args = [ "change" ];
			ARRAY_PUSH.apply(args, arguments);
			return me.task(function(resolve) {
				resolve(runRoute.apply(me, args));
			}, ROUTE + "/change");
		},

		/**
		 * Handles route set
		 * @handler
		 * @inheritdoc #event-route/set
		 * @localdoc Translates {@link #event-route/set} to {@link dom.hash.widget#event-hub/hash/set}
		 * @fires hub/route/set
		 */
		"route/set": function onRouteSet(route, data) {
			var me = this;
			var args = [ "route/set" ];
			ARRAY_PUSH.apply(args, arguments);
			return this.publish.apply(me, args);
		},

		/**
		 * Navigate to a new URI by fulfill the route parameters with the specified list of values, after emitting
		 * a {@link #event-route/set} event synchronously, call each handler whose route pattern where the pattern matches it.
		 *
		 * @param {String} pattern The route pattern to construct the new route.
		 * @param {Object} params The data object contains the parameter values for routing.
		 * @return {Promise}
		 * @fires route/set
		 */
		"go": function go(pattern, params) {
			var me = this;
			var args = [ "set" ];
			ARRAY_PUSH.apply(args, arguments);
			return me.task(function (resolve) {
				resolve(runRoute.apply(me, args));
			}, ROUTE + "/set");
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-opt/store/component',[
	"troopjs-core/mixin/base",
	"when",
	"poly/array"
], function StoreModule(Base, when) {
	"use strict";

	/**
	 * A simple key-value store that supports **dot separated key** format.
	 * @class opt.store.component
	 * @extend core.mixin.base
	 */

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
	 * @param {String} method Method name
	 * @return {Boolean|*}
	 * @ignore
	 */
	function applyMethod(method) {
		/*jshint validthis:true*/
		var me = this;

		return method in me && me[method].apply(me, ARRAY_SLICE.call(arguments, 1));
	}

	/**
	 * Puts value
	 * @param {String|null} key Key - can be dot separated for sub keys
	 * @param {*} value Value
	 * @return {Promise} Promise of put
	 * @ignore
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
	 * @param {String} key Key - can be dot separated for sub keys
	 * @return {*} Value
	 * @ignore
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
	 * @param key {String} key Key - can be dot separated for sub keys
	 * @return {Boolean}
	 * @ignore
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

	/**
	 * @method constructor
	 * @param {...Object} adapter One or more adapters
	 * @throws {Error} If no adapter was provided
	 */
	return Base.extend(function StoreComponent(adapter) {
		if (arguments[LENGTH] === 0) {
			throw new Error("No adapter(s) provided");
		}

		var me = this;

		/**
		 * Current adapters
		 * @private
		 * @readonly
		 * @property {Array} adapters
		 */
		me[ADAPTERS] = ARRAY_SLICE.call(arguments);

		/**
		 * Current storage
		 * @private
		 * @readonly
		 * @property {Object} storage
		 */
		me[STORAGE] = {};

		/**
		 * Current locks
		 * @private
		 * @readonly
		 * @property {Object} locks
		 */
		me[LOCKS] = {};
	}, {
		"displayName" : "opt/store/component",

		/**
		 * Waits for store to be "locked"
		 * @param {String} key Key
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of ready
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
		 * @param {...String} key Key - can be dot separated for sub keys
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of value
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
				.then(onFulfilled && when.apply(onFulfilled), onRejected, onProgress);
		},

		/**
		 * Puts state value
		 * @param {String} key Key - can be dot separated for sub keys
		 * @param {*} value Value
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of value
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
		 * @param {String} key Key - can be dot separated for sub keys
		 * @param {*} value Value
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of value
		 */
		"putIfNotHas" : function (key, value, onFulfilled, onRejected, onProgress) {
			var me = this;

			return !me.has(key)
				? me.put(key, value, onFulfilled, onRejected, onProgress)
				: when(UNDEFINED, onFulfilled, onRejected, onProgress);
		},

		/**
		 * Checks if key exists
		 * @param {String} key Key - can be dot separated for sub keys
		 * @return {Boolean} True if key exists, otherwise false
		 */
		"has" : function (key) {
			return has.call(this, key);
		},

		/**
		 * Clears all adapters
		 * @param {Function} [onFulfilled] onFulfilled callback
		 * @param {Function} [onRejected] onRejected callback
		 * @param {Function} [onProgress] onProgress callback
		 * @return {Promise} Promise of clear
		 */
		"clear" : function (onFulfilled, onRejected, onProgress) {
			var me = this;

			return when
				.map(me[ADAPTERS], function (adapter) {
					return when(applyMethod.call(adapter, CLEAR, me));
				})
				// Add callbacks
				.then(onFulfilled && when.apply(onFulfilled), onRejected, onProgress);
		}
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-net/ajax/service',[
	"troopjs-core/component/service",
	"jquery",
	"troopjs-util/merge"
], function (Service, $, merge) {
	"use strict";

	/**
	 * Provides ajax as a service
	 * @class net.ajax.service
	 * @extend core.component.service
	 */

	/**
	 * @method constructor
	 */
	return Service.extend({
		"displayName" : "net/ajax/service",

		/**
		 * The ajax event
		 * @event hub/ajax
		 * @param {Object} settings Ajax settings
		 */

		/**
		 * Make ajax request.
		 * @handler
		 * @inheritdoc #event-hub/ajax
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-data/cache/component',[
	"troopjs-core/component/base",
	"poly/object",
	"poly/array"
], function CacheModule(Component) {
	"use strict";

	/**
	 * Component for handling effective object caching with cycle references concerned.
	 * @class data.cache.component
	 * @extend core.component.base
	 */

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

	/**
	 * Internal method to put a node in the cache
	 * @ignore
	 * @param node Node
	 * @param _constructor Constructor of value
	 * @param now Current time (seconds)
	 * @return Cached node
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
	 * @method constructor
	 */
	return Component.extend(function CacheComponent() {
		/**
		 * Cache generations
		 * @private
		 * @readonly
		 * @property {Object} generations
		 */
		this[GENERATIONS] = {};
	}, {
		"displayName" : "data/cache/component",

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Purges all objects that duck-type cache-able
		 */
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
		 * @return Cached node (if it existed in the cache before), otherwise the node sent in
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
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-data/cache/service',[ "troopjs-core/component/service" ], function CacheServiceModule(Service) {
	"use strict";

	/**
	 * Service for evicting values from one or more {@link data.cache.component caches}
	 * @class data.cache.service
	 * @extend core.component.service
	 */

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

	/**
	 * @method constructor
	 * @param {...data.cache.component} cache One or more cache components
	 */
	return Service.extend(function CacheService(cache) {
		/**
		 * Internal caches
		 * @private
		 * @readonly
		 * @property {data.cache.component[]} caches
		 */
		this[CACHES] = ARRAY_SLICE.call(arguments);
	}, {
		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Starts the cache eviction
		 * @param {Number} delay Delay between cache eviction sweeps
		 */
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

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Stops the cache eviction
		 */
		"sig/stop" : function stop() {
			var me = this;

			// Clear timeout
			clearTimeout(me[TIMEOUT]);
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-data/query/component',[ "troopjs-core/mixin/base" ], function QueryModule(Base) {
	"use strict";

	/**
	 * Component who understands the ubiquitous data query string format.
	 * @class data.query.component
	 * @extend core.mixin.base
	 */

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
	 * @method constructor
	 * @param {String} [query] data query
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
		 * @chainable
		 * @param {String} query data query
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
		 * @chainable
		 * @param {Object} cache The cache dictionary.
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
		 * @return {Array} the result AST.
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
		 * @return {String} new query string
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
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-data/query/service',[
	"module",
	"troopjs-core/component/service",
	"./component",
	"troopjs-util/merge",
	"when"
], function QueryServiceModule(module, Service, Query, merge, when) {
	"use strict";

	/**
	 * Service that batch processes the query requests send to server and cache the results.
	 * @class data.query.service
	 * @extend core.component.service
	 * @uses net.ajax.service
	 */

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
	 * @method constructor
	 * @param {data.cache.component} cache Cache
	 * @throws {Error} If no cache is provided
	 */
	return Service.extend(function QueryService(cache) {
		var me = this;

		if (cache === UNDEFINED) {
			throw new Error("No cache provided");
		}

		/**
		 * Current batches
		 * @private
		 * @readonly
		 * @property {Array} batches
		 */
		me[BATCHES] = [];

		/**
		 * Current cache
		 * @private
		 * @readonly
		 * @property {data.cache.component} cache
		 */
		me[CACHE] = cache;

		me.configure(MODULE_CONFIG);
	}, {
		"displayName" : "data/query/service",

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Starts batch interval
		 */
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

				/**
				 * Requests via ajax
				 * @ignore
				 * @fires net.ajax.service#event-hub/ajax
				 */
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

		/**
		 * @handler
		 * @inheritdoc
		 * @localdoc Stops batch interval
		 */
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
		 * @handler
		 * @param {...String} query TroopJS data query
		 * @return {Promise}
		 */
		"hub/query" : function hubQuery(query) {
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
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-jquery/hashchange',[ "jquery" ], function HashchangeModule($) {
	"use strict";

	/**
	 * Normalized hashchange event. Extends {@link jQuery} with:
	 *
	 * - {@link $#event-hashchange} event
	 *
	 *
	 * <div class="notice">
	 * Heavily influenced by <a href="https://github.com/millermedeiros/Hasher">Hasher</a>
	 * which is available under <a href="ttp://www.opensource.org/licenses/mit-license.php">MIT license</a>.
	 * </div>
	 *
	 * @class jquery.hashchange
	 * @static
	 * @alias plugin.jquery
	 */

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
	 * @class $
	 */

	/**
	 * A special jQuery event fired ever when the URL hash has changed.
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
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/hash/widget',[
	"../component/widget",
	"troopjs-jquery/hashchange"
], function (Widget) {
	"use strict";

	/**
	 * Widget that attaches to the window object in order to handle `window.location.hash` changes.
	 * @class dom.hash.widget
	 * @extend dom.component.widget
	 * @alias widget.hash
	 */

	var $ELEMENT = "$element";
	var HASH = "_hash";
	var RE = /^#/;

	/**
	 * Hash change event (global)
	 * @localdoc Triggered when a {@link #$element} with {@link dom.hash.widget} attached to it changes its hash
	 * @event hub/hash/change
	 * @param {String} hash The new hash
	 */

	/**
	 * Hash change event (local)
	 * @localdoc Triggered when the attached {@link #$element} hash is changed
	 * @event dom/hashchange
	 * @preventable
	 * @param {Object} $event {@link jQuery} event
	 * @param {String} hash The new hash
	 */

	/**
	 * Hash set event (global)
	 * @localdoc Triggered when a component wants to change the hash of an {@link #$element}'s with {@link dom.hash.widget} attached to it
	 * @event hub/hash/set
	 * @param {String} hash The new hash
	 * @param {Boolean} [silent=false] Change the hash silently without triggering {@link dom.hash.widget#event-hub/hash/change} event.
	 */

	/**
	 * Hash set event (local)
	 * @localdoc Triggered when a component wants to change the attached {@link #$element} hash
	 * @event dom/hashset
	 * @preventable
	 * @param {Object} $event {@link jQuery} event
	 * @param {String} hash The new hash
	 * @param {Boolean} [silent=false] Change the hash silently without triggering {@link dom.hash.widget#event-dom/hashchange} event.
	 */

	/**
	 * Fires whenever the browser route has changed
	 * @event hub/route/change
	 * @preventable
	 * @param {String} hash The new hash
	 */

	/**
	 * Hash change handler (global)
	 * @inheritdoc #event-hub/hash/change
	 * @handler hub/hash/change
	 * @template
	 * @return {Promise}
	 */

	return Widget.extend({
		"displayName" : "dom/hash/widget",

		/**
		 * @inheritdoc
		 * @handler
		 */
		"sig/start" : function () {
			this[$ELEMENT].trigger("hashchange");
		},

		/**
		 * Hash change handler (local)
		 * @handler
		 * @inheritdoc #event-dom/hashchange
		 * @localdoc Handles changing hash of the attached {@link #$element}
		 * @param {Object} $event {@link jQuery} event
		 * @fires hub/route/change
		 */
		"dom/hashchange": function ($event) {
			var me = this;
			var hash = me[$ELEMENT].get(0).location.hash.replace(RE, "");

			// Did anything change?
			if (hash !== me[HASH]) {
				// Store and publish new hash
				me.publish("route/change", me[HASH] = hash);
			}
			else {
				// Prevent further hashchange handlers from receiving this
				$event.stopImmediatePropagation();
			}
		},

		/**
		 * Hash set handler (local)
		 * @inheritdoc #event-dom/hashset
		 * @localdoc Handles setting hash of the attached {@link #$element}
		 * @handler
		 */
		"dom/hashset": function ($event, hash, silent) {
			this.publish("route/set", hash, null, silent);
		},

		/**
		 * Route set handler (global), implicitly translates to {@link #event-dom/hashset} by setting the {@link #$element} hash
		 * @handler hub/route/set
		 * @return {Promise}
		 */
		"hub/route/set": function (path, data, silent) {
			var me = this;

			// If we are silent we update the local me[HASH] to prevent change detection
			if (silent === true) {
				me[HASH] = path;
			}

			me[$ELEMENT].get(0).location.hash = path;
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/woven',[
	"./config",
	"when",
	"jquery",
	"poly/array"
], function WovenModule(config, when, $) {
	"use strict";

	/**
	 * @class dom.loom.woven
	 * @mixin dom.loom.config
	 * @mixin Function
	 * @static
	 */

	var ARRAY_MAP = Array.prototype.map;
	var LENGTH = "length";
	var WOVEN = "woven";
	var $WARP = config["$warp"];

	/**
	 * Retrieve all or specific widget instances living on this element, that are
	 * created by {@link dom.loom.weave}.
	 *
	 * It also lives as a jquery plugin as {@link $#method-woven}.
	 * @method constructor
	 * @param {...String} [widget] One or more widget names to narrow down the returned ones.
	 * @return {Promise} Promise to the completion of retrieving the woven widgets array.
	 */
	return function woven() {
		var $woven = [];
		var $wovenLength = 0;
		var re;

		// If we have arguments we have convert and filter
		if (arguments[LENGTH] > 0) {
			// Map arguments to a regexp
			re = new RegExp(ARRAY_MAP.call(arguments, function (widget) {
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
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/loom/plugin',[
	"jquery",
	"when",
	"./config",
	"./weave",
	"./unweave",
	"./woven",
	"troopjs-util/getargs",
	"poly/array"
], function WeaveModule($, when, config, weave, unweave, woven, getargs) {
	"use strict";

	/**
	 * Extends {@link jQuery} with:
	 *
	 *  - {@link $#property-weave} and {@link $#property-woven} properties
	 *  - {@link $#method-weave}, {@link $#method-unweave} and {@link $#method-woven} methods
	 *
	 * @class dom.loom.plugin
	 * @static
	 * @alias plugin.jquery
	 */

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
	 * @return {boolean}
	 * @ignore
	 */
	function hasDataWeaveAttr(element) {
		return $(element).attr(ATTR_WEAVE) !== UNDEFINED;
	}

	/**
	 * Tests if element has a data-woven attribute
	 * @param element to test
	 * @return {boolean}
	 * @ignore
	 */
	function hasDataWovenAttr(element) {
		return $(element).attr(ATTR_WOVEN) !== UNDEFINED;
	}

	/**
	 * @class $
	 */

	/**
	 * jQuery `:weave` expression
	 * @property weave
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
	 * jQuery `:woven` expression
	 * @property woven
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
	 * @method weave
	 * @inheritdoc dom.loom.weave#constructor
	 */
	$FN[WEAVE] = weave;

	/**
	 * @method unweave
	 * @inheritdoc dom.loom.unweave#constructor
	 */
	$FN[UNWEAVE] = unweave;

	/**
	 * @method woven
	 * @inheritdoc dom.loom.woven#constructor
	 */
	$FN[WOVEN] = woven;
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-requirejs/multiversion',[],function MultiVersionModule() {
	"use strict";

	/**
	 * RequireJS multiversion plugin
	 * @class requirejs.multiversion
	 * @static
	 * @alias plugin.requirejs
	 */

	//TODO Add usage docs

	var UNDEFINED;
	var RE = /(.+?)#(.+)$/;
	var RE_EMPTY = /^empty:/;
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

			if (RE_EMPTY.test(parentRequire.toUrl(name + ".js"))) {
				onload(UNDEFINED);
			}
			else {
				parentRequire([ name ], function (module) {
					onload(module);
				}, onload.error);
			}
		}
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-requirejs/shadow',[ "text" ], function (text) {
	"use strict";

	/**
	 * RequireJS shadow plugin
	 * @class requirejs.shadow
	 * @static
	 * @alias plugin.requirejs
	 */

	//TODO Add usage docs

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

		return "define([" + deps.join(", ") + "], function (" + args.join(", ") + ") {\n"
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
				content = content.replace(/define\(/, function (match) {
					return match + '"' + [pluginName, moduleName].join('!') + '",';
				});
				write(content);
			}
		}
	};
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-util/select',[],function SelectModule() {
	"use strict";

	/**
	 * @class util.select
	 * @mixin Function
	 * @static
	 */

	var UNDEFINED;
	var FALSE = false;
	var PERIOD = ".";
	var LEFT_BRACKET = "[";
	var RIGHT_BRACKET = "]";
	var SINGLE_QUOTE = "'";
	var DOUBLE_QUOTE = "\"";

	/**
	 * Function that traverses a JSON object
	 * @method constructor
	 * @param {String} query simple JSON query
	 * @return {*} Value from traversed query
	 */
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
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-requirejs/json',[
	"text",
	"troopjs-util/select",
	"poly/json"
], function (text, select) {
	"use strict";

	/**
	 * RequireJS json plugin
	 * @class requirejs.json
	 * @static
	 * @alias plugin.requirejs
	 */

	//TODO Add usage docs

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
				write("define('" + pluginName + "!" + moduleName + "', function(){ return " + JSON.stringify(buildMap[moduleName]) + "});");
			}
		}
	};
});
