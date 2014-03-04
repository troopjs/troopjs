/*globals buster:false*/
buster.testCase("troopjs-core/component/base", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require( [ "troopjs-core/component/base", "when/delay" ] , function (Component, delay) {

		var PHASES = {
			"INITIAL": undefined,
			"INITIALIZE": "initialize",
			"STARTED": "started",
			"STOP": "stop",
			"FINALIZED": "finalized"
		};

		run({
			"setUp": function () {
				this.timeout = 500;
			},

			"signal sync": function () {
				var count = 0;

				function onSignal(arg1, arg2) {
					count++;
					assert.equals(arg1, 123);
					assert.equals(arg2, "abc");
				}

				var Foo = Component.extend({
					"sig/foo": onSignal
				});

				var Bar = Foo.extend({
					"sig/foo": onSignal
				});

				return Bar().signal("foo", 123, "abc").then(function () {
					assert.equals(count, 2);
				});
			},

			"signal async": function () {
				var count = 0;

				function onSignal(arg1, arg2) {
					count++;
					assert.equals(arg1, 123);
					assert.equals(arg2, "abc");
					return delay(200);
				}

				var Foo = Component.extend({
					"sig/foo": onSignal
				});

				var Bar = Foo.extend({
					"sig/foo": onSignal
				});

				return Bar().signal("foo", 123, "abc").then(function () {
					assert.equals(count, 2);
				});
			},

			"declarative event async": function () {
				var count = 0;

				function onEvent(arg1, arg2) {
					count++;
					assert.equals(arg1, 123);
					assert.equals(arg2, "abc");
					return delay(200);
				}

				var Foo = Component.extend({
					"on/foo": onEvent
				});

				var Bar = Foo.extend({
					"on/foo": onEvent
				});

				var bar = Bar();

				return bar.start().then(function () {
					return bar.emit("foo", 123, "abc").then(function () {
						assert.equals(count, 2);
					});
				});
			},

			"phase - match": function () {
				this.timeout = 500;
				var foo = Component.create({
					"sig/start": function() {
						return delay(200);
					},
					"sig/finalize": function() {
						return delay(200);
					}
				});

				assert.equals(foo.phase, PHASES.INITIAL);

				var started = foo.start().then(function() {
					assert.equals(foo.phase, PHASES.STARTED);
					var stopped = foo.stop().then(function() {
						assert.equals(foo.phase, PHASES.FINALIZED);
					});
					assert.equals(foo.phase, PHASES.STOP);
					return stopped;
				});
				assert.equals(foo.phase, PHASES.INITIALIZE);
				return started;
			},

			"phase - guardian": function () {
				var foo = Component.create({});
				// Invalid call to stop before component started.
				assert.exception(function() {
					foo.stop();
				});

				return foo.start().then(function() {
					// Invalid call to start after started.
					assert.exception(function() { foo.start(); });

					return foo.stop().then(function() {
						// Invalid call to stop after stopped.
						assert.exception(function() { foo.stop(); });
					});
				});
			},
			'event handlers - setup/teardown': function() {
				var setup = this.spy();
				var teardown = this.spy();
				var foo = Component.create({
					"sig/setup": function(type, handlers) {
						setup(type, handlers);
					},
					"sig/teardown": function(type, handlers) {
						teardown(type, handlers);
					}
				});

				function handler1() {}
				function handler2() {}

				foo.on("foo", handler1).on("foo", handler2);

				var handlers = foo.handlers["foo"];
				assert.calledOnce(setup);
				assert.calledWith(setup, "foo", handlers);
				foo.off("foo", handler1);
				refute.called(teardown);
				foo.off("foo", handler2);
				assert.calledOnce(teardown);
				assert.calledWith(teardown, "foo", handlers);

			}
		});
	});
});
