/**
 * TroopJS requirejs/template
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Parts of code from require-cs 0.4.0+ Copyright (c) 2010-2011, The Dojo Foundation
 */
define(function TemplateModule() {
	"use strict";

	/*jshint rhino:true, node:true, wsh:true*/
	var FACTORIES = {
		"node" : function () {
			// Using special require.nodeRequire, something added by r.js.
			var fs = require.nodeRequire("fs");

			return function fetchText(path, callback) {
				var file = fs.readFileSync(path, "utf8");
				//Remove BOM (Byte Mark Order) from utf8 files if it is there.
				if (file.indexOf("\uFEFF") === 0) {
					file = file.substring(1);
				}
				callback(file);
			};
		},

		"browser" : function () {
			/*jshint nonew:false, loopfunc:true*/
			// Would love to dump the ActiveX crap in here. Need IE 6 to die first.
			var progIds = [ "Msxml2.XMLHTTP", "Microsoft.XMLHTTP", "Msxml2.XMLHTTP.4.0"];
			var progId;
			var XHR;
			var i;

			if (typeof XMLHttpRequest !== "undefined") {
				XHR = XMLHttpRequest;
			}
			else {
				for (i = 0; i < 3; i++) {
					progId = progIds[i];

					try {
						new ActiveXObject(progId);
						XHR = function(){
							return new ActiveXObject(progId);
						};
						break;
					}
					catch (e) {
					}
				}

				if (!XHR){
					throw new Error("XHR: XMLHttpRequest not available");
				}
			}

			return function fetchText(url, callback) {
				var xhr = new XHR();
				xhr.open("GET", url, true);
				xhr.onreadystatechange = function () {
					// Do not explicitly handle errors, those should be
					// visible via console output in the browser.
					if (xhr.readyState === 4) {
						callback(xhr.responseText);
					}
				};
				xhr.send(null);
			};
		},

		"rhino" : function () {
			var encoding = "utf-8";
			var lineSeparator = java.lang.System.getProperty("line.separator");

			// Why Java, why is this so awkward?
			return function fetchText(path, callback) {
				var file = new java.io.File(path);
				var input = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(file), encoding));
				var stringBuffer = new java.lang.StringBuffer();
				var line;
				var content = "";

				try {
					line = input.readLine();

					// Byte Order Mark (BOM) - The Unicode Standard, version 3.0, page 324
					// http://www.unicode.org/faq/utf_bom.html

					// Note that when we use utf-8, the BOM should appear as "EF BB BF", but it doesn't due to this bug in the JDK:
					// http://bugs.sun.com/bugdatabase/view_bug.do?bug_id=4508058
					if (line && line.length() && line.charAt(0) === 0xfeff) {
						// Eat the BOM, since we've already found the encoding on this file,
						// and we plan to concatenating this buffer with others; the BOM should
						// only appear at the top of a file.
						line = line.substring(1);
					}

					stringBuffer.append(line);

					while ((line = input.readLine()) !== null) {
						stringBuffer.append(lineSeparator);
						stringBuffer.append(line);
					}
					// Make sure we return a JavaScript string and not a Java string.
					content = String(stringBuffer.toString()); // String
				} finally {
					input.close();
				}

				callback(content);
			};
		},

		"borked" : function () {
			return function fetchText() {
				throw new Error("Environment unsupported.");
			};
		}
	};

	var RE_SANITIZE = /^[\n\t\r]+|[\n\t\r]+$/g;
	var RE_BLOCK = /<%(=)?([\S\s]*?)%>/g;
	var RE_TOKENS = /<%(\d+)%>/gm;
	var RE_REPLACE = /(["\n\t\r])/gm;
	var RE_CLEAN = /o \+= "";| \+ ""/gm;
	var EMPTY = "";
	var REPLACE = {
		"\"" : "\\\"",
		"\n" : "\\n",
		"\t" : "\\t",
		"\r" : "\\r"
	};

	/**
	 * Compiles template
	 *
	 * @param body Template body
	 * @returns {String}
	 */
	function compile(body) {
		var blocks = [];
		var length = 0;

		function blocksTokens(original, prefix, block) {
			blocks[length] = prefix
				? "\" +" + block + "+ \""
				: "\";" + block + "o += \"";
			return "<%" + String(length++) + "%>";
		}

		function tokensBlocks(original, token) {
			return blocks[token];
		}

		function replace(original, token) {
			return REPLACE[token] || token;
		}

		return ("function template(data) { var o = \""
		// Sanitize body before we start templating
		+ body.replace(RE_SANITIZE, "")

		// Replace script blocks with tokens
		.replace(RE_BLOCK, blocksTokens)

		// Replace unwanted tokens
		.replace(RE_REPLACE, replace)

		// Replace tokens with script blocks
		.replace(RE_TOKENS, tokensBlocks)

		+ "\"; return o; }")

		// Clean
		.replace(RE_CLEAN, EMPTY);
	}

	var buildMap = {};
	var fetchText = FACTORIES[ typeof process !== "undefined" && process.versions && !!process.versions.node
		? "node"
		: (typeof window !== "undefined" && window.navigator && window.document) || typeof importScripts !== "undefined"
			? "browser"
			: typeof Packages !== "undefined"
				? "rhino"
				: "borked" ]();

	return {
		load: function (name, parentRequire, load, config) {
			var path = parentRequire.toUrl(name);

			fetchText(path, function (text) {
				try {
					text = "define(function() { return " + compile(text, name, path, config.template) + "; })";
				}
				catch (err) {
					err.message = "In " + path + ", " + err.message;
					throw(err);
				}

				if (config.isBuild) {
					buildMap[name] = text;
				}

				// IE with conditional comments on cannot handle the
				// sourceURL trick, so skip it if enabled
				/*@if (@_jscript) @else @*/
				else {
					text += "\n//@ sourceURL='" + path +"'";
				}
				/*@end@*/

				load.fromText(name, text);

				// Give result to load. Need to wait until the module
				// is fully parse, which will happen after this
				// execution.
				parentRequire([name], function (value) {
					load(value);
				});
			});
		},

		write: function (pluginName, name, write) {
			if (buildMap.hasOwnProperty(name)) {
				write.asModule(pluginName + "!" + name, buildMap[name]);
			}
		}
	};
});
