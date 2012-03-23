({
	"baseUrl": "../src/",
	"paths" : {
		"config": "empty:",
		"jquery" : "lib/jquery/dist/jquery",
		"compose" : "lib/composejs/compose",
		"deferred" : "lib/troopjs-jquery/src/deferred",
		"text" : "lib/requirejs/text",
		"template" : "lib/troopjs-requirejs/src/template",
		"troopjs" : "lib/troopjs/src",
		"troopjs-jquery" : "lib/troopjs-jquery/src"
	},

	"include" : [
		"troopjs/component/base",
		"troopjs/component/gadget",
		"troopjs/component/widget",
		"troopjs/pubsub/hub",
		"troopjs/pubsub/topic",
		"troopjs/remote/ajax",
		"troopjs/store/base",
		"troopjs/store/local",
		"troopjs/store/session",
		"troopjs-jquery/action",
		"troopjs-jquery/deferred",
		"troopjs-jquery/destroy",
		"troopjs-jquery/dimensions",
		"troopjs-jquery/hashchange",
		"troopjs-jquery/weave",
		"troopjs-jquery/wire",
		"template"
	],

	"out": "../dist/troopjs-bundle-maxi.js"
})
