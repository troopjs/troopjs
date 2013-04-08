/**
 * TroopJS core/pubsub/hub
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "../event/emitter" ], function HubModule(Emitter) {
	/*jshint strict:false */

	var COMPONENT_PROTOTYPE = Emitter.prototype;

	return Emitter.create({
		"displayName": "core/pubsub/hub",
		"subscribe" : COMPONENT_PROTOTYPE.on,
		"unsubscribe" : COMPONENT_PROTOTYPE.off,
		"publish" : COMPONENT_PROTOTYPE.emit,
		"republish" : COMPONENT_PROTOTYPE.reemit
	});
});
