/**
 * TroopJS jquery/dimensions
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "jquery", "./resize" ], function DimensionsModule($) {
	"use strict";

	var NULL = null;
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
	 */
	function onResize() {
		/*jshint validthis:true*/
		var me = this;
		var $me = $(me);
		var width = $me.width();
		var height = $me.height();

		// Iterate all dimensions
		$.each($.data(me, DIMENSIONS), function dimensionIterator(namespace, dimension) {
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

				$me.trigger(DIMENSIONS + "." + namespace, [ _w, _h ]);
			}
		});
	}

	$.event.special[DIMENSIONS] = {
		setup : function onDimensionsSetup() {
			$(this)
				.bind(RESIZE, onResize)
				.data(DIMENSIONS, {});
		},

		/**
		 * Do something each time an event handler is bound to a particular element
		 * @param handleObj (Object)
		 */
		add : function onDimensionsAdd(handleObj) {
			var me = this;
			var namespace = handleObj.namespace;
			var dimension = {};
			var w = dimension[W] = [];
			var h = dimension[H] = [];
			var re = /(w|h)(\d+)/g;
			var matches;

			while ((matches = re.exec(namespace)) !== NULL) {
				dimension[matches[1]].push(parseInt(matches[2], 10));
			}

			w.sort(reverse);
			h.sort(reverse);

			$.data(me, DIMENSIONS)[namespace] = dimension;
		},

		/**
		 * Do something each time an event handler is unbound from a particular element
		 * @param handleObj (Object)
		 */
		remove : function onDimensionsRemove(handleObj) {
			delete $.data(this, DIMENSIONS)[handleObj.namespace];
		},

		teardown : function onDimensionsTeardown() {
			$(this)
				.removeData(DIMENSIONS)
				.unbind(RESIZE, onResize);
		}
	};
});