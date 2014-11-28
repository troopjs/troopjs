/**
 *   ____ .     ____  ____  ____    ____.
 *   \   (/_\___\  (__\  (__\  (\___\  (/
 *   / ._/  ( . _   \  . /   . /  . _   \_
 * _/    ___/   /____ /  \_ /  \_    ____/
 * \   _/ \____/   \____________/   /
 *  \_t:_____r:_______o:____o:___p:/ [ troopjs - 3.0.0-pr.5+e1aa0ce ]
 *
 * @license http://troopjs.mit-license.org/ © Mikael Karon, Garry Yao, Eyal Arubas
 */

define('troopjs/version',[], { 'toString': function () { return "3.0.0-pr.5+e1aa0ce"; } });

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/mixin/decorator',[ "poly/object" ], function () {
	

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
define('troopjs-compose/decorator/after',[ "../mixin/decorator" ], function (Decorator) {
	

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
				? function () {
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
define('troopjs-compose/decorator/around',[ "../mixin/decorator" ], function (Decorator) {
	

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
define('troopjs-compose/decorator/before',[ "../mixin/decorator" ], function (Decorator) {
	

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
				? function () {
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
 * @license MIT http://mu-lib.mit-license.org/
 */
define('mu-merge/main',[ "poly/object" ], function () {
	

	/**
	 * @class mu-lib.merge
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

define('mu-merge', ['mu-merge/main'], function (main) { return main; });

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/extend',[
	"../mixin/decorator",
	"mu-merge"
], function (Decorator, merge) {
	

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
define('troopjs-compose/decorator/from',[ "../mixin/decorator" ], function (Decorator) {
	

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
define('troopjs-log/sink/methods',[], function () {
	return [ "assert", "debug", "dir", "error", "info", "log", "time", "timeEnd", "trace", "warn" ];
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/sink/console',[
	"./methods",
	"poly/array",
	"poly/function"
], function (METHODS) {
	

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
define('troopjs-log/config',[
	"module",
	"mu-merge"
], function (module, merge) {
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
], function (METHODS, CONF) {
	

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
], function (METHODS) {
	

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
define('troopjs-compose/mixin/config',[
	"module",
	"mu-merge"
], function (module, merge) {
	

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
		"pragmas": [],


		/**
		 * @cfg {RegExp} specials Regular Expression used parse 'specials'.
		 * A special must be in form of a function call (ended in parenthesis), and have an optional type following a slash
		 *
		 * ````
		 * <special>[/<type>](<arguments>)
		 * ````
		 * @protected
		 */
		"specialsPattern": /^([^\/]+)(?:\/(.+?))?\((.*)\)$/
	}, module.config());
});

(function() {
    

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('mu-unique/src/sorter',[], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        throw Error("no module loader found");
    }

    function factory() {
        return function (arr, order) {
            Array.prototype.sort.call(arr, order);
        };
    }

}());

(function() {
    

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('mu-unique/src/unique',['./sorter'], uniqueFactory);
    } else if (typeof exports === 'object') {
        module.exports = uniqueFactory(
            require('./sorter')
        );
    } else {
        throw Error("no module loader found");
    }

    function uniqueFactory(sorter) {

        var undefined,
            DEFAULT_SORTABLE = false;

        function trivialOrder(a, b) {
            return a > b ? 1 : a < b ? -1 : 0;
        }

        function trivialCompare(a, b) {
            return a === b;
        }

        /**
         * Assume a sorted array. Remove duplicate elements with one pass.
         * @param arr A sorted array
         * @param order
         * @private
         */
        function _uniqueifySorted(arr, order) {
            var i = 0, n = 1, len = arr.length;
            if (len < 2) return;
            while (i < len) {
                if (order(arr[i], arr[n - 1]) !== 0) {
                    arr[n] = arr[i];
                    n++;
                }
                i++;
            }
            arr.length = n;
        }

        /**
         * Assume an unsorted array. Removes duplicates with two nested loops.
         * @param arr
         * @param compare
         * @private
         */
        function _uniqueifyNotSorted(arr, compare) {
            var i = 0, j, len = arr.length;
            while (i < len) {
                j = i + 1;
                while (j < len) {
                    if (compare(arr[i], arr[j])) {
                        arr[j--] = arr[--len];
                    }
                    j++;
                }
                i++;
            }
            arr.length = len;
        }

        /**
         * Uniqueify an array.
         * @param arr the array to uniqueify
         * @param sortable is this array sortable?
         * @param comparator a function which defines an order for the elements in
         * the array (if the array is sortabel), or elements equality if it is not.
         */
        return function () {

            var arr,
                sortable,
                comparator,
                args = Array.prototype.slice.call(arguments, 0);

            if (args.length === 0) args.push(this);

            if (args.length === 1) {
                if (Object.prototype.toString.call(args[0]) !== '[object Array]')
                    args.unshift(this);
                else
                    args.push(DEFAULT_SORTABLE);
            }

            if (args.length === 2) {
                if (Object.prototype.toString.call(args[0]) !== '[object Array]') {
                    args.unshift(this);
                } else if (args[1] === true) {
                    args.push(trivialOrder);
                } else if (args[1] === false) {
                    args.push(trivialCompare);
                } else {
                    args[2] = args[1];
                    args[1] = DEFAULT_SORTABLE;
                }
            }

            arr = args[0];
            sortable = args[1];
            comparator = args[2];

            if (Object.prototype.toString.call(arr) !== '[object Array]')
                throw Error("'arr' must be an array");
            if (!(sortable === true || sortable === false))
                throw Error("'sortable' must be a boolean");
            if (typeof comparator !== 'function')
                throw Error("'comparator' must be a function");

            if (sortable) {
                sorter(arr, comparator);
                _uniqueifySorted(arr, comparator);
            } else {
                _uniqueifyNotSorted(arr, comparator);
            }

            return arr.length;
        };
    }

}());

(function() {
    

    if (typeof define === 'function' && define.amd) {
        define('mu-unique/main',['./src/unique'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('./src/unique')
        );
    } else {
        throw Error("no module loader found");
    }

    function factory(unique) {
        return unique;
    }

})();

define('mu-unique', ['mu-unique/main'], function (main) { return main; });

(function() {
    

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('mu-getargs/src/getargs',[], getargsFactory);
    } else if (typeof exports === 'object') {
        module.exports = getargsFactory();
    } else {
        throw Error("no module loader found");
    }

    function getargsFactory() {

        /**
         * @class mu-lib.getargs
         * @mixin Function
         * @static
         */

        var UNDEFINED,
            STR_SUBSTRING = String.prototype.substring,
            STR_SLICE = String.prototype.slice,
            RE_STRING = /^(["']).*\1$/,
            RE_BOOLEAN = /^(?:false|true)$/i,
            RE_BOOLEAN_TRUE = /^true$/i,
            RE_DIGIT = /^\d+$/;

        /**
         * Function that calls on a String, to parses it as function parameters delimited by commas.
         *
         *    " 1  , '2' , 3  ,false,5 "
         *
         * results in
         *
         *    [ 1, "2", 3, false, 5]
         *
         *
         * and
         *
         *    "'1, 2 ',  3,\"4\", 5 "
         *
         * results in
         *
         *    [ "1, 2 ", 3, "4", 5 ]
         *
         * Also handles named parameters.
         *
         *    "1, two=2, 3, 'key.four'=4, 5"
         *
         * results in
         *
         *    result = [1, 2, 3, 4, 5]
         *    result["two"] === result[1]
         *    result["key.four"] === result[3]
         *
         * @method constructor
         * @return {Array} the array of parsed params.
         */
        return function getargs(str) {

            str = str || this;

            if (!(typeof str == 'string' || str instanceof String))
                throw Error("First argument must be a string");

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

                var value = STR_SUBSTRING.call(str, from, to);
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
            for (index = from = to = 0, length = str.length; index < length; index++) {

                // Get char
                c = str.charAt(index);

                switch (c) {
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
                            key = STR_SUBSTRING.call(str, from, to);

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
    }

}());

(function() {
    

    if (typeof define === 'function' && define.amd) {
        define('mu-getargs/main',['./src/getargs'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('./src/getargs')
        );
    } else {
        throw Error("no module loader found");
    }

    function factory(getargs) {
        return getargs;
    }

})();

define('mu-getargs', ['mu-getargs/main'], function (main) { return main; });

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/mixin/factory',[
	"./config",
	"./decorator",
	"mu-unique",
	"mu-getargs",
	"poly/object"
], function (config, Decorator, unique, getargs) {
	

	/**
	 * The factory module establishes the fundamental object composition in TroopJS:
	 *
	 *  - **First-class mixin** based on prototype, that supports deterministic multiple inheritance that:
	 *    - Eliminating the frustrating issues from multi-tiered, single-rooted ancestry;
	 *    - Avoid occasionally unexpected modification from prototype chain, from the prototype-based inheritance;
	 *    - Reduced the function creation overhead in classical inheritance pattern;
	 *  - **Advice decorator** for method overriding without the need for super call;
	 *  - **Declarative** "special" functions that never overrides parent ones reserved for event emission
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
	var ARRAY_SLICE = ARRAY_PROTO.slice;
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
	var SPECIALS_PATTERN = config["specialsPattern"];

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
		var args = ARRAY_SLICE.call(arguments);
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
				if ((matches = SPECIALS_PATTERN.exec(name))) {
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
		"value": function () {
			return Factory.apply(null, arguments)();
		}
	});

	return Factory;
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/logger',[ "./sink/console" ], function (logger) {
	

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
define('troopjs-core/event/runner/sequence',[ "when" ], function (when) {
	

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
		var candidates = [];
		var candidatesCount = 0;
		var handler;

		// Copy from handlers list to candidates array
		for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
			candidates[candidatesCount++] = handler;
		}

		// Reduce `candidates`
		return when.reduce(candidates, function (results, candidate, index) {
			// Apply `candidate[CALLBACK]` with `candidate[CONTEXT]` passing `args`
			// Pass result from apply to `when` and onwards to store in `results`
			return when(candidate.apply(candidate[CONTEXT], args), function (result) {
				results[index] = result;
			})
			// `yield` results for next execution
			.yield(results);
		}, candidates);
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/event/emitter',[
	"../mixin/base",
	"./runner/sequence"
], function (Base, sequence) {
	

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
	var TOSTRING_FUNCTION = "[object Function]";
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
	var LIMIT = "limit";
	var ON = "on";
	var OFF = "off";

	/**
	 * Creates a new handler
	 * @inheritdoc #on
	 * @return {core.event.emitter.handler} Handler
	 * @ignore
	 */
	function createHandler(type, callback, data) {
		var me = this;
		var count = 0;

		var handler = function () {
			// Let `limit` be `handler[LIMIT]`
			var limit = handler[LIMIT];

			// Get result from execution of `handler[CALLBACK]`
			var result = handler[CALLBACK].apply(this, arguments);

			// If there's a `limit` and `++count` is greater or equal to it `off` the callback
			if (limit !== 0 && ++count >= limit) {
				me.off(type, callback);
			}

			// Return
			return result;
		};

		if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
			handler[CALLBACK] = callback;
			handler[CONTEXT] = me;
			handler[LIMIT] = 0;
		}
		else {
			handler[CALLBACK] = callback[CALLBACK];
			handler[CONTEXT] = callback[CONTEXT] || me;
			handler[LIMIT] = callback[LIMIT] || 0;

			if (callback.hasOwnProperty(ON)) {
				handler[ON] = callback[ON];
			}
			if (callback.hasOwnProperty(OFF)) {
				handler[OFF] = callback[OFF];
			}
		}

		handler[DATA] = data;

		return handler;
	}

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Base.extend(function () {
		/**
		 * Handlers attached to this component, addressable either by key or index
		 * @private
		 * @readonly
		 * @property {core.event.emitter.handler[]} handlers
		 */
		this[HANDLERS] = [];
	}, {
		"displayName" : "core/event/emitter",

		/**
		 * Adds a listener for the specified event type.
		 * @chainable
		 * @param {String} type The event type to subscribe to.
		 * @param {Function|Object} callback The event callback to add. If callback is a function defaults from below will be used:
		 * @param {Function} callback.callback Callback method.
		 * @param {Object} [callback.context=this] Callback context.
		 * @param {Number} [callback.limit=0] Callback limit.
		 * @param {Function} [callback.on=undefined] Will be called once this handler is added to the handlers list.
		 * @param {core.event.emitter.handler} [callback.on.handler] The handler that was just added.
		 * @param {Object} [callback.on.handlers] The list of handlers the handler was added to.
		 * @param {Function} [callback.off=undefined] Will be called once this handler is removed from the handlers list.
		 * @param {core.event.emitter.handler} [callback.off.handler] The handler that was just removed.
		 * @param {Object} [callback.off.handlers] The list of handlers the handler was removed from.
		 * @param {*} [data] Handler data
		 */
		"on" : function (type, callback, data) {
			var me = this;
			var handlers;
			var handler;

			// Get callback from next arg
			if (callback === UNDEFINED) {
				throw new Error("no callback provided");
			}

			// Create new handler
			handler = createHandler.call(me, type, callback, data);

			// Have handlers
			if ((handlers = me[HANDLERS][type]) !== UNDEFINED) {
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
				handlers[HEAD] = handlers[TAIL] = handler;
			}

			// If we have an `ON` callback ...
			if (handler.hasOwnProperty(ON)) {
				// .. call it in the context of `me`
				handler[ON].call(me, handler, handlers);
			}

			return me;
		},

		/**
		 * Remove callback(s) from a subscribed event type, if no callback is specified,
		 * remove all callbacks of this type.
		 * @chainable
		 * @param {String} type The event type subscribed to
		 * @param {Function|Object} [callback] The event callback to remove. If callback is a function context will be this, otherwise:
		 * @param {Function} [callback.callback] Callback method to match.
		 * @param {Object} [callback.context=this] Callback context to match.
		 */
		"off" : function (type, callback) {
			var me = this;
			var _callback;
			var _context;
			var handlers;
			var handler;
			var head;
			var tail;

			// Have handlers
			if ((handlers = me[HANDLERS][type]) !== UNDEFINED) {
				// Have HEAD in handlers
				if (HEAD in handlers) {
					if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
						_callback = callback;
						_context = me;
					}
					else if (callback !== UNDEFINED) {
						_callback = callback[CALLBACK];
						_context = callback[CONTEXT];
					}

					// Iterate handlers
					for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
						// Should we remove?
						remove : {
							// If no context or context does not match we should break
							if (_context && handler[CONTEXT] !== _context) {
								break remove;
							}

							// If no callback or callback does not match we should break
							if (_callback && handler[CALLBACK] !== _callback) {
								break remove;
							}

							// If we have an `OFF` callback ...
							if (handler.hasOwnProperty(OFF)) {
								// .. call it in the context of `me`
								handler[OFF].call(me, handler, handlers);
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
		 * Adds a listener for the specified event type exactly once.
		 * @chainable
		 * @inheritdoc #on
		 */
		"one": function (type, callback, data) {
			var me = this;
			var _callback;

			if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
				_callback = {};
				_callback[CALLBACK] = callback;
				_callback[LIMIT] = 1;
			}
			else {
				_callback = callback;
				_callback[LIMIT] = 1;
			}

			// Delegate return to `on`
			return me.on(type, _callback, data);
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
		"emit" : function (event, args) {
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
define('troopjs-core/component/runner/sequence',[ "poly/array" ], function () {
	

	/**
	 * @class core.component.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var FALSE = false;
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

		// Iterate handlers
		for (candidate = handlers[HEAD]; candidate !== UNDEFINED; candidate = candidate[NEXT]) {
			if (
				// Filter `candidate[CONTEXT]` if we have `context`
				(context !== UNDEFINED && candidate[CONTEXT] !== context) ||
					// Filter `candidate[CALLBACK]` if we have `callback`
				(callback !== UNDEFINED && candidate[CALLBACK] !== callback)
			) {
				continue;
			}

			candidates[candidatesCount++] = candidate;
		}

		// Reduce and return
		return candidates.reduce(function (current, candidate) {
			var result = current !== FALSE
				? candidate.apply(candidate[CONTEXT], args)
				: current;

			return result === UNDEFINED
				? current
				: result;
		}, UNDEFINED);
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/signal/initialize',[ "when" ], function (when) {
	var UNDEFINED;
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.initialize
	 * @implement core.component.signal
	 * @static
	 * @alias feature.signal
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.base#phase} to `initialized`
	 */

	return function initialize() {
		var me = this;
		var args = arguments;

		return when(me[PHASE], function (phase) {
			var _args;

			if (phase === UNDEFINED) {
				// Let `me[PHASE]` be `"initialize"`
				// Let `_args` be `[ "initialize" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ me[PHASE] = "initialize" ], args);

				return me
					.signal.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `"initialized"`
						return me[PHASE] = "initialized";
					});
			}
			else {
				return phase;
			}
		});
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/signal/start',[
	"./initialize",
	"when"
], function (initialize, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.start
	 * @implement core.component.signal
	 * @static
	 * @alias feature.signal
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.base#phase} to `started`
	 */

	return function start() {
		var me = this;
		var args = arguments;

		return when(initialize.apply(me, args), function (phase) {
			var _args;

			if (phase === "initialized") {
				// Let `me[PHASE]` be `"start"`
				// Let `_args` be `[ "start" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ me[PHASE] = "start" ], args);

				return me
					.signal.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `"started"`
						return me[PHASE] = "started";
					});
			}
			else {
				return phase;
			}
		});
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/signal/stop',[
	"./start",
	"when"
], function (start, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.stop
	 * @implement core.component.signal
	 * @static
	 * @alias feature.signal
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.base#phase} to `stopped`
	 */

	return function stop() {
		var me = this;
		var args = arguments;

		return when(start.apply(me, args), function (phase) {
			var _args;

			if (phase === "started") {
				// Let `me[PHASE]` be `"stop"`
				// Let `_args` be `[ "stop" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ me[PHASE] = "stop" ], args);

				return me
					.signal.apply(me, _args)
					.then(function () {
						// Let `me[PHASE]` be `"stopped"`
						return me[PHASE] = "stopped";
					});
			}
			else {
				return phase;
			}
		});
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/signal/finalize',[
	"./stop",
	"when"
], function (stop, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";

	/**
	 * @class core.component.signal.finalize
	 * @implement core.component.signal
	 * @static
	 * @alias feature.signal
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.base#phase} to `finalized`
	 */
	return function finalize() {
		var me = this;
		var args = arguments;

		return when(stop.apply(me, args), function (phase) {
			var _args;

			if (phase === "stopped") {
				// Let `me[PHASE]` be `"finalize"`
				// Let `_args` be `[ "finalize" ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ me[PHASE] = "finalize" ], args);

				return me
					.signal.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `"finalized"`
						return me[PHASE] = "finalized";
					});
			}
			else {
				return phase;
			}
		});
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/registry/component',[
	"../mixin/base",
	"poly/array"
], function (Base) {
	

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
	var REGEXP_STRING = "[object RegExp]";

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Base.extend(function () {
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
		 * - If no value is provided, it depends on the **key**
		 *   - if key is string or number, current value under this key is returned.
		 *   - if key is regexp, all values whose key match this pattern are returned
		 * - If value is provided it replaces the current value for the key
		 * @param {String|Number|RegExp} [key] Entry key, index or pattern
		 * @param {*} [value] Entry value
		 * @return {*} All values if no key, current value for key if no value provided, otherwise the provided value if a new entry is created
		 * @throws Error if a new entry is created and key is not of type String
		 */
		"access": function (key, value) {
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
			// query registry by keys
			else if (OBJECT_TOSTRING.call(key) === REGEXP_STRING && value === UNDEFINED){
				result = Object.keys(index_key).filter(function (name) {
						return key.test(name);
				}).map(function map(key) {
					return index_key[key][VALUE];
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
		"remove": function (key) {
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

		"compact": function () {

		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/registry',[ "../registry/component" ], function (Registry) {
	

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

	return Registry.create({
		"displayName": "core/component/registry"
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/task/registry',[ "../registry/component" ], function (Registry) {
	

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

	return Registry.create({
		"displayName": "core/task/registry"
	});
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/task/factory',[
	"./registry",
	"when"
], function (registry, when) {
	

	/**
	 * @class core.task.factory
	 * @mixin Function
	 * @static
	 */

	var NAME = "name";
	var CONTEXT = "context";
	var STARTED = "started";
	var FINISHED = "finished";

	/**
	 * Creates and registers a task
	 * @method constructor
	 * @param {Promise|Resolver} promiseOrResolver The task resolver.
	 * @param {String} [name] Task name
	 * @return {Promise}
	 */
	return function factory(promiseOrResolver, name) {
		var task = when.isPromiseLike(promiseOrResolver)
			? when(promiseOrResolver)
			: when.promise(promiseOrResolver);

		task[CONTEXT] = this;
		task[NAME] = name || "task";
		task[STARTED] = new Date();

		// Compute task `key`
		var key = task[NAME] + "@" + task[STARTED];

		// Register task
		registry.access(key, task);

		return task
			// Cleanup
			.ensure(function () {
				// Let `task[FINISHED]` be `new Date()`
				task[FINISHED] = new Date();

				// Un-register task
				registry.remove(key)
			});
	};
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/base',[
	"../event/emitter",
	"./runner/sequence",
	"./signal/start",
	"./signal/finalize",
	"troopjs-compose/mixin/config",
	"./registry",
	"../task/factory",
	"mu-merge",
	"troopjs-compose/decorator/around",
	"when",
	"poly/array"
], function (Emitter, sequence, start, finalize, COMPOSE_CONF, componentRegistry, taskFactory, merge, around, when) {
	

	/**
	 * Imagine component as an object that has predefined life-cycle, with the following phases:
	 *
	 *   1. initialize
	 *   1. initialized
	 *   1. start
	 *   1. started
	 *   1. stop
	 *   1. stopped
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
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var CONFIGURATION = "configuration";
	var RUNNER = "runner";
	var HANDLERS = "handlers";
	var HEAD = "head";
	var TAIL = "tail";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var SIG = "sig";
	var SIG_SETUP = SIG + "/setup";
	var SIG_ADD = SIG + "/add";
	var SIG_REMOVE = SIG + "/remove";
	var SIG_TEARDOWN = SIG + "/teardown";
	var ON = "on";
	var ONE = "one";
	var EVENT_TYPE_SIG = new RegExp("^" + SIG + "/(.+)");

	/**
	 * Current lifecycle phase
	 * @readonly
	 * @protected
	 * @property {"initialized"|"started"|"stopped"|"finalized"} phase
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
	 * Task signal
	 * @event sig/task
	 * @localdoc Triggered when this component starts a {@link #method-task}.
	 * @param {Object} task Task
	 * @param {Promise} task.promise The Promise that makes up of this task
	 * @param {Object} task.context from which component the task is issued
	 * @param {Date} task.started Task start date
	 * @param {Date} task.finished Task completion date
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

	/**
	 * @method one
	 * @chainable
	 * @inheritdoc
	 * @localdoc Adds support for {@link #event-sig/setup} and {@link #event-sig/add}.
	 * @fires sig/setup
	 * @fires sig/add
	 */

	// Add pragma for signals and events.
	COMPOSE_CONF.pragmas.push({
		"pattern": /^(?:sig|one?)\/.+/,
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
		"sig/initialize" : function () {
			var me = this;
			var specials = me.constructor.specials;

			// Register component
			componentRegistry.access(me.toString(), me);

			// Initialize ON specials
			var specials_on = when.map(specials[ON] || ARRAY_PROTO, function (special) {
				return me.on(special[TYPE], special[VALUE]);
			});

			// Initialize ONE specials
			var specials_one = when.map(specials[ONE] || ARRAY_PROTO, function (special) {
				return me.one(special[TYPE], special[VALUE]);
			});

			// Join and return
			return when.join(specials_on, specials_one);
		},

		/**
		 * Handles the component finalization.
		 * @inheritdoc #event-sig/finalize
		 * @localdoc Un-registers all handlers
		 * @handler
		 * @return {Promise}
		 */
		"sig/finalize" : function () {
			var me = this;

			// Un-register component
			componentRegistry.remove(me.toString());

			// Finalize all handlers, in reverse
			return when.map(me[HANDLERS].reverse(), function (handlers) {
				return me.off(handlers[TYPE]);
			});
		},

		/**
		 * Add to the component {@link #configuration configuration}, possibly merge with the existing one.
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
		"configure" : function (config) {
			return merge.apply(this[CONFIGURATION], arguments);
		},

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Adds support for {@link #event-sig/setup} and {@link #event-sig/add}.
		 * @fires sig/setup
		 * @fires sig/add
		 */
		"on": around(function (fn) {
			return function (type, callback, data) {
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
						? fn.call(me, type, callback, data)
						: me;
			};
		}),

		/**
		 * @chainable
		 * @method
		 * @inheritdoc
		 * @localdoc Adds support for {@link #event-sig/remove} and {@link #event-sig/teardown}.
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
					? fn.call(me, type, callback)
					: me;
			};
		}),

		/**
		 * Signals the component
		 * @param {String} _signal Signal
		 * @param {...*} [args] signal arguments
		 * @return {Promise}
		 */
		"signal": function (_signal) {
			var me = this;

			// Slice `arguments`
			var args = ARRAY_SLICE.call(arguments);

			// Modify first argument
			args[0] = "sig/" + _signal;

			// Emit
			return me.emit.apply(me, args);
		},

		/**
		 * Schedule a new promise that runs on this component, sends a {@link #event-sig/task} once finished.
		 *
		 * **Note:** It's recommended to use **this method instead of an ad-hoc promise** to do async lift on this component,
		 * since in additional to an ordinary promise, it also helps to track the context of any running promise,
		 * including it's name, completion time and a given ID.
		 *
		 * 	var widget = Widget.create({
		 * 		"sig/task" : function(task) {
		 * 			print('task %s started at: %s, finished at: %s', task.name, task.started, task.finished);
		 * 		}
		 * 	});
		 *
		 * 	widget.task(function(resolve) {
		 * 		$(this.$element).fadeOut(resolve);
		 * 	}, 'animate');
		 *
		 * @param {Promise|Resolver} promiseOrResolver The task resolver.
		 * @param {String} [name] Task name
		 * @return {Promise}
		 * @fires sig/task
		 */
		"task" : function (promiseOrResolver, name) {
			var me = this;

			// Create task
			var task = taskFactory.call(me, promiseOrResolver, name);

			// Signal `TASK` and yield `task`
			return me.signal("task", task).yield(task);
		},

		/**
		 * Start the component life-cycle, sends out {@link #event-sig/initialize} and then {@link #event-sig/start}.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 * @fires sig/initialize
		 * @fires sig/start
		 */
		"start" : start,

		/**
		 * Stops the component life-cycle.
		 * @param {...*} [args] arguments
		 * @return {Promise}
		 * @fires sig/stop
		 * @fires sig/finalize
		 */
		"stop" : finalize
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/runner/pipeline',[ "when" ], function (when) {
	

	/**
	 * @class core.component.runner.pipeline
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var FUNCTION_PROTO = Function.prototype;
	var APPLY = FUNCTION_PROTO.apply;
	var CALL = FUNCTION_PROTO.call;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var ARRAY_SLICE = Array.prototype.slice;
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
			if (
				// Filter `candidate[CONTEXT]` if we have `context`
			(context !== UNDEFINED && candidate[CONTEXT] !== context) ||
				// Filter `candidate[CALLBACK]` if we have `callback`
			(callback !== UNDEFINED && candidate[CALLBACK] !== callback)
			) {
				continue;
			}

			// Add to candidates
			candidates[candidatesCount++] = candidate;
		}

		return when
			// Reduce `candidates`
			.reduce(candidates, function (current, candidate) {
				// Get object type
				var type = OBJECT_TOSTRING.call(current);

				// Calculate method depending on type
				var method = (type === TOSTRING_ARRAY || type === TOSTRING_ARGUMENTS)
					? APPLY
					: CALL;

				// Execute `candidate` using `method` in `context` passing `current`
				return method.call(candidate, context, current);
			}, args)
			// Convert result
			.then(function (result) {
				// Get object type
				var type = OBJECT_TOSTRING.call(result);

				// Convert and return `result`
				return type === TOSTRING_ARRAY
					? result
					: type === TOSTRING_ARGUMENTS
						? ARRAY_SLICE.call(result)
						: [ result ];
			});
	}
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/runner/pattern',[], function () {
	return /^(?:initi|fin)alized?$/;
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/runner/pipeline',[
	"./pattern",
	"when"
], function (RE_PHASE, when) {
	

	/**
	 * @class core.pubsub.runner.pipeline
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var FUNCTION_PROTO = Function.prototype;
	var APPLY = FUNCTION_PROTO.apply;
	var CALL = FUNCTION_PROTO.call;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var ARRAY_SLICE = Array.prototype.slice;
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
			if (
				// Filter `candidate[CONTEXT]` if we have `context`
			(context !== UNDEFINED && candidate[CONTEXT] !== context) ||
				// Filter `candidate[CALLBACK]` if we have `callback`
			(callback !== UNDEFINED && candidate[CALLBACK] !== callback)
			) {
				continue;
			}

			candidates[candidatesCount++] = candidate;
		}

		return when
			// Reduce `candidates`
			.reduce(candidates, function (current, candidate) {
				// Let `context` be `candidate[CONTEXT]`
				var context = candidate[CONTEXT];

				// Return early if `context` is `UNDEFINED` or matches a blocked phase
				if (context !== UNDEFINED && RE_PHASE.test(context[PHASE])) {
					return current;
				}

				// Get object type
				var type = OBJECT_TOSTRING.call(current);

				// Calculate method depending on type
				var method = (type === TOSTRING_ARRAY || type === TOSTRING_ARGUMENTS)
					? APPLY
					: CALL;

				// Execute `candidate` using `method` in `context` passing `current`
				return when(method.call(candidate, context, current), function (result) {
					// Return result defaulting to `current`
					return result === UNDEFINED
						? current
						: result;
				});
			}, args)
			// Convert and remember result
			.then(function (result) {
				// Get object type
				var type = OBJECT_TOSTRING.call(result);

				// Convert, store and return `result` in `handlers[MEMORY]`
				return handlers[MEMORY] = type === TOSTRING_ARRAY
					? result
					: type === TOSTRING_ARGUMENTS
						? ARRAY_SLICE.call(result)
						: [ result ];
			});
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/emitter',[
	"../event/emitter",
	"./runner/pipeline",
	"troopjs-compose/decorator/from"
], function (Emitter, pipeline, from) {
	

	/**
	 * A specialized version of {@link core.event.emitter emitter} for memorized events.
	 *
	 * ## Memorized emitting
	 *
	 * A emitter event will memorize the "current" value of each event. Each runner may have it's own interpretation
	 * of what "current" means.
	 *
	 * @class core.pubsub.emitter
	 * @extend core.event.emitter
	 */

	var UNDEFINED;
	var ARRAY_SLICE = Array.prototype.slice;
	var MEMORY = "memory";
	var HANDLERS = "handlers";
	var RUNNER = "runner";
	var TYPE = "type";

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

	return Emitter.extend({
		"displayName": "core/pubsub/emitter",

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
		 *   - The original data params from {@link #publish} if this is the first handler, or the previous handler returns `undefined`.
		 *   - One value as the single argument if the previous handler return a non-array.
		 *   - Each argument value deconstructed from the returning array of the previous handler.
		 *
		 * @param {String} type The topic to publish.
		 * @param {...*} [args] Additional params that are passed to the handler function.
		 * @return {Promise}
		 */
		"publish" : function (type) {
			var me = this;

			// Prepare event object
			var event = {};
			event[TYPE] = type;
			event[RUNNER] = pipeline;

			// Slice `arguments`
			var args = ARRAY_SLICE.call(arguments);

			// Modify first `arg`
			args[0] = event;

			// Delegate the actual emitting to event emitter.
			return me.emit.apply(me, args);
		},

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} type event type to peek at
		 * @param {*} [value] Value to use _only_ if no memory has been recorder
		 * @return {*} Value in MEMORY
		 */
		"peek": function (type, value) {
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
define('troopjs-core/pubsub/hub',[ "./emitter" ], function (Emitter) {
	

	/**
	 * @class core.pubsub.hub
	 * @extend core.pubsub.emitter
	 * @inheritdoc
	 * @localdoc This is the singleton instance of the {@link core.pubsub.emitter hub emitter}
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

	return Emitter.create({
		"displayName": "core/pubsub/hub"
	});
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
],function (Component, pipeline, COMPOSE_CONF, when, hub) {
	

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
	 * @localdoc Adds convenience methods and specials to interact with the hub
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var ARGS = "args";
	var TYPE = "type";
	var VALUE = "value";
	var HUB = "hub";
	var RE = new RegExp("^" + HUB + "/(.+)");

	// Add pragma for HUB special
	COMPOSE_CONF.pragmas.push({
		"pattern": /^hub(?::(memory))?\/(.+)/,
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
		"sig/initialize" : function () {
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
		"sig/start" : function () {
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
		"sig/add": function (handlers, type, callback) {
			var me = this;
			var matches;
			var _callback;

			if ((matches = RE.exec(type)) !== NULL) {
				// Let `_callback` be `{}` and initialize
				_callback = {};
				_callback[CONTEXT] = me;
				_callback[CALLBACK] = callback;

				// Subscribe to the hub
				hub.subscribe(matches[1], _callback);
			}
		},

		/**
		 * @inheritdoc
		 * @localdoc Removes remote subscription from the {@link core.pubsub.hub hub} that was previously registered in {@link #handler-sig/add}
		 * @handler
		 */
		"sig/remove": function (handlers, type, callback) {
			var me = this;
			var matches;
			var _callback;

			if ((matches = RE.exec(type)) !== NULL) {
				// Let `_callback` be `{}` and initialize
				_callback = {};
				_callback[CONTEXT] = me;
				_callback[CALLBACK] = callback;

				// Unsubscribe from the hub
				hub.unsubscribe(matches[1], _callback);
			}
		},

		/**
		 * Handles a component task
		 * @inheritdoc #event-sig/task
		 * @localdoc Publishes `task` on the {@link core.pubsub.hub hub} whenever a {@link #event-sig/task task} event is emitted
		 * @return {Promise}
		 * @template
		 * @handler
		 */
		"sig/task" : function (task) {
			return this.publish("task", task);
		},

		/**
		 * @inheritdoc core.pubsub.hub#publish
		 */
		"publish" : function () {
			return hub.publish.apply(hub, arguments);
		},

		/**
		 * @chainable
		 * @inheritdoc core.pubsub.hub#subscribe
		 * @localdoc Subscribe to public events from this component, forcing the context of which to be this component.
		 */
		"subscribe" : function (event, callback, data) {
			return this.on(HUB + "/" + event, callback, data);
		},

		/**
		 * @chainable
		 * @inheritdoc core.pubsub.hub#unsubscribe
		 * @localdoc Unsubscribe from public events in context of this component.
		 */
		"unsubscribe" : function (event, callback) {
			return this.off(HUB + "/" + event, callback);
		},

		/**
		 * @inheritdoc core.pubsub.hub#peek
		 */
		"peek" : function (event, value) {
			return hub.peek(event, value);
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/service',[ "./gadget" ], function (Gadget) {
	

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
(function() {
    

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('mu-selector-set/src/classifier',[], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        throw Error("no module loader found");
    }

    function factory() {

        /**
         * See:
         * https://github.com/jquery/sizzle/blob/709e1db5bcb42e9d761dd4a8467899dd36ce63bc/src/sizzle.js#L81
         * http://www.w3.org/TR/CSS21/syndata.html#value-def-identifier
         */
        var identifier = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+";

        // regular expressions
        var re = {

            /**
             * End of line whitespace
             */
            ws: /(\s+)$/,

            /**
             * End of line garbage is one of:
             * - anything that starts with a colon
             * - anything inside square brackets
             */
            garbage: /(\:.+?|\[.*?\])$/,

            /**
             * CSS ID selector
             */
            id: new RegExp("^#" + identifier),

            /**
             * CSS class selector
             */
            cls: new RegExp("^\\." + identifier),

            /**
             * A candidate is either:
             * - ID
             * - Class
             * - Tag
             * Look for candidates from the end of the line.
             */
            candidate: new RegExp("([#\\.]{0,1}" + identifier + "?)$")
        };

        /**
         * Get the most significant part of a CSS selector.
         * The "significant" part is defined as any leading id, class name or
         * tag name component (in that order of precedence) of the last
         * (right most) selector.
         *
         * See test/classifier.js for examples
         *
         * @private
         * @static
         * @param {String} selector CSS selector
         * @return {String} the most significant part of the selector
         */
        function classifier(selector) {
            var i, m, c, candidates = [];
            selector = selector
                .replace(re.ws, "")
                .replace(re.garbage, "");
            while (m = selector.match(re.candidate)) {
                selector = selector
                    .replace(re.candidate, "")
                    .replace(re.garbage, "");
                candidates.push(m[0]);
            }
            c = candidates.length;
            // if no candidates, return the universal selector
            if (!c)
                return '*';
            // return the ID part of the selector:
            for (i = 0; i < c; i++)
                if (re.id.test(candidates[i]))
                    return candidates[i];
            // if no ID, return the class
            for (i = 0; i < c; i++)
                if (re.cls.test(candidates[i]))
                    return candidates[i];
            // if no class, return the tag
            return candidates[0];
        }

        return classifier;
    }
}());

(function() {
    

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('mu-selector-set/src/splitter',[], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        throw Error("no module loader found");
    }

    function factory(){

        var IGNORE_BOUNDARIES = ['\'', '"'],
            SELECTORS_DELIMITER = ',';

        function splitter(selector){
            var res, len = 0, flag = false, tot = selector.length;
            if (!tot) return [];
            while (
                selector[len] &&
                (flag || selector[len] !== SELECTORS_DELIMITER)
            ) {
                if (selector[len] === flag){
                    flag = false;
                } else if (
                    flag === false &&
                    IGNORE_BOUNDARIES.indexOf(selector[len]) !== -1
                ){
                    flag = selector[len];
                }
                len++;
            }
            res = splitter(selector.substr(len + 1));
            res.push(selector.substr(0, len));
            return res;
        }

        return splitter;

    }
}());

(function(global) {
    

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('mu-selector-set/src/MappedLists',factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        throw Error("no module loader found");
    }

    function factory() {

        /**
         * A simple construct to manage lists by keys. Much like a hash map
         * with key-value pairs, this map has key-list pairs.
         * @constructor
         */
        function MappedLists() {
            this.lists = {};
        }

        /**
         * Add data to the list in `key`
         * @param key The key of the list
         * @param data Data to add
         * @returns {MappedLists}
         */
        MappedLists.prototype.add = function(key, data) {
            key += " ";
            this.lists[key] = this.lists[key] || [];
            this.lists[key].push(data);
            return this;
        };

        /**
         * Remove data from the list in `key`
         * @param key The key of the list
         * @param data Data to add
         * @param {Function} comp custom comparator to determine which items to remove
         * @returns {MappedLists}
         */
        MappedLists.prototype.remove = function(key, data, comp) {
            key += " ";
            comp = comp || eqComp;
            var i, list = this.lists[key];
            if (!list) return this;
            if (!data){
                delete this.lists[key];
                return this;
            }
            i = list.length;
            while(i--) if (comp(data, list[i])) list.splice(i, 1);
            return this;
        };

        /**
         * Get the list associated with 'key', or an empty list
         * if not found.
         * @param key
         * @returns {Array}
         */
        MappedLists.prototype.get = function(key) {
            key += " ";
            if (!this.lists[key]) this.lists[key] = [];
            return this.lists[key];
        };

        return MappedLists;
    }

    function eqComp(o1, o2){
        return o1 === o2;
    }
}(this));

(function() {
    

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('mu-selector-set/src/Subsets',['./MappedLists'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('./MappedLists'));
    } else {
        throw Error("no module loader found");
    }

    function factory(MappedLists) {

        /**
         * A "Subset" object encapsulates all the functionalities required to
         * manage a certain type (subset) of selectors.
         * @param re The regular expression to test if a selector is of the type
         * corresponding to this subset.
         * @param extractor {Function} A function which takes a DOM element and
         * returns a string of keys of this elements that match this subset.
         * For example, in the IDs subset this method will return an array with
         * at most one value - the element's id.
         * @param ci {Boolean} Is this subset case insensitive?
         * @constructor
         * @private
         */
        function Subset(re, extractor, ci) {
            var mappedLists = new MappedLists();
            this.isOfType = function(selector) {
                return re.test(selector);
            };
            this.extractElementKeys = extractor;
            this.add = function(key, data) {
                mappedLists.add(ci ? key.toLowerCase() : key, data);
                return this;
            };
            this.remove = function(key, data, comp) {
                mappedLists.remove(ci ? key.toLowerCase() : key, data, comp);
                return this;
            };
            this.get = function(key) {
                return mappedLists.get(ci ? key.toLowerCase() : key);
            };
        }

        return function() {

            var subsets = [];

            // Note: The order of subsets in this array matters!
            // It determined the priority of checking elements against
            // subsets.

            // ID selectors subset
            subsets.push(
                new Subset(
                    /^#.+$/,
                    function(el) {
                        return el.id ? ["#" + el.id] : [];
                    }
                )
            );

            // CLASS selectors subset
            subsets.push(
                new Subset(
                    /^\..+$/,
                    function(el) {
                        var res = [], classes = el.className;
                        if (typeof classes === 'string')
                            res = classes.split(/\s+/);
                        // for SVG elements:
                        else if (typeof classes === 'object' && 'baseVal' in classes)
                            res = classes.baseVal.split(/\s+/);
                        return res.map(function(r) {
                            return "." + r;
                        });
                    }
                )
            );

            // TAG selectors subset
            subsets.push(
                new Subset(
                    /^[^\*\.#].*$/,
                    function(el) {
                        return el.nodeName ? [el.nodeName] : [];
                    },
                    true // case insensitive
                )
            );

            // other selectors subset
            subsets.push(
                new Subset(
                    /^\*$/,
                    function(el) {
                        return ['*'];
                    }
                )
            );

            return subsets;

        };

    }
}());

/**
 * ignore coverage measurements for this module,
 * because this is just an adapter for native browser functions.
 */

/* istanbul ignore next */
(function() {
    

    if (typeof define === 'function' && define.amd) {
        define('mu-selector-set/src/matchesSelector',factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        throw Error("no module loader found");
    }

    function factory() {
        var docElem = window.document.documentElement,
            matchesSelector = docElem.matches ||
                docElem.matchesSelector ||
                docElem.webkitMatchesSelector ||
                docElem.mozMatchesSelector ||
                docElem.oMatchesSelector ||
                docElem.msMatchesSelector ||
                matchesSelectorPoly;

        /**
         * https://developer.mozilla.org/en-US/docs/Web/API/Element.matches#Polyfill
         */
        function matchesSelectorPoly(selector) {
            var element = this,
                doc = element.document || element.ownerDocument,
                matches = doc.querySelectorAll(selector),
                i = 0;
            while (matches[i] && matches[i] !== element) i++;
            return matches[i] ? true : false;
        }

        /**
         * A service function which takes an element and a selector and returns
         * `true` if the element matches the selector, or `false` otherwise.
         * This function tries to use native browser *matchesSelector functions,
         * and falls back to a simple polyfill.
         */
        return function(element, selector) {
            return matchesSelector.call(element, selector);
        }
    }
}());

(function() {
    

    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('mu-selector-set/src/SelectorSet',[
            './classifier',
            './splitter',
            './Subsets',
            './matchesSelector'
        ], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('./classifier'),
            require('./splitter'),
            require('./Subsets'),
            require('./matchesSelector')
        );
    } else {
        throw Error("no module loader found");
    }

    function factory(classify, splitter, Subsets, matchesSelector) {

        /**
         * A SelectorSet is an object which manages a set of CSS selectors.
         * It provides two core functionalities:
         * 1. Adding selectors to the set.
         * 2. Matching a DOM element against selectors in the set and retrieving
         *    an array of selectors which match the element.
         * The SelectorSet object internal implementation takes care of indexing
         * the selectors added to it, such that later retrieving matches against
         * a DOM object is very fast.
         * The indexing is done according to:
         * 1. The most significant part of the selector.
         * 2. The type of the most significant type.
         * For example, the selector `".parent .child#bobby"` will be indexed as
         * an ID selector with the ID `"#bobby"`.
         * @constructor
         */
        function SelectorSet() {
            this.subsets = Subsets();
        }

        /**
         * matchesSelector is a function which checks if an element matches a
         * selector.
         * It can be overridden by the user by:
         * 1. Overriding the prototype, thus modifying all instances of
         *    SelectorSet:
         *    ```
         *    SelectorSet.prototype.matchesSelector = customFunction`;
         *    var sSet = new SelectorSet();
         *    ```
         * 2. Overriding the instance, thus modifying a specific instance of
         *    SelectorSet:
         *    ```
         *    var sSet = new SelectorSet();
         *    sSet.matchesSelector = customFunction`;
         *    ```
         * @param element {DOMElement} The element to match
         * @param selector {String} The selector to match against
         * @returns true if the element matches the selector. false otherwise.
         */
        SelectorSet.prototype.matchesSelector = matchesSelector;

        /**
         * Add a selector to the set.
         * @param selector {String} The selector to add.
         * @param datum1, datum2, ... Arbitrary number of additional parameters
         * which will be added with the selector as associated data.
         * @returns {SelectorSet}
         */
        SelectorSet.prototype.add = function(selector) {
            // selector might actually contain multiple selections seperated
            // by a comma. we need to separate them.
            var args = Array.prototype.slice.call(arguments),
                selectors = splitter(selector),
                i = selectors.length;
            while (i--) {
                args.splice(0, 1, selectors[i]);
                _add.apply(this, args);
            }
            return this;
        };

        function _add( /* selector, arg1, arg2, ... */ ) {
            var i, subset, key,
                args = Array.prototype.slice.call(arguments);
            args[0] = args[0].trim();
            key = classify(args[0]);
            for (i = 0; i < this.subsets.length; i++) {
                subset = this.subsets[i];
                if (subset.isOfType(key)) {
                    subset.add(key, args);
                    return;
                }
            }
        }

        /**
         * Remove a selector from the set.
         * @param selector {String} The selector to remove.
         * @param datum1, datum2, ... Arbitrary number of additional parameters.
         * @returns {SelectorSet}
         */
        SelectorSet.prototype.remove = function(selector) {
            // selector might actually contain multiple selections seperated
            // by a comma. we need to separate them.
            var args = Array.prototype.slice.call(arguments),
                selectors = splitter(selector),
                i = selectors.length;
            while (i--) {
                args.splice(0, 1, selectors[i]);
                _remove.apply(this, args);
            }
            return this;
        };

        function _remove( /* selector, arg1, arg2, ... */ ) {
            var i, subset, key,
                args = Array.prototype.slice.call(arguments);
            args[0] = args[0].trim();
            key = classify(args[0]);
            for (i = 0; i < this.subsets.length; i++) {
                subset = this.subsets[i];
                if (subset.isOfType(key)) {
                    subset.remove(key, args, compare);
                    return;
                }
            }

            function compare(args, candidate){
                var i = 0, len = args.length;
                for (; i < len; i++){
                    if (args[i] !== candidate[i]) return false;
                }
                return true;
            }
        }

        /**
         * Match DOM elements to selectors in the set.
         * @param el1, el2, ... The DOM elements to match.
         * @returns {Array} An array of arrays. Each sub-array is a selector
         * that matches the elements + the data this selector was added with.
         */
        SelectorSet.prototype.matches = function() {
            var i, j, k, t, el, subset, elKey, elKeys, candidate, candidates,
                res = [],
                els = Array.prototype.slice.call(arguments);
            els = Array.prototype.concat.apply([], els); // flatten 'els'
            for (t = 0; t < els.length; t++) {
                el = els[t];
                for (i = 0; i < this.subsets.length; i++) {
                    subset = this.subsets[i];
                    elKeys = subset.extractElementKeys(el);
                    for (j = 0; j < elKeys.length; j++) {
                        elKey = elKeys[j];
                        candidates = subset.get(elKey);
                        for (k = 0; k < candidates.length; k++) {
                            candidate = candidates[k];
                            if (res.indexOf(candidate) === -1 &&
                                this.matchesSelector(el, candidate[0]))
                                res.push(candidate);
                        }
                    }
                }
            }
            return res;
        };

        return SelectorSet;
    }
}());

(function() {
    

    if (typeof define === 'function' && define.amd) {
        define('mu-selector-set/main',['./src/SelectorSet'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(
            require('./src/SelectorSet')
        );
    } else {
        throw Error("no module loader found");
    }

    function factory(SelectorSet) {
        return SelectorSet;
    }

})();

define('mu-selector-set', ['mu-selector-set/main'], function (main) { return main; });

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/runner/sequence',[
	"mu-selector-set",
	"jquery",
	"poly/array"
], function (SelectorSet, $) {
	

	/**
	 * @class dom.runner.sequence
	 * @implement core.event.emitter.runner
	 * @private
	 * @static
	 * @alias feature.runner
	 */

	var UNDEFINED;
	var FALSE = false;
	var LEFT_BUTTON = 0;

	function map (match) {
		return match[1];
	}

	// Use `$.find.matchesSelector` for wider browser support
	SelectorSet.prototype.matchesSelector = $.find.matchesSelector;

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Runner that executes DOM candidates in sequence without overlap
	 * @return {*} Result from last handler
	 */
	return function sequence(event, handlers, args) {

		var result = UNDEFINED;
		var direct = handlers.direct;
		var delegated = handlers.delegated;
		var reduce = function (result, handler) {
			// If immediate propagation is stopped we should just return last result
			if ($event.isImmediatePropagationStopped()) {
				return result;
			}

			// If the previous handler return false we should stopPropagation and preventDefault
			if (result === FALSE) {
				$event.stopPropagation();
				$event.preventDefault();
			}

			return handler.apply(handler.context, args);
		};

		var $event = args[0];
		var $delegate = $event.delegateTarget;
		var $target = $event.target;
		var $document = $target.ownerDocument;
		var $notClick = $event.type !== "click";

		// Bubble the event up the dom if
		// ... this is not a black-holed element (jQuery #13180)
		// ... and this is the left button or it's a not a click event (jQuery #3861)
		var $bubble = $target.nodeType !== UNDEFINED && ($event.button === LEFT_BUTTON || $notClick);

		// Loop ...
		do {
			// Don't process clicks on disabled elements (jQuery #6911, #8165, #11382, #11764)
			if ($target.disabled !== true || $notClick) {
				// Run delegated handlers which match this element
				result = delegated
					.matches($event.currentTarget = $target)
					.map(map)
					.reduce(reduce, result);
			}

			// Bubble if ...
			$bubble = $bubble
				// ... we were not told to stop propagation
				&& !$event.isPropagationStopped()
				// ... we are not at the delegate element
				&& $target !== $delegate
				// ... we have a parent node
				&& ($target = $target.parentNode) !== null
				// ... the new target is not the document
				&& $target !== $document;
		}
		// ... while we are still bubbling
		while ($bubble);

		// Run all the direct (non-delegated) handlers of the root element
		if (result !== FALSE) {
			result = direct.reduce(reduce, result);
		}

		return result;
	}
});
/**
 * @license MIT http://mu-lib.mit-license.org/
 */
(function() {
	

	if (typeof define === "function" && define.amd) {
		define('mu-jquery-destroy/src/jQueryDestroy',["jquery"], factory);
	} else if (typeof exports === "object") {
		module.exports = factory(require("jquery"));
	} else {
		throw Error("no module loader found");
	}

	function factory($) {

		/**
		 * Extends {@link jQuery} with:
		 *
		 *  - {@link $#event-destroy} event
		 *
		 * @class mu-lib.jquery.destroy
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
			"noBubble": true,

			"trigger": function () {
				return false;
			},

			"remove": function onDestroyRemove(handleObj) {
				var me = this;

				if (handleObj) {
					handleObj.handler.call(me, $.Event(handleObj.type, {
						"data": handleObj.data,
						"namespace": handleObj.namespace,
						"target": me
					}));
				}
			}
		};
	}
})();

(function() {
	

	if (typeof define === "function" && define.amd) {
		define('mu-jquery-destroy/main',["./src/jQueryDestroy"], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(
			require("./src/jQueryDestroy")
		);
	} else {
		throw Error("no module loader found");
	}

	function factory(jQueryDestroy) {
		return jQueryDestroy;
	}
})();

define('mu-jquery-destroy', ['mu-jquery-destroy/main'], function (main) { return main; });

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/component',[
	"troopjs-core/component/gadget",
	"troopjs-core/component/runner/sequence",
	"./runner/sequence",
	"troopjs-compose/mixin/config",
	"troopjs-compose/decorator/before",
	"jquery",
	"when",
	"mu-selector-set",
	"poly/array",
	"mu-jquery-destroy"
], function (Gadget, core_sequence, dom_sequence, COMPOSE_CONF, before, $, when, SelectorSet) {
	

	/**
	 * Component that manages all DOM manipulation and integration.
	 * @class dom.component
	 * @extend core.component.gadget
	 * @alias dom.component
	 */

	var UNDEFINED;
	var NULL = null;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var $FN = $.fn;
	var $GET = $FN.get;
	var WHEN_ATTEMPT = when.attempt;
	var TOSTRING_FUNCTION = "[object Function]";
	var $ELEMENT = "$element";
	var PROXY = "proxy";
	var DOM = "dom";
	var ARGS = "args";
	var NAME = "name";
	var VALUE = "value";
	var TYPE = "type";
	var RUNNER = "runner";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var DATA = "data";
	var DIRECT = "direct";
	var DELEGATED = "delegated";
	var ON = "on";
	var OFF = "off";
	var RE = new RegExp("^" + DOM + "/(.+)");

	function on_delegated(handler, handlers) {
		handlers[DELEGATED].add(handler[DATA], handler);
	}

	function on_direct(handler, handlers) {
		handlers[DIRECT].push(handler);
	}

	function off_delegated(handler, handlers) {
		handlers[DELEGATED].remove(handler[DATA], handler);
	}

	function off_direct(handler, handlers) {
		var direct = handlers[DIRECT];
		var index = direct.indexOf(handler);

		if (index !== -1) {
			direct.splice(index, 1);
		}
	}

	/**
	 * Render signal
	 * @event sig/render
	 * @localdoc Triggered after {@link #before}, {@link #after}, {@link #html}, {@link #text}, {@link #append} and {@link #prepend}
	 * @since 3.0
	 * @preventable
	 * @param {...*} [args] Render arguments
	 */

	/**
	 * Handles component render
	 * @handler sig/render
	 * @template
	 * @inheritdoc #event-sig/render
	 * @return {Promise}
	 */

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
	 * @handler dom/destroy
	 * @template
	 * @inheritdoc #event-dom/destroy
	 * @localdoc Triggered when this widget is removed from the DOM
	 */

	/**
	 * Renders content and replaces {@link #$element} html contents
	 * @method html
	 * @param {Function|String|Promise} [contentOrPromise] Contents to render or a Promise for contents
	 * @param {...*} [args] Template arguments
	 * @fires sig/render
	 * @return {String|Promise} The returned content string or promise of rendering.
	 */

	/**
	 * Renders content and replaces {@link #$element} text contents
	 * @method text
	 * @inheritdoc #html
	 * @fires sig/render
	 */

	/**
	 * Renders content and inserts it before {@link #$element}
	 * @method before
	 * @inheritdoc #html
	 * @fires sig/render
	 */

	/**
	 * Renders content and inserts it after {@link #$element}
	 * @method after
	 * @inheritdoc #html
	 * @fires sig/render
	 */

	/**
	 * Renders content and appends it to {@link #$element}
	 * @method append
	 * @inheritdoc #html
	 * @fires sig/render
	 */

	/**
	 * Renders content and prepends it to {@link #$element}
	 * @method prepend
	 * @inheritdoc #html
	 * @fires sig/render
	 */

	// Add pragmas for DOM specials
	COMPOSE_CONF.pragmas.push({
		"pattern": /^dom(?::([^\/]+))?\/([^\(]+(?=$))/,
		"replace": function(match, $1, $2) {
			return DOM + "/" + $2 + ($1 === UNDEFINED ? "()" : "(\"" + $1 + "\")");
		}
	});

	/**
	 * Creates a new component that attaches to a specified (jQuery) DOM element.
	 * @method constructor
	 * @param {jQuery|HTMLElement} $element The element that this component should be attached to
	 * @param {String} [displayName] A friendly name for this component
	 * @throws {Error} If no $element is provided
	 * @throws {Error} If $element is not of supported type
	 */
	return Gadget.extend(function ($element, displayName) {
		var me = this;
		var $get;
		var args;

		// No $element
		if ($element === UNDEFINED || $element === NULL) {
			throw new Error("No $element provided");
		}
		// Is _not_ a jQuery element
		else if (!$element.jquery) {
			// Let `args` be `ARRAY_SLICE.call(arguments)`
			args = ARRAY_SLICE.call(arguments);

			// Let `$element` be `$($element)`
			// Let `args[0]` be `$element`
			args[0] = $element = $($element);
		}
		// From a different jQuery instance
		else if (($get = $element.get) !== $GET) {
			// Let `args` be `ARRAY_SLICE.call(arguments)`
			args = ARRAY_SLICE.call(arguments);

			// Let `$element` be `$($get.call($element, 0))`
			// Let `args[0]` be `$element`
			args[0] = $element = $($get.call($element, 0));
		}

		/**
		 * jQuery element this widget is attached to
		 * @property {jQuery} $element
		 * @readonly
		 * @protected
		 */
		me[$ELEMENT] = $element;

		// Update `me.displayName` if `displayName` was supplied
		if (displayName !== UNDEFINED) {
			me.displayName = displayName;
		}

		// Return potentially modified `args`
		return args;
	}, {
		"displayName" : "dom/component",

		/**
		 * @handler
		 * @localdoc Registers event handlers that are declared as DOM specials.
		 * @inheritdoc
		 */
		"sig/initialize" : function () {
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
		"sig/setup": function (handlers, type) {
			var me = this;
			var matches;

			if ((matches = RE.exec(type)) !== NULL) {
				// Create delegated and direct event stores
				handlers[DIRECT] = [];
				handlers[DELEGATED] = new SelectorSet();

				// $element.on handlers[PROXY]
				me[$ELEMENT].on(matches[1], NULL, me, handlers[PROXY] = function ($event) {
					var args = {};
					args[TYPE] = type;
					args[RUNNER] = dom_sequence;
					args[CONTEXT] = me;
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
		 * @localdoc Remove for the DOM event handler proxies that are registered on the DOM element.
		 * @inheritdoc
		 */
		"sig/teardown": function (handlers, type) {
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
		"sig/task" : function (task) {
			this[$ELEMENT].trigger("task", [ task ]);
		},

		/**
		 * @method
		 * @localdoc Registers emitter `on` and `off` callbacks
		 * @inheritdoc
		 */
		"on": before(function (type, callback, data) {
			var _callback = callback;

			// Check if this is a DOM type
			if (RE.test(type)) {
				// If `callback` is a function ...
				if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
					// Create `_callback` object
					_callback = {};
					_callback[CALLBACK] = callback;
				}

				// Set `ON` and `OFF` callbacks
				_callback[ON] = data !== UNDEFINED
					? on_delegated
					: on_direct;
				_callback[OFF] = data !== UNDEFINED
					? off_delegated
					: off_direct;
			}

			// Mutate return args to next method
			return [ type, _callback, data ];
		})
	}, [ "html", "text", "before", "after", "append", "prepend" ].reduce(function (spec, method) {
		// Let `$fn` be `$FN[method]`
		var $fn = $FN[method];

		// Create `spec[method]`
		spec[method] = function (contentOrPromise, args) {
			var me = this;

			// If `_args.length` is `0` just return `$fn.call(...)`
			if (arguments.length === 0) {
				return $fn.call(me[$ELEMENT]);
			}

			// Convert arguments to an array
			var _args = ARRAY_SLICE.call(arguments);

			return when(contentOrPromise, function (contents) {
				var result;

				// Initialize event
				var event = {};
				event[RUNNER] = core_sequence;
				event[CONTEXT] = me;
				event[TYPE] = "sig/render";

				// If `contents` is a function ...
				if (OBJECT_TOSTRING.call(contents) === TOSTRING_FUNCTION) {
					// ... attempt and wait for resolution
					result = WHEN_ATTEMPT.apply(me, _args).then(function (output) {
						// Call `$fn` with `output`
						$fn.call(me[$ELEMENT], output);

						// Let `_args[0]` be `event`
						_args[0] = event;

						// Emit
						return me.emit.apply(me, _args);
					});
				}
				// ... otherwise we can emit right away
				else {
					// Call `$fn` with `contents`
					$fn.call(me[$ELEMENT], contents);

					// Let `_args[0]` be `event`
					_args[0] = event;

					// Emit
					result = me.emit.apply(me, _args);
				}

				// Return `result`
				return result;
			});
		};

		// Return spec for next iteration
		return spec;
	}, {}));
});

