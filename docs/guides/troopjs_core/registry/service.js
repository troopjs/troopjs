/*
 * TroopJS core/registry/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../component/service", "poly/object", "poly/array" ], function RegistryServiceModule(Service) {
	"use strict";

	/**
	 * A special {@link core.component.service service} presents the registry table for all
	 * other services across the application.
	 *
	 * 	// Upon instantiation this service is registered.
	 * 	Service.create({
	 *
	 * 		// This will be the service key.
	 * 		displayName: "my/provided",
	 *
	 * 		// Provide actual services on hub.
	 * 		"hub/my/provided/service" : function() {
	 * 			// Do some dirty lift.
	 * 		}
	 * 	});
	 *
	 * 	// Now we can look for it in registry.
	 * 	var service = registry.get("my/provided")[0];
	 *
	 * @class core.registry.service
	 * @extends core.component.service
	 */

	var SERVICES = "services";

	return Service.extend(function RegistryService() {
		var me = this;

		me[SERVICES] = {};

		me.add(me);
	},{
		"displayName" : "core/registry/service",

		/**
		 * Register a service.
		 * @param {core.component.service} service
		 */
		"add" : function add(service) {
			this[SERVICES][service.toString()] = service;
		},

		/**
		 * Remove a service from the registry.
		 * @param {core.component.service} service
		 */
		"remove": function remove(service) {
			delete this[SERVICES][service.toString()];
		},

		/**
		 * Find registered service(s) by service name.
		 * @param {String} pattern Regexp that matches the service name.
		 * @returns {Array|null}
		 */
		"get" : function get(pattern) {
			var re = new RegExp(pattern);
			var services = this[SERVICES];

			return Object.keys(services)
				.filter(function filter(serviceName) {
					return re.test(serviceName);
				})
				.map(function map(serviceName) {
					return services[serviceName];
				});
		},

		/**
		 * Hub event for adding service.
		 * @event
		 * @param {core.component.service} service
		 * @returns {Mixed}
		 */
		"hub/registry/add" : function onAdd(service) {
			return this.add(service);
		},

		/**
		 * Hub event for removing service.
		 * @event
		 * @param {core.component.service} service
		 * @returns {Mixed}
		 */
		"hub/registry/remove" : function onRemove(service) {
			return this.remove(service);
		},

		/**
		 * Hub event for finding service(s).
		 * @event
		 * @param {String} pattern
		 * @returns {Mixed}
		 */
		"hub/registry/get" : function onGet(pattern) {
			return this.get(pattern);
		}
	});
});