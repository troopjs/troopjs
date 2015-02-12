/*!
 *   ____ .     ____  ____  ____    ____.
 *   \   (/_\___\  (__\  (__\  (\___\  (/
 *   / ._/  ( . _   \  . /   . /  . _   \_
 * _/    ___/   /____ /  \_ /  \_    ____/
 * \   _/ \____/   \____________/   /
 *  \_t:_____r:_______o:____o:___p:/ [ troopjs - 3.0.0-rc.1+b4b32c9 ]
 *
 * @license http://troopjs.mit-license.org/ © Mikael Karon, Garry Yao, Eyal Arubas
 */
define('troopjs/version',[], { 'toString': function () { return "3.0.0-rc.1+b4b32c9"; } });

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator',[ "poly/object" ], function () {
	

	/**
	 * Decorator provides customized way to add properties/methods to object created by {@link compose.factory}.
	 * @class compose.decorator
	 * @protected
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
define('troopjs-compose/decorator/after',[ "../decorator" ], function (Decorator) {
	

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
	 * @return {compose.decorator}
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
define('troopjs-compose/decorator/around',[ "../decorator" ], function (Decorator) {
	

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
	 * @return {compose.decorator}
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
define('troopjs-compose/decorator/before',[ "../decorator" ], function (Decorator) {
	

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
	 * @return {compose.decorator}
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/decorator/extend',[
	"../decorator",
	"mu-merge/main"
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
	 * @return {compose.decorator}
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
define('troopjs-compose/decorator/from',[ "../decorator" ], function (Decorator) {
	

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
	 * @return {compose.decorator}
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
define('troopjs-compose/config',[
	"module",
	"mu-merge/main"
], function (module, merge) {
	

	/**
	 * Pragma interface.
	 * @class compose.config.pragma
	 * @interface
	 * @private
	 */
	/**
	 * @property {RegExp} pattern Matching pattern
	 */
	/**
	 * @property {String|Function} replace Replacement String or function
	 */

	/**
	 * Provides configuration for the {@link compose.factory}
	 * @class compose.config
	 * @private
	 * @alias feature.config
	 */

	return merge.call({
		/**
		 * @cfg {compose.config.pragma[]}
		 * Pragmas used to rewrite methods before processing
		 * @protected
		 */
		"pragmas": [],


		/**
		 * @cfg {RegExp}
		 * Regular Expression used parse 'specials'.
		 * ````
		 * <special>/<type>[(<arguments>)]
		 * ````
		 * @protected
		 */
		"specials": /^([^\/]+)\/(.+?)(?:\((.*)\))?$/
	}, module.config());
});

