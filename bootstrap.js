/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "module", "require", "./version" ], function (module, localRequire, version) {

	// Let `contexts` be `require.s.contexts`
	var contexts = require.s.contexts;

	// Find the name of our context
	var contextName = Object
		.keys(contexts)
		.reduce(function (result, name) {
			var context = contexts[name];

			return context.defined["troopjs/version"] === version
				? name
				: result;
		}, "_");

	// Let `contextConfig` be `contexts[contextName].config`
	var contextConfig = contexts[contextName].config;

	// Calculate `path`
	var path = localRequire
		.toUrl(module.id)
		.replace(module.id, "")
		.replace(contextConfig.baseUrl, "");

	// Update configuration
	require.config({
		"context": contextName,
		"packages": ["compose", "core", "dom", "log"].map(function (name) {
			name = "troopjs-" + name;

			return {
				"name": name,
				"location": path + name
			}
		})
	});

	// Return `version`
	return version;
});