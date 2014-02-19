/*globals buster:false*/
buster.testCase("troopjs-core/logger/console", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	require( [ "troopjs-core/logger/console" ] , function (logger) {
		run({
			"log" : function () {
				logger.log("log message");
				assert(true);
			},
			"warn" : function () {
				logger.warn("warn message");
				assert(true);
			},
			"debug" : function () {
				logger.debug("debug message");
				assert(true);
			},
			"info" : function () {
				logger.info("info message");
				assert(true);
			},
			"error" : function () {
				logger.error("error message");
				assert(true);
			}
		});
	});
});