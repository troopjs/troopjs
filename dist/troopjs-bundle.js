
/*!
 * TroopJS RequireJS template plug-in
 *
 * parts of code from require-cs 0.4.0+ Copyright (c) 2010-2011, The Dojo Foundation
 *
 * @license TroopJS 0.0.2 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * This plugin provides a template loader and compiler.
 */
define('template',[],function TemplateModule() {
	

	var FACTORIES = {
		"node" : function () {
			// Using special require.nodeRequire, something added by r.js.
			var fs = require.nodeRequire("fs");

			return function fetchText(path, callback) {
				callback(fs.readFileSync(path, 'utf8'));
			};
		},

		"browser" : function () {
			// Would love to dump the ActiveX crap in here. Need IE 6 to die first.
			var progIds = [ "Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"];
			var progId;
			var XHR;
			var i;

			if (typeof XMLHttpRequest !== "undefined") {
				XHR = XMLHttpRequest;
			}
			else find: {
				for (i = 0; i < 3; i++) {
					progId = progIds[i];

					try {
						XHR = ActiveXObject(progId);
						break find;
					} catch (e) {}
				}

				throw new Error("XHR: XMLHttpRequest not available");
			}

			return function fetchText(url, callback) {
				var xhr = new XHR();
				xhr.open('GET', url, true);
				xhr.onreadystatechange = function (evt) {
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
	 * @returns {Function}
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
	};

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

/*
 * ComposeJS, object composition for JavaScript, featuring
* JavaScript-style prototype inheritance and composition, multiple inheritance, 
* mixin and traits-inspired conflict resolution and composition  
 */
(function(define){

define('compose',[], function(){
	// function for creating instances from a prototype
	function Create(){
	}
	var delegate = Object.create ?
		function(proto){
			return Object.create(typeof proto == "function" ? proto.prototype : proto || Object.prototype);
		} :
		function(proto){
			Create.prototype = typeof proto == "function" ? proto.prototype : proto;
			var instance = new Create();
			Create.prototype = null;
			return instance;
		};
	function validArg(arg){
		if(!arg){
			throw new Error("Compose arguments must be functions or objects");
		}
		return arg;
	}
	// this does the work of combining mixins/prototypes
	function mixin(instance, args, i){
		// use prototype inheritance for first arg
		var value, argsLength = args.length; 
		for(; i < argsLength; i++){
			var arg = args[i];
			if(typeof arg == "function"){
				// the arg is a function, use the prototype for the properties
				var prototype = arg.prototype;
				for(var key in prototype){
					value = prototype[key];
					var own = prototype.hasOwnProperty(key);
					if(typeof value == "function" && key in instance && value !== instance[key]){
						var existing = instance[key]; 
						if(value == required){
							// it is a required value, and we have satisfied it
							value = existing;
						} 
						else if(!own){
							// if it is own property, it is considered an explicit override 
							// TODO: make faster calls on this, perhaps passing indices and caching
							if(isInMethodChain(value, key, getBases([].slice.call(args, 0, i), true))){
								// this value is in the existing method's override chain, we can use the existing method
								value = existing;
							}else if(!isInMethodChain(existing, key, getBases([arg], true))){
								// the existing method is not in the current override chain, so we are left with a conflict
								console.error("Conflicted method " + key + ", final composer must explicitly override with correct method.");
							}
						}
					}
					if(value && value.install && own && !isInMethodChain(existing, key, getBases([arg], true))){
						// apply modifier
						value.install.call(instance, key);
					}else{
						instance[key] = value;
					} 
				}
			}else{
				// it is an object, copy properties, looking for modifiers
				for(var key in validArg(arg)){
					var value = arg[key];
					if(typeof value == "function"){
						if(value.install){
							// apply modifier
							value.install.call(instance, key);
							continue;
						}
						if(key in instance){
							if(value == required){
								// required requirement met
								continue;
							} 
						}
					}
					// add it to the instance
					instance[key] = value;
				}
			}
		}
		return instance;	
	}
	// allow for override (by es5 module)
	Compose._setMixin = function(newMixin){
		mixin = newMixin;
	};
	function isInMethodChain(method, name, prototypes){
		// searches for a method in the given prototype hierarchy 
		for(var i = 0; i < prototypes.length;i++){
			var prototype = prototypes[i];
			if(prototype[name] == method){
				// found it
				return true;
			}
		}
	}
	// Decorator branding
	function Decorator(install, direct){
		function Decorator(){
			if(direct){
				return direct.apply(this, arguments);
			}
			throw new Error("Decorator not applied");
		}
		Decorator.install = install;
		return Decorator;
	}
	Compose.Decorator = Decorator;
	// aspect applier 
	function aspect(handler){
		return function(advice){
			return Decorator(function install(key){
				var baseMethod = this[key];
				(advice = this[key] = baseMethod ? handler(this, baseMethod, advice) : advice).install = install;
			}, advice);
		};
	};
	// around advice, useful for calling super methods too
	Compose.around = aspect(function(target, base, advice){
		return advice.call(target, base);
	});
	Compose.before = aspect(function(target, base, advice){
		return function(){
			var results = advice.apply(this, arguments);
			if(results !== stop){
				return base.apply(this, results || arguments);
			}
		};
	});
	var stop = Compose.stop = {};
	var undefined;
	Compose.after = aspect(function(target, base, advice){
		return function(){
			var results = base.apply(this, arguments);
			var adviceResults = advice.apply(this, arguments);
			return adviceResults === undefined ? results : adviceResults;
		};
	});
	
	// rename Decorator for calling super methods
	Compose.from = function(trait, fromKey){
		if(fromKey){
			return (typeof trait == "function" ? trait.prototype : trait)[fromKey];
		}
		return Decorator(function(key){
			if(!(this[key] = (typeof trait == "string" ? this[trait] : 
				(typeof trait == "function" ? trait.prototype : trait)[fromKey || key]))){
				throw new Error("Source method " + fromKey + " was not available to be renamed to " + key);
			}
		});
	};
	
	// Composes an instance
	Compose.create = function(base){
		// create the instance
		var instance = mixin(delegate(base), arguments, 1);
		var argsLength = arguments.length;
		// for go through the arguments and call the constructors (with no args)
		for(var i = 0; i < argsLength; i++){
			var arg = arguments[i];
			if(typeof arg == "function"){
				instance = arg.call(instance) || instance;
			}
		}
		return instance;
	}
	// The required function, just throws an error if not overriden
	function required(){
		throw new Error("This method is required and no implementation has been provided");
	};
	Compose.required = required;
	// get the value of |this| for direct function calls for this mode (strict in ES5)
	
	function extend(){
		var args = [this];
		args.push.apply(args, arguments);
		return Compose.apply(0, args);
	}
	// Compose a constructor
	function Compose(base){
		var args = arguments;
		var prototype = (args.length < 2 && typeof args[0] != "function") ? 
			args[0] : // if there is just a single argument object, just use that as the prototype 
			mixin(delegate(validArg(base)), args, 1); // normally create a delegate to start with			
		function Constructor(){
			var instance;
			if(this instanceof Constructor){
				// called with new operator, can proceed as is
				instance = this;
			}else{
				// we allow for direct calls without a new operator, in this case we need to
				// create the instance ourself.
				Create.prototype = prototype;
				instance = new Create();
			}
			// call all the constructors with the given arguments
			for(var i = 0; i < constructorsLength; i++){
				var constructor = constructors[i];
				var result = constructor.apply(instance, arguments);
				if(typeof result == "object"){
					if(result instanceof Constructor){
						instance = result;
					}else{
						for(var j in result){
							if(result.hasOwnProperty(j)){
								instance[j] = result[j];
							}
						}
					}
				}	
			}
			return instance;
		}
		// create a function that can retrieve the bases (constructors or prototypes)
		Constructor._getBases = function(prototype){
			return prototype ? prototypes : constructors;
		};
		// now get the prototypes and the constructors
		var constructors = getBases(args), 
			constructorsLength = constructors.length;
		if(typeof args[args.length - 1] == "object"){
			args[args.length - 1] = prototype;
		}
		var prototypes = getBases(args, true);
		Constructor.extend = extend;
		if(!Compose.secure){
			prototype.constructor = Constructor;
		}
		Constructor.prototype = prototype;
		return Constructor;
	};
	
	Compose.apply = function(thisObject, args){
		// apply to the target
		return thisObject ? 
			mixin(thisObject, args, 0) : // called with a target object, apply the supplied arguments as mixins to the target object
			extend.apply.call(Compose, 0, args); // get the Function.prototype apply function, call() it to apply arguments to Compose (the extend doesn't matter, just a handle way to grab apply, since we can't get it off of Compose) 
	};
	Compose.call = function(thisObject){
		// call() should correspond with apply behavior
		return mixin(thisObject, arguments, 1);
	};
	
	function getBases(args, prototype){
		// this function registers a set of constructors for a class, eliminating duplicate
		// constructors that may result from diamond construction for classes (B->A, C->A, D->B&C, then D() should only call A() once)
		var bases = [];
		function iterate(args, checkChildren){
			outer: 
			for(var i = 0; i < args.length; i++){
				var arg = args[i];
				var target = prototype && typeof arg == "function" ?
						arg.prototype : arg;
				if(prototype || typeof arg == "function"){
					var argGetBases = checkChildren && arg._getBases;
					if(argGetBases){
						iterate(argGetBases(prototype)); // don't need to check children for these, this should be pre-flattened 
					}else{
						for(var j = 0; j < bases.length; j++){
							if(target == bases[j]){
								continue outer;
							}
						}
						bases.push(target);
					}
				}
			}
		}
		iterate(args, true);
		return bases;
	}
	// returning the export of the module
	return Compose;
});
})(typeof define != "undefined" ?
	define: // AMD/RequireJS format if available
	function(deps, factory){
		if(typeof module !="undefined"){
			module.exports = factory(); // CommonJS environment, like NodeJS
		//	require("./configure");
		}else{
			Compose = factory(); // raw script, assign to Compose global
		}
	});

/*!
 * TroopJS base component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The base trait provides functionality for instance counting,
 * configuration and a default 'toString' method.
 */
define('troopjs-core/component/base',[ "compose", "config" ], function ComponentModule(Compose, config) {
	var COUNT = 0;

	return Compose(function Component() {
		this.instanceCount = COUNT++;
	}, {
		displayName : "core/component",

		/**
		 * Application configuration
		 */
		config : config,

		/**
		 * Generates string representation of this object
		 * @returns Combination displayName and instanceCount
		 */
		toString : function toString() {
			var self = this;

			return self.displayName + "@" + self.instanceCount;
		}
	});
});

/*!
 * TroopJS deferred component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/util/deferred',[ "jquery" ], function DeferredModule($) {
	return $.Deferred;
});
/*!
 * TroopJS util/unique component
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/util/unique',[],function UniqueModule() {
	return function unique(callback) {
		var self = this;
		var length = self.length;
		var result = [];
		var value;
		var i;
		var j;
		var k;

		add: for (i = j = k = 0; i < length; i++, j = 0) {
			value = self[i];

			while(j < k) {
				if (callback.call(self, value, result[j++]) === true) {
					continue add;
				}
			}

			result[k++] = value;
		}

		return result;
	};
});
/*!
 * TroopJS pubsub/topic module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/pubsub/topic',[ "../component/base", "../util/unique" ], function TopicModule(Component, unique) {
	var TOSTRING = Object.prototype.toString;
	var TOSTRING_ARRAY = TOSTRING.call(Array.prototype);

	function comparator (a, b) {
		return a.publisherInstanceCount === b.publisherInstanceCount;
	}

	return Component.extend(function Topic(topic, publisher, parent) {
		var self = this;

		self.topic = topic;
		self.publisher = publisher;
		self.parent = parent;
		self.publisherInstanceCount = publisher.instanceCount;
	}, {
		displayName : "core/pubsub/topic",

		/**
		 * Generates string representation of this object
		 * @returns Instance topic
		 */
		toString : function toString() {
			return this.topic;
		},

		/**
		 * Traces topic origin to root
		 * @returns String representation of all topics traced down to root
		 */
		trace : function trace() {
			var current = this;
			var constructor = current.constructor;
			var parent;
			var item;
			var stack = "";
			var i;
			var u;
			var iMax;

			while (current) {
				if (TOSTRING.call(current) === TOSTRING_ARRAY) {
					u = unique.call(current, comparator);

					for (i = 0, iMax = u.length; i < iMax; i++) {
						item = u[i];

						u[i] = item.constructor === constructor
							? item.trace()
							: item.topic;
					}

					stack += u.join(",");
					break;
				}

				parent = current.parent;
				stack += parent
					? current.publisher + ":"
					: current.publisher;
				current = parent;
			}

			return stack;
		}
	});
});
/*!
 * TroopJS pubsub/hub module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/pubsub/hub',[ "compose", "../component/base", "./topic" ], function HubModule(Compose, Component, Topic) {
	var FUNCTION = Function;
	var MEMORY = "memory";
	var CONTEXT = "context";
	var CALLBACK = "callback";
	var LENGTH = "length";
	var HEAD = "head";
	var TAIL = "tail";
	var NEXT = "next";
	var HANDLED = "handled";
	var ROOT = {};
	var HANDLERS = {};
	var COUNT = 0;

	return Compose.create({
		displayName: "core/pubsub/hub",

		/**
		 * Subscribe to a topic
		 * 
		 * @param topic Topic to subscribe to
		 * @param context (optional) context to scope callbacks to
		 * @param memory (optional) do we want the last value applied to callbacks
		 * @param callback Callback for this topic
		 * @returns self
		 */
		subscribe : function subscribe(topic /*, context, memory, callback, callback, ..*/) {
			var self = this;
			var length = arguments[LENGTH];
			var context = arguments[1];
			var memory = arguments[2];
			var callback = arguments[3];
			var offset;
			var handlers;
			var handler;
			var handled;
			var head;
			var tail;

			// No context or memory was supplied
			if (context instanceof FUNCTION) {
				callback = context;
				memory = false;
				context = ROOT;
				offset = 1;
			}
			// Only memory was supplied
			else if (context === true || context === false) {
				callback = memory;
				memory = context;
				context = ROOT;
				offset = 2;
			}
			// Context was supplied, but not memory
			else if (memory instanceof FUNCTION) {
				callback = memory;
				memory = false;
				offset = 2;
			}
			// All arguments were supplied
			else if (callback instanceof FUNCTION){
				offset = 3;
			}
			// Something is wrong, return fast
			else {
				return self;
			}

			// Have handlers
			if (topic in HANDLERS) {

				// Get handlers
				handlers = HANDLERS[topic];

				// Create new handler
				handler = {
					"callback" : arguments[offset++],
					"context" : context
				};

				// Get tail handler
				tail = TAIL in handlers
					// Have tail, update handlers.tail.next to point to handler
					? handlers[TAIL][NEXT] = handler
					// Have no tail, update handlers.head to point to handler
					: handlers[HEAD] = handler;

				// Iterate handlers from offset
				while (offset < length) {
					// Set tail -> tail.next -> handler
					tail = tail[NEXT] = {
						"callback" : arguments[offset++],
						"context" : context
					};
				}

				// Set tail handler
				handlers[TAIL] = tail;

				// Want memory and have memory
				if (memory && MEMORY in handlers) {
					// Get memory
					memory = handlers[MEMORY];

					// Get handled
					handled = memory[HANDLED];

					// Loop through handlers, optimize for arguments
					if (memory[LENGTH] > 0 ) while(handler) {
						// Skip to next handler if this handler has already been handled
						if (handler[HANDLED] === handled) {
							handler = handler[NEXT];
							continue;
						}

						// Store handled
						handler[HANDLED] = handled;

						// Apply handler callback
						handler[CALLBACK].apply(handler[CONTEXT], memory);

						// Update handler
						handler = handler[NEXT];
					}
					// Loop through handlers, optimize for no arguments
					else while(handler) {
						// Skip to next handler if this handler has already been handled
						if (handler[HANDLED] === handled) {
							handler = handler[NEXT];
							continue;
						}

						// Store handled
						handler[HANDLED] = handled;

						// Call handler callback
						handler[CALLBACK].call(handler[CONTEXT]);

						// Update handler
						handler = handler[NEXT];
					}
				}
			}
			// No handlers
			else {
				// Create head and tail
				head = tail = {
					"callback" : arguments[offset++],
					"context" : context
				};

				// Iterate handlers from offset
				while (offset < length) {
					// Set tail -> tail.next -> handler
					tail = tail[NEXT] = {
						"callback" : arguments[offset++],
						"context" : context
					};
				}

				// Create topic list
				HANDLERS[topic] = {
					"head" : head,
					"tail" : tail
				};
			}

			return self;
		},

		/**
		 * Unsubscribes from topic
		 * 
		 * @param topic Topic to unsubscribe from
		 * @param context (optional) context to scope callbacks to
		 * @param callback (optional) Callback to unsubscribe, if none
		 *        are provided all callbacks are unsubscribed
		 * @returns self
		 */
		unsubscribe : function unsubscribe(topic /*, context, callback, callback, ..*/) {
			var length = arguments[LENGTH];
			var context = arguments[1];
			var callback = arguments[2];
			var offset;
			var handlers;
			var handler;
			var head;
			var previous = null;

			// No context or memory was supplied
			if (context instanceof FUNCTION) {
				callback = context;
				context = ROOT;
				offset = 1;
			}
			// All arguments were supplied
			else if (callback instanceof FUNCTION){
				offset = 2;
			}
			// Something is wrong, return fast
			else {
				return self;
			}

			unsubscribe: {
				// Fast fail if we don't have subscribers
				if (!(topic in HANDLERS)) {
					break unsubscribe;
				}

				// Get handlers
				handlers = HANDLERS[topic];

				// Get head
				head = handlers[HEAD];

				// Loop over remaining arguments
				while (offset < length) {
					// Store callback
					callback = arguments[offset++];

					// Get first handler
					handler = previous = head;

					// Loop through handlers
					do {
						// Check if this handler should be unlinked
						if (handler[CALLBACK] === callback && handler[CONTEXT] === context) {
							// Is this the first handler
							if (handler === head) {
								// Re-link head and previous, then
								// continue
								head = previous = handler[NEXT];
								continue;
							}

							// Unlink current handler, then continue
							previous[NEXT] = handler[NEXT];
							continue;
						}

						// Update previous pointer
						previous = handler;
					} while (handler = handler[NEXT]);
				}

				// Update head and tail
				if (head && previous) {
					handlers[HEAD] = head;
					handlers[TAIL] = previous;
				}
				else {
					delete handlers[HEAD];
					delete handlers[TAIL];
				}
			}

			return this;
		},

		/**
		 * Publishes on a topic
		 * 
		 * @param topic Topic to publish to
		 * @param arg (optional) Argument
		 * @returns self
		 */
		publish : function publish(topic /*, arg, arg, ..*/) {
			var handlers;
			var handler;

			// Store handled
			var handled = arguments[HANDLED] = COUNT++;

			// Have handlers
			if (topic in HANDLERS) {
				// Get handlers
				handlers = HANDLERS[topic];

				// Remember arguments
				handlers[MEMORY] = arguments;

				// Get first handler
				handler = handlers[HEAD];

				// Loop through handlers, optimize for arguments
				if (arguments[LENGTH] > 0) while(handler) {
					// Skip to next handler if this handler has already been handled
					if (handler[HANDLED] === handled) {
						handler = handler[NEXT];
						continue;
					}

					// Update handled
					handler[HANDLED] = handled;

					// Apply handler callback
					handler[CALLBACK].apply(handler[CONTEXT], arguments);

					// Update handler
					handler = handler[NEXT];
				}
				// Loop through handlers, optimize for no arguments
				else while(handler) {
					// Skip to next handler if this handler has already been handled
					if (handler[HANDLED] === handled) {
						handler = handler[NEXT];
						continue;
					}

					// Update handled
					handler[HANDLED] = handled;

					// Call handler callback
					handler[CALLBACK].call(handler[CONTEXT]);

					// Update handler
					handler = handler[NEXT];
				}
			}
			// No handlers
			else if (arguments[LENGTH] > 0){
				// Create handlers and store with topic
				HANDLERS[topic] = handlers = {};

				// Remember arguments
				handlers[MEMORY] = arguments;
			}

			return this;
		}
	});
});

