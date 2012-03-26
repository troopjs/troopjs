/*!
 * TroopJS remote/ajax module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "compose", "../component/base", "../pubsub/topic", "../pubsub/hub", "jquery" ], function AjaxModule(Compose, Component, Topic, hub, $) {

	function request(topic, settings, deferred) {
		$.extend(true, settings, {
			"headers": {
				"x-my-request": new Date().getTime(),
				"x-my-component": topic.constructor === Topic ? topic.trace() : topic
			}
		});

		// Request
		$.ajax(settings).then(deferred.resolve, deferred.reject);
	}

	return Compose.create(Component, function Ajax() {
		hub.subscribe("hub/ajax", this, request);
	}, {
		displayName : "remote/ajax"
	});
});