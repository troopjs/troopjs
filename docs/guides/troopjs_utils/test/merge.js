/*globals buster:false*/
buster.testCase("troopjs-utils/merge", function (run) {
	"use strict";

	var assert = buster.assert;

	require( [ "troopjs-utils/merge" ] , function (merge) {
		run({
			"{'a':1} + {'b':2}" : function () {
				assert.equals(merge.call({"a":1}, {"b":2}), {"a":1, "b":2});
			},

			"{'a':1} + {'a':2}" : function () {
				assert.equals(merge.call({"a":1}, {"a":2}), {"a":2});
			},

			"{'a':1} + {'a':[2]}" : function () {
				assert.equals(merge.call({"a":1}, {"a":[2]}), {"a":[2]});
			},

			"{'a':[1]} + {'a':[2]}" : function () {
				assert.equals(merge.call({"a":[1]}, {"a":[2]}), {"a":[1,2]});
			},

			"{'a':[1]} + {'a':2}" : function () {
				assert.equals(merge.call({"a":[1]}, {"a":2}), {"a":2});
			},

			"{'a':{'b':1}} + {'a':2}" : function () {
				assert.equals(merge.call({"a":{"b":1}}, {"a":2}), {"a":2});
			},

			"{'a':{'b':1}} + {'a':{'c':2}}" : function () {
				assert.equals(merge.call({"a":{"b":1}}, {"a":{"c":2}}), {"a":{"b":1, "c":2}});
			},

			"{'a':1} + {'a':{'b':2}}" : function () {
				assert.equals(merge.call({"a":1}, {"a":{"b":2}}), {"a":{"b":2}});
			}
		});
	});
});