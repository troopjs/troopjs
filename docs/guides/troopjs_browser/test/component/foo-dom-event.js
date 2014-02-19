/*
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-browser/component/widget"], function FooWidgetModule(Widget) {
	"use strict";

	var assert = buster.referee.assert;

	function assertClickHandler($evt, foo, bar) {
		assert.equals($evt.type, "click", "click event is not called");
		assert.equals(foo, "foo");
		assert.equals(bar, "bar");
		this.spy();
	}

	/**
	 * A simple widget with declared dom handlers.
	 */
	function assertKeyDownHandler($evt, data) {
		assert.equals($evt.type, "keydown", "keydown event is not called");
		assert.equals({"foo": "bar"}, data);
		this.spy();
	}

	function assertFails() {
		assert(false, "this method shouldn't be called");
	}


	return Widget.extend({
		"displayName" : "test/component/widget/foo-dom-event",
		"sig/start": function(spy) {
			this.spy = spy;
		},

		"dom/click" : assertClickHandler,
		"dom:.btn/click": assertClickHandler,
		"dom:[type='button']/click": assertClickHandler,
		"dom:#btn-foo.btn/click": assertClickHandler,
/*
		"dom:#btn-foo.btn,.bar/click": assertClickHandler,
		"dom:.bar,#btn-foo.btn/click": assertClickHandler,
*/

		"dom:.btn:last-child/click": assertFails,
		"dom:[type='text']/click": assertFails,

		"dom/keydown" : assertKeyDownHandler
	});
});
