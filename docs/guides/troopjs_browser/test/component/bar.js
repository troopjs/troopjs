/*
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-browser/component/widget"], function BarWidgetModule(Widget) {
	"use strict";

	var assert = buster.referee.assert;

	/**
	 * A simple widget for test.
	 */
	return Widget.extend(function ($el, name, arg1, arg2) {
		assert('foobar', $el.className);
		assert.same(this.displayName, name);
		assert.same(123, arg1);
		assert.same("abc", arg2);
	}, {
		"displayName" : "test/component/widget/bar",
		"sig/initialize" : function onInitialize() {},
		"sig/start" : function onStart(arg1, arg2) {
			assert.same(456, arg1);
			assert.same("def", arg2);
		},
		"sig/stop" : function onStop() {},
		"sig/finalize" : function onFinalize() {
		}
	});
});
