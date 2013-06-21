/**
 * TroopJS core/registry/service
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "../component/service", "poly/object", "poly/array" ], function RegistryServiceModule(Service) {
	"use strict";

	var SERVICES = "services";

	return Service.extend(function RegistryService() {
		var self = this;

		self[SERVICES] = {};

		self.add(self);
	},{
		"displayName" : "core/registry/service",

		"add" : function add(service) {
			this[SERVICES][service.toString()] = service;
		},

		"remove": function remove(service) {
			delete this[SERVICES][service.toString()];
		},

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

		"hub/registry/add" : function onAdd(service) {
			return this.add(service);
		},

		"hub/registry/remove" : function onRemove(service) {
			return this.remove(service);
		},

		"hub/registry/get" : function onGet(pattern) {
			return this.get(pattern);
		}
	});
});