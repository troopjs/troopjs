SRC=../src
DIST := ../dist
R := lib/rjs/dist/r.js

# Core services
TROOPJS-CORE := template \
	troopjs-core/remote/ajax \
	troopjs-core/route/router \
	troopjs-core/store/local \
	troopjs-core/store/session \
	troopjs-core/dimensions/service \
	troopjs-core/route/router \
	troopjs-core/route/placeholder \
	troopjs-core/widget/application \
	troopjs-core/widget/sandbox \
	troopjs-core/util/each \
	troopjs-core/util/grep \
	troopjs-core/util/merge \
	troopjs-core/util/tr \
	troopjs-core/util/unique \
	troopjs-core/util/when

# jQuery plugins
TROOPJS-JQUERY := troopjs-jquery/action \
	troopjs-jquery/destroy \
	troopjs-jquery/resize \
	troopjs-jquery/dimensions \
	troopjs-jquery/hashchange \
	troopjs-jquery/weave

#  All modules
INCLUDE := $(TROOPJS-CORE) $(TROOPJS-JQUERY)

# A literal comma
comma :=,

# A literal space
space :=
space +=

# Joins elements of the list in arg 2 with the given separator
#   1. Element separator
#   2. The list
join-with = $(subst $(space),$1,$(strip $2))

all: prepare js

clean:
	@@echo "Removing" $(DIST)
	@@rm -rf $(DIST)

prepare:
	@@echo "Creating" $(DIST)
	@@mkdir -p $(DIST)

js: prepare
	@@echo "Compiling JS"
	@@node $(R) -o \
		out=$(DIST)/troopjs-bundle.js \
		baseUrl=$(SRC) \
		paths.jquery=empty: \
		paths.compose=lib/composejs/compose \
		paths.config=empty: \
		paths.troopjs-core=lib/troopjs-core/src \
		paths.troopjs-jquery=lib/troopjs-jquery/src \
		paths.template=lib/troopjs-requirejs/src/template \
		paths.deferred=lib/troopjs-jquery/src/deferred \
		include=$(call join-with,$(comma),$(INCLUDE)) \
		optimize=none

.PHONY: all clean
