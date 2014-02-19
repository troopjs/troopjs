/*
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-browser/component/widget"], function FooWidgetModule(Widget) {
	"use strict";

	/**
	 * A simple widget for test.
	 */
	return Widget.extend({
		"displayName" : "test/component/widget/foo"
	});
});
