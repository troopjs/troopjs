/*globals buster:false*/
buster.testCase("troopjs-browser/application/widget", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [
		"troopjs-browser/application/widget",
		"text!troopjs-browser/test/application/page.html",
		"jquery"
	],
		function (Application, html, $) {

		function assertWidgets (widgets1, widgets2) {
			assert.equals(widgets1.length, 2);
			assert.equals(widgets2.length, 1);
			assert.equals(widgets1[0].displayName, "troopjs-browser/test/component/foo");
			assert.equals(widgets1[1].displayName, "troopjs-browser/test/component/bar");
			assert.equals(widgets2[0].displayName, "troopjs-browser/test/component/baz");
		}

		run({
			"setUp": function () {
				this.$el = $(html).appendTo("body");
				this.app = Application($('html'));
			},
			"weaving": function () {
				var app = this.app;

				return app.weave(456, 'def').spread(assertWidgets).then(function () {
						return app.unweave().spread(assertWidgets);
				});
			},
			"tearDown": function () {
				this.$el.remove();
			}
		});
	});
});
