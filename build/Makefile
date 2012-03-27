DIST := ../dist

all: js

clean:
	@@echo "Removing" $(DIST)
	@@rm -rf $(DIST)

js:
	@@echo "Compiling JS"
	@@node lib/rjs/dist/r.js -o \
		out=../dist/troopjs-bundle.js \
		baseUrl=../src/ \
		paths.compose=lib/composejs/compose \
		paths.config=empty: \
		paths.deferred=lib/troopjs-jquery/src/deferred \
		paths.jquery=empty: \
		paths.template=lib/troopjs-requirejs/src/template \
		paths.text=lib/requirejs/text \
		paths.troopjs-core=lib/troopjs-core/src \
		paths.troopjs-jquery=lib/troopjs-jquery/src \
		include=troopjs-core/component/base,troopjs-core/component/gadget,troopjs-core/component/widget,troopjs-core/pubsub/hub,troopjs-core/pubsub/topic,troopjs-core/remote/ajax,troopjs-core/store/base,troopjs-core/store/local,troopjs-core/store/session,troopjs-jquery/action,troopjs-jquery/deferred,troopjs-jquery/destroy,troopjs-jquery/dimensions,troopjs-jquery/hashchange,troopjs-jquery/weave,troopjs-jquery/wire,template \
		optimize=none

.PHONY: all clean
