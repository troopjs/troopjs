/**
 * TroopJS browser/ajax/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "troopjs-core/component/service", "jquery", "troopjs-utils/merge", "when" ], function AjaxModule(Service, $, merge, when) {
	"use strict";

	var ARRAY_SLICE = Array.prototype.slice;

	return Service.extend({
		"displayName" : "browser/ajax/service",

		"hub/ajax" : function ajax(settings) {
			// Request
			var request = $.ajax(merge.call({
				"headers": {
					"x-request-id": new Date().getTime()
				}
			}, settings));

			// Wrap and return
			return when(request, function () {
				return ARRAY_SLICE.call(arguments);
			});
		}
	});
});