/*
 * TroopJS browser/mvc/route/widget module
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../../component/widget" ], function (Widget) {
	"use strict";

	var $ELEMENT = "$element";
	var DISPLAYNAME = "displayName";
	var SET = "/set";

	function setRoute(uri) {
		/* jshint validthis:true */
		this[$ELEMENT].trigger("hashset", [ uri ]);
	}

	return Widget.extend({
		"displayName" : "browser/mvc/route/widget",

		"sig/initialize" : function () {
			var me = this;

			me.subscribe(me[DISPLAYNAME] + SET, setRoute);
		},

		"sig/finalize" : function () {
			var me = this;

			me.unsubscribe(me[DISPLAYNAME] + SET, setRoute);
		},

		"dom/urichange" : function ($event, uri) {
			var me = this;

			me.publish(me[DISPLAYNAME], uri, $event);
		}
	});
});
