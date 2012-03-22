({
	"baseUrl": "../src/",
	"paths" : {
		"config": "empty:",
		"json" : "lib/jsonjs/json2",
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
	],

	"out": "../dist/troopjs-bundle-minimal.js"
})
