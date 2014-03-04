/*
 * TroopJS net/ajax/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"troopjs-core/component/service",
	"jquery",
	"troopjs-utils/merge"
], function (Service, $, merge) {
	"use strict";

	/**
	 * Provides ajax as a service
	 * @class net.ajax.service
	 * @extends core.component.service
	 */
	return Service.extend({
		"displayName" : "net/ajax/service",

		/**
		 * Make ajax request.
		 * @event
		 * @param settings
		 */
		"hub/ajax" : function ajax(settings) {
			// Request
			return $.ajax(merge.call({
				"headers": {
					"x-troopjs-request-id": new Date().getTime()
				}
			}, settings));
		}
	});
});
