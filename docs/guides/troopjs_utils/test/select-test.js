/*globals buster:false*/
buster.testCase("troopjs-utils/select", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [ "troopjs-utils/select" ] , function (select) {
		var data = {
			"child": 1,

			"grand": {
				"child": 2,
				"child.escape": 4
			},

			"child.escape": 3,

			"grand.escape": {
				"child.escape": 5
			},

			"[child]": 6
		};

		run({
			"child": function () {
				assert.same(select.call(data, "child"), data.child);
			},

			"grand.child": function () {
				assert.same(select.call(data, "grand.child"), data.grand.child);
			},

			"'child.escape'": function () {
				assert.same(select.call(data, "'child.escape'"), data["child.escape"]);
			},

			"grand.'child.escape'": function () {
				assert.same(select.call(data, "grand.'child.escape'"), data.grand["child.escape"]);
			},

			"'grand.escape'.\"child.escape\"": function () {
				assert.same(select.call(data, "'grand.escape'.\"child.escape\""), data["grand.escape"]["child.escape"]);
			},

			"[child]": function () {
				assert.same(select.call(data, "[child]"), data.child);
			},

			"[grand][child]": function () {
				assert.same(select.call(data, "[grand][child]"), data.grand.child);
			},

			"[grand].child": function () {
				assert.same(select.call(data, "[grand].child"), data.grand.child);
			},

			"['child']": function () {
				assert.same(select.call(data, "['child']"), data.child);
			},

			"'[child]'": function () {
				assert.same(select.call(data, "'[child]'"), data["[child]"]);
			},

			"[grand.escape][\"child.escape\"]": function () {
				assert.same(select.call(data, "[grand.escape][\"child.escape\"]"), data["grand.escape"]["child.escape"]);
			}
		});
	});
});