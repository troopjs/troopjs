buster.testCase("troopjs-data/cache/component", function (run) {
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
				var self = this;

				self.cache.stop().then(function () {
					delete self.cache;

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
				}
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