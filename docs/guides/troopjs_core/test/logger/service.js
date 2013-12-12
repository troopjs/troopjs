/*globals buster:false*/
buster.testCase("troopjs-core/logger/service", function (run) {
	"use strict";

	var ARRAY_PUSH = Array.prototype.push;
	var assert = buster.assert;

	require( [ "troopjs-core/logger/service", "troopjs-core/component/gadget", "troopjs-core/pubsub/hub" ] , function (Service, Gadget, hub) {
		var Appender = Gadget.extend({
			"append" : function () {
				var args = [ this.toString() ];

				ARRAY_PUSH.apply(args, arguments);

				buster.log.apply(buster, args);
			}
		});

		run({
			"with two appenders" : function (done) {
				var service = Service(Appender(), Appender());

				service.start().then(function () {
					hub.publish("logger/log", "log message");
					hub.publish("logger/warn", "warn message");
					hub.publish("logger/debug", "debug message");
					hub.publish("logger/info", "info message");
					hub.publish("logger/error", "error message");

					service.stop().then(function () {
						assert(true);
						done();
					});
				});
			}
		});
	});
});