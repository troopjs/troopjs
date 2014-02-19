/*globals buster:false*/
buster.testCase("troopjs-data/query/component", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	var UNDEFINED;

	require( [ "troopjs-data/query/component", "troopjs-data/cache/component" ] , function (Query, Cache) {
		run({
			"parse" : {
				"UNDEFINED" : function() {
					var ast = Query(UNDEFINED).ast();

					assert.equals(ast, []);
				},

				"test!123" : function () {
					var ast = Query("test!123").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!123",
						"raw" : "test!123"
					}]);
				},

				"test!123|xxx!321" : function () {
					var ast = Query("test!123|xxx!321").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!123",
						"raw" : "test!123"
					}, {
						"op" : "!",
						"text" : "xxx!321",
						"raw" : "xxx!321"
					}]);
				},

				"test!123.p1" : function () {
					var ast = Query("test!123.p1").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!123",
						"raw" : "test!123"
					}, {
						"op" : ".",
						"text" : "p1",
						"raw" : "p1"
					}]);
				},

				"test!123.p1.p2" : function () {
					var ast = Query("test!123.p1.p2").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!123",
						"raw" : "test!123"
					}, {
						"op" : ".",
						"text" : "p1",
						"raw" : "p1"
					}, {
						"op" : ".",
						"text" : "p2",
						"raw" : "p2"
					}]);
				},

				"test!123.p1,.p2" : function () {
					var ast = Query("test!123.p1,.p2").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!123",
						"raw" : "test!123"
					}, {
						"op" : ".",
						"text" : "p1",
						"raw" : "p1"
					}, {
						"op" : ",",
						"text" : "",
						"raw" : ""
					}, {
						"op" : ".",
						"text" : "p2",
						"raw" : "p2"
					}]);
				},

				"test!123.p1,.p2|xxx!321.p3.p4,.p5" : function () {
					var ast = Query("test!123.p1,.p2|xxx!321.p3.p4,.p5").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!123",
						"raw" : "test!123"
					}, {
						"op" : ".",
						"text" : "p1",
						"raw" : "p1"
					}, {
						"op" : ",",
						"text" : "",
						"raw" : ""
					}, {
						"op" : ".",
						"text" : "p2",
						"raw" : "p2"
					}, {
						"op" : "!",
						"text" : "xxx!321",
						"raw" : "xxx!321"
					}, {
						"op" : ".",
						"text" : "p3",
						"raw" : "p3"
					}, {
						"op" : ".",
						"text" : "p4",
						"raw" : "p4"
					}, {
						"op" : ",",
						"text" : "",
						"raw" : ""
					}, {
						"op" : ".",
						"text" : "p5",
						"raw" : "p5"
					}]);
				},

				"test!123 .p1,   .p2|xxx!321 .p3  .p4   , .p5" : function () {
					var ast = Query("test!123 .p1,   .p2|xxx!321 .p3  .p4   , .p5").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!123",
						"raw" : "test!123"
					}, {
						"op" : ".",
						"text" : "p1",
						"raw" : "p1"
					}, {
						"op" : ",",
						"text" : "",
						"raw" : ""
					}, {
						"op" : ".",
						"text" : "p2",
						"raw" : "p2"
					}, {
						"op" : "!",
						"text" : "xxx!321",
						"raw" : "xxx!321"
					}, {
						"op" : ".",
						"text" : "p3",
						"raw" : "p3"
					}, {
						"op" : ".",
						"text" : "p4",
						"raw" : "p4"
					}, {
						"op" : ",",
						"text" : "",
						"raw" : ""
					}, {
						"op" : ".",
						"text" : "p5",
						"raw" : "p5"
					}]);
				},

				"test!'123 321'" : function () {
					var ast = Query("test!'123 321'").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!'123 321'",
						"raw" : "test!123 321"
					}]);
				},

				"test!'123 321'.p1,.'p2 asd'" : function () {
					var ast = Query("test!'123 321'.p1,.'p2 asd'").ast();

					assert.equals(ast, [{
						"op" : "!",
						"text" : "test!'123 321'",
						"raw" : "test!123 321"
					}, {
						"op" : ".",
						"text" : "p1",
						"raw" : "p1"
					}, {
						"op" : ",",
						"text" : "",
						"raw" : ""
					}, {
						"op" : ".",
						"text" : "'p2 asd'",
						"raw" : "p2 asd"
					}]);
				}
			},

			"reduce" : {
				"setUp" : function (done) {
					var cache = this.cache = Cache();

					cache.start().then(done);
				},

				"tearDown" : function (done) {
					var me = this;

					me.cache.stop().then(function () {
						delete me.cache;

						done();
					});
				},

				"with static data" : {
					"setUp" : function () {
						this.cache.put([{
							"id" : "test!123",
							"collapsed" : false,
							"maxAge" : 10,
							"p1" : {
								"id" : "test!321",
								"collapsed" : true
							},
							"px" : [{
								"id" : "test!zzz",
								"collapsed" : true
							}, {
								"id" : "test!abc",
								"collapsed" : true
							}],
							"py" : [{
								"id" : "test!zzz",
								"collapsed" : true
							}],
							"p3" : {
								"id" : "test!xxx",
								"collapsed" : true
							}
						}, {
							"id" : "test!321",
							"collapsed" : false,
							"maxAge" : 10,
							"p2" : {
								"id" : "test!yyy",
								"collapsed" : true
							}
						}, {
							"id" : "test!yyy",
							"collapsed" : false,
							"maxAge" : 10
						}, {
							"id" : "test!zzz",
							"collapsed" : false,
							"maxAge" : 10
						}]);
					},

					"test!123" : function () {
						var ast = Query("test!123").reduce(this.cache).ast();

						assert.equals(ast, []);
					},

					"test!1234" : function () {
						var ast = Query("test!1234").reduce(this.cache).ast();

						assert.equals(ast, [{
							"op" : "!",
							"text" : "test!1234",
							"raw" : "test!1234",
							"resolved" : false
						}]);
					},

					"test!123.p1" : function () {
						var ast = Query("test!123.p1").reduce(this.cache).ast();

						assert.equals(ast, []);
					},

					"test!123.p2" : function () {
						var ast = Query("test!123.p2").reduce(this.cache).ast();

						assert.equals(ast, [{
							"op" : "!",
							"text" : "test!123",
							"raw" : "test!123",
							"resolved" : true
						}, {
							"op" : ".",
							"text" : "p2",
							"raw" : "p2",
							"resolved" : false
						}]);
					},

					"test!123.p1.p2" : function () {
						var ast = Query("test!123.p1.p2").reduce(this.cache).ast();

						assert.equals(ast, []);
					},

					"test!123.p1,.p3" : function () {
						var ast = Query("test!123.p1,.p3").reduce(this.cache).ast();

						assert.equals(ast, [{
							"op" : "!",
							"text" : "test!xxx",
							"raw" : "test!xxx",
							"resolved" : false
						}]);
					},

					"test!123.p1,.p2" : function () {
						var ast = Query("test!123.p1,.p2").reduce(this.cache).ast();

						assert.equals(ast, [{
							"op" : "!",
							"text" : "test!123",
							"raw" : "test!123",
							"resolved" : true
						}, {
							"op" : ".",
							"text" : "p2",
							"raw" : "p2",
							"resolved" : false
						}]);
					},

					"test!123.p1.p3.p4,.p2" : function () {
						var ast = Query("test!123.p1.p3.p4,.p2").reduce(this.cache).ast();

						assert.equals(ast, [{
							"op" : "!",
							"text" : "test!321",
							"raw" : "test!321",
							"resolved" : true
						}, {
							"op" : ".",
							"text" : "p3",
							"raw" : "p3",
							"resolved" : false
						}, {
							"op" : ".",
							"text" : "p4",
							"raw" : "p4",
							"resolved" : false
						}, {
							"op" : "!",
							"text" : "test!123",
							"raw" : "test!123",
							"resolved" : true
						}, {
							"op" : ".",
							"text" : "p2",
							"raw" : "p2",
							"resolved" : false
						}]);
					},

					"test!123|test!321" : function () {
						var ast = Query("test!123|test!321").reduce(this.cache).ast();

						assert.equals(ast, []);
					},

					"test!123.p1,.p2,.p3|test!321.p2" : function () {
						var ast = Query("test!123.p1,.p2,.p3|test!321.p2").reduce(this.cache).ast();

						assert.equals(ast, [{
							"op" : "!",
							"text" : "test!123",
							"raw" : "test!123",
							"resolved" : true
						}, {
							"op" : ".",
							"text" : "p2",
							"raw" : "p2",
							"resolved" : false
						}, {
							"op" : "!",
							"text" : "test!xxx",
							"raw" : "test!xxx",
							"resolved" : false
						}]);
					},

					"test!123.px" : function () {
						var ast = Query("test!123.px").reduce(this.cache).ast();

						assert.equals(ast, [{
							"op" : "!",
							"text" : "test!123",
							"raw" : "test!123",
							"resolved" : true
						}, {
							"op" : ".",
							"text" : "px",
							"raw" : "px",
							"resolved" : false
						}]);
					},

					"test!123.py" : function () {
						var ast = Query("test!123.py").reduce(this.cache).ast();

						assert.equals(ast, [{
							"op" : "!",
							"text" : "test!123",
							"raw" : "test!123",
							"resolved" : true
						}, {
							"op" : ".",
							"text" : "py",
							"raw" : "py",
							"resolved" : true
						}]);
					}
				},

				"with maxAged data" : {
					"setUp" : function () {
						this.cache.put([{
							"id" : "test!123",
							"maxAge" : 2,
							"p1" : {
								"id" : "test!321",
								"collapsed" : true
							},
							"p3" : {
								"id" : "test!xxx",
								"collapsed" : true
							}
						}, {
							"id" : "test!321",
							"maxAge" : 1,
							"p2" : {
								"id" : "test!xxx",
								"collapsed" : true
							}
						}, {
							"id": "test!xxx",
							"collapsed": false,
							"maxAge" : 5
						}]);
					},

					"test!123|test!321" : function (done) {
						var cache = this.cache;

						setTimeout(function () {
							var ast = Query("test!123|test!321").reduce(cache).ast();

							assert.equals(ast, [{
								"op" : "!",
								"text" : "test!321",
								"raw" : "test!321",
								"resolved" : false
							}]);

							done();
						}, 1000);

						this.timeout = 1100;
					},

					"test!321.p2" : function (done) {
						var cache = this.cache;

						setTimeout(function () {
							var ast = Query("test!321.p2").reduce(cache).ast();

							assert.equals(ast, [{
								"op" : "!",
								"text" : "test!321",
								"raw" : "test!321",
								"resolved" : false
							}, {
								"op" : ".",
								"text" : "p2",
								"raw" : "p2",
								"resolved" : false
							}]);

							done();
						}, 1000);

						this.timeout = 1100;
					}
				}
			},

			"rewrite" : {
				"setUp" : function (done) {
					var cache = this.cache = Cache();

					cache.put([{
						"id" : "test!123",
						"collapsed" : false,
						"maxAge" : 10,
						"p1" : {
							"id" : "test!321",
							"collapsed" : true
						},
						"p3" : {
							"id" : "test!xxx",
							"collapsed" : true
						}
					}, {
						"id" : "test!321",
						"collapsed" : false,
						"maxAge" : 10,
						"p2" : {
							"id" : "test!yyy",
							"collapsed" : true
						}
					}, {
						"id" : "test!yyy",
						"collapsed" : false,
						"maxAge" : 10
					}]);

					cache.start().then(done);
				},

				"tearDown" : function (done) {
					var me = this;

					me.cache.stop().then(function () {
						delete me.cache;

						done();
					});
				},

				"test!123" : function () {
					var rewrite = Query("test!123").reduce(this.cache).rewrite();

					assert.equals(rewrite, "");
				},

				"test!123.p1,.p3" : function () {
					var rewrite = Query("test!123.p1,.p3").reduce(this.cache).rewrite();

					assert.equals(rewrite, "test!xxx");
				},

				"test!123.p1.p2.p3,.p3" : function () {
					var rewrite = Query("test!123.p1.p2.p3,.p3").reduce(this.cache).rewrite();

					assert.equals(rewrite, "test!yyy.p3|test!xxx");
				},

				"test!123.p1,.p2,.p3|test!321.p2" : function () {
					var rewrite = Query("test!123.p1,.p2,.p3|test!321.p1,.p2").reduce(this.cache).rewrite();

					assert.equals(rewrite, "test!123.p2|test!xxx|test!321.p1");
				},

				"test!'123'.p1,.p2,.p3|test!321.p1,.p2" : function () {
					var rewrite = Query("test!'123'.p1,.p2,.p3|test!321.p1,.p2").reduce(this.cache).rewrite();

					assert.equals(rewrite, "test!'123'.p2|test!xxx|test!321.p1");
				}
			}
		});
	});
});