/**
 * TroopJS jquery/weave
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "require", "jquery", "when", "troopjs-utils/getargs", "troopjs-utils/filter", "./destroy", "poly/array", "poly/string" ], function WeaveModule(parentRequire, $, when, getargs, filter) {
	/*jshint strict:false, laxbreak:true, newcap:false, es5:true */

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_MAP = ARRAY_PROTO.map;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var $FN = $.fn;
	var $EXPR = $.expr;
	var $CREATEPSEUDO = $EXPR.createPseudo;
	var WIDGETS = "widgets";
	var WEAVE = "weave";
	var UNWEAVE = "unweave";
	var WOVEN = "woven";
	var DESTROY = "destroy";
	var LENGTH = "length";
	var DATA = "data-";
	var DATA_WEAVE = DATA + WEAVE;
	var DATA_WOVEN = DATA + WOVEN;
	var DATA_UNWEAVE = DATA + UNWEAVE;
	var SELECTOR_WEAVE = "[" + DATA_WEAVE + "]";
	var SELECTOR_UNWEAVE = "[" + DATA_WOVEN + "]";
	var RE_SEPARATOR = /[\s,]+/;

	/**
	 * Generic destroy handler.
	 * Simply makes sure that unweave has been called
	 */
	function onDestroy() {
		$(this).unweave();
	}

	/**
	 * Tests if element has a data-weave attribute
	 * @param element to test
	 * @returns {boolean}
	 * @private
	 */
	function hasDataWeaveAttr(element) {
		return $(element).attr(DATA_WEAVE) !== UNDEFINED;
	}

	/**
	 * Tests if element has a data-woven attribute
	 * @param element to test
	 * @returns {boolean}
	 * @private
	 */
	function hasDataWovenAttr(element) {
		return $(element).attr(DATA_WOVEN) !== UNDEFINED;
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
			widgets = RegExp(getargs.call(widgets).map(function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Return expression
			return function (element) {
				// Get weave attribute
				var weave = $(element).attr(DATA_WEAVE);

				// Check that weave is not UNDEFINED, and that widgets test against a processed weave
				return weave !== UNDEFINED && widgets.test(weave.replace(RE_SEPARATOR, "\n"));
			};
		})
		// Otherwise fall back to legacy
		: function (element, index, match) {
			var weave = $(element).attr(DATA_WEAVE);

			return weave === UNDEFINED
				? false
				: match === UNDEFINED
					? true
					: RegExp(getargs.call(match[3]).map(function (widget) {
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
			widgets = RegExp(getargs.call(widgets).map(function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Return expression
			return function (element) {
				// Get woven attribute
				var woven = $(element).attr(DATA_WOVEN);

				// Check that woven is not UNDEFINED, and that widgets test against a processed woven
				return woven !== UNDEFINED && widgets.test(woven.replace(RE_SEPARATOR, "\n"));
			};
		})
		// Otherwise fall back to legacy
		: function (element, index, match) {
			var woven = $(element).attr(DATA_WOVEN);

			return woven === UNDEFINED
				? false
				: match === UNDEFINED
					? true
					: RegExp(getargs.call(match[3]).map(function (widget) {
						return "^" + widget;
					}).join("|"), "m").test(woven.replace(RE_SEPARATOR, "\n"));
		};

	/**
	 * Weaves elements
	 * @returns {Promise} of weaving
	 */
	$FN[WEAVE] = function () {
		var $elements = $(this);
		var weave_args = arguments;
		var woven = [];
		var wovenLength = 0;

		// Prepare $elements for weaving
		$elements
			// Reduce to only elements that can be woven
			.filter(SELECTOR_WEAVE)
				// Reduce to only elements that don't have a the destroy handler attached
				.filter(function () {
					// Get events
					var events = $._data(this, "events");

					// Check if we can find the onDestroy event handler in events
					var found = events && $.grep(events[DESTROY] || false, function (handleObj) {
						return handleObj.handler === onDestroy;
					}).length > 0;

					// Return true if not found, false if we did
					return !found;
				})
				// Attach onDestroy event
				.on(DESTROY, onDestroy)
				// Back to previous filtering
				.end()
			// Iterate
			.each(function (index, element) {
				var $element = $(element);
				var $data = $element.data();
				var $widgets = $data[WIDGETS] || ($data[WIDGETS] = []);
				var $widgetsLength = $widgets[LENGTH];
				var $woven = [];
				var $wovenLength = 0;
				var matches;
				var attr_weave = $element.attr(DATA_WEAVE);
				var attr_args;
				var i;
				var iMax;
				var value;
				var re = /[\s,]*([\w_\-\/\.]+)(?:\(([^\)]+)\))?/g;

				// Make sure to remove DATA_WEAVE (so we don't try processing this again)
				$element.removeAttr(DATA_WEAVE);

				// Iterate attr_weave (while re matches)
				// matches[0] : original matching string - " widget/name(1, 'string', false)"
				// matches[2] : widget name - "widget/name"
				// matches[3] : widget arguments - "1, 'string', false"
				while ((matches = re.exec(attr_weave)) !== null) {
					// Create attr_args
					attr_args = [ $element, matches[1] ];

					// Store trimmed matches[0] as WEAVE on attr_args
					attr_args[WEAVE] = matches[0].trim();

					// Transfer arguments from getargs (if any exist)
					if (matches[2]) {
						ARRAY_PUSH.apply(attr_args, getargs.call(matches[2]));
					}

					// Iterate end of attr_args to copy from $data
					for (i = 2, iMax = attr_args[LENGTH]; i < iMax; i++) {
						// Get value
						value = attr_args[i];

						// Override if value is in $data
						attr_args[i] = value in $data
							? $data[value]
							: value;
					}

					// Store $woven arguments
					$woven[$wovenLength++] = attr_args;
				}

				// Iterate $woven
				$woven.forEach(function (widget_args, $wovenIndex) {
					// Create deferred and resolver
					var deferred = when.defer();
					var resolver = deferred.resolver;
					var promise = $widgets[$widgetsLength++] = $woven[$wovenIndex] = deferred.promise;

					// Copy WEAVE
					promise[WEAVE] = widget_args[WEAVE];

					// Require module, add error handler
					parentRequire([ widget_args[1] ], function (Widget) {
						var widget;

						try {
							// Create widget instance
							widget = Widget.apply(Widget, widget_args);

							// Add WOVEN to promise
							promise[WOVEN] = widget.toString();

							// Resolve with start yielding widget
							resolver.resolve(widget.start.apply(widget, weave_args).yield(widget));
						}
						catch (e) {
							// Reject resolver
							resolver.reject(e);
						}
					}, resolver.reject);
				});

				// Add promise to woven (and for legacy to $data[WOVEN])
				$data[WOVEN] = woven[wovenLength++] = when.all($woven, function (widgets) {
					// Get current DATA_WOVEN attribute
					var attr_woven = $element.attr(DATA_WOVEN);

					// Convert to array
					attr_woven = attr_woven === UNDEFINED
						? []
						: [ attr_woven ];

					// Push orinal weave
					ARRAY_PUSH.apply(attr_woven, widgets.map(function (widget) { return widget.toString(); }));

					// Either set or remove DATA_WOVEN attribute
					if (attr_woven[LENGTH] !== 0) {
						$element.attr(DATA_WOVEN, attr_woven.join(" "));
					}
					else {
						$element.removeAttr(DATA_WOVEN);
					}

					// Trigger event on $element indicating widget(s) were woven
					$element.triggerHandler(WEAVE, widgets);

					// Return widgets
					return widgets;
				});
			});

		// Return promise of all woven
		return when.all(woven);
	};

	/**
	 * Unweaves elements
	 * @returns {Promise} of unweaving
	 */
	$FN[UNWEAVE] = function () {
		var $elements = $(this);
		var unweave_args = arguments;
		var unwoven = [];
		var unwovenLength = 0;

		// Prepare $elements for unweaving
		$elements
			// Reduce to only elements that can be unwoven
			.filter(SELECTOR_UNWEAVE)
			// Iterate
			.each(function (index, element) {
				var $element = $(element);
				var $data = $element.data();
				var $widgets = $data[WIDGETS] || ($data[WIDGETS] = []);
				var $unwoven = [];
				var $unwovenLength = 0;
				var attr_unweave = $element.attr(DATA_UNWEAVE);
				var i;
				var iMax;
				var re;

				// Remove DATA_UNWEAVE attribute
				$element.removeAttr(DATA_UNWEAVE);

				// If we have attr_unweave, we need to filter
				if (attr_unweave) {
					// Create regexp to match widgets
					re = RegExp(attr_unweave.split(RE_SEPARATOR).map(function (widget) {
						return "^" + widget;
					}).join("|"), "m");

					// Filter $widgets
					filter.call($widgets, function ($widget) {
						var filtered = re.test($widget[WOVEN]);

						if (filtered) {
							$unwoven[$unwovenLength++] = $widget;
						}

						return !filtered;
					});

					// When all $widgets are fulfilled
					when.all($widgets, function (widgets) {
						// Either set or remove DATA_WOVEN argument
						if (widgets[LENGTH] !== 0) {
							$element.attr(DATA_WOVEN, widgets.join(" "));
						}
						else {
							$element.removeAttr(DATA_WOVEN);
						}

						// Return widgets
						return widgets;
					});
				}
				// Otherwise unweave all widgets
				else {
					// Copy from $widgets to $unwoven
					for (i = 0, iMax = $widgets[LENGTH]; i < iMax; i++) {
						$unwoven[$unwovenLength++] = $widgets[i];
					}

					// Truncate $widgets
					$widgets[LENGTH] = 0;

					// Remove DATA_WOVEN attribute
					$element.removeAttr(DATA_WOVEN);
				}

				// Iterate $unwoven
				$unwoven.forEach(function ($widget, $unwovenIndex) {
					// Redefine $unwoven
					$unwoven[$unwovenIndex] = when($widget, function (widget) {
						// Chain deferred to stop, resolve with widget
						var promise = widget.stop.apply(widget, unweave_args).yield(widget);

						// Copy WEAVE
						promise[WEAVE] = $widget[WEAVE];

						// Return promise
						return promise;
					});
				});

				// Add to unwoven
				unwoven[unwovenLength++] = when.all($unwoven, function (widgets) {
					// Get current DATA_WEAVE attribute
					var attr_weave = $element.attr(DATA_WEAVE);

					// Convert to array
					attr_weave = attr_weave === UNDEFINED
						? []
						: [ attr_weave ];

					// Push orinal weave
					ARRAY_PUSH.apply(attr_weave, $unwoven.map(function ($widget) { return $widget[WEAVE]; }));

					// Either set or remove DATA_WEAVE attribute
					if (attr_weave[LENGTH] !== 0) {
						$element.attr(DATA_WEAVE, attr_weave.join(" "));
					}
					else {
						$element.removeAttr(DATA_WEAVE);
					}

					// Trigger event on $element indicating widget(s) were unwoven
					$element.triggerHandler(UNWEAVE, widgets);

					// Return widgets
					return widgets;
				});
			});

		// Return promise of all unwoven
		return when.all(unwoven);
	};

	/**
	 * Gets woven widgets
	 * @returns {Promise} of woven widgets
	 */
	$FN[WOVEN] = function () {
		var woven = [];
		var wovenLength = 0;
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
				var $widgets = ($.data(element, WIDGETS) || []).filter(function ($widget) {
					return re.test($widget[WOVEN]);
				});

				// Add promise of widgets to woven
				woven[wovenLength++] = when.all($widgets);
			});
		}
		// Otherwise we can use a faster approach
		else {
			// Iterate
			$(this).each(function (index, element) {
				// Add promise of widgets to woven
				woven[wovenLength++] = when.all($.data(element, WIDGETS));
			});
		}

		// Return promise of woven
		return when.all(woven);
	};
});
