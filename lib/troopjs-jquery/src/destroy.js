/**
 * TroopJS jquery/destroy
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
/*global define:false */
define([ "jquery" ], function DestroyModule($) {
	/*jshint strict:false, smarttabs:true */

	var DESTROY = "destroy";

	$.event.special[DESTROY] = {
		"noBubble" : true,

		"trigger" : function () {
			return false;
		},

		"remove" : function onDestroyRemove(handleObj) {
			var self = this;

			if (handleObj) {
				handleObj.handler.call(self, $.Event({
					"type" : handleObj.type,
					"data" : handleObj.data,
					"namespace" : handleObj.namespace,
					"target" : self
				}));
			}
		}
	};
});
