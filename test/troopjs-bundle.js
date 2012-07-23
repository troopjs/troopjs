require.config({
	baseUrl : (buster.env.contextPath || "") + "src",
	paths : {
		"compose" : "lib/composejs/compose",
		"troopjs-core" : "lib/troopjs-core/src",
		"troopjs-jquery" : "lib/troopjs-jquery/src",
		"troopjs-requirejs" : "lib/troopjs-requirejs/src"
	}
});