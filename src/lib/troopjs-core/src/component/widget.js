/*!
 * TroopJS widget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The widget trait provides common UI related logic
 */
define([ "./gadget", "jquery" ], function WidgetModule(Gadget, $) {
	var UNDEFINED = undefined;
	var FUNCTION = Function;
	var SLICE = Array.prototype.slice;
	var REFRESH = "widget/refresh";
	var $ELEMENT = "$element";
	var DISPLAYNAME = "displayName";
	var ATTR_WEAVE = "[data-weave]";
	var ATTR_WOVEN = "[data-woven]";

	/**
	 * Creates a proxy of the inner method 'render' with the 'op' parameter set
	 * 
	 * @param op name of jQuery method call
	 * @returns proxied render
	 */
	function renderProxy(op) {
		/**
		 * Renders contents into element
		 * @param contents (Function | String) Template/String to render
		 * @param data (Object) If contents is a template - template data
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		function render(contents, data, deferred) {
			var self = this;

			// If contents is a function, call it
			if (contents instanceof FUNCTION) {
				contents = contents.call(self, data);
			}
			// otherwise data makes no sense
			else {
				deferred = data;
			}

			var $element = self[$ELEMENT];

			// Defer render (as weaving it may need to load async)
			var deferredRender = $.Deferred(function deferredRender(dfdRender) {
				// Call render
				op.call($element, contents);

				// Weave element
				self.weave($element, dfdRender);
			})
			.done(function renderDone() {
				// After render is complete, trigger "widget/refresh" with woven components
				$element.trigger(REFRESH, arguments);
			});

			if (deferred) {
				deferredRender.then(deferred.resolve, deferred.reject);
			}

			return self;
		}

		return render;
	}

	return Gadget.extend(function Widget(element, displayName) {
		var self = this;
		self[$ELEMENT] = $(element);

		if (displayName !== undefined) {
			self[DISPLAYNAME] = displayName;
		}
	}, {
		/**
		 * Default display name
		 */
		displayName: "component/widget",

		/**
		 * Weaves all children of $element
		 * @param $element (jQuery) Element to weave
		 * @param deferred (Deferred) Deferred (optional)
		 * @returns self
		 */
		weave : function weave($element, deferred) {
			$element.find(ATTR_WEAVE).weave(deferred);

			return this;
		},

		/**
		 * Unweaves all children of $element _and_ self
		 * @param $element (jQuery) Element to unweave
		 * @returns self
		 */
		unweave : function unweave($element) {
			$element.find(ATTR_WOVEN).andSelf().unweave();

			return this;
		},

		/**
		 * Triggers event on $element
		 * @param $event (jQuery.Event | String) Event to trigger
		 * @returns self
		 */
		trigger : function trigger($event) {
			$element.trigger($event, SLICE.call(arguments, 1));

			return this;
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

			var $element = self[$ELEMENT];

			// Create deferred for emptying
			var emptyDeferred = $.Deferred(function emptyDeferred(dfd) {

				// Detach contents
				var $contents = $element.contents().detach();

				// Trigger refresh
				$element.trigger(REFRESH, arguments);

				// Get DOM elements
				var contents = $contents.get();

				// Use timeout in order to yield
				setTimeout(function emptyTimeout() {
					try {
						// Remove elements from DOM
						$contents.remove();

						// Resolve deferred
						dfd.resolve(contents);
					}
					// If there's an error
					catch (e) {
						// Reject deferred
						dfd.reject(contents);
					}
				}, 0);
			});

			// If a deferred was passed, add resolve/reject
			if (deferred) {
				emptyDeferred.then(deferred.resolve, deferred.reject);
			}

			return self;
		},

		/**
		 * Generic destroy handler.
		 */
		"dom/destroy" : function onDestroy(topic, $event) {
			var self = this;
			var destructor = self.destructor;
			var result = UNDEFINED;

			// Check if we have a destructor, then call it
			if (destructor instanceof FUNCTION) {
				result = destructor.call(self);
			}

			// If the destructor does not return false, unweave
			if (result !== false) {
				self.unweave(self[$ELEMENT]);
			}

			return result;
		}
	});
});
