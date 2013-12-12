/*globals buster:false*/
buster.testCase("troopjs-data/cache/component", function (run) {
	"use strict";

	var assert = buster.assert;
	var refute = buster.assertions.refute;

	require( [ "troopjs-data/cache/component" ] , function (Cache) {
		run({
			"setUp" : function (done) {
				// Create cache with 1 second generations
				var cache = this.cache = Cache(1000);

				cache.start().then(done);
			},

			"tearDown" : function (done) {
				var me = this;

				me.cache.stop().then(function () {
					delete me.cache;

					done();
				});
			},

			"with emty cache" : {
				"'whatever' is undefined" : function () {
					refute.defined(this.cache["whatever"]);
				}
			},

			"with static data" : {
				"setUp" : function () {
					this.cache.put([{
						"id" : "one",
						"two" : {
							"id" : "two",
							"collapsed" : true
						}
					}, {
						"id" : "two"
					}]);
				},

				"'one' is defined" : function () {
					assert.defined(this.cache["one"]);
				},

				"'one.two' is same as 'two'" : function () {
					var cache = this.cache;

					assert.same(cache["one"]["two"], cache["two"]);
				},

				"Properties of 'one' are pruned after update" : function () {
					var cache = this.cache;
					var one = cache["one"];

					// Update cache with a non-collapsed object.
					cache.put({
						"id" : "one",
						"collapsed": false
					});

					// Two should be pruned.
					refute.defined(one["two"]);
				}
			},

			"test obj.indexed is updated for each put" : {

				"setUp" : function (done) {
					var foo = this.cache.put({
						"id" : "foo",
						"maxAge" : 10
					});

					// Save the last index.
					this.indexed = foo["indexed"];

					// At least 1s to get a different index
					setTimeout(function() {
						done();
					}, 1000);

					this.timeout = 1500;
				},

				"fresh put" : function () {
					var bar = this.cache.put({ id: "bar" });
					assert(bar["indexed"] > this.indexed);
				},

				"update put" : function () {
					var foo = this.cache.put({ id: "foo" });
					assert(foo["indexed"] > this.indexed);
				}
			}
		});
	});
});