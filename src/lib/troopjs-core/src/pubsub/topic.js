/*!
 * TroopJS pubsub/topic module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define([ "../component/base" ], function TopicModule(Component) {
	var ARRAY = Array;

	return Component.extend(function Topic(topic, publisher, parent) {
		var self = this;

		self.topic = topic;
		self.publisher = publisher;
		self.parent = parent;
	}, {
		displayName : "pubsub/topic",

		/**
		 * Generates string representation of this object
		 * @returns Instance topic
		 */
		toString : function toString() {
			return this.topic;
		},

		/**
		 * Traces topic origin to root
		 * @returns String representation of all topics traced down to root
		 */
		trace : function trace() {
			var current = this;
			var constructor = current.constructor;
			var parent;
			var item;
			var stack = "";
			var i;
			var iMax;

			while (current) {
				if (current.constructor === ARRAY) {
					for (i = 0, iMax = current.length; i < iMax; i++) {
						item = current[i];

						current[i] = item.constructor === constructor
							? item.trace()
							: item;
					}

					stack += current.join(",");
					break;
				}

				parent = current.parent;
				stack += parent
					? current.publisher + ":"
					: current.publisher;
				current = parent;
			}

			return stack;
		}
	});
});