/**
 * TroopJS browser/application/widget
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "module", "../component/widget", "when", "troopjs-core/registry/service", "poly/array" ], function ApplicationWidgetModule(module, Widget, when, RegistryService) {
	/*jshint laxbreak:true */

	var ARRAY_PROTO = Array.prototype;
	var ARRAY_SLICE = ARRAY_PROTO.slice;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var REGISTRY = "registry";

	/**
	 * Forwards _signal to components
	 * @private
	 * @param {String} _signal Signal to forward
	 * @param {Array} _args Signal arguments
	 * @returns {Function}
	 */
	function forward(_signal, _args) {
		var self = this;
		var signal = self.signal;
		var args = [ _signal ];
		var components = self[REGISTRY].get();
		var index = 0;

		ARRAY_PUSH.apply(args, _args);

		var next = function () {
			var component;

			return (component = components[index++])
				? when(signal.apply(component, args), next)
				: when.resolve(_args);
		};

		return next();
	}

	return Widget.extend(function ApplicationWidget() {
		// Create registry
		var registry = this[REGISTRY] = RegistryService();

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
			var self = this;
			var weave = self.weave;
			var args = arguments;

			return forward.call(self, "start", args).then(function started() {
				return weave.apply(self, args);
			});
		},

		"sig/stop" : function onStop() {
			var self = this;
			var unweave = self.unweave;
			var args = arguments;

			return unweave.apply(self, args).then(function stopped() {
				return forward.call(self, "stop", args);
			});
		},

		"sig/finalize" : function onFinalize() {
			return forward.call(this, "finalize", arguments);
		}
	});
});