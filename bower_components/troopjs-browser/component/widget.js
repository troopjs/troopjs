/*
 * TroopJS browser/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
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
