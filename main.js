/**
 * @license MIT http://troopjs.mit-license.org/
 */
define([
	"./version",
	"troopjs-compose/decorator/after",
	"troopjs-compose/decorator/around",
	"troopjs-compose/decorator/before",
	"troopjs-compose/decorator/extend",
	"troopjs-compose/decorator/from",
	"troopjs-log/sink/console",
	"troopjs-log/sink/forward",
	"troopjs-log/sink/null",
	"troopjs-core/component/service",
	"troopjs-dom/application/widget",
	"troopjs-dom/loom/plugin"
], function (version) {
	return version;
});
