/*globals buster:false*/
buster.testCase("troopjs-core/component/gadget", function (run) {
	"use strict";

	var assert = buster.referee.assert;
	var refute = buster.referee.refute;

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_CONCAT = ARRAY_PROTO.concat;
	var TOPIC = "TEST";
	var TEST_ARGS = ["abc", "", 1, 0, false, true, {}];
	var APPLY_ARGS = ARRAY_CONCAT.call(ARRAY_PROTO, [TOPIC], TEST_ARGS);
	var NAME_HANDLER = "__test_handlers";

	/**
	 * compare a array of expected result with actual result
	 */
	function allSame(actual, expected){
		for(var l = expected.length; l--;){
			assert.same(expected[l], actual[l]);
		}
	}

	require( [ "troopjs-core/component/gadget"] , function (Gadget) {

		run({
			"publish/subscribe": {
				setUp: function(){
					var me = this;
					me.timeout = 500;

					var insts = me.instances = [];

					me.registerInstance = function(instance){
						var found = false;

						for(var l = insts.length; l--;){
							var inst = insts[l];

							if (inst === instance){
								found = true;
								break;
							}
						}

						if (found){
							return;
						}

						me.instances.push(instance);
					};

					// helper to subscribe topic,
					// all subscription will be cleaned in teardown
					me.subscribe = function(context, topic, func){
						if (!context[NAME_HANDLER]){
							context[NAME_HANDLER] = [];
						}

						me.registerInstance(context);

						// call the real subscribe
						context.subscribe(topic, func);

						context[NAME_HANDLER].push({
							topic: topic,
							func: func
						});

						return me;

					};
				},
				tearDown: function(){
					var me = this;
					var insts = me.instances;

					// clear up all subscription
					for(var l = insts.length; l--;){

						var inst = insts[l];

						if (!inst[NAME_HANDLER]){
							continue;
						}

						var handlers = inst[NAME_HANDLER];

						for(var m = handlers.length; m--;){
							var handler = handlers[m];

							inst.unsubscribe(handler.topic, handler.func);
						}

						// pop out instance at last
						insts.pop();

					}
				},
				// POSITIVE TESTS
				"without exception when there is no subscriber" : function () {
					var g1 = new Gadget();

					return g1.publish(TOPIC).then(function() {
						assert(true);
					});
				},
				"different topics should not interfere with each other": function(){
					var g1 = new Gadget();

					this
					.subscribe(g1, TOPIC + "diff", function(){
						assert(false);
					})
					.subscribe(g1, TOPIC, function(test){
						assert(test);
					});

					return g1.publish(TOPIC, true);
				},
				"with args" : function () {
					var g1 = new Gadget();

					this.subscribe(g1, TOPIC, function(){
						allSame(arguments, TEST_ARGS);
					});

					return g1.publish.apply(g1, APPLY_ARGS);
				},
				"multiple times and in order" : function () {
					var g1 = new Gadget();

					var spy = this.spy();

					this
					.subscribe(g1, TOPIC, spy)
					.subscribe(g1, TOPIC, function(){

						assert.called(spy);

						allSame(arguments, TEST_ARGS);
					});

					return g1.publish.apply(g1, APPLY_ARGS);
				},
				"cross gadget" : function () {

					var g1 = new Gadget();
					var g2 = new Gadget();

					this.subscribe(g1, TOPIC, function(){
						allSame(arguments, TEST_ARGS);
					});

					return g2.publish.apply(g2, APPLY_ARGS);
				}
			},
			"on/off/emit": {
				"emit to a topic that no handler is listening": function(){
					var g1 = new Gadget();

					g1.emit.apply(g1, TEST_ARGS);
					assert(true);
				},
				"without exception": function(){
					var g1 = new Gadget();

					g1.on(TOPIC, function(){
						allSame(arguments, TEST_ARGS);
					});

					return g1.emit.apply(g1, APPLY_ARGS);
				},
				"on multiple instance should not interfere with each other": function(){
					var g1 = new Gadget();
					var g2 = new Gadget();

					g1.on(TOPIC, function(){
						allSame(arguments, TEST_ARGS);
					});
					g2.on(TOPIC, function(){
						assert(false);
					});

					return g1.emit.apply(g1, APPLY_ARGS);
				},
				"on() multiple times and the handler received in order": function(){
					var g1 = new Gadget();
					var g2 = new Gadget();

					var spy = this.spy();

					g1.on(TOPIC, spy);
					g1.on(TOPIC, function(test){
						assert.called(spy);
						allSame(arguments, TEST_ARGS);
					});
					g2.on(TOPIC, function(){
						assert(false);
					});

					return g1.emit.apply(g1, APPLY_ARGS);
				}
			},

			"publish/subscribe - context matches *this* ": function (done) {

				var count = 0;
				var g1 = Gadget.create({
					'hub/foo': function () {
						count++;
						assert.same(g1, this);
					}
				});

				var g2 = Gadget.create({
					'hub/foo': function () {
						count++;
						assert.same(g2, this);
					}
				});

				var g3 = Gadget.create({});

				return g1.start().then(function () {
					g2.start().then(function () {
						g3.publish('foo').then(function () {
							assert.same(2, count);
							done();
						});
					})
				});
			},

			"publish/subscribe - memory" : function() {
				var spy1 = this.spy();
				var spy2 = this.spy();

				var g1 = Gadget.create({
					"hub:memory/foo/bar": function() {
						spy1.apply(spy1,arguments);
					},
					"hub/foo/bar": function() {
						spy2.apply(spy1, arguments);
					}
				});

				return g1.publish("foo/bar", "foo", "bar").then(function() {

					// None of them should be called because component not yet started.
					refute.called(spy1);
					refute.called(spy2);

					return g1.start().then(function() {

						// Only the handler declared with memory if is called.
						assert.calledWithExactly(spy1, "foo", "bar");
						refute.called(spy2);
					});
				});
			},

			"publish after called .off": function() {
				var foo = this.spy();
				var g1 = Gadget.create({
					'hub/foo': function() {
						foo();
					}
				});
				return g1.start().then(function() {
					g1.unsubscribe("foo");
					return g1.publish("foo").then(function() {
						refute.called(foo);
					})
				});
			}
		});
	});
});
