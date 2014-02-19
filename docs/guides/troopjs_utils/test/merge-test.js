/*globals buster:false*/
buster.testCase("troopjs-utils/merge", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [ "troopjs-utils/merge" ] , function (merge) {
		run({
			"null or undefined should return quick": function () {
				assert.same(merge.call(null, {'a':1}), null);
				assert.same(merge.call(undefined, {'a':1}), undefined);
			},

			"{'a':1} + {'b':2}" : function () {
				assert.equals(merge.call({"a":1}, {"b":2}), {"a":1, "b":2});
			},

			"{'a':1} + undefined,  {'b':2}" : function () {
				assert.equals(merge.call({"a":1}, undefined, {"b":2}), {"a":1, "b":2});
			},

			"{'a':1} + null,  {'b':2}" : function () {
				assert.equals(merge.call({"a":1}, null, {"b":2}), {"a":1, "b":2});
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