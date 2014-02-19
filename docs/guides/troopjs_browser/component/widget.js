/*
 * TroopJS browser/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
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
