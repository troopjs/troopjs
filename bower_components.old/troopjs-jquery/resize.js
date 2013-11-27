/**
 * TroopJS jquery/resize
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Heavy inspiration from https://github.com/cowboy/jquery-resize.git
 */
define([ "jquery" ], function ResizeModule($) {
	"use strict";

	var NULL = null;
	var RESIZE = "resize";
	var W = "w";
	var H = "h";
	var $ELEMENTS = $([]);
	var INTERVAL = NULL;

	/**
	 * Iterator
	 * @param index
	 * @param me
	 */
	function iterator(index, me) {
		// Get data
		var $data = $.data(me);

		// Get reference to $me
		var $me = $(me);

		// Get previous width and height
		var w = $me.width();
		var h = $me.height();

		// Check if width or height has changed since last check
		if (w !== $data[W] || h !== $data[H]) {
			$data[W] = w;
			$data[H] = h;

			$me.trigger(RESIZE, [ w, h ]);
		}
	}

	/**
	 * Internal interval
	 */
	function interval() {
		$ELEMENTS.each(iterator);
	}

	$.event.special[RESIZE] = {
		"setup" : function onResizeSetup() {
			var me = this;

			// window has a native resize event, exit fast
			if ($.isWindow(me)) {
				return false;
			}

			// Store data
			var $data = $.data(me, RESIZE, {});

			// Get reference to $me
			var $me = $(me);

			// Initialize data
			$data[W] = $me.width();
			$data[H] = $me.height();

			// Add to tracked collection
			$ELEMENTS = $ELEMENTS.add(me);

			// If this is the first element, start interval
			if($ELEMENTS.length === 1) {
				INTERVAL = setInterval(interval, 100);
			}
		},

		"teardown" : function onResizeTeardown() {
			var me = this;

			// window has a native resize event, exit fast
			if ($.isWindow(me)) {
				return false;
			}

			// Remove data
			$.removeData(me, RESIZE);

			// Remove from tracked collection
			$ELEMENTS = $ELEMENTS.not(me);

			// If this is the last element, stop interval
			if($ELEMENTS.length === 0 && INTERVAL !== NULL) {
				clearInterval(INTERVAL);
			}
		}
	};
});
