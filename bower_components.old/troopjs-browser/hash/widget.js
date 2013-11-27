/**
 * TroopJS browser/hash/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"../component/widget",
	"troopjs-core/net/uri",
	"troopjs-jquery/hashchange"
], function (Widget, URI) {
	"use strict";

	var $ELEMENT = "$element";
	var HASH = "_hash";
	var RE = /^#/;

	return Widget.extend({
		"displayName" : "browser/hash/widget",

		"sig/start" : function () {
			this[$ELEMENT].trigger("hashchange");
		},

		"dom/hashchange" : function ($event) {
			var me = this;
			var $element = me[$ELEMENT];

			// Create URI
			var uri = URI($element.get(0).location.hash.replace(RE, ""));

			// Convert to string
			var hash = uri.toString();

			// Did anything change?
			if (hash !== me[HASH]) {
				// Store new value
				me[HASH] = hash;

				// Retrigger URICHANGE event
				$element.trigger("urichange", [ uri ]);
			}
			else {
				// Prevent further hashchange handlers from receiving this
				$event.stopImmediatePropagation()
			}
		},

		"dom/hashset" : function ($event, uri, silent) {
			var me = this;
			var hash = uri.toString();

			if (silent === true) {
				me[HASH] = hash;
			}

			me[$ELEMENT].get(0).location.hash = hash;
		}
	});
});