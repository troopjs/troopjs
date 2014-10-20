/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([ "module", "main" ], function(module, main) {
	// List of current sub module names.
	var MODULE_NAMES = [ "compose", "core", "dom" ];

	var base = module.uri + "/../bower_components";
	var packages = [];
	for (var i = 0, name, module, length = MODULE_NAMES.length;
		name = MODULE_NAMES[ i ], i < length; i++) {
		module = "troopjs-" + name;
		packages.push({
			"name": module,
			"location": base + "/" + module
		});
	}

	var config = { "packages": packages }, moduleCfg = module.config();

	// Enter the appropriate require context when necessary.
	if (moduleCfg.context)
		config["context"] = moduleCfg.context;

	// Append sub module packages definition to 2.0 context.
	require.config(config);

	return main;
});
