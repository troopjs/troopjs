#!/usr/bin/env node
require('shelljs/global');

// Check for test module dependencies.
var MODULES = 'buster phantomjs';
var deps = MODULES.split(' ');
var installed = {};

try {
	deps.forEach(function(dep) {
		installed[dep] = require.resolve(dep);
	});
}
catch (e) {
	exec('npm install ' + deps.filter(function(dep) {
		return !installed[dep];
	}).join(' '));
}