/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides life cycle management
 */
define('troopjs-core/component/gadget',[ "compose", "./base", "../util/deferred", "../pubsub/hub" ], function GadgetModule(Compose, Component, Deferred, hub) {
	var NULL = null;
	var FUNCTION = Function;
	var RE_HUB = /^hub(?::(\w+))?\/(.+)/;
	var RE_SIG = /^sig\/(.+)/;
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;
	var MEMORY = "memory";
	var SUBSCRIPTIONS = "subscriptions";

	return Component.extend(function Gadget() {
		var self = this;
		var bases = self.constructor._getBases(true);
		var base;
		var callbacks;
		var callback;
		var i;
		var j;
		var jMax;

		var signals = {};
		var signal;
		var matches;
		var key = null;

		// Iterate base chain (while there's a prototype)
		for (i = bases.length; i >= 0; i--) {
			base = bases[i];

			add: for (key in base) {
				// Get value
				callback = base[key];

				// Continue if value is not a function
				if (!(callback instanceof FUNCTION)) {
					continue;
				}

				// Match signature in key
				matches = RE_SIG.exec(key);

				if (matches !== NULL) {
					// Get signal
					signal = matches[1];

					// Have we stored any callbacks for this signal?
					if (signal in signals) {
						// Get callbacks (for this signal)
						callbacks = signals[signal];

						// Reset counters
						j = jMax = callbacks.length;

						// Loop callbacks, continue add if we've already added this callback
						while (j--) {
							if (callback === callbacks[j]) {
								continue add;
							}
						}

						// Add callback to callbacks chain
						callbacks[jMax] = callback;
					}
					else {
						// First callback
						signals[signal] = [ callback ];
					}
				}
			}
		}

		// Extend self
		Compose.call(self, {
			signal : function signal(signal, deferred) {
				var _self = this;
				var _callbacks;
				var _j;
				var head = deferred;

				// Only trigger if we have callbacks for this signal
				if (signal in signals) {
					// Get callbacks
					_callbacks = signals[signal];

					// Reset counter
					_j = _callbacks.length;

					// Build deferred chain from end to 1
					while (--_j) {
						// Create new deferred
						head = Deferred(function (dfd) {
							// Store callback and deferred as they will have changed by the time we exec
							var _callback = _callbacks[_j];
							var _deferred = head;

							// Add done handler
							dfd.done(function done() {
								_callback.call(_self, signal, _deferred);
							});
						});
					}

					// Execute first sCallback, use head deferred
					_callbacks[0].call(_self, signal, head);
				}
				else if (deferred) {
					deferred.resolve();
				}

				return _self;
			}
		});
	}, {
		displayName : "core/component/gadget",

		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;

			var subscriptions = self[SUBSCRIPTIONS] = [];
			var key = NULL;
			var value;
			var matches;
			var topic;

			// Loop over each property in gadget
			for (key in self) {
				// Get value
				value = self[key];

				// Continue if value is not a function
				if (!(value instanceof FUNCTION)) {
					continue;
				}

				// Match signature in key
				matches = RE_HUB.exec(key);

				if (matches !== NULL) {
					// Get topic
					topic = matches[2];

					// Subscribe
					hub.subscribe(topic, self, matches[1] === MEMORY, value);

					// Store in subscriptions
					subscriptions[subscriptions.length] = [topic, self, value];

					// NULL value
					self[key] = NULL;
				}
			}

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;
			var subscriptions = self[SUBSCRIPTIONS];
			var subscription;

			// Loop over subscriptions
			while (subscription = subscriptions.shift()) {
				hub.unsubscribe(subscription[0], subscription[1], subscription[2]);
			}

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		/**
		 * Calls hub.publish in self context
		 * @returns self
		 */
		publish : function publish() {
			var self = this;

			PUBLISH.apply(hub, arguments);

			return self;
		},

		/**
		 * Calls hub.subscribe in self context
		 * @returns self
		 */
		subscribe : function subscribe() {
			var self = this;

			SUBSCRIBE.apply(hub, arguments);

			return self;
		},

		/**
		 * Calls hub.unsubscribe in self context
		 * @returns self
		 */
		unsubscribe : function unsubscribe() {
			var self = this;

			UNSUBSCRIBE.apply(hub, arguments);

			return self;
		},

		start : function start(deferred) {
			var self = this;

			Deferred(function deferredStart(dfdStart) {
				Deferred(function deferredInitialize(dfdInitialize) {
					self.signal("initialize", dfdInitialize);
				})
				.done(function doneInitialize() {
					self.signal("start", dfdStart);
				})
				.fail(dfdStart.reject);

				if (deferred) {
					dfdStart.then(deferred.resolve, deferred.reject);
				}
			});

			return self;
		},

		stop : function stop(deferred) {
			var self = this;

			Deferred(function deferredFinalize(dfdFinalize) {
				Deferred(function deferredStop(dfdStop) {
					self.signal("stop", dfdStop);
				})
				.done(function doneStop() {
					self.signal("finalize", dfdFinalize);
				})
				.fail(dfdFinalize.reject);

				if (deferred) {
					dfdFinalize.then(deferred.resolve, deferred.reject);
				}
			});

			return self;
		}
	});
});

