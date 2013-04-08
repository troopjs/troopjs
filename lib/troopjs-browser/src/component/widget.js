/**
 * TroopJS browser/component/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "troopjs-core/component/gadget", "jquery", "troopjs-jquery/weave" ], function WidgetModule(Gadget, $) {

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var TYPEOF_FUNCTION = typeof function () {};
	var $WEAVE = $.fn.weave;
	var $UNWEAVE = $.fn.unweave;
	var $ELEMENT = "$element";
	var $HANDLERS = "$handlers";
	var ATTR_WEAVE = "[data-weave]";
	var ATTR_WOVEN = "[data-woven]";
	var LENGTH = "length";
	var FEATURES = "features";
	var TYPE = "type";
	var VALUE = "value";
	var PROXY = "proxy";
	var GUID = "guid";

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
		 * @returns {Object} self
		 */
		function render(contents, data) {
			var self = this;
			var args = ARRAY_SLICE.call(arguments, 1);

			// Call render with contents (or result of contents if it's a function)
			return $fn.call(self[$ELEMENT], typeof contents === TYPEOF_FUNCTION ? contents.apply(self, args) : contents)
				.find(ATTR_WEAVE)
				.weave();
		}

		return render;
	}

	return Gadget.extend(function Widget($element, displayName) {
		var self = this;

		if ($element === UNDEFINED) {
			throw new Error("No $element provided");
		}

		self[$ELEMENT] = $element;
		self[$HANDLERS] = [];

		if (displayName !== UNDEFINED) {
			self.displayName = displayName;
		}
	}, {
		"displayName" : "browser/component/widget",

		/**
		 * Signal handler for 'initialize'
		 */
		"sig/initialize" : function initialize() {
			var self = this;
			var $element = self[$ELEMENT];
			var $handler;
			var $handlers = self[$HANDLERS];
			var special;
			var specials = self.constructor.specials.dom;
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
				$handler[PROXY] = proxy = eventProxy(self, value);

				// Attach proxy
				$element.on(type, features, self, proxy);

				// Copy GUID from proxy to value (so you can use .off to remove it)
				value[GUID] = proxy[GUID]
			}
		},

		/**
		 * Signal handler for 'finalize'
		 */
		"sig/finalize" : function finalize() {
			var self = this;
			var $element = self[$ELEMENT];
			var $handler;
			var $handlers = self[$HANDLERS];
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
		 * Weaves all children of $element
		 * @returns {Promise} from $WEAVE
		 */
		"weave" : function weave() {
			return $WEAVE.apply(this[$ELEMENT].find(ATTR_WEAVE), arguments);
		},

		/**
		 * Unweaves all children of $element _and_ self
		 * @returns {Promise} from $UNWEAVE
		 */
		"unweave" : function unweave() {
			return $UNWEAVE.apply(this[$ELEMENT].find(ATTR_WOVEN).addBack(), arguments);
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
