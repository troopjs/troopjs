/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The gadget trait provides convenient access to common application
 * logic such as pubsub* and ajax
 */
define([ "./base", "../pubsub/hub", "../pubsub/topic", "deferred" ], function GadgetModule(Component, hub, Topic, Deferred) {
	var PUBLISH = hub.publish;
	var SUBSCRIBE = hub.subscribe;
	var UNSUBSCRIBE = hub.unsubscribe;

	return Component.extend({
		/**
		 * Calls hub.publish in self context
		 * @returns self
		 */
		publish : function publish() {
			var self = this;

			PUBLISH.apply(hub, arguments);

			return self;
		},

		/**
		 * Calls hub.subscribe in self context
		 * @returns self
		 */
		subscribe : function subscribe() {
			var self = this;

			SUBSCRIBE.apply(hub, arguments);

			return self;
		},

		/**
		 * Calls hub.unsubscribe in self context
		 * @returns self
		 */
		unsubscribe : function unsubscribe() {
			var self = this;

			UNSUBSCRIBE.apply(hub, arguments);

			return self;
		},

		/**
		 * Dispatches call to ajax module
		 * @param setting (Object or URL) Ajax settings
		 * @param deferred (Deferred)
		 * @returns self
		 */
		ajax : function ajax(setting, deferred) {
			var self = this;

			self.publish(new Topic("app/ajax", self), setting, deferred);

			return self;
		}
	});
});