/*!
 * TroopJS service component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/component/service',[ "./gadget" ], function ServiceModule(Gadget) {
	return Gadget.extend({
		displayName : "core/component/service"
	});
});
/*!
 * TroopJS util/merge module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/util/merge',[],function MergeModule() {
	var ARRAY = Array;
	var OBJECT = Object;

	return function merge(source) {
		var target = this;
		var key = null;
		var i;
		var iMax;
		var value;
		var constructor;

		for (i = 0, iMax = arguments.length; i < iMax; i++) {
			source = arguments[i];

			for (key in source) {
				value = source[key];
				constructor = value.constructor;
	
				if (!(key in target)) {
					target[key] = value;
				}
				else if (constructor === ARRAY) {
					target[key] = target[key].concat(value);
				}
				else if (constructor === OBJECT) {
					merge.call(target[key], value);
				}
				else {
					target[key] = value;
				}
			}
		}

		return target;
	};
});
/*!
 * TroopJS remote/ajax module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/remote/ajax',[ "../component/service", "../pubsub/topic", "jquery", "../util/merge" ], function AjaxModule(Service, Topic, $, merge) {
	return Service.extend({
		displayName : "core/remote/ajax",

		"hub/ajax" : function request(topic, settings, deferred) {
			// Request
			$.ajax(merge.call({
				"headers": {
					"x-request-id": new Date().getTime(),
					"x-components": topic instanceof Topic ? topic.trace() : topic
				}
			}, settings)).then(deferred.resolve, deferred.reject);
		}
	});
});
/*!
 * TroopJS util/uri module
 * 
 * parts of code from parseUri 1.2.2 Copyright Steven Levithan <stevenlevithan.com>
 * 
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/util/uri',[ "compose" ], function URIModule(Compose) {
	var NULL = null;
	var FUNCTION = Function;
	var ARRAY = Array;
	var ARRAY_PROTO = ARRAY.prototype;
	var TYPEOF_OBJECT = typeof Object.prototype;
	var TYPEOF_STRING = typeof String.prototype;
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

	// Store current Compose.secure setting
	var SECURE = Compose.secure;

	// Prevent Compose from creating constructor property
	Compose.secure = true;

	var Query = Compose(function Query(arg) {
		var self = this;
		var matches;
		var key = NULL;
		var value;
		var re = /(?:&|^)([^&=]*)=?([^&]*)/g;

		switch (typeof arg) {
		case TYPEOF_OBJECT:
			for (key in arg) {
				self[key] = arg[key];
			}
			break;

		case TYPEOF_STRING:
			while (matches = re.exec(str)) {
				key = matches[1];

				if (key in self) {
					value = self[key];

					if (value instanceof ARRAY) {
						value[value.length] = matches[2];
					}
					else {
						self[key] = [ value, matches[2] ];
					}
				}
				else {
					self[key] = matches[2];
				}
			}
			break;
		}

	}, {
		toString : function toString() {
			var self = this;
			var key = NULL;
			var value = NULL;
			var query = [];
			var i = 0;
			var j;

			for (key in self) {
				if (self[key] instanceof FUNCTION) {
					continue;
				}

				query[i++] = key;
			}

			query.sort();

			while (i--) {
				key = query[i];
				value = self[key];

				if (value instanceof ARRAY) {
					value = value.slice(0);

					value.sort();

					j = value.length;

					while (j--) {
						value[j] = key + "=" + value[j];
					}

					query[i] = value.join("&");
				}
				else {
					query[i] = key + "=" + value;
				}
			}

			return query.join("&");
		}
	});

	var Path = Compose(ARRAY_PROTO, function Path(str) {
		if (!str || str.length === 0) {
			return;
		}

		var self = this;
		var matches;
		var re = /(?:\/|^)([^\/]*)/g;

		while (matches = re.exec(str)) {
			self.push(matches[1]);
		}
	}, {
		toString : function toString() {
			return this.join("/");
		}
	});

	var URI = Compose(function URI(str) {
		var self = this;
		var matches = RE_URI.exec(str);
		var i = matches.length;
		var value;

		while (i--) {
			value = matches[i];

			if (value) {
				self[KEYS[i]] = value;
			}
		}

		if (QUERY in self) {
			self[QUERY] = Query(self[QUERY]);
		}

		if (PATH in self) {
			self[PATH] = Path(self[PATH]);
		}
	}, {
		toString : function toString() {
			var self = this;
			var uri = [ PROTOCOL , "://", AUTHORITY, "/", PATH, "?", QUERY, "#", ANCHOR ];
			var i;
			var key;

			if (!(PROTOCOL in self)) {
				uri.splice(0, 3);
			}

			if (!(PATH in self)) {
				uri.splice(0, 2);
			}

			if (!(ANCHOR in self)) {
				uri.splice(-2, 2);
			}

			if (!(QUERY in self)) {
				uri.splice(-2, 2);
			}

			i = uri.length;

			while (i--) {
				key = uri[i];

				if (key in self) {
					uri[i] = self[key];
				}
			}

			return uri.join("");
		}
	});

	// Restore Compose.secure setting
	Compose.secure = SECURE;

	URI.Path = Path;
	URI.Query = Query;

	return URI;
});
/*!
 * TroopJS route/router module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/route/router',[ "../component/service", "../util/uri" ], function RouterModule(Service, URI) {
	var HASHCHANGE = "hashchange";
	var $ELEMENT = "$element";
	var ROUTE = "route";
	var RE = /^#/;

	function onHashChange($event) {
		var self = $event.data;

		// Create URI
		var uri = URI($event.target.location.hash.replace(RE, ""));

		// Convert to string
		var route = uri.toString();

		// Did anything change?
		if (route !== self[ROUTE]) {
			// Store new value
			self[ROUTE] = route;

			// Publish route
			self.publish(ROUTE, uri);
		}
	}

	return Service.extend(function RouterService($element) {
		this[$ELEMENT] = $element;
	}, {
		displayName : "core/route/router",

		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;

			self[$ELEMENT].bind(HASHCHANGE, self, onHashChange);

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		"sig/start" : function start(signal, deferred) {
			var self = this;

			self[$ELEMENT].trigger(HASHCHANGE);

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;

			self[$ELEMENT].unbind(HASHCHANGE, onHashChange);

			if (deferred) {
				deferred.resolve();
			}

			return self;
		}
	});
});
/*!
 * TroopJS store/base module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/store/base',[ "compose", "../component/gadget" ], function StoreModule(Compose, Gadget) {
	var STORAGE = "storage";

	return Gadget.extend({
		storage : Compose.required,

		set : function set(key, value, deferred) {
			// JSON encoded 'value' then store as 'key'
			this[STORAGE].setItem(key, JSON.stringify(value));

			// Resolve deferred
			if (deferred) {
				deferred.resolve(value);
			}
		},

		get : function get(key, deferred) {
			// Get value from 'key', parse JSON
			var value = JSON.parse(this[STORAGE].getItem(key));

			// Resolve deferred
			if (deferred) {
				deferred.resolve(value);
			}
		},

		remove : function remove(key, deferred) {
			// Remove key
			this[STORAGE].removeItem(key);

			// Resolve deferred
			if (deferred) {
				deferred.resolve();
			}
		},

		clear : function clear(deferred) {
			// Clear
			this[STORAGE].clear();

			// Resolve deferred
			if (deferred) {
				deferred.resolve();
			}
		}
	});
});
/*!
 * TroopJS store/local module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/store/local',[ "compose", "./base" ], function StoreLocalModule(Compose, Store) {

	return Compose.create(Store, {
		displayName : "core/store/local",

		storage : window.localStorage
	});
});
/*!
 * TroopJS store/session module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/store/session',[ "compose", "./base" ], function StoreSessionModule(Compose, Store) {

	return Compose.create(Store, {
		displayName : "core/store/session",

		storage: window.sessionStorage
	});
});

/*!
 * TroopJS dimensions/service module
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/dimensions/service',[ "../component/service" ], function DimensionsServiceModule(Service) {
	var DIMENSIONS = "dimensions";
	var $ELEMENT = "$element";

	function onDimensions($event, w, h) {
		$event.data.publish(DIMENSIONS, w, h);
	}

	return Service.extend(function DimensionsService($element, dimensions) {
		var self = this;

		self[$ELEMENT] = $element;
		self[DIMENSIONS] = dimensions;
	}, {
		displayName : "core/dimensions/service",

		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;

			self[$ELEMENT].bind(DIMENSIONS + "." + self[DIMENSIONS], self, onDimensions);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/start" : function start(signal, deferred) {
			var self = this;

			self[$ELEMENT].trigger("resize." + DIMENSIONS);

			if (deferred) {
				deferred.resolve();
			}
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;

			self[$ELEMENT].unbind(DIMENSIONS + "." + self[DIMENSIONS], onDimensions);

			if (deferred) {
				deferred.resolve();
			}
		}
	});
});
/*!
 * TroopJS widget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The widget trait provides common UI related logic
 */
