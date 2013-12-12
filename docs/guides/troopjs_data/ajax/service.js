/**
 * TroopJS data/ajax/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"troopjs-core/component/service",
	"jquery",
	"troopjs-utils/merge"
], function (Service, $, merge) {
	"use strict";

	return Service.extend({
		"displayName" : "data/ajax/service",

		"hub/ajax" : function ajax(settings) {
			// Request
			return $.ajax(merge.call({
				"headers": {
					"x-request-id": new Date().getTime()
				}
			}, settings));
		}
	});
});