require.config({
	baseUrl : (buster.env.contextPath || "") + "src",
	paths : {
		"jquery" : "../resources/jquery/dist/jquery",
		"compose" : "lib/composejs/compose",
		"troopjs-core" : "lib/troopjs-core/src",
		"troopjs-utils" : "lib/troopjs-utils/src",
		"troopjs-jquery" : "lib/troopjs-jquery/src",
		"troopjs-requirejs" : "lib/troopjs-requirejs/src"
	}
});