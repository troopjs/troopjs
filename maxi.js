define([
	"./mini",
	"troopjs-compose/decorator/after",
	"troopjs-compose/decorator/around",
	"troopjs-compose/decorator/before",
	"troopjs-compose/decorator/extend",
	"troopjs-compose/decorator/from",
	"troopjs-log/sink/console",
	"troopjs-log/sink/forward",
	"troopjs-log/sink/null",
	"troopjs-opt/pubsub/proxy/to1x",
	"troopjs-opt/pubsub/proxy/to2x",
	"troopjs-opt/route/gadget",
	"troopjs-opt/store/component",
	"troopjs-net/ajax/service",
	"troopjs-data/cache/component",
	"troopjs-data/cache/service",
	"troopjs-data/query/service",
	"troopjs-browser/hash/widget",
	"troopjs-browser/loom/plugin",
	"troopjs-jquery/noconflict",
	"troopjs-requirejs/multiversion",
	"troopjs-requirejs/shadow",
	"troopjs-requirejs/json"
], function (mini) {
	return mini;
});
