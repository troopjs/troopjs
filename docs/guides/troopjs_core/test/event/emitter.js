/*globals buster:false*/
buster.testCase("troopjs-core/event/emitter", function (run) {
	"use strict";

	var assert = buster.assert;

	require( [ "troopjs-core/event/emitter", "when" ] , function (Emitter, when) {

		run({
			"on/emit" : function (done) {
				var arg = "TEST";
				var context = this;

				Emitter()
					.on("test", context, function onTest(test) {
						assert.same(arg, test);
					})
					.emit("test", arg)
					.then(done);
			},

			"on/emit again": function(done) {
				var arg = "TEST";
				var context = this;

				var emitter = Emitter();
				var count = 0;

				emitter
					.on("test", context, function() {
						count++;
					})
					.emit("test", arg)
					.then(function () {
						emitter.emit("test", arg)
							.then(function () {
								assert.equals(count, 2);
							})
							.then(done)
					});
			},

			"on/emit again with different arg": function(done) {
				var emitter = Emitter();
				var context = this;
				var last;

				emitter
					.on("test", context, function(test) {
						last = test;
					})
					.emit("test", "test")
					.then(function () {
						emitter.emit("test", "test2")
							.then(function () {
								assert.equals(last, "test2");
							})
							.then(done);
					});
			},

			"on/emit 2 emitters": function(done) {
				var emitter1 = Emitter();
				var emitter2 = Emitter();

				var context = this;

				emitter1.on("one", context, function(arg) {
					assert.same(arg, "one");
				});

				emitter2.on("two", context, function(arg){
					assert.same(arg, 2);
				});

				emitter1.emit("one", "one").then(function () {
					emitter2.emit("two", 2).then(done);
				});
			},

			"on/emit async subscribers": function(done) {
				var emitter = Emitter();
				var context = this;
				var start = new Date().getTime();

				this.timeout = 1000;

				emitter
					.on("one", context, function (started) {
						assert.equals(started, start);

						return when.promise(function (resolve) {
							setTimeout(function () {
								resolve([ started, new Date().getTime() ]);
							}, 500);
						});
					})
					.on("one", context, function (started, first) {
						assert.equals(start, started);
						assert.greater(first, started);
						assert.near(first - started, 500, 10);
					})
					.emit("one", start).then(done);
			},

			"off/emit": function(done) {
				var emitter = Emitter();
				var context = this;
				var last;

				var callback = function(arg) {
					last = arg;
				};

				emitter
					.on("test", context, callback)
					.emit("test", "test")
					.then(function () {
						emitter
							.off("test", context, callback)
							.emit("test", "test2")
							.then(function () {
								assert.equals(last, "test");
							})
							.then(done);
					});
			},

			"on/reemit": function(done) {
				var emitter = Emitter();
				var context = this;
				var count = 0;
				
				emitter
					.on("test", context, function(message){
						assert.equals(message, "test");
						count++;
					})
					.emit("test", "test")
					.then(function () {
						emitter
							.reemit("test", context, function(message) {
								assert.equals(message, "test");
							})
							.then(done);
					});
			},

			"on/emit reject": function (done) {
				var emitter = Emitter();
				var context = this;

				emitter
					.on("test", context, function (pass) {
						return pass
							? when.resolve()
							: when.reject();
					})
					.on("test", context, function (pass) {
						assert.isTrue(pass);
					})
					.emit("test", false)
					.then(function () {
						assert(false);
					}, function() {
						assert(true);
					})
					.ensure(function () {
						emitter
							.emit("test", true)
							.then(function () {
								assert(true);
							}, function() {
								assert(false);
							})
							.ensure(done);
					});
			}
		});
	});
});