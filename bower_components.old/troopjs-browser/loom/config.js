/**
 * TroopJS browser/loom/config
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([ "module", "troopjs-utils/merge" ], function LoomConfigModule(module, merge) {
	"use strict";

	return merge.call({
		"$warp" : "$warp",
		"$weft" : "$weft",
		"weave" : "data-weave",
		"unweave" : "data-unweave",
		"woven" : "data-woven"
	}, module.config());
});