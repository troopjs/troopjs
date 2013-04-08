/**
 * TroopJS jquery/resize
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Heavy inspiration from https://github.com/cowboy/jquery-resize.git
 */
/*global define:false */
define([ "jquery" ], function ResizeModule($) {
	/*jshint strict:false, smarttabs:true */

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
		"setup" : function onResizeSetup(data, namespaces, eventHandle) {
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
		"teardown" : function onResizeTeardown(namespaces) {
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
