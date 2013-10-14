## Contribution to the Docs

### How does it work

 1. We're generating the entire docs, from the source code and markdown files (including but not limited to README.md), so NO EXTERNAL docs should be involved.
 2. [JSDuck](https://github.com/senchalabs/jsduck/) is used as the documentation tool, which is by far the best from the result that we can get, consult to [JSDuck Manual](https://github.com/senchalabs/jsduck/wiki/_pages) for usages.
 3. The docs will be living in a central place which is nothing more than a static site, publicly available on api.troopjs.com (later).
 4. Documentation for each TroopJS module lives in their own repo, which are later pulls by the bundle when building docs, so NO MODULE docs should be included in the bundle.

### How to contribute

The following steps are for your contribution to take place:
 * Checkout the TroopJS bundle project:

 ```bash
 	> git clone git@github.com:troopjs/troopjs.git
 ```
 * Install from Bower any TroopJS module that you'd like to involve, e.g.:

 ```bash
 	> cd troopjs
 	> bower install troopjs-core
 ```

 * Github fork the TroopJS module repo that you'd like to contribute to,
 clone it and check out the "feature/docs" branch:

 ```bash
 	> git clone git@github.com:{you}/troopjs-core.git
 	> git checkout feature/docs
 ```

 * Now **link** the bower component of the root bundle, to your corresponding local repository:
 ```bash
 	> cd troopjs-core
 	> bower link
 	> cd ../troopjs
 	> bower link troopjs-core
 ```
 * Make your modification to your module's sources and markdowns.
 * Build the docs for verification

 ```bash
 	> # Install JSDuck if necessary.
 	> gem install jsduck
 	> grunt docs
 ```

 * Navigate to where your troop bundle is served from, e.g.:

 ```bash
 	> open http://localhost/troopjs/dist/docs
 ```
 
 * Push your changes and send a pull request from your **docs** branch to the same branch of the TroopJS module.
