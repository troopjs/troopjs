/*globals buster:false*/
buster.testCase("troopjs-core/logger/pubsub", function (run) {
	"use strict";

	var assert = buster.referee.assert;

	var LOGGER_LOG = "logger/log";
	var LOGGER_WARN = "logger/warn";
	var LOGGER_DEBUG = "logger/debug";
	var LOGGER_INFO = "logger/info";
	var LOGGER_ERROR = "logger/error";

	function done() {
		assert(true);
	}

	require( [ "troopjs-core/logger/pubsub", "troopjs-core/pubsub/hub" ] , function (logger, hub) {
		run({
			"setUp" : function () {
				hub.subscribe(LOGGER_LOG, this, done);
				hub.subscribe(LOGGER_WARN, this, done);
				hub.subscribe(LOGGER_DEBUG, this, done);
				hub.subscribe(LOGGER_INFO, this, done);
				hub.subscribe(LOGGER_ERROR, this, done);
			},

			"tearDown" : function () {
				hub.unsubscribe(LOGGER_LOG, this, done);
				hub.unsubscribe(LOGGER_WARN, this, done);
				hub.unsubscribe(LOGGER_DEBUG, this, done);
				hub.unsubscribe(LOGGER_INFO, this, done);
				hub.unsubscribe(LOGGER_ERROR, this, done);
			},

			"log" : function () {
				logger.log("log message");
			},
			"warn" : function () {
				logger.warn("warn message");
			},
			"debug" : function () {
				logger.debug("debug message");
			},
			"info" : function () {
				logger.info("info message");
			},
			"error" : function () {
				logger.info("error message");
			}
		});
	});
});