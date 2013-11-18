# How to require TroopJS source bundle in AMD loader
TroopJS bundle along with its sub modules can be loaded by requireJS **from source** to ease the development when you want to debug TroopJS internals, rather than using the built version.

## Checkout TroopJS working copies
You need to checkout all working copies of all TroopJS bundle and modules which will be loaded by requireJS individually:

```bash
cd $workspace
git clone git@github.com:troopjs/troopjs.git
```
Repeat the above for all sub modules as well:
 - [troopjs-core](git@github.com:troopjs/troopjs-core.git)
 - [troopjs-browser](git@github.com:troopjs/troopjs-browser.git)
 - [troopjs-data](git@github.com:troopjs/troopjs-data.git)
 - [troopjs-jquery](git@github.com:troopjs/troopjs-jquery.git)
 - [troopjs-requirejs](git@github.com:troopjs/troopjs-requirejs.git)
 - [troopjs-utils](git@github.com:troopjs/troopjs-utils.git)

## Install/Link sub modules in TroopJS bundle
All sub modules are installed as bower components in troopjs bundle:

```bash
cd troopjs
bower install
```
Now all modules are installed from bower registry with versions specified in bundle's bower.json file.

You may want to run module code from an unpublished branch, in that case you'll need to bower **link** individual module to the working copy that you've just checked out above:

```bash
cd troopjs-data
bower link
cd ../troopjs
bower link troopjs-data
```

## Checkout module branch

Make sure each of the modules that are linked with the correct branch that your app expects, this can be verified with `bower list`.

```bash
cd troopjs-data
git checkout support/2.0.x
cd ../troopjs
bower list
```

## Make your require config.js use troopjs-bundle

Depending on what your requireJS config file looks like, you should register the troopjs-bundle as AMD **package** inside of it:

```bash
require.config({
	"packages": [
		{
			"name": "troopjs",
			"location": "[where your troopjs bundle resides]"
		}
	]
});
```

If you have defined any requirejs **context** in your application, you'll need to inform the troopjs-bundle as well:

````bash
require.config({
	"context": "my-context",
	"packages": [
		{
			"name": "troopjs",
			"location": "[where your troopjs bundle resides]"
		}
	],
	config: {
		"troopjs": {
			"context": "my-context"
		}
	}
});
```

# Done! You should be loading TroopJS source now.