define('mu-emitter/config',{
  "handlers": "handlers",
  "emitter": "emitter",
  "type": "type",
  "callback": "callback",
  "data": "data",
  "scope": "scope",
  "executor": "executor",
  "head": "head",
  "tail": "tail",
  "next": "next",
  "count": "count",
  "limit": "limit",
  "on": "on",
  "off": "off"
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/config',[
	"module",
	"troopjs-compose/config",
	"mu-emitter/config",
	"mu-merge/main"
], function (module, config, emitterConfig, merge) {
	

	/**
	 * @class core.config.emitter
	 * @enum {String}
	 * @private
	 */
	/**
	 * @property handlers Property name for `handlers`
	 */
	/**
	 * @property emitter Property name for `emitter`
	 */
	/**
	 * @property type Property name for `type`
	 */
	/**
	 * @property callback Property name for `callback`
	 */
	/**
	 * @property data Property name for `data`
	 */
	/**
	 * @property scope Property name for `scope`
	 */
	/**
	 * @property executor Property name for `executor`
	 */
	/**
	 * @property head Property name for `head`
	 */
	/**
	 * @property tail Property name for `tail`
	 */
	/**
	 * @property next Property name for `next`
	 */
	/**
	 * @property count Property name for `count`
	 */
	/**
	 * @property limit Property name for `limit`
	 */
	/**
	 * @property on Property name for `on`
	 */
	/**
	 * @property off Property name for `off`
	 */

	/**
	 * @class core.config.phase
	 * @enum
	 * @private
	 */
	var PHASE = {
		/**
		 * Protected phases
		 */
		"skip": /^(?:initi|fin)alized?$/,
		/**
		 * Phase while component is initializing.
		 */
		"initialize": "initialize",
		/**
		 * Phase when component is initialized.
		 */
		"initialized": "initialized",
		/**
		 * Phase while component is starting.
		 */
		"start": "start",
		/**
		 * Phase when component is started.
		 */
		"started": "started",
		/**
		 * Phase while component is stopping.
		 */
		"stop": "stop",
		/**
		 * Phase when component is stopped.
		 */
		"stopped": "stopped",
		/**
		 * Phase while component is finalizing.
		 */
		"finalize": "finalize",
		/**
		 * Phase when component is finalized.
		 */
		"finalized": "finalized"
	};

	/**
	 * @class core.config.signal
	 * @enum {String}
	 * @private
	 */
	var SIGNAL = {
		/**
		 * Signal emitted first time an event handler is added.
		 */
		"setup": "sig/setup",
		/**
		 * Signal emitted each time an event handler is added.
		 */
		"add": "sig/add",
		/**
		 * Signal emitted each time an event handler is removed.
		 */
		"remove": "sig/remove",
		/**
		 * Signal emitted last time an event handler is removed.
		 */
		"teardown": "sig/teardown",
		/**
		 * Signal emitted when component initializes.
		 */
		"initialize": "sig/initialize",
		/**
		 * Signal emitted when component starts.
		 */
		"start": "sig/start",
		/**
		 * Signal emitted when component stops.
		 */
		"stop": "sig/stop",
		/**
		 * Signal emitted when component finalizes.
		 */
		"finalize": "sig/finalize",
		/**
		 * Signal emitted during registration.
		 */
		"register": "sig/register",
		/**
		 * Signal emitted during un-registeration.
		 */
		"unregister": "sig/unregister",
		/**
		 * Signal emitted when component starts a task.
		 */
		"task": "sig/task"
	};

	/**
	 * Component configuration
	 * @class core.config
	 * @extends compose.config
	 * @private
	 * @alias feature.config
	 */

	return merge.call({}, config, {
		/**
		 * Component signals
		 * @cfg {core.config.signal}
		 * @protected
		 */
		"signal": SIGNAL,

		/**
		 * Component phases
		 * @cfg {core.config.phase}
		 * @protected
		 */
		"phase": PHASE,

		/**
		 * Emitter properties
		 * @cfg {core.config.emitter}
		 * @protected
		 */
		"emitter": emitterConfig
	}, module.config());
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/signal/initialize',[
	"../../config",
	"when/when"
], function (config, when) {
	var UNDEFINED;
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";
	var INITIALIZE = config.phase.initialize;
	var INITIALIZED = config.phase.initialized;
	var SIG_INITIALIZE = config.signal.initialize;

	/**
	 * @class core.component.signal.initialize
	 * @implement core.component.signal
	 * @mixin core.config
	 * @static
	 * @alias feature.signal
	 * @private
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.emitter#property-phase} to `initialized`
	 */

	return function initialize() {
		var me = this;
		var args = arguments;

		return when(me[PHASE], function (phase) {
			var _args;

			if (phase === UNDEFINED) {
				// Let `me[PHASE]` be `INITIALIZE`
				me[PHASE] = INITIALIZE;

				// Let `_args` be `[ SIG_INITIALIZE ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ SIG_INITIALIZE ], args);

				return me
					.emit.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `INITIALIZED`
						return me[PHASE] = INITIALIZED;
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
	"../../config",
	"when/when"
], function (initialize, config, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";
	var INITIALIZED = config.phase.initialized;
	var START = config.phase.start;
	var STARTED = config.phase.started;
	var SIG_START = config.signal.start;

	/**
	 * @class core.component.signal.start
	 * @implement core.component.signal
	 * @mixin core.config
	 * @static
	 * @alias feature.signal
	 * @private
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.emitter#property-phase} to `started`
	 */

	return function start() {
		var me = this;
		var args = arguments;

		return when(initialize.apply(me, args), function (phase) {
			var _args;

			if (phase === INITIALIZED) {
				// Let `me[PHASE]` be `START`
				me[PHASE] = START;

				// Let `_args` be `[ SIG_START ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ SIG_START ], args);

				return me
					.emit.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `STARTED`
						return me[PHASE] = STARTED;
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
	"../../config",
	"when/when"
], function (start, config, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";
	var STARTED = config.phase.started;
	var STOP = config.phase.stop;
	var STOPPED = config.phase.stopped;
	var SIG_STOP = config.signal.stop;

	/**
	 * @class core.component.signal.stop
	 * @implement core.component.signal
	 * @mixin core.config
	 * @static
	 * @alias feature.signal
	 * @private
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.emitter#property-phase} to `stopped`
	 */

	return function stop() {
		var me = this;
		var args = arguments;

		return when(start.apply(me, args), function (phase) {
			var _args;

			if (phase === STARTED) {
				// Let `me[PHASE]` be `"stop"`
				me[PHASE] = STOP;

				// Let `_args` be `[ SIG_STOP ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ SIG_STOP ], args);

				return me
					.emit.apply(me, _args)
					.then(function () {
						// Let `me[PHASE]` be `STOPPED`
						return me[PHASE] = STOPPED;
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
	"../../config",
	"when/when"
], function (stop, config, when) {
	var ARRAY_PUSH = Array.prototype.push;
	var PHASE = "phase";
	var STOPPED = config.phase.stopped;
	var FINALIZE = config.phase.finalize;
	var FINALIZED = config.phase.finalized;
	var SIG_FINALIZE = config.signal.finalize;

	/**
	 * @class core.component.signal.finalize
	 * @implement core.component.signal
	 * @mixin core.config
	 * @static
	 * @alias feature.signal
	 * @private
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 * @localdoc Transitions the component {@link core.component.emitter#property-phase} to `finalized`
	 */
	return function finalize() {
		var me = this;
		var args = arguments;

		return when(stop.apply(me, args), function (phase) {
			var _args;

			if (phase === STOPPED) {
				// Let `me[PHASE]` be `FINALIZE`
				me[PHASE] = FINALIZE;

				// Let `_args` be `[ SIG_FINALIZE ]`
				// Push `args` on `_args`
				ARRAY_PUSH.apply(_args = [ SIG_FINALIZE ], args);

				return me
					.emit.apply(me, _args)
					.then(function() {
						// Let `me[PHASE]` be `FINALIZED`
						return me[PHASE] = FINALIZED;
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
define('troopjs-log/methods',[], function () {
	return [ "assert", "debug", "dir", "error", "info", "log", "time", "timeEnd", "trace", "warn" ];
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-log/null',[
	"./methods",
	"poly/array"
], function (METHODS) {
	

	/**
	 * @class log.null
	 * @implement log.logger
	 * @singleton
	 * @inheritdoc log.console
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
define('mu-emitter/handler',[ "./config" ], function (config) {
  

  var UNDEFINED;
  var OBJECT_TOSTRING = Object.prototype.toString;
  var TOSTRING_FUNCTION = "[object Function]";
  var EMITTER = config.emitter;
  var TYPE = config.type;
  var CALLBACK = config.callback;
  var DATA = config.data;
  var SCOPE = config.scope;
  var LIMIT = config.limit;
  var COUNT = config.count;
  var ON = config.on;
  var OFF = config.off;

  function Handler(emitter, type, callback, data) {
    var me = this;

    me[EMITTER] = emitter;
    me[TYPE] = type;
    me[DATA] = data;

    if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
      me[CALLBACK] = callback;
      me[SCOPE] = emitter;
    }
    else if (callback !== UNDEFINED) {
      me[CALLBACK] = callback[CALLBACK];
      me[SCOPE] = callback[SCOPE] || emitter;

      if (callback.hasOwnProperty(LIMIT)) {
        me[LIMIT] = callback[LIMIT];
        me[COUNT] = 0;
      }
      if (callback.hasOwnProperty(ON)) {
        me[ON] = callback[ON];
      }
      if (callback.hasOwnProperty(OFF)) {
        me[OFF] = callback[OFF];
      }
    }
    else {
      throw new Error("Unable to use 'callback'");
    }
  }

  Handler.prototype.handle = function (args) {
    // Let `me` be `this`
    var me = this;

    // Get result from execution of `handler[CALLBACK]`
    var result = me[CALLBACK].apply(me[SCOPE], args);

    // If there's a `me[LIMIT]` and `++me[COUNT]` is greater or equal to it ...
    if (me.hasOwnProperty(LIMIT) && ++me[COUNT] >= me[LIMIT]) {
      // ... `me[EMITTER].off` `me` (note that `me[CALLBACK]` and `me[SCOPE]` are used by `.off`)
      me[EMITTER].off(me[TYPE], me);
    }

    return result;
  };

  return Handler;
});
define('mu-emitter/executor',[
  "./config",
  "poly/array"
], function (config) {
  

  var UNDEFINED;
  var CALLBACK = config.callback;
  var SCOPE = config.scope;
  var HEAD = config.head;
  var NEXT = config.next;


  return function executor(event, handlers, args) {
    var _handlers = [];
    var _handlersCount = 0;
    var _callback = event[CALLBACK];
    var _scope = event[SCOPE];
    var handler;

    for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
      if (_callback && handler[CALLBACK] !== _callback) {
        continue;
      }

      if (_scope && handler[SCOPE] !== _scope) {
        continue;
      }

      _handlers[_handlersCount++] = handler;
    }

    return _handlers.map(function (_handler) {
      return _handler.handle(args);
    });
  }
});
define('mu-emitter/main',[
  "./config",
  "./handler",
  "./executor"
], function (config, Handler, executor) {
  

  var UNDEFINED;
  var ARRAY_SLICE = Array.prototype.slice;
  var OBJECT_TOSTRING = Object.prototype.toString;
  var TOSTRING_STRING = "[object String]";
  var TOSTRING_FUNCTION = "[object Function]";

  var HANDLERS = config.handlers;
  var EXECUTOR = config.executor;
  var TYPE = config.type;
  var CALLBACK = config.callback;
  var SCOPE = config.scope;
  var LIMIT = config.limit;
  var HEAD = config.head;
  var TAIL = config.tail;
  var NEXT = config.next;
  var ON = config.on;
  var OFF = config.off;

  function Emitter() {
  }

  Emitter.prototype[EXECUTOR] = executor;

  Emitter.prototype.on = function (type, callback, data) {
    var me = this;
    var handlers = me[HANDLERS] || (me[HANDLERS] = {});
    var handler;

    if (callback === UNDEFINED) {
      throw new Error("no 'callback' provided");
    }

    handler = new Handler(me, type, callback, data);

    if (handlers.hasOwnProperty(type)) {
      handlers = handlers[type];

      handlers[TAIL] = handlers.hasOwnProperty(TAIL)
        ? handlers[TAIL][NEXT] = handler
        : handlers[HEAD] = handler;
    }
    else {
      handlers = handlers[type] = {};

      handlers[TYPE] = type;
      handlers[HEAD] = handlers[TAIL] = handler;
    }

    if (handler.hasOwnProperty(ON)) {
      handler[ON].call(me, handler, handlers);
    }
  };

  Emitter.prototype.off = function (type, callback) {
    var me = this;
    var handlers = me[HANDLERS] || (me[HANDLERS] = {});
    var handler;
    var head = UNDEFINED;
    var tail = UNDEFINED;
    var _callback;
    var _scope;

    if (handlers.hasOwnProperty(type)) {
      handlers = handlers[type];

      if (OBJECT_TOSTRING.call(callback) === TOSTRING_FUNCTION) {
        _callback = callback;
        _scope = me;
      }
      else if (callback !== UNDEFINED) {
        _callback = callback[CALLBACK];
        _scope = callback[SCOPE];
      }

      for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
        unlink: {
          if (_callback && handler[CALLBACK] !== _callback) {
            break unlink;
          }

          if (_scope && handler[SCOPE] !== _scope) {
            break unlink;
          }

          if (handler.hasOwnProperty(OFF)) {
            handler[OFF].call(me, handler, handlers);
          }

          continue;
        }

        if (head === UNDEFINED) {
          head = tail = handler;
        }
        else {
          tail = tail[NEXT] = handler;
        }
      }

      if (head !== UNDEFINED) {
        handlers[HEAD] = head;
      }
      else {
        delete handlers[HEAD];
      }

      if (tail !== UNDEFINED) {
        handlers[TAIL] = tail;

        delete tail[NEXT];
      }
      else {
        delete handlers[TAIL];
      }
    }
  };

  Emitter.prototype.one = function (type, callback, data) {
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

    return me.on(type, _callback, data);
  };

  Emitter.prototype.emit = function (event) {
    var me = this;
    var handlers = me[HANDLERS] || (me[HANDLERS] = {});
    var _event;
    var _type;
    var _executor;

    if (OBJECT_TOSTRING.call(event) === TOSTRING_STRING) {
      _event = {};
      _type = _event[TYPE] = event;
      _executor = me[EXECUTOR];
    }
    else if (event.hasOwnProperty(TYPE)) {
      _event = event;
      _type = event[TYPE];
      _executor = event[EXECUTOR] || me[EXECUTOR];
    }
    else {
      throw new Error("Unable to use 'event'");
    }


    if (handlers.hasOwnProperty(_type)) {
      handlers = handlers[_type];
    } else {
      handlers = handlers[_type] = {};
      handlers[TYPE] = _type;
    }

    return _executor.call(me, _event, handlers, ARRAY_SLICE.call(arguments, 1));
  };

  return Emitter;
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-compose/factory',[
	"./config",
	"./decorator",
	"mu-unique/main",
	"mu-getargs/main",
	"poly/object",
	"poly/function"
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
	 * @class compose.factory
	 * @mixin compose.config
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
	var PATTERN = config[SPECIALS];

	/**
	 * Instantiate immediately after extending this constructor from multiple others constructors/objects.
	 * @method create
	 * @static
	 * @param {...(Function|Object)} composition One or more constructors or objects to be mixed in.
	 * @return {compose.composition} Object instance created out of the composition of constructors and objects.
	 */
	function create(composition) {
		/*jshint validthis:true*/
		return extend.apply(this, arguments)();
	}

	function extend(composition) {
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
	 * @param {...(Function|Object)} composition One or more constructors or objects to be mixed in.
	 * @return {compose.composition} Object class created out of the composition of constructors and objects.
	 */
	function Factory (composition) {
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
		var replace;
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
					if ((name = name.replace(pragma.pattern, typeof (replace = pragma.replace) === TYPEOF_FUNCTION ? replace.bind(arg) : replace)) !== nameRaw) {
						break;
					}
				}

				// Check if this matches a SPECIAL signature
				if ((matches = PATTERN.exec(name))) {
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
define('troopjs-log/console',[
	"./methods",
	"poly/array",
	"poly/function"
], function (METHODS) {
	

	/**
	 * This class implements the {@link log.logger} API.
	 * @localdoc
	 * On platforms where the native `console` object doesn't support the full {@link log.logger} API,
	 * this class acts like a polyfill for the missing methods.
	 * @class log.console
	 * @implement log.logger
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
define('troopjs-log/logger',[ "./console" ], function (logger) {
	

	/**
	 * The console interface describes the API of the client's debugging console
	 * (e.g. the [Web Console](https://developer.mozilla.org/en-US/docs/Tools/Web_Console) in Firefox).
	 * The specifics of how it works vary from client to client, but there is a _de facto_ set of features that are
	 * typically provided.
	 *
	 * ## Outputting text to the console
	 *
	 * The most frequently-used feature of the console is logging of text and other data.
	 * There are four categories of output you can generate, using the {@link #log}, {@link #info}, {@link #warn},
	 * and {@link #error} methods. Each of these results in output that's styled differently in the log,
	 * and you can use the filtering controls provided by your client to only view the kinds of output that interest you.
	 *
	 * There are two ways to use each of the output methods; you can simply pass in a list of objects whose
	 * string representations get concatenated into one string then output to the console, or you can pass in a string
	 * containing zero or more substitution strings followed by a list of the objects with which to replace them.
	 *
	 * ### Writing a single object
	 *
	 * The simplest way to use the logging methods is to output a single object:
	 *
	 *     var someObject = { str: "Some text", id: 5 };
	 *     logger.log(someObject);
	 *
	 * The output looks something like this:
	 *
	 *     [09:27:13.475] ({str:"Some text", id:5})
	 *
	 * ### Writing multiple objects
	 *
	 * You can also output multiple objects by simply listing them when calling the logging method, like this:
	 *
	 *     var car = "Dodge Charger";
	 *     var someObject = {str:"Some text", id:5};
	 *     console.info("My first car was a", car, ". The object is: ", someObject);
	 *
	 * This output will look like this:
	 *
	 *     [09:28:22.711] My first car was a Dodge Charger . The object is:  ({str:"Some text", id:5})
	 *
	 * ### Using string substitutions
	 *
	 * When passing a string to one of the console methods that accepts a string, you may use these substitution strings:
	 *
	 * - `%o`         : Outputs a hyperlink to a JavaScript object. Clicking the link opens an inspector.
	 * - `%d` or `%i` : Outputs an integer. Formatting is not yet supported.
	 * - `%s`         : Outputs a string.
	 * - `%f`         : Outputs a floating-point value. Formatting is not yet supported.
	 *
	 * Each of these pulls the next argument after the format string off the parameter list. For example:
	 *
	 *     for (var i=0; i<5; i++) {
	 *       console.log("Hello, %s. You've called me %d times.", "Bob", i+1);
	 *     }
	 *
	 * The output looks like this:
	 *
	 *     [13:14:13.481] Hello, Bob. You've called me 1 times.
	 *     [13:14:13.483] Hello, Bob. You've called me 2 times.
	 *     [13:14:13.485] Hello, Bob. You've called me 3 times.
	 *     [13:14:13.487] Hello, Bob. You've called me 4 times.
	 *     [13:14:13.488] Hello, Bob. You've called me 5 times.
	 *
	 * ## Timers
	 *
	 * In order to calculate the duration of a specific operation, you can use timers.
	 * To start a timer, call the {@link #time} method, giving it a name as only parameter.
	 * To stop the timer, and to get the elapsed time in miliseconds, just call the {@link #timeEnd} method,
	 * again passing the timer's name as the parameter.
	 * Up to 10,000 timers can run simultaneously on a given page.
	 *
	 * For example, given this code:
	 *
	 *     console.time("answer time");
	 *     alert("Click to continue");
	 *     console.timeEnd("answer time");
	 *
	 * will log the time needed by the user to discard the alert box:
	 *
	 *     13:50:42.246: answer time: timer started
	 *     13:50:43.243: answer time: 998ms
	 *
	 * Notice that the timer's name is displayed both when the timer is started and when it's stopped.
	 *
	 * ## Stack traces
	 *
	 * The console also supports outputting a stack trace; this will show you the call path taken to reach the point at
	 * which you call {@link #trace}. Given code like this:
	 *
	 *     foo();
	 *       function foo() {
	 *         function bar() {
	 *           console.trace();
	 *         }
	 *       bar();
	 *     }
	 *
	 * The output in the console looks something like this:
	 *
	 *     console.trace():   main.js:46
	 *       bar()           main.js:46
	 *       foo()           main.js:48
	 *       <anonymous>     main.js:42
	 *
	 * <div class="notice">
	 * Documentation for this class comes from <a href="https://developer.mozilla.org/en-US/docs/Web/API/console">MDN</a>
	 * and is available under <a href="http://creativecommons.org/licenses/by-sa/2.0/">Creative Commons: Attribution-Sharealike license</a>.
	 * </div>
	 *
	 * @localdoc
	 * ## Changing framework logger
	 * This is a _virtual_ class that under normal circumstances is an alias for the {@link log.console} sink.
	 *
	 * If you want to change logger sink in your application you should use the [requirejs map config](http://requirejs.org/docs/api.html#config-map)
	 * to map this class to any module that implements the {@link log.logger} API.
	 *
	 * An example configuration that would change the logger to {@link log.null} would look like this:
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
	 * @singleton
	 * @interface
	 * @alias feature.logger
	 */

	/**
	 * Writes a message and stack trace to the log if first argument is false
	 * @method assert
	 * @param {Boolean} expression Conditional expression
	 * @param {Object|String} payload Initial payload
	 * @param {Object...} [obj] Supplementary payloads
	 *
	 * - If `payload` is of type `Object` the string representations of each of these objects are appended together in the order listed and output.
	 * - If `payload` is of type `String` these are JavaScript objects with which to replace substitution strings within payload.
	 */

	/**
	 * Writes a message to the log with level `debug`
	 * @method debug
	 * @inheritdoc #log
	 * @deprecated An alias for {@link #log}. This was added to improve compatibility with existing sites already using `debug()`. However, you should use {@link #log} instead.
	 */

	/**
	 * Displays an interactive list of the properties of the specified JavaScript object. The output is presented as a hierarchical listing that let you see the contents of child objects.
	 * @method dir
	 * @param {Object} object A JavaScript object whose properties should be output
	 */

	/**
	 * Writes a message to the log with level `error`
	 * @method error
	 * @inheritdoc #log
	 */

	/**
	 * Writes a message to the log with level `info`.
	 * @method info
	 * @inheritdoc #log
	 */

	/**
	 * Writes a message to the log with level `log`
	 * @method log
	 * @param {Object|String} payload Initial payload
	 * @param {Object...} [obj] Supplementary payloads
	 *
	 * - If `payload` is of type `Object` the string representations of each of these objects are appended together in the order listed and output.
	 * - If `payload` is of type `String` these are JavaScript objects with which to replace substitution strings within payload.
	 */

	/**
	 * Starts a timer you can use to track how long an operation takes. You give each timer a unique name, and may have up to 10,000 timers running on a given page.
	 * When you call {@link #timeEnd} with the same name, the log will output the time, in milliseconds, that elapsed since the timer was started.
	 * @method time
	 * @param {String} timerName The name to give the new timer. This will identify the timer; use the same name when calling {@link #timeEnd} to stop the timer and get the time written to the log
	 */

	/**
	 * Stops a timer that was previously started by calling {@link #time}.
	 * @method timeEnd
	 * @param {String} timerName The name of the timer to stop. Once stopped, the elapsed time is automatically written to the log
	 */

	/**
	 * Outputs a stack trace to the log.
	 * @method trace
	 */

	/**
	 * Writes a message to the log with level `warn`
	 * @method warn
	 * @inheritdoc #log
	 */

	return logger;
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/composition',[
	"troopjs-compose/factory",
	"troopjs-log/logger"
], function ObjectBaseModule(Factory, logger) {
	var INSTANCE_COUNTER = 0;
	var INSTANCE_COUNT = "instanceCount";

	/**
	 * Base composition with instance count.
	 * @class core.composition
	 * @implement compose.composition
	 * @mixin log.logger
	 */

	/**
	 * @method create
	 * @static
	 * @inheritable
	 * @inheritdoc
	 * @return {core.composition} Instance of this class
	 */

	/**
	 * @method extend
	 * @static
	 * @inheritable
	 * @inheritdoc
	 * @return {core.composition} The extended subclass
	 */

	/**
	 * Creates a new component instance
	 * @method constructor
	 */
	return Factory(function () {
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
		 * @protected
		 * @readonly
		 * @property {String}
		 */
		"displayName" : "core/composition",

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
define('troopjs-core/emitter/executor',[
	"../config",
	"when/when"
], function (config, when) {
	

	/**
	 * @class core.emitter.executor
	 * @mixin Function
	 * @private
	 * @static
	 * @alias feature.executor
	 */

	var UNDEFINED;
	var CALLBACK = config.emitter.callback;
	var SCOPE = config.emitter.scope;
	var HEAD = config.emitter.head;
	var NEXT = config.emitter.next;

	/**
	 * Executes an emission
	 * @method constructor
	 * @param {Object} event Event object
	 * @param {Object} handlers List of handlers
	 * @param {*[]} [args] Handler arguments
	 * @localdoc
	 * - Executes event handlers asynchronously passing each handler `args`.
	 *
	 * @return {*} Array of handler results
	 */
	return function (event, handlers, args) {
		var _handlers = [];
		var _handlersCount = 0;
		var callback = event[CALLBACK];
		var scope = event[SCOPE];
		var handler;

		for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
			if (callback && handler[CALLBACK] !== callback) {
				continue;
			}

			if (scope && handler[SCOPE] !== scope) {
				continue;
			}

			_handlers[_handlersCount++] = handler;
		}

		return when.reduce(_handlers, function (results, _handler, index) {
			return when(_handler.handle(args), function (result) {
				results[index] = result;
			})
				.yield(results);
		}, _handlers);
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/emitter/composition',[
	"mu-emitter/main",
	"../composition",
	"../config",
	"./executor",
	"troopjs-compose/decorator/from",
	"when/when"
], function (Emitter, Composition, config, executor, from) {
	

	/**
	 * This event module is heart of all TroopJS event-based whistles, from the API names it's aligned with Node's events module,
	 * while behind the regularity it's powered by a highly customizable **event executor** mechanism.
	 *
	 * @class core.emitter.composition
	 * @extend core.composition
	 */

	var EXECUTOR = config.emitter.executor;
	var HANDLERS = config.emitter.handlers;

	/**
	 * Event executor
	 * @private
	 * @readonly
	 * @property {core.emitter.executor} executor
	 */

	/**
	 * Event handlers
	 * @protected
	 * @readonly
	 * @property {Object} handlers Object where the key represents the event type and the value is a list of {@link core.emitter.handler handlers} for that type.
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Composition.extend(function () {
		this[HANDLERS] = {};
	}, (function (key, value) {
		var me = this;
		me[key] = value;
		return me;
	}).call({
		"displayName": "core/emitter/composition",

		/**
		 * Adds a listener for the specified event type.
		 * @method
		 * @param {String} type The event type to subscribe to.
		 * @param {Function|Object} callback The event callback to add. If callback is a function defaults from below will be used:
		 * @param {Function} callback.callback Callback method.
		 * @param {Object} [callback.scope=this] Callback scope.
		 * @param {Number} [callback.limit=0] Callback limit.
		 * @param {Function} [callback.on=undefined] Will be called once this handler is added to the handlers list.
		 * @param {core.emitter.handler} [callback.on.handler] The handler that was just added.
		 * @param {Object} [callback.on.handlers] The list of handlers the handler was added to.
		 * @param {Function} [callback.off=undefined] Will be called once this handler is removed from the handlers list.
		 * @param {core.emitter.handler} [callback.off.handler] The handler that was just removed.
		 * @param {Object} [callback.off.handlers] The list of handlers the handler was removed from.
		 * @param {*} [data] Handler data
		 */
		"on": from(Emitter),

		/**
		 * Remove callback(s) from a subscribed event type, if no callback is specified,
		 * remove all callbacks of this type.
		 * @method
		 * @param {String} type The event type subscribed to
		 * @param {Function|Object} [callback] The event callback to remove. If callback is a function scope will be this, otherwise:
		 * @param {Function} [callback.callback] Callback method to match.
		 * @param {Object} [callback.scope=this] Callback scope to match.
		 */
		"off": from(Emitter),

		/**
		 * Adds a listener for the specified event type exactly once.
		 * @method
		 * @inheritdoc #on
		 */
		"one": from(Emitter),

		/**
		 * Trigger an event which notifies each of the listeners of their subscribing,
		 * optionally pass data values to the listeners.
		 *
		 *  A sequential runner, is the default runner for this module, in which all handlers are running
		 *  with the same argument data specified by the {@link #emit} function.
		 *  Each handler will wait for the completion for the previous one if it returns a promise.
		 *
		 * @method
		 * @param {String|Object} event The event type to emit, or an event object
		 * @param {String} [event.type] The event type name.
		 * @param {Function} [event.runner] The runner function that determinate how the handlers are executed, overrides the
		 * default behaviour of the event emitting.
		 * @param {...*} [args] Data params that are passed to the listener function.
		 * @return {*} Result returned from runner.
		 */
		"emit": from(Emitter)
	}, EXECUTOR, executor));
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/executor',[
	"../config",
	"poly/array"
], function (config) {
	

	/**
	 * @class core.component.executor
	 * @mixin Function
	 * @private
	 * @static
	 * @alias feature.executor
	 */

	var UNDEFINED;
	var FALSE = false;
	var HEAD = config.emitter.head;
	var NEXT = config.emitter.next;
	var CALLBACK = config.emitter.callback;
	var SCOPE = config.emitter.scope;

	/**
	 * @method constructor
	 * @inheritdoc core.emitter.executor#constructor
	 * @localdoc
	 * - Executes event handlers synchronously passing each handler `args`.
	 * - Anything returned from a handler except `undefined` will be stored as `result`
	 * - If a handler returns `undefined` the current `result` will be kept
	 * - If a handler returns `false` no more handlers will be executed.
	 *
	 * @return {*} Stored `result`
	 */
	return function (event, handlers, args) {
		var _handlers = [];
		var _handlersCount = 0;
		var scope = event[SCOPE];
		var callback = event[CALLBACK];
		var handler;

		// Iterate handlers
		for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
			if (callback && handler[CALLBACK] !== callback) {
				continue;
			}

			if (scope && handler[SCOPE] !== scope) {
				continue;
			}
			_handlers[_handlersCount++] = handler;
		}

		// Reduce and return
		return _handlers.reduce(function (current, _handler) {
			var result = current !== FALSE
				? _handler.handle(args)
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
define('troopjs-core/registry/emitter',[
	"../emitter/composition",
	"../config",
	"../component/executor",
	"poly/array",
	"poly/object"
], function (Emitter, config, executor) {
	

	/**
	 * A light weight implementation to register key/value pairs by key and index
	 * @class core.registry.emitter
	 * @extend core.emitter.composition
	 */

	var LENGTH = "length";
	var INDEX = "index";
	var OBJECT_TOSTRING = Object.prototype.toString;
	var TOSTRING_REGEXP = "[object RegExp]";
	var SIG_REGISTER = config.signal.register;
	var SIG_UNREGISTER = config.signal.unregister;
	var EXECUTOR = config.emitter.executor;

	/**
	 * Register signal
	 * @event sig/register
	 * @localdoc Triggered when something is registered via {@link #register}.
	 * @since 3.0
	 * @param {String} key
	 * @param {*} value
	 */

	/**
	 * Un-register signal
	 * @event sig/unregister
	 * @localdoc Triggered when something is un-registered via {@link #unregister}.
	 * @since 3.0
	 * @param {String} key
	 * @param {*} value
	 */

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Emitter.extend(function () {
		/**
		 * Registry index
		 * @private
		 * @readonly
		 */
		this[INDEX] = {};
	}, (function (key, value) {
		var me = this;
		me[key] = value;
		return me;
	}).call({
		"displayName": "core/registry/emitter",

		/**
		 * Gets value by key
		 * @param {String|RegExp} [key] key to filter by
		 *  - If `String` get value exactly registered for key.
		 *  - If `RegExp` get value where key matches.
		 *  - If not provided all values registered are returned
		 * @return {*|*[]} result(s)
		 */
		"get": function (key) {
			var index = this[INDEX];
			var result;

			if (arguments[LENGTH] === 0) {
				result = Object
					.keys(index)
					.map(function (_key) {
						return index[_key];
					});
			}
			else if (OBJECT_TOSTRING.call(key) === TOSTRING_REGEXP) {
				result = Object
					.keys(index)
					.filter(function (_key) {
						return key.test(_key);
					}).map(function (_key) {
						return index[_key];
					});
			}
			else {
				result = index[key];
			}

			return result;
		},

		/**
		 * Registers value with key
		 * @param {String} key Key
		 * @param {*} value Value
		 * @fires sig/register
		 * @return {*} value registered
		 */
		"register": function (key, value) {
			var me = this;
			var index = me[INDEX];

			if (index[key] !== value) {

				if (index.hasOwnProperty(key)) {
					me.unregister(key);
				}

				me.emit(SIG_REGISTER, key, index[key] = value);
			}

			return value;
		},

		/**
		 * Un-registers key
		 * @param {String} key Key
		 * @fires sig/unregister
		 * @return {*} value unregistered
		 */
		"unregister": function (key) {
			var me = this;
			var index = me[INDEX];
			var value;

			if (index.hasOwnProperty(key)) {

				value = index[key];

				if (delete index[key]) {
					me.emit(SIG_UNREGISTER, key, value);
				}
			}

			return value;
		}
	}, EXECUTOR, executor));
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/registry',[ "../registry/emitter" ], function (Registry) {
	

	/**
	 * @class core.component.registry
	 * @extend core.registry.emitter
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
define('troopjs-core/task/registry',[ "../registry/emitter" ], function (Registry) {
	

	/**
	 * @class core.task.registry
	 * @extend core.registry.emitter
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
	"when/when"
], function (registry, when) {
	

	/**
	 * @class core.task.factory
	 * @mixin Function
	 * @static
	 */

	var TASK_COUNTER = 0;

	/**
	 * Creates and registers a task
	 * @method constructor
	 * @param {Promise|Function} promiseOrResolver The task resolver.
	 * @param {String} [name=task] Task name
	 * @return {Promise}
	 */
	return function factory(promiseOrResolver, name) {
		// Get promise
		var promise = when.isPromiseLike(promiseOrResolver)
			? when(promiseOrResolver)
			: when.promise(promiseOrResolver);

		// Create key
		var key = (name || "task") + "@" + ++TASK_COUNTER;

		// Ensure un-registration
		// Register task
		// Return
		return registry.register(key, promise.ensure(function () {
			registry.unregister(key);
		}));
	};
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/component/emitter',[
	"../emitter/composition",
	"../config",
	"./registry",
	"./executor",
	"../task/factory",
	"mu-merge/main",
	"troopjs-compose/decorator/around",
	"when/when",
	"poly/array"
], function (Emitter, config, registry, executor, taskFactory, merge, around, when) {
	

	/**
	 * Component emitter
	 * @class core.component.emitter
	 * @extend core.emitter.composition
	 * @mixin core.config
	 * @alias feature.component
	 */

	var FALSE = false;
	var ARRAY_PROTO = Array.prototype;
	var EXECUTOR = config.emitter.executor;
	var HANDLERS = config.emitter.handlers;
	var HEAD = config.emitter.head;
	var TAIL = config.emitter.tail;
	var SIG_SETUP = config.signal.setup;
	var SIG_ADD = config.signal.add;
	var SIG_REMOVE = config.signal.remove;
	var SIG_TEARDOWN = config.signal.teardown;
	var SIG_TASK = config.signal.task;
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var ON = "on";
	var ONE = "one";
	var SIG = "sig";
	var SIG_PATTERN = new RegExp("^" + SIG + "/(.+)");

	/**
	 * Current lifecycle phase
	 * @protected
	 * @readonly
	 * @property {core.config.phase} phase
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
	 * @event sig/stop
	 * @localdoc Triggered when this component enters the stop phase
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
	 * @param {Promise} task Task
	 * @param {String} name Task name
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
	 * @inheritdoc
	 * @localdoc Adds support for {@link #event-sig/setup} and {@link #event-sig/add}.
	 * @fires sig/setup
	 * @fires sig/add
	 */

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
			registry.register(me.toString(), me);

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
			registry.unregister(me.toString(), me);

			// Finalize all handlers
			Object
				.keys(me[HANDLERS])
				.forEach(function (type) {
					me.off(type);
				});
		},

		/**
		 * @method
		 * @inheritdoc
		 * @localdoc Adds support for {@link #event-sig/setup} and {@link #event-sig/add}.
		 * @fires sig/setup
		 * @fires sig/add
		 */
		"on": around(function (fn) {
			return function (type, callback, data) {
				var me = this;
				var handlers = me[HANDLERS];
				var event;
				var result;
				var _handlers;

				// If this type is NOT a signal we don't have to event try
				if (!SIG_PATTERN.test(type)) {
					// Get or initialize the handlers for this type
					if (handlers.hasOwnProperty(type)) {
						_handlers = handlers[type];
					} else {
						_handlers = {};
						_handlers[TYPE] = type;
					}

					// Initialize event
					event = {};
					event[EXECUTOR] = executor;

					// If this is the first handler signal SIG_SETUP
					if (!_handlers.hasOwnProperty(HEAD)) {
						event[TYPE] = SIG_SETUP;
						result = me.emit(event, _handlers, type, callback, data);
					}

					// If we were not interrupted
					if (result !== FALSE) {
						// Signal SIG_ADD
						event[TYPE] = SIG_ADD;
						result = me.emit(event, _handlers, type, callback, data);
					}

					// If we were not interrupted and `type` is not in `handlers`
					if (result !== FALSE && !handlers.hasOwnProperty(type)) {
						handlers[type] = _handlers;
					}
				}

				// If we were not interrupted call super.on
				if (result !== FALSE) {
					fn.call(me, type, callback, data);
				}
			};
		}),

		/**
		 * @method
		 * @inheritdoc
		 * @localdoc Adds support for {@link #event-sig/remove} and {@link #event-sig/teardown}.
		 * @fires sig/remove
		 * @fires sig/teardown
		 */
		"off": around(function(fn) {
			return function (type, callback) {
				var me = this;
				var handlers = me[HANDLERS];
				var event;
				var result;
				var _handlers;

				if (!SIG_PATTERN.test(type)) {
					// Get or initialize the handlers for this type
					if (handlers.hasOwnProperty(type)) {
						_handlers = handlers[type];
					} else {
						_handlers = {};
						_handlers[TYPE] = type;
					}

					// Initialize event
					event = {};
					event[EXECUTOR] = executor;

					// Signal SIG_REMOVE
					event[TYPE] = SIG_REMOVE;
					result = me.emit(event, _handlers, type, callback);

					// If we were not interrupted and this is the last handler signal SIG_TEARDOWN
					if (result !== FALSE && _handlers[HEAD] === _handlers[TAIL]) {
						event[TYPE] = SIG_TEARDOWN;
						result = me.emit(event, _handlers, type, callback);
					}

					// If we were not interrupted and `type` is not in `handlers`
					if (result !== FALSE && !handlers.hasOwnProperty(type)) {
						handlers[type] = _handlers;
					}
				}

				// If we were not interrupted call super.off
				if (result !== FALSE) {
					fn.call(me, type, callback);
				}
			};
		}),

		/**
		 * @inheritdoc core.task.factory#constructor
		 * @fires sig/task
		 */
		"task" : function (promiseOrResolver, name) {
			var me = this;

			// Create task
			var task = taskFactory.call(me, promiseOrResolver, name);

			// Signal `SIG_TASK` and yield `task`
			return me.emit(SIG_TASK, task, name).yield(task);
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/executor',[
	"../config",
	"when/when"
], function (config, when) {
	

	/**
	 * @class core.pubsub.executor
	 * @mixin Function
	 * @mixin core.config
	 * @private
	 * @static
	 * @alias feature.executor
	 */

	var UNDEFINED;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var ARRAY_SLICE = Array.prototype.slice;
	var TOSTRING_ARGUMENTS = "[object Arguments]";
	var TOSTRING_ARRAY = "[object Array]";
	var SKIP = config.phase.skip;
	var SCOPE = config.emitter.scope;
	var CALLBACK = config.emitter.callback;
	var HEAD = config.emitter.head;
	var NEXT = config.emitter.next;
	var PHASE = "phase";
	var MEMORY = "memory";

	/**
	 * @method constructor
	 * @inheritdoc core.emitter.executor#constructor
	 * @localdoc
	 * - Skips handlers who's scope.{@link core.component.gadget#property-phase phase} matches {@link core.config.phase#skip}.
	 * - Executes handlers passing each handler the result from the previous.
	 * - If a handler returns `undefined` the result from the previous is used.
	 * - When all handlers are completed the end result is memorized on `handlers`
	 *
	 * @return {Promise} Promise for `[*]`
	 */
	return function (event, handlers, args) {
		var _handlers = [];
		var _handlersCount = 0;
		var scope = event[SCOPE];
		var callback = event[CALLBACK];
		var handler;

		// Iterate handlers
		for (handler = handlers[HEAD]; handler !== UNDEFINED; handler = handler[NEXT]) {
			if (callback && handler[CALLBACK] !== callback) {
				continue;
			}

			if (scope && handler[SCOPE] !== scope) {
				continue;
			}

			_handlers[_handlersCount++] = handler;
		}

		return when
			// Reduce `_handlers`
			.reduce(_handlers, function (current, _handler) {
				// Let `_scope` be `handler[SCOPE]`
				var _scope = _handler[SCOPE];

				// Return early if `_scope[PHASE]` matches a blocked phase
				if (_scope !== UNDEFINED && SKIP.test(_scope[PHASE])) {
					return current;
				}

				// Run `handler` passing `args`
				// Pass to `when` to (potentially) update `result`
				return when(_handler.handle(current), function (result) {
					// If `result` is `UNDEFINED` ...
					if (result === UNDEFINED) {
						// ... return `current` ...
						return current;
					}

					// Detect `result` type
					switch (OBJECT_TOSTRING.call(result)) {
						// `arguments` should be converted to an array
						case TOSTRING_ARGUMENTS:
							return ARRAY_SLICE.call(result);
							break;

						// `array` can be passed as-is
						case TOSTRING_ARRAY:
							return result;
							break;

						// everything else should be wrapped in an array
						default:
							return [ result ];
					}
				});
			}, args)
			// Memorize
			.tap(function (result) {
				// Store `result` in `handlers[MEMORY]`
				handlers[MEMORY] = result;
			});
	}
});
/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-core/pubsub/emitter',[
	"../emitter/composition",
	"../config",
	"./executor",
	"troopjs-compose/decorator/from"
], function (Emitter, config, executor, from) {
	

	/**
	 * A specialized version of {@link core.emitter.composition} for memorized events and {@link core.component.gadget#property-phase phase} protection.
	 *
	 * ## Memorized emitting
	 *
	 * A emitter event will memorize the "current" value of each event. Each executor may have it's own interpretation
	 * of what "current" means.
	 *
	 * @class core.pubsub.emitter
	 * @extend core.emitter.composition
	 */

	var UNDEFINED;
	var MEMORY = "memory";
	var HANDLERS = config.emitter.handlers;
	var EXECUTOR = config.emitter.executor;

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

	return Emitter.extend((function (key, value) {
		var me = this;
		me[key] = value;
		return me;
	}).call({
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
		"publish" : from("emit"),

		/**
		 * Returns value in handlers MEMORY
		 * @param {String} type event type to peek at
		 * @param {*} [value] Value to use _only_ if no memory has been recorder
		 * @return {*} Value in MEMORY
		 */
		"peek": function (type, value) {
			var handlers;

			return (handlers = this[HANDLERS][type]) === UNDEFINED || !handlers.hasOwnProperty(MEMORY)
				? value
				: handlers[MEMORY];
		}
	}, EXECUTOR, executor));
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
	"./emitter",
	"../config",
	"../pubsub/hub",
	"../pubsub/executor",
	"when/when"
],function (Emitter, config, hub, executor, when) {
	

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
	 * @extend core.component.emitter
	 * @localdoc Adds convenience methods and specials to interact with the hub
	 * @alias feature.component
	 */

	var UNDEFINED;
	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var EXECUTOR = config.emitter.executor;
	var SCOPE = config.emitter.scope;
	var CALLBACK = config.emitter.callback;
	var ARGS = "args";
	var NAME = "name";
	var TYPE = "type";
	var VALUE = "value";
	var HUB = "hub";
	var RE = new RegExp("^" + HUB + "/(.+)");

	/**
	 * @method constructor
	 * @inheritdoc
	 */
	return Emitter.extend({
		"displayName" : "core/component/gadget",

		/**
		 * @inheritdoc
		 * @localdoc Registers event handlers declared HUB specials
		 * @handler
		 */
		"sig/initialize" : function () {
			var me = this;

			return when.map(me.constructor.specials[HUB] || ARRAY_PROTO, function (special) {
				return me.on(special[NAME], special[VALUE]);
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

					if (special[ARGS][0] === true && (memory = hub.peek(special[TYPE], empty)) !== empty) {
						// Redefine result
						result = {};
						result[TYPE] = special[NAME];
						result[EXECUTOR] = executor;
						result[SCOPE] = me;
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
				_callback[SCOPE] = me;
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
				_callback[SCOPE] = me;
				_callback[CALLBACK] = callback;

				// Unsubscribe from the hub
				hub.unsubscribe(matches[1], _callback);
			}
		}
	});
});

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/config',[
	"troopjs-core/config",
	"module",
	"mu-merge/main"
], function (config, module, merge) {
	

	/**
	 * @class dom.config.signal
	 * @extends core.config.signal
	 * @private
	 */
	var SIGNAL = {
		/**
		 * Signal emitted when component renders.
		 */
		"render": "sig/render"
	};

	/**
	 * DOM component configuration
	 * @class dom.config
	 * @extends core.config
	 * @private
	 * @alias feature.config
	 */

	return merge.call({}, config, {
		 /**
		 * @cfg {dom.config.signal}
		 * @inheritdoc
		 * @protected
		 */
		"signal": SIGNAL
	}, module.config());
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/executor',[
	"mu-selector-set/main",
	"jquery",
	"poly/array"
], function (SelectorSet, $) {
	

	/**
	 * @class dom.executor
	 * @mixin Function
	 * @private
	 * @static
	 * @alias feature.executor
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
	 * @inheritdoc core.emitter.executor#constructor
	 * @localdoc
	 * - Executes handlers synchronously passing each handler `args`.
	 * - If a handler returns `false` no more handlers will be executed.
	 * - If a handler stops propagation no more handlers will be executed.
	 *
	 * @return {*} Result from last handler
	 */
	return function (event, handlers, args) {
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

			return handler.handle(args);
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

/**
 * @license MIT http://troopjs.mit-license.org/
 */
define('troopjs-dom/component',[
	"troopjs-core/component/gadget",
	"./config",
	"./executor",
	"troopjs-compose/decorator/before",
	"jquery",
	"when/when",
	"mu-selector-set/main",
	"poly/array",
	"mu-jquery-destroy/main"
], function (Gadget, config, executor, before, $, when, SelectorSet) {
	

	/**
	 * Component that manages all DOM manipulation and integration.
	 * @class dom.component
	 * @extend core.component.gadget
	 * @mixin dom.config
	 * @alias feature.component
	 */

	var UNDEFINED;
	var NULL = null;
	var OBJECT_TOSTRING = Object.prototype.toString;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var $FN = $.fn;
	var $GET = $FN.get;
	var TOSTRING_FUNCTION = "[object Function]";
	var $ELEMENT = "$element";
	var PROXY = "proxy";
	var DOM = "dom";
	var ARGS = "args";
	var NAME = "name";
	var VALUE = "value";
	var TYPE = config.emitter.type;
	var EXECUTOR = config.emitter.executor;
	var SCOPE = config.emitter.scope;
	var CALLBACK = config.emitter.callback;
	var DATA = config.emitter.data;
	var DIRECT = "direct";
	var DELEGATED = "delegated";
	var ON = "on";
	var OFF = "off";
	var SIG_RENDER = config.signal.render;
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
					args[EXECUTOR] = executor;
					args[SCOPE] = me;
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
		spec[method] = function (contentOrPromise) {
			var me = this;

			// If `arguments.length` is `0` just return `$fn.call(...)`
			if (arguments.length === 0) {
				return $fn.call(me[$ELEMENT]);
			}

			// Slice `arguments` to `args`
			var args = ARRAY_SLICE.call(arguments, 0);

			return when(contentOrPromise, function (content) {
				// If `content` is a function ...
				return (OBJECT_TOSTRING.call(content) === TOSTRING_FUNCTION)
					// ... return result of applying `content` with sliced `args`...
					? content.apply(me, ARRAY_SLICE.call(args, 1))
					// ... otherwise return `content`
					: content;
			})
				.then(function (content) {
					// Let `args[0]` be `$(content)`
					// Let `$content` be `args[0]`
					var $content = args[0] = $(content);

					// Let `emit_args` be `[ SIG_RENDER ]`
					var emit_args = [ SIG_RENDER ];

					// Push `args` on `emit_args`
					ARRAY_PUSH.apply(emit_args, args);

					// Call `$fn` with `$content`
					$fn.call(me[$ELEMENT], $content);

					// Emit `emit_args`
					// Yield `args`
					return me.emit
						.apply(me, emit_args)
						.yield(args);
				});
		};

		// Return spec for next iteration
		return spec;
	}, {}));
});

define(['troopjs/version'], function (version) {
	return version;
});