/*globals buster:false*/
buster.testCase("troopjs-data/cache/component", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	require( [ "troopjs-data/cache/component", "troopjs-data/cache/service" ] , function (Cache, GC) {
		run({
			"setUp" : function (done) {
				var cache = this.cache = Cache();
				// Start GC with 1 second generations
				var gc = this.gc = GC(cache);
				gc.start(1000).then(done);
			},

			"tearDown" : function (done) {
				var me = this;
				me.gc.stop().then(function () {
					delete me.cache;
					delete me.gc;
					done();
				});
			},

			"with maxAged data 'one' is cached" : {
				"setUp" : function () {
					this.cache.put([{
						"id" : "one",
						"maxAge" : 1
					}, {
						"id" : "two",
						"maxAge" : 2,
						"one" : {
							"id" : "one",
							"collapsed" : true
						}
					}]);
				},

				"from the start" : function () {
					assert.defined(this.cache["one"]);
				},

				"for at least half but at most one generation" : function (done) {
					var cache = this.cache;

					setTimeout(function () {
						assert.defined(cache["one"], "(cached for half of one generation) 'one'");

						setTimeout(function () {
							refute.defined(cache["one"], "(expired after one generation) 'one'");
							done();
						}, 500);
					}, 500);

					this.timeout = 1100;
				}
			},

			"with maxAged data 'two' is cached" : {
				"setUp" : function () {
					this.cache.put([{
						"id" : "one",
						"maxAge" : 1
					}, {
						"id" : "two",
						"maxAge" : 2,
						"one" : {
							"id" : "one",
							"collapsed" : true
						}
					}]);
				},

				"from the start" : function () {
					assert.defined(this.cache["two"]);
				},

				"for at least one but at most two generations" : function (done) {
					var cache = this.cache;

					setTimeout(function () {
						assert.defined(cache["two"], "(cached for one generation) 'two'");

						setTimeout(function () {
							refute.defined(cache["two"], "(expired after two generations) 'two'");
							done();
						}, 1050);
					}, 1000);

					this.timeout = 2100;
				}
			}
		});
	});
});