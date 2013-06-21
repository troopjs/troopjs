/**
 * TroopJS browser/route/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../component/widget", "./uri", "troopjs-jquery/hashchange" ], function RouteWidgetModule(Widget, URI) {
	"use strict";
	var $ELEMENT = "$element";
	var HASHCHANGE = "hashchange";
	var ROUTE = "route";
	var RE = /^#/;

	function onHashChange($event) {
		var self = $event.data;

		// Create URI
		var uri = URI($event.target.location.hash.replace(RE, ""));

		// Convert to string
		var route = uri.toString();

		// Did anything change?
		if (route !== self[ROUTE]) {
			// Store new value
			self[ROUTE] = route;

			// Publish route
			self.publish(self.displayName, uri, $event);
		}
	}

	return Widget.extend({
		"displayName" :"browser/route/widget",

		"sig/initialize" : function initialize() {
			var self = this;

			self[$ELEMENT].on(HASHCHANGE, self, onHashChange);
		},

		"sig/start" : function start() {
			this[$ELEMENT].trigger(HASHCHANGE);
		},

		"sig/finalize" : function finalize() {
			this[$ELEMENT].off(HASHCHANGE, onHashChange);
		}
	});
});