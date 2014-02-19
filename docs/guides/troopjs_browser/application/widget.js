/*
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "module", "../component/widget", "when", "troopjs-core/registry/service", "poly/array" ], function ApplicationWidgetModule(module, Widget, when, RegistryService) {
	"use strict";

	var UNDEFINED;
	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var REGISTRY = "registry";

	/*
	 * Forwards _signal to components
	 * @private
	 * @param {String} _signal Signal to forward
	 * @param {Array} _args Signal arguments
	 * @return {Promise} promise of next handler callback execution
	 */
	function forward(_signal, _args) {
		/*jshint validthis:true*/
		var me = this;
		var args = [ _signal ];
		var components = me[REGISTRY].get();
		var componentsCount = 0;
		var results = [];
		var resultsCount = 0;

		ARRAY_PUSH.apply(args, _args);

		var next = function (result, skip) {
			var component;

			if (skip !== true) {
				results[resultsCount++] = result;
			}

			return (component = components[componentsCount++]) !== UNDEFINED
				? when(component.signal.apply(component, args), next)
				: when.resolve(results);
		};

		return next(UNDEFINED, true);
	}

	/**
	 * The application widget serves as top-most page component
	 * that bootstrap all other components registered.
	 * @class browser.application.widget
	 */
	return Widget.extend(function ApplicationWidget() {
		// Create registry
		var registry = this[REGISTRY] = RegistryService();

		// TODO only register _services_
		// Slice and iterate arguments
		ARRAY_SLICE.call(arguments, 2).forEach(function (component) {
			// Register component
			registry.add(component);
		});
	}, {
		"displayName" : "browser/application/widget",

		"sig/initialize" : function onInitialize() {
			return forward.call(this, "initialize", arguments);
		},

		"sig/start" : function onStart() {
			var me = this;
			var args = arguments;

			return forward.call(me, "start", args).then(function started() {
				return me.weave.apply(me, args);
			});
		},

		"sig/stop" : function onStop() {
			var me = this;
			var args = arguments;

			return me.unweave.apply(me, args).then(function stopped() {
				return forward.call(me, "stop", args);
			});
		},

		"sig/finalize" : function onFinalize() {
			return forward.call(this, "finalize", arguments);
		}
	});
});