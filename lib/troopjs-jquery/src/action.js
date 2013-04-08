/**
 * TroopJS jquery/action
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "jquery", "troopjs-utils/getargs" ], function ActionModule($, getargs) {
	/*jshint strict:false, smarttabs:true, laxbreak:true */

	var UNDEFINED;
	var FALSE = false;
	var NULL = null;
	var SLICE = Array.prototype.slice;
	var ACTION = "action";
	var ORIGINALEVENT = "originalEvent";
	var RE_ACTION = /^([\w\d\s_\-\/]+)(?:\.([\w\.]+))?(?:\((.*)\))?$/;
	var RE_DOT = /\.+/;

	/**
	 * Namespace iterator
	 * @param namespace (string) namespace
	 * @param index (number) index
	 */
	function namespaceIterator(namespace, index) {
		return namespace ? namespace + "." + ACTION : NULL;
	}

	/**
	 * Action handler
	 * @param $event (jQuery.Event) event
	 */
	function onAction($event) {
		// Set $target
		var $target = $(this);
		// Get argv
		var argv = SLICE.call(arguments, 1);
		// Extract type
		var type = ORIGINALEVENT in $event
			? $event[ORIGINALEVENT].type
			: ACTION;
		// Extract name
		var name = $event[ACTION];

		// Reset $event.type
		$event.type = ACTION + "/" + name + "." + type;

		// Trigger 'ACTION/{name}.{type}'
		$target.trigger($event, argv);

		// No handler, try without namespace, but exclusive
		if ($event.result !== FALSE) {
			// Reset $event.type
			$event.type = ACTION + "/" + name + "!";

			// Trigger 'ACTION/{name}'
			$target.trigger($event, argv);

			// Still no handler, try generic action with namespace
			if ($event.result !== FALSE) {
				// Reset $event.type
				$event.type = ACTION + "." + type;

				// Trigger 'ACTION.{type}'
				$target.trigger($event, argv);
			}
		}
	}

	/**
	 * Internal handler
	 * 
	 * @param $event jQuery event
	 */
	function handler($event) {
		// Get closest element that has an action defined
		var $target = $($event.target).closest("[data-action]");

		// Fail fast if there is no action available
		if ($target.length === 0) {
			return;
		}

		// Extract all data in one go
		var $data = $target.data();
		// Extract matches from 'data-action'
		var matches = RE_ACTION.exec($data[ACTION]);

		// Return fast if action parameter was f*cked (no matches)
		if (matches === NULL) {
			return;
		}

		// Extract action name
		var name = matches[1];
		// Extract action namespaces
		var namespaces = matches[2];
		// Extract action args
		var args = matches[3];

		// If there are action namespaces, make sure we're only triggering action on applicable types
		if (namespaces !== UNDEFINED && !RegExp(namespaces.split(RE_DOT).join("|")).test($event.type)) {
			return;
		}

		// Split args by separator (if there were args)
		var argv = args !== UNDEFINED
			? getargs.call(args)
			: [];

		// Iterate argv to determine arg type
		$.each(argv, function argsIterator(i, value) {
			if (value in $data) {
				argv[i] = $data[value];
			}
		});

		$target
			// Trigger exclusive ACTION event
			.trigger($.Event($event, {
				type: ACTION + "!",
				action: name
			}), argv);

		// Since we've translated the event, stop propagation
		$event.stopPropagation();
	}

	$.event.special[ACTION] = {
		/**
		 * @param data (Anything) Whatever eventData (optional) was passed in
		 *        when binding the event.
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 * @param eventHandle (Function) The actual function that will be bound
		 *        to the browser’s native event (this is used internally for the
		 *        beforeunload event, you’ll never use it).
		 */
		setup : function onActionSetup(data, namespaces, eventHandle) {
			$(this).bind(ACTION, data, onAction);
		},

		/**
		 * Do something each time an event handler is bound to a particular element
		 * @param handleObj (Object)
		 */
		add : function onActionAdd(handleObj) {
			var events = $.map(handleObj.namespace.split(RE_DOT), namespaceIterator);

			if (events.length !== 0) {
				$(this).bind(events.join(" "), handler);
			}
		},

		/**
		 * Do something each time an event handler is unbound from a particular element
		 * @param handleObj (Object)
		 */
		remove : function onActionRemove(handleObj) {
			var events = $.map(handleObj.namespace.split(RE_DOT), namespaceIterator);

			if (events.length !== 0) {
				$(this).unbind(events.join(" "), handler);
			}
		},

		/**
		 * @param namespaces (Array) An array of namespaces specified when
		 *        binding the event.
		 */
		teardown : function onActionTeardown(namespaces) {
			$(this).unbind(ACTION, onAction);
		}
	};

	$.fn[ACTION] = function action(name) {
		return $(this).trigger({
			type: ACTION + "!",
			action: name
		}, SLICE.call(arguments, 1));
	};
});