define('troopjs-core/component/widget',[ "./gadget", "jquery", "../util/deferred" ], function WidgetModule(Gadget, $, Deferred) {
	var NULL = null;
	var FUNCTION = Function;
	var UNDEFINED = undefined;
	var ARRAY_PROTO = Array.prototype;
	var SHIFT = ARRAY_PROTO.shift;
	var UNSHIFT = ARRAY_PROTO.unshift;
	var POP = ARRAY_PROTO.pop;
	var $TRIGGER = $.fn.trigger;
	var $ONE = $.fn.one;
	var $BIND = $.fn.bind;
	var $UNBIND = $.fn.unbind;
	var RE = /^dom(?::(\w+))?\/([^\.]+(?:\.(.+))?)/;
	var REFRESH = "widget/refresh";
	var $ELEMENT = "$element";
	var $PROXIES = "$proxies";
	var ONE = "one";
	var THEN = "then";
	var ATTR_WEAVE = "[data-weave]";
	var ATTR_WOVEN = "[data-woven]";

	/**
	 * Creates a proxy of the inner method 'handlerProxy' with the 'topic', 'widget' and handler parameters set
	 * @param topic event topic
	 * @param widget target widget
	 * @param handler target handler
	 * @returns {Function} proxied handler
	 */
	function eventProxy(topic, widget, handler) {
		/**
		 * Creates a proxy of the outer method 'handler' that first adds 'topic' to the arguments passed
		 * @returns result of proxied hanlder invocation
		 */
		return function handlerProxy() {
			// Add topic to front of arguments
			UNSHIFT.call(arguments, topic);

			// Apply with shifted arguments to handler
			return handler.apply(widget, arguments);
		};
	}

	/**
	 * Creates a proxy of the inner method 'render' with the '$fn' parameter set
	 * @param $fn jQuery method
	 * @returns {Function} proxied render
	 */
	function renderProxy($fn) {
		/**
		 * Renders contents into element
		 * @param contents (Function | String) Template/String to render
		 * @param data (Object) If contents is a template - template data (optional)
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		function render(/* contents, data, ..., deferred */) {
			var self = this;
			var $element = self[$ELEMENT];
			var arg = arguments;

			// Shift contents from first argument
			var contents = SHIFT.call(arg);

			// Assume deferred is the last argument
			var deferred = arg[arg.length];

			// If deferred not a true Deferred, make it so
			if (deferred === UNDEFINED || !(deferred[THEN] instanceof FUNCTION)) {
				deferred = Deferred();
			}

			// Defer render (as weaving it may need to load async)
			Deferred(function deferredRender(dfdRender) {

				// After render is complete, trigger REFRESH with woven components. Add this here to make sure it's the first done hadler
				dfdRender.done(function renderDone() {
					$element.trigger(REFRESH, arguments);
				});

				// Link deferred
				dfdRender.then(deferred.resolve, deferred.reject, deferred.notify);

				// Notify that we're about to render
				dfdRender.notify([ "beforeRender" ]);

				// Call render with contents (or result of contents if it's a function)
				$fn.call($element, contents instanceof FUNCTION ? contents.apply(self, arg) : contents);

				// Notify that we're rendered
				dfdRender.notify([ "afterRender" ]);

				// Weave element
				$element.find(ATTR_WEAVE).weave(dfdRender);
			});

			return self;
		}

		return render;
	}

	return Gadget.extend(function Widget($element, displayName) {
		var self = this;

		self[$ELEMENT] = $element;

		if (displayName) {
			self.displayName = displayName;
		}
	}, {
		displayName : "core/component/widget",

		"sig/initialize" : function initialize(signal, deferred) {
			var self = this;
			var $element = self[$ELEMENT];
			var $proxies = self[$PROXIES] = [];;
			var key = NULL;
			var value;
			var matches;
			var topic;

			// Loop over each property in widget
			for (key in self) {
				// Get value
				value = self[key];

				// Continue if value is not a function
				if (!(value instanceof FUNCTION)) {
					continue;
				}

				// Match signature in key
				matches = RE.exec(key);

				if (matches !== NULL) {
					// Get topic
					topic = matches[2];

					// Replace value with a scoped proxy
					value = eventProxy(topic, self, value);

					// Either ONE or BIND element
					(matches[2] === ONE ? $ONE : $BIND).call($element, topic, self, value);

					// Store in $proxies
					$proxies[$proxies.length] = [topic, value];

					// NULL value
					self[key] = NULL;
				}
			}

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		"sig/finalize" : function finalize(signal, deferred) {
			var self = this;
			var $element = self[$ELEMENT];
			var $proxies = self[$PROXIES];
			var $proxy;

			// Loop over subscriptions
			while ($proxy = $proxies.shift()) {
				$element.unbind($proxy[0], $proxy[1]);
			}

			if (deferred) {
				deferred.resolve();
			}

			return self;
		},

		/**
		 * Weaves all children of $element
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		weave : function weave(deferred) {
			var self = this;

			self[$ELEMENT].find(ATTR_WEAVE).weave(deferred);

			return self;
		},

		/**
		 * Unweaves all children of $element _and_ self
		 * @returns self
		 */
		unweave : function unweave() {
			var self = this;

			self[$ELEMENT].find(ATTR_WOVEN).andSelf().unweave();

			return this;
		},

		/**
		 * Binds event from $element, exactly once
		 * @returns self
		 */
		one : function one() {
			var self = this;

			$ONE.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Binds event to $element
		 * @returns self
		 */
		bind : function bind() {
			var self = this;

			$BIND.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Unbinds event from $element
		 * @returns self
		 */
		unbind : function unbind() {
			var self = this;

			$UNBIND.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Triggers event on $element
		 * @returns self
		 */
		trigger : function trigger() {
			var self = this;

			$TRIGGER.apply(self[$ELEMENT], arguments);

			return self;
		},

		/**
		 * Renders content and inserts it before $element
		 */
		before : renderProxy($.fn.before),

		/**
		 * Renders content and inserts it after $element
		 */
		after : renderProxy($.fn.after),

		/**
		 * Renders content and replaces $element contents
		 */
		html : renderProxy($.fn.html),

		/**
		 * Renders content and replaces $element contents
		 */
		text : renderProxy($.fn.text),

		/**
		 * Renders content and appends it to $element
		 */
		append : renderProxy($.fn.append),

		/**
		 * Renders content and prepends it to $element
		 */
		prepend : renderProxy($.fn.prepend),

		/**
		 * Empties widget
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		empty : function empty(deferred) {
			var self = this;

			// Create deferred for emptying
			Deferred(function emptyDeferred(dfd) {
				// Get element
				var $element = self[$ELEMENT];

				// Detach contents
				var $contents = $element.contents().detach();

				// Trigger refresh
				$element.trigger(REFRESH, self);

				// Use timeout in order to yield
				setTimeout(function emptyTimeout() {
					// Get DOM elements
					var contents = $contents.get();

					// Remove elements from DOM
					$contents.remove();

					// Resolve deferred
					dfd.resolve(contents);
				}, 0);

				// If a deferred was passed, add resolve/reject/notify
				if (deferred) {
					dfd.then(deferred.resolve, deferred.reject, deferred.notify);
				}
			});

			return self;
		}
	});
});

/*!
 * TroopJS widget/placeholder component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/widget/placeholder',[ "../component/widget", "../util/deferred" ], function WidgetPlaceholderModule(Widget, Deferred) {
	var UNDEFINED = undefined;
	var FUNCTION = Function;
	var ARRAY = Array;
	var ARRAY_PROTO = ARRAY.prototype;
	var POP = ARRAY_PROTO.pop;
	var HOLDING = "holding";
	var DATA_HOLDING = "data-" + HOLDING;
	var $ELEMENT = "$element";
	var TARGET = "target";
	var THEN = "then";

	function release(/* arg, arg, arg, deferred*/) {
		var self = this;
		var arg = arguments;
		var argc = arg.length;

		// Check if the last argument looks like a deferred, and in that case set it
		var deferred = argc > 0 && arg[argc - 1][THEN] instanceof FUNCTION
			? POP.call(arg)
			: UNDEFINED;

		Deferred(function deferredRelease(dfd) {
			var i;
			var iMax;
			var name;
			var argv;

			// We're already holding something, resolve with cache
			if (HOLDING in self) {
				dfd.resolve(self[HOLDING]);
			}
			else {
				// Add done handler to release
				dfd.done(function doneRelease(widget) {
					// Set DATA_HOLDING attribute
					self[$ELEMENT].attr(DATA_HOLDING, widget);

					// Store widget
					self[HOLDING] = widget;
				});

				// Get widget name
				name = self[TARGET];

				// Set initial argv
				argv = [ self[$ELEMENT], name ];

				// Append values from arg to argv
				for (i = 0, iMax = arg.length; i < iMax; i++) {
					argv[i + 2] = arg[i];
				}

				// Require widget by name
				require([ name ], function required(Widget) {
					// Resolve with constructed, bound and initialized instance
					var widget = Widget
						.apply(Widget, argv);

					Deferred(function deferredStart(dfdStart) {
						widget.start(dfdStart);
					})
					.done(function doneStarted() {
						dfd.resolve(widget);
					})
					.fail(dfd.reject);
				});
			}

			// Link deferred
			if (deferred) {
				dfd.then(deferred.resolve, deferred.reject);
			}
		});

		return self;
	}

	function hold(deferred) {
		var self = this;

		Deferred(function deferredHold(dfdHold) {
			var widget;

			// Check that we are holding
			if (HOLDING in self) {
				// Get what we're holding
				widget = self[HOLDING];

				// Cleanup
				delete self[HOLDING];

				// Remove DATA_HOLDING attribute
				self[$ELEMENT].removeAttr(DATA_HOLDING);

				// Deferred stop
				Deferred(function deferredStop(dfdStop) {
					widget.stop(dfdStop);
				})
				.then(dfdHold.resolve, dfdHold.reject);
			}
			else {
				dfdHold.resolve();
			}

			// Link deferred
			if (deferred) {
				dfdHold.then(deferred.resolve, deferred.reject);
			}
		});

		return self;
	}

	return Widget.extend(function WidgetPlaceholder($element, name, target) {
		this[TARGET] = target;
	}, {
		displayName : "core/widget/placeholder",

		release : release,
		hold : hold,
		finalize : hold
	});
});
/*!
 * TroopJS route/placeholder module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/route/placeholder',[ "../widget/placeholder" ], function RoutePlaceholderModule(Placeholder) {
	var NULL = null;
	var ROUTE = "route";

	return Placeholder.extend(function RoutePlaceholderWidget($element, name) {
		this[ROUTE] = RegExp($element.data("route"));
	}, {
		"displayName" : "core/route/placeholder",

		"hub:memory/route" : function onRoute(topic, uri) {
			var self = this;
			var matches = self[ROUTE].exec(uri.path);

			if (matches !== NULL) {
				self.release.apply(self, matches.slice(1));
			}
			else {
				self.hold();
			}
		}
	});
});
/*!
 * TroopJS widget/application component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/widget/application',[ "../component/widget", "../util/deferred" ], function ApplicationModule(Widget, Deferred) {
	return Widget.extend({
		displayName : "core/widget/application",

		"sig/start" : function start(signal, deferred) {
			var self = this;

			self.weave(deferred);

			return self;
		},

		"sig/stop" : function stop(signal, deferred) {
			var self = this;

			self.unweave(deferred);

			return self;
		}
	});
});
/*!
 * TroopJS each component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/util/each',[ "jquery" ], function EachModule($) {
	return $.each;
});
/*!
 * TroopJS grep component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/util/grep',[ "jquery" ], function GrepModule($) {
	return $.grep;
});
/*!
 * TroopJS util/tr component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/util/tr',[],function TrModule() {
	var TYPEOF_NUMBER = typeof Number();

	return function tr(callback) {
		var self = this;
		var result = [];
		var i;
		var length = self.length;
		var key;

		// Is this an array? Basically, is length a number, is it 0 or is it greater than 0 and that we have index 0 and index length-1
		if (typeof length === TYPEOF_NUMBER && length === 0 || length > 0 && 0 in self && length - 1 in self) {
			for (i = 0; i < length; i++) {
				result.push(callback.call(self, self[i], i));
			}
		// Otherwise we'll iterate it as an object
		} else if (self){
			for (key in self) {
				result.push(callback.call(self, self[key], key));
			}
		}

		return result;
	};
});
/*!
 * TroopJS when component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-core/util/when',[ "jquery" ], function WhenModule($) {
	return $.when;
});
/*!
 * TroopJS jQuery action plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-jquery/action',[ "jquery" ], function ActionModule($) {
	var UNDEFINED = undefined;
	var FALSE = false;
	var NULL = null;
	var SLICE = Array.prototype.slice;
	var ACTION = "action";
	var ORIGINALEVENT = "originalEvent";
	var RE_ACTION = /^([\w\d\s_\-\/]+)(?:\.([\w\.]+))?(?:\((.*)\))?$/;
	var RE_SEPARATOR = /\s*,\s*/;
	var RE_DOT = /\.+/;
	var RE_STRING = /^(["']).*\1$/;
	var RE_DIGIT = /^\d+$/;
	var RE_BOOLEAN = /^(?:false|true)$/i;
	var RE_BOOLEAN_TRUE = /^true$/i;

	/**
	 * Namespace iterator
	 * @param namespace (string) namespace
	 * @param index (number) index
	 */
	function namespaceIterator(namespace, index) {
		return namespace ? namespace + "." + ACTION : NULL;
	}

	/**
	 * Action handler
	 * @param $event (jQuery.Event) event
	 */
	function onAction($event) {
		// Set $target
		var $target = $(this);
		// Get argv
		var argv = SLICE.call(arguments, 1);
		// Extract type
		var type = ORIGINALEVENT in $event
			? $event[ORIGINALEVENT].type
			: ACTION;
		// Extract name
		var name = $event[ACTION];

		// Reset $event.type
		$event.type = ACTION + "/" + name + "." + type;

		// Trigger 'ACTION/{name}.{type}'
		$target.trigger($event, argv);

		// No handler, try without namespace, but exclusive
		if ($event.result !== FALSE) {
			// Reset $event.type
			$event.type = ACTION + "/" + name + "!";

			// Trigger 'ACTION/{name}'
			$target.trigger($event, argv);

			// Still no handler, try generic action with namespace
			if ($event.result !== FALSE) {
				// Reset $event.type
				$event.type = ACTION + "." + type;

				// Trigger 'ACTION.{type}'
				$target.trigger($event, argv);
			}
		}
	}

	/**
	 * Internal handler
	 * 
	 * @param $event jQuery event
	 */
	function handler($event) {
		// Get closest element that has an action defined
		var $target = $($event.target).closest("[data-action]");

		// Fail fast if there is no action available
		if ($target.length === 0) {
			return;
		}

		// Extract all data in one go
		var $data = $target.data();
		// Extract matches from 'data-action'
		var matches = RE_ACTION.exec($data[ACTION]);

		// Return fast if action parameter was f*cked (no matches)
		if (matches === NULL) {
			return;
		}

		// Extract action name
		var name = matches[1];
		// Extract action namespaces
		var namespaces = matches[2];
		// Extract action args
		var args = matches[3];

		// If there are action namespaces, make sure we're only triggering action on applicable types
		if (namespaces !== UNDEFINED && !RegExp(namespaces.split(RE_DOT).join("|")).test($event.type)) {
			return;
		}

		// Split args by separator (if there were args)
		var argv = args !== UNDEFINED
			? args.split(RE_SEPARATOR)
			: [];

		// Iterate argv to determine arg type
		$.each(argv, function argsIterator(i, value) {
			if (value in $data) {
				argv[i] = $data[value];
			} else if (RE_STRING.test(value)) {
				argv[i] = value.slice(1, -1);
			} else if (RE_DIGIT.test(value)) {
				argv[i] = Number(value);
			} else if (RE_BOOLEAN.test(value)) {
				argv[i] = RE_BOOLEAN_TRUE.test(value);;
			} else {
				argv[i] = UNDEFINED;
			}
		});

		$target
			// Trigger exclusive ACTION event
			.trigger($.Event($event, {
				type: ACTION + "!",
				action: name
			}), argv);

		// Since we've translated the event, stop propagation
		$event.stopPropagation();
	}

	$.event.special[ACTION] = {
		/**
		 * @param data (Anything) Whatever eventData (optional) was passed in
		 *        when binding the event.
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 * @param eventHandle (Function) The actual function that will be bound
		 *        to the browser’s native event (this is used internally for the
		 *        beforeunload event, you’ll never use it).
		 */
		setup : function onActionSetup(data, namespaces, eventHandle) {
			$(this).bind(ACTION, data, onAction);
		},

		/**
		 * Do something each time an event handler is bound to a particular element
		 * @param handleObj (Object)
		 */
		add : function onActionAdd(handleObj) {
			var events = $.map(handleObj.namespace.split(RE_DOT), namespaceIterator);

			if (events.length !== 0) {
				$(this).bind(events.join(" "), handler);
			}
		},

		/**
		 * Do something each time an event handler is unbound from a particular element
		 * @param handleObj (Object)
		 */
		remove : function onActionRemove(handleObj) {
			var events = $.map(handleObj.namespace.split(RE_DOT), namespaceIterator);

			if (events.length !== 0) {
				$(this).unbind(events.join(" "), handler);
			}
		},

		/**
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 */
		teardown : function onActionTeardown(namespaces) {
			$(this).unbind(ACTION, onAction);
		}
	};

	$.fn[ACTION] = function action(name) {
		return $(this).trigger({
			type: ACTION + "!",
			action: name
		}, SLICE.call(arguments, 1));
	};
});

/*!
 * TroopJS jQuery destroy plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-jquery/destroy',[ "jquery" ], function DestroyModule($) {
	$.event.special["destroy"] = {
		remove : function onDestroyRemove(handleObj) {
			var self = this;

			handleObj.handler.call(self, $.Event({
				"type" : handleObj.type,
				"data" : handleObj.data,
				"namespace" : handleObj.namespace,
				"target" : self
			}));
		}
	};
});

/*!
 * TroopJS jQuery resize plug-in
 * @license TroopJS Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * Trigger resize on all elements
 * Heavy inspiration from https://github.com/cowboy/jquery-resize.git
 */
define('troopjs-jquery/resize',[ "jquery" ], function ResizeModule($) {
	var NULL = null;
	var RESIZE = "resize";
	var W = "w";
	var H = "h";
	var $ELEMENTS = $([]);
	var INTERVAL = NULL;

	/**
	 * Iterator
	 * @param index
	 * @param self
	 */
	function iterator(index, self) {
		// Get data
		var $data = $.data(self);

		// Get reference to $self
		var $self = $(self);

		// Get previous width and height
		var w = $self.width();
		var h = $self.height();

		// Check if width or height has changed since last check
		if (w !== $data[W] || h !== $data[H]) {
			$self.trigger(RESIZE, [$data[W] = w, $data[H] = h]);
		}
	}

	/**
	 * Internal interval
	 */
	function interval() {
		$ELEMENTS.each(iterator);
	}

	$.event.special[RESIZE] = {
		/**
		 * @param data (Anything) Whatever eventData (optional) was passed in
		 *        when binding the event.
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 * @param eventHandle (Function) The actual function that will be bound
		 *        to the browser’s native event (this is used internally for the
		 *        beforeunload event, you’ll never use it).
		 */
		setup : function hashChangeSetup(data, namespaces, eventHandle) {
			var self = this;

			// window has a native resize event, exit fast
			if ($.isWindow(self)) {
				return false;
			}

			// Store data
			var $data = $.data(self, RESIZE, {});

			// Get reference to $self
			var $self = $(self);

			// Initialize data
			$data[W] = $self.width();
			$data[H] = $self.height();

			// Add to tracked collection
			$ELEMENTS = $ELEMENTS.add(self);

			// If this is the first element, start interval
			if($ELEMENTS.length === 1) {
				INTERVAL = setInterval(interval, 100);
			}
		},

		/**
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 */
		teardown : function onDimensionsTeardown(namespaces) {
			var self = this;

			// window has a native resize event, exit fast
			if ($.isWindow(self)) {
				return false;
			}

			// Remove data
			$.removeData(self, RESIZE);

			// Remove from tracked collection
			$ELEMENTS = $ELEMENTS.not(self);

			// If this is the last element, stop interval
			if($ELEMENTS.length === 0 && INTERVAL !== NULL) {
				clearInterval(INTERVAL);
			}
		}
	};
});

/*!
 * TroopJS jQuery dimensions plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-jquery/dimensions',[ "jquery" ], function DimensionsModule($) {
	var DIMENSIONS = "dimensions";
	var RESIZE = "resize." + DIMENSIONS;
	var W = "w";
	var H = "h";
	var _W = "_" + W;
	var _H = "_" + H;

	/**
	 * Internal comparator used for reverse sorting arrays
	 */
	function reverse(a, b) {
		return b - a;
	}

	/**
	 * Internal onResize handler
	 * @param $event
	 */
	function onResize($event) {
		var $self = $(this);
		var width = $self.width();
		var height = $self.height();

		// Iterate all dimensions
		$.each($.data(self, DIMENSIONS), function dimensionIterator(namespace, dimension) {
			var w = dimension[W];
			var h = dimension[H];
			var _w;
			var _h;
			var i;

			i = w.length;
			_w = w[i - 1];
			while(w[--i] < width) {
				_w = w[i];
			}

			i = h.length;
			_h = h[i - 1];
			while(h[--i] < height) {
				_h = h[i];
			}

			// If _w or _h has changed, update and trigger
			if (_w !== dimension[_W] || _h !== dimension[_H]) {
				dimension[_W] = _w;
				dimension[_H] = _h;

				$self.trigger(DIMENSIONS + "." + namespace, [ _w, _h ]);
			}
		});
	}

	$.event.special[DIMENSIONS] = {
		/**
		 * @param data (Anything) Whatever eventData (optional) was passed in
		 *        when binding the event.
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 * @param eventHandle (Function) The actual function that will be bound
		 *        to the browser’s native event (this is used internally for the
		 *        beforeunload event, you’ll never use it).
		 */
		setup : function onDimensionsSetup(data, namespaces, eventHandle) {
			$(this)
				.bind(RESIZE, onResize)
				.data(DIMENSIONS, {});
		},

		/**
		 * Do something each time an event handler is bound to a particular element
		 * @param handleObj (Object)
		 */
		add : function onDimensionsAdd(handleObj) {
			var self = this;
			var namespace = handleObj.namespace;
			var dimension = {};
			var w = dimension[W] = [];
			var h = dimension[H] = [];
			var re = /(w|h)(\d+)/g;
			var matches;

			while (matches = re.exec(namespace)) {
				dimension[matches[1]].push(parseInt(matches[2]));
			}

			w.sort(reverse);
			h.sort(reverse);

			$.data(self, DIMENSIONS)[namespace] = dimension;
		},

		/**
		 * Do something each time an event handler is unbound from a particular element
		 * @param handleObj (Object)
		 */
		remove : function onDimensionsRemove(handleObj) {
			delete $.data(this, DIMENSIONS)[handleObj.namespace];
		},

		/**
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 */
		teardown : function onDimensionsTeardown(namespaces) {
			$(this)
				.removeData(DIMENSIONS)
				.unbind(RESIZE, onResize);
		}
	};
});
/*!
 * TroopJS jQuery hashchange plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
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
	var _isIE = !+"\v1";

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
		var self = this;
		var element;

		self.element = element = document.createElement("iframe");
		element.src = "about:blank";
		element.style.display = "none";
	}

	Frame.prototype = {
		getElement : function () {
			return this.element;
		},

		getHash : function () {
			return this.element.contentWindow.frameHash;
		},

		update : function (hash) {
			var self = this;
			var document = self.element.contentWindow.document;

			// Quick return if hash has not changed
			if (self.getHash() === hash) {
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
		/**
		 * @param data (Anything) Whatever eventData (optional) was passed in
		 *        when binding the event.
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 * @param eventHandle (Function) The actual function that will be bound
		 *        to the browser’s native event (this is used internally for the
		 *        beforeunload event, you’ll never use it).
		 */
		setup : function hashChangeSetup(data, namespaces, eventHandle) {
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
				? (function hashChangeIntervalWrapper() {
					var document = window.document;
					var _isLocal = location.protocol === "file:";

					var frame = new Frame(document);
					document.body.appendChild(frame.getElement());
					frame.update(hash);

					return function hashChangeInterval() {
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
				: function hashChangeInterval() {
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

		/**
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 */
		teardown : function hashChangeTeardown(namespaces) {
			var window = this;

			// Quick return if we support onHashChange natively
			if (ONHASHCHANGE in window) {
				return false;
			}

			window.clearInterval($.data(window, INTERVAL));
		}
	};
});

/*!
 * TroopJS jQuery weave plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define('troopjs-jquery/weave',[ "jquery" ], function WeaveModule($) {
	var UNDEFINED = undefined;
	var ARRAY = Array;
	var FUNCTION = Function;
	var ARRAY_PROTO = ARRAY.prototype;
	var JOIN = ARRAY_PROTO.join;
	var POP = ARRAY_PROTO.pop;
	var $WHEN = $.when;
	var THEN = "then";
	var WEAVE = "weave";
	var UNWEAVE = "unweave";
	var WOVEN = "woven";
	var DESTROY = "destroy";
	var DATA_WEAVE = "data-" + WEAVE;
	var DATA_WOVEN = "data-" + WOVEN;
	var SELECTOR_WEAVE = "[" + DATA_WEAVE + "]";
	var SELECTOR_WOVEN = "[" + DATA_WOVEN + "]";
	var RE_SEPARATOR = /\s*,\s*/;
	var RE_STRING = /^(["']).*\1$/;
	var RE_DIGIT = /^\d+$/;
	var RE_BOOLEAN = /^(?:false|true)$/i;
	var RE_BOOLEAN_TRUE = /^true$/i;

	/**
	 * Generic destroy handler.
	 * Simply makes sure that unweave has been called
	 * @param $event
	 */
	function onDestroy($event) {
		$(this).unweave();
	}

	$.fn[WEAVE] = function weave(/* arg, arg, arg, deferred*/) {
		var woven = [];
		var i = 0;
		var $elements = $(this);

		var arg = arguments;
		var argc = arg.length;

		// Check if the last argument looks like a deferred, and in that case set it
		var deferred = argc > 0 && arg[argc - 1][THEN] instanceof FUNCTION
			? POP.call(arg)
			: UNDEFINED;

		$elements
			// Reduce to only elements that can be woven
			.filter(SELECTOR_WEAVE)
			// Iterate
			.each(function elementIterator(index, element) {
				var $element = $(element);
				var $data = $element.data();
				var weave = $element.attr(DATA_WEAVE) || "";
				var re = /[\s,]*([\w_\-\/]+)(?:\(([^\)]+)\))?/g;
				var widgets = [];
				var mark = i;
				var j = 0;
				var matches;

				$element
					// Store DATA_WEAVE attribute as WEAVE
					.data(WEAVE, weave)
					// Store widgets array as WOVEN
					.data(WOVEN, widgets)
					// Make sure to remove DATA_WEAVE (so we don't try processing this again)
					.removeAttr(DATA_WEAVE);

				// Iterate widgets (while the RE_WEAVE matches)
				while (matches = re.exec(weave)) {
					// Add deferred to woven array
					$.Deferred(function deferedRequire(dfd) {
						var _j = j++; // store _j before we increment
						var k;
						var l;
						var kMax;
						var value;

						// Store on woven
						woven[i++] = dfd;

						// Add done handler to register
						dfd.done(function doneRequire(widget) {
							widgets[_j] = widget;
						});

						// Get widget name
						var name = matches[1];

						// Set initial argv
						var argv = [ $element, name ];

						// Append values from arg to argv
						for (k = 0, kMax = arg.length, l = argv.length; k < kMax; k++, l++) {
							argv[l] = arg[k];
						}

						// Get widget args
						var args = matches[2];

						// Any widget arguments
						if (args !== UNDEFINED) {
							// Convert args to array
							args = args.split(RE_SEPARATOR);

							// Append typed values from args to argv
							for (k = 0, kMax = args.length, l = argv.length; k < kMax; k++, l++) {
								// Get value
								value = args[k];

								if (value in $data) {
									argv[l] = $data[value];
								} else if (RE_STRING.test(value)) {
									argv[l] = value.slice(1, -1);
								} else if (RE_DIGIT.test(value)) {
									argv[l] = Number(value);
								} else if (RE_BOOLEAN.test(value)) {
									argv[l] = RE_BOOLEAN_TRUE.test(value);
								} else {
									argv[l] = value;
								}
							}
						}

						require([ name ], function required(Widget) {
							// Resolve with constructed and initialized instance
							var widget = Widget
								.apply(Widget, argv)
								.bind(DESTROY, onDestroy);

							if (deferred){
								// notify deferred we wired an widget
								deferred.notifyWith(widget, ['wired', widget]);
							}

							// Start
							$.Deferred(function deferredStart(dfdStart) {
								widget.start(dfdStart);
							})
							.done(function doneStart() {
								dfd.resolve(widget);
							})
							.fail(dfd.reject);
						});
					});
				}

				// Slice out widgets woven for this element
				$WHEN.apply($, woven.slice(mark, i)).done(function doneRequired() {
					// Set DATA_WOVEN attribute
					$element.attr(DATA_WOVEN, JOIN.call(arguments, " "));
				});
			});

		if (deferred) {
			// When all deferred are resolved, resolve original deferred
			$WHEN.apply($, woven).then(deferred.resolve, deferred.reject);
		}

		return $elements;
	};

	$.fn[UNWEAVE] = function unweave(deferred) {
		var unwoven = [];
		var i = 0;
		var $elements = $(this);

		$elements
			// Reduce to only elements that are woven
			.filter(SELECTOR_WOVEN)
			// Iterate
			.each(function elementIterator(index, element) {
				var $element = $(element);
				var widgets = $element.data(WOVEN);
				var widget;

				$element
					// Remove WOVEN data
					.removeData(WOVEN)
					// Remove DATA_WOVEN attribute
					.removeAttr(DATA_WOVEN);

				// Somewhat safe(r) iterator over widgets
				while (widget = widgets.shift()) {
					// $.Deferred stop
					$.Deferred(function deferredStop(dfdStop) {
						// Store on onwoven
						unwoven[i++] = dfdStop;

						widget.stop(dfdStop);
					});
				}

				$element
					// Copy woven data to data-weave attribute
					.attr(DATA_WEAVE, $element.data(WEAVE))
					// Remove data fore WEAVE
					.removeData(WEAVE)
					// Make sure to clean the destroy event handler
					.unbind(DESTROY, onDestroy);
			});

		if (deferred) {
			// When all deferred are resolved, resolve original deferred
			$WHEN.apply($, unwoven).then(deferred.resolve, deferred.reject);
		}

		return $elements;
	};
});