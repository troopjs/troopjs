/*!
 * TroopJS base component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * The base trait provides functionality for instance counting
 * and a default 'toString' method.
 */
define([ "compose", "config" ], function ComponentModule(Compose, config) {
	var COUNT = 0;

	return Compose(function Component() {
		this.instanceCount = COUNT++;
	}, {
		/**
		 * Application configuration
		 */
		config : config,

		// Require compositions to provide a displayName
		displayName : Compose.required,

		/**
		 * Generates string representation of this object
		 * @returns Combination displayName and instanceCount
		 */
		toString : function toString() {
			var self = this;

			return self.displayName + "@" + self.instanceCount;
		}
	});
});
