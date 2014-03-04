/*globals buster:false*/
buster.testCase("troopjs-core/pubsub/hub", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require( [ "troopjs-core/pubsub/hub", "troopjs-core/pubsub/runner/sequence", "jquery", "when", "when/delay" ] , function (hub, sequence, $, when, delay) {

		run({
			"setUp" : function () {
				this.timeout = 1000;
			},

			"subscribe/publish sync subscribers" : function () {
				var foo = "FOO";
				var bar = "BAR";

				return hub
					.subscribe("foo/bar", this, function (arg) {
						assert.same(foo, arg);
						// Return an array.
						return [arg, bar];
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.same(foo, arg1);
						assert.same(bar, arg2);
						// Return no value.
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						// Arguments received are to be same as the previous one.
						assert.same(foo, arg1);
						assert.same(bar, arg2);

						// Return array-like arguments
						return arguments;
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						// Arguments received are to be same as the previous one.
						assert.same(foo, arg1);
						assert.same(bar, arg2);

						// Return a single value.
						return arg1;
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.same(foo, arg1);
						refute.defined(arg2);

						// Return array-alike jQuery object.
						return $("<span></span><span></span>");
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.defined(arg1.jquery);
						refute.defined(arg2);
					})
					.publish("foo/bar", foo);
			},

			"subscribe/publish async subscribers": function() {
				var foo = "FOO";
				var bar = "BAR";

				return hub
					.subscribe("foo/bar", this, function (arg) {
						assert.same(foo, arg);
						return when.resolve([arg, bar]);
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.same(foo, arg1);
						assert.same(bar, arg2);
						return delay(200, [bar]);
					})
					.subscribe("foo/bar", this, function (arg1) {
						assert.same(bar, arg1);
						// Return a promise that resolves to no value.
						return delay(200, foo);
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						assert.same(foo, arg1);
						refute.defined(arg2);

						// Return a promise that resolves to no value.
						return delay(200, undefined);
					})
					.subscribe("foo/bar", this, function (arg1, arg2) {
						// Arguments received are to be same as the previous one.
						assert.same(foo, arg1);
						refute.defined(arg2);

						// Return array-alike jQuery object.
						return delay(200, $("<span></span><span></span>"));
					})
					.subscribe("foo/bar", this, function(arg1, arg2) {
						assert.defined(arg1.jquery);
						refute.defined(arg2);
					})
					.publish("foo/bar", foo);
			},

			"subscribe/publish - using explicit sequence runner": function () {
				var foo = "FOO";
				var bar = "BAR";
				var context = this;
				var count = 0;

				return hub
					.subscribe("foo/bar", context, function (arg) {
						assert.same(foo, arg);
						count++;
						return [foo, bar];
					})
					.subscribe("foo/bar", context, function (arg1, arg2) {
						// Arguments received are to be same as the previous one.
						assert.same(foo, arg1);
						refute.defined(arg2);
						count++;
					})
					.emit({
						"type" : "foo/bar",
						"runner" : sequence
					}, foo)
					.then(function () {
						assert.same(2, count);
					});
			},

			"tearDown": function () {
				hub.unsubscribe("foo/bar");
			}
		});
	});
});
