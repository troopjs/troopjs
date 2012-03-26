({
	"baseUrl" : "../src/",
	"paths" : {
		"compose" : "lib/composejs/compose",
		"config": "empty:",
		"deferred" : "lib/troopjs-jquery/src/deferred",
		"jquery" : "empty:",
		"template" : "lib/troopjs-requirejs/src/template",
		"text" : "lib/requirejs/text",
		"troopjs-core" : "lib/troopjs-core/src",
		"troopjs-jquery" : "lib/troopjs-jquery/src"
	},

	"include" : [
		"troopjs-core/component/base",
		"troopjs-core/component/gadget",
		"troopjs-core/component/widget",
		"troopjs-core/pubsub/hub",
		"troopjs-core/pubsub/topic",
		"troopjs-core/remote/ajax",
		"troopjs-core/store/base",
		"troopjs-core/store/local",
		"troopjs-core/store/session",
		"troopjs-jquery/action",
		"troopjs-jquery/deferred",
		"troopjs-jquery/destroy",
		"troopjs-jquery/dimensions",
		"troopjs-jquery/hashchange",
		"troopjs-jquery/weave",
		"troopjs-jquery/wire",
		"template"
	],

	"out": "../dist/troopjs-bundle.js"
})
