/*globals buster:false*/
buster.testCase("troopjs-composer/mixin/factory", function(run) {
	"use strict";

	var assert = buster.referee.assert;

	require([
		"troopjs-composer/mixin/factory",
		"troopjs-composer/decorator/after",
		"troopjs-composer/decorator/around",
		"troopjs-composer/decorator/before",
		"troopjs-composer/decorator/extend",
		"troopjs-composer/decorator/from"
	], function(Factory, after, around, before, extend, from) {

		function method1() {}

		var Arith = Factory({
			"sub": function(a, b) {
				return a - b;
			},
			"sub2": function(a, b) {
				return b - a;
			}
		});

		run({
			"Factory": {
				// POSITIVE TESTS
				"Factory.create": function() {
					var o = Factory.create(function() {
						this["prop2"] = "bar";
					}, {
						"prop1": "foo",
						"func1": method1
					});

					assert.equals(o.prop2, "bar");
					assert.equals(o.prop1, "foo");
					assert.equals(o.func1, method1);
				},
				"Factory.extend": function() {
					assert(true);
				}
			},

			"Decorator": {

				"setUp": function() {
					this.Cal = Factory({
						name: "cal",
						supports: {
							add: true
						},
						add: function(a, b) {
							return a + b;
						},
						sub: function(a, b) {
							return a - b;
						}
					});
				},

				"decorator/before": function() {
					var cal = Factory.create(this.Cal, {
						// Return array that spreads over arguments of original.
						add: before(function(a, b) {
							assert.equals(a, 1);
							assert.equals(b, 2);
							return [1, 3];
						}),
						// No return value should not interfere original.
						sub: before(function() { })
					});

					assert.equals(cal.add(1, 2), 4);
					assert.equals(cal.sub(2, 1), 1);
				},

				"decorator/after": function() {
					var cal = Factory.create(this.Cal, {
						add: after(function(a, b) {
							assert.equals(1, a);
							assert.equals(2, b);
						}),
						sub: after(function() {
							return -1;
						})
					});

					assert.equals(cal.add(1, 2), 3);
					assert.equals(cal.sub(2, 1), -1);
				},

				"decorator/around": function() {
					var cal = Factory.create(this.Cal, {
						add: around(function(org) {
							return function(a, b) {
								a *= a;
								b *= b;
								return org(a,b);
							}
						})
					});

					assert.equals(cal.add(1, 2), 5);
				},

				"decorator/from": function() {
					var cal1 = Factory.create(this.Cal, {
						sub: from(Arith)
					});

					var cal2 = Factory.create(this.Cal, {
						sub: from(Arith, "sub2")
					});

					var cal3 = Factory.create(this.Cal, {
						sub: from("add")
					});

					assert.equals(cal1.sub(2, 1), 1);
					assert.equals(cal2.sub(2, 1), -1);
					assert.equals(cal3.sub(2, 1), 3);
				},

				"decorator/extend": function() {
					var Cal = Factory(this.Cal, {
						supports: extend({
							sub: true
						})
					});

					var Cal2 = Cal.extend({
						mul: function(a, b) { return a * b; },
						supports: extend(function() {
							return {
								mul: true,
								div: false
							}
						})
					});

					var cal1 = Cal();
					var cal2 = Cal2();

					assert.equals(cal1.supports, {
						add: true,
						sub: true
					});

					assert.equals(cal2.supports, {
						div: false,
						mul: true
					});
				}
			}
		});
	});
});
