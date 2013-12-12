/*globals buster:false*/
buster.testCase("troopjs-core/net/uri", function (run) {
	"use strict";

	var assert = buster.assert;

	require( [ "troopjs-core/net/uri" ] , function (URI) {
		run({
			"(empty)" : function () {
				var source = "";
				var uri = URI(source);

				assert.match(uri.toString(), source);
			},

			"http://" : function () {
				var source = "http://";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol : "http"
				});

				assert.same(uri.toString(), source);
			},

			"https://" : function() {
				var source = "https://";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol : "https"
				});

				assert.same(uri.toString(), source);
			},

			"http://host" : function () {
				var source = "http://host";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host",
					authority : "host"
				});

				assert.same(uri.toString(), source);
			},

			"http://host/" : function () {
				var source = "http://host/";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host",
					authority : "host",
					path : [ "" ]
				});

				assert.same(uri.toString(), source);
			},

			"http://host.com" : function () {
				var source = "http://host.com";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					authority : "host.com"
				});

				assert.same(uri.toString(), source);
			},

			"http://subdomain.host.com" : function () {
				var source = "http://subdomain.host.com";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "subdomain.host.com",
					authority : "subdomain.host.com"
				});

				assert.same(uri.toString(), source);
			},

			"http://host.com:81" : function () {
				var source = "http://host.com:81";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "host.com:81"
				});

				assert.same(uri.toString(), source);
			},

			"http://user@host.com" : function () {
				var source = "http://user@host.com";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					authority : "user@host.com",
					user : "user"
				});

				assert.same(uri.toString(), source);
			},

			"http://user@host.com:81" : function () {
				var source = "http://user@host.com:81";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user@host.com:81",
					user : "user"
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com" : function () {
				var source = "http://user:pass@host.com";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					authority : "user:pass@host.com",
					user : "user",
					password : "pass"
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81" : function () {
				var source = "http://user:pass@host.com:81";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass"
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81?query" : function () {
				var source = "http://user:pass@host.com:81?query";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					query : {
						query : ""
					}
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81#anchor" : function () {
				var source = "http://user:pass@host.com:81#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/" : function () {
				var source = "http://user:pass@host.com:81/";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "" ]
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/?query" : function () {
				var source = "http://user:pass@host.com:81/?query";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "" ],
					query : {
						query : ""
					}
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/#anchor" : function () {
				var source = "http://user:pass@host.com:81/#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "" ],
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/file.ext" : function () {
				var source = "http://user:pass@host.com:81/file.ext";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "file.ext" ]
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory" : function () {
				var source = "http://user:pass@host.com:81/directory";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory" ]
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory?query" : function () {
				var source = "http://user:pass@host.com:81/directory?query";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory" ],
					query : {
						query : ""
					}
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory#anchor" : function () {
				var source = "http://user:pass@host.com:81/directory#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory" ],
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory/#anchor" : function () {
				var source = "http://user:pass@host.com:81/directory/#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory", "" ],
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory/sub.directory/" : function () {
				var source = "http://user:pass@host.com:81/directory/sub.directory/";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory", "sub.directory", "" ]
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory/sub.directory/file.ext" : function () {
				var source = "http://user:pass@host.com:81/directory/sub.directory/file.ext";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory", "sub.directory", "file.ext" ]
				});

				assert.match(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory/file.ext?query" : function () {
				var source = "http://user:pass@host.com:81/directory/file.ext?query";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory", "file.ext" ],
					query : {
						query : ""
					}
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory/file.ext?query=1&test=2" : function () {
				var source = "http://user:pass@host.com:81/directory/file.ext?query=1&test=2";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory", "file.ext" ],
					query : {
						query : "1",
						test : "2"
					}
				});

				assert.same(uri.toString(), source);
			},

			"http://user:pass@host.com:81/directory/file.ext?query=1#anchor" : function () {
				var source = "http://user:pass@host.com:81/directory/file.ext?query=1#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol: "http",
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "pass",
					path : [ "", "directory", "file.ext" ],
					query : {
						query : "1"
					},
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"//&#47;&#47;host.com" : function () {
				var source = "//host.com";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					host : "host.com",
					authority : "host.com"
				});

				assert.same(uri.toString(), source);
			},

			"//&#47;&#47;user:pass@host.com:81/direc.tory/file.ext?query=1&test=2#anchor" : function () {
				var source = "//user:pass@host.com:81/direc.tory/file.ext?query=1&test=2#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					host : "host.com",
					port : 81,
					authority : "user:pass@host.com:81",
					user : "user",
					password : "password",
					path : [ "direc.tory", "file.ext" ],
					query : {
						query : "1",
						test : "2"
					},
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"/directory/sub.directory/file.ext?query=1&test=2#anchor" : function () {
				var source = "/directory/sub.directory/file.ext?query=1&test=2#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "", "directory", "sub.directory", "file.ext" ],
					query : {
						query : "1",
						test : "2"
					},
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"/directory/" : function () {
				var source = "/directory/";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "", "directory", "" ]
				});

				assert.same(uri.toString(), source);
			},

			"/file.ext" : function () {
				var source = "/file.ext";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "", "file.ext" ]
				});

				assert.same(uri.toString(), source);
			},

			"/?query" : function () {
				var source = "/?query";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "" ],
					query : {
						query : ""
					}
				});

				assert.same(uri.toString(), source);
			},

			"/?query=1&test=2#anchor" : function () {
				var source = "/?query=1&test=2#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "" ],
					query : {
						query : "1",
						test : "2"
					},
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"#anchor" : function () {
				var source = "#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"path/to/file" : function () {
				var source = "path/to/file";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "path", "to", "file" ]
				});

				assert.same(uri.toString(), source);
			},

			"localhost" : function () {
				var source = "localhost";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "localhost" ]
				});

				assert.same(uri.toString(), source);
			},

			"192.168.1.1" : function () {
				var source = "192.168.1.1";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "192.168.1.1" ]
				});

				assert.same(uri.toString(), source);
			},

			"host.com" : function () {
				var source = "host.com";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "host.com" ]
				});

				assert.same(uri.toString(), source);
			},

			"//host.com:81" : function () {
				var source = "host.com:81";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol : "host.com",
					path : [ "81" ]
				});

				assert.same(uri.toString(), source);
			},

			"//host.com:81/" : function () {
				var source = "host.com:81/";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol : "host.com",
					path : [ "81", "" ]
				});

				assert.same(uri.toString(), source);
			},

			"host.com?query" : function () {
				var source = "host.com?query";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "host.com" ],
					query : {
						query : ""
					}
				});

				assert.same(uri.toString(), source);
			},

			"host.com#anchor" : function () {
				var source = "host.com#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "host.com" ],
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"host.com/" : function () {
				var source = "host.com/";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "host.com", "" ]
				});

				assert.same(uri.toString(), source);
			},

			"host.com/file.ext" : function () {
				var source = "host.com/file.ext";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "host.com", "file.ext" ]
				});

				assert.same(uri.toString(), source);
			},

			"host.com/directory/?query" : function () {
				var source = "host.com/directory/?query";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "host.com", "directory", "" ],
					query : {
						query : ""
					}
				});

				assert.same(uri.toString(), source);
			},

			"host.com/directory/#anchor" : function () {
				var source = "host.com/directory/#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "host.com", "directory", "" ],
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"host.com/directory/file.ext" : function () {
				var source = "host.com/directory/file.ext";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "host.com", "directory", "file.ext" ]
				});

				assert.same(uri.toString(), source);
			},

			"//host.com:81/direc.tory/file.ext?query=1&test=2#anchor" : function () {
				var source = "host.com:81/direc.tory/file.ext?query=1&test=2#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol : "host.com",
					path : [ "81", "direc.tory", "file.ext" ],
					query : {
						query : "1",
						test : "2"
					},
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"user@host.com" : function () {
				var source = "user@host.com";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "user@host.com" ]
				});

				assert.same(uri.toString(), source);
			},

			"//user@host.com:81" : function () {
				var source = "user@host.com:81";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol : "user@host.com",
					path : [ "81" ]
				});

				assert.same(uri.toString(), source);
			},

			"user@host.com/" : function () {
				var source = "user@host.com/";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "user@host.com", "" ]
				});

				assert.same(uri.toString(), source);
			},

			"user@host.com/file.ext" : function () {
				var source = "user@host.com/file.ext";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "user@host.com", "file.ext" ]
				});

				assert.same(uri.toString(), source);
			},

			"user@host.com?query" : function () {
				var source = "user@host.com?query";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "user@host.com" ],
					query : {
						query : ""
					}
				});

				assert.same(uri.toString(), source);
			},

			"user@host.com#anchor" : function () {
				var source = "user@host.com#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					path : [ "user@host.com" ],
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			},

			"//user:pass@host.com:81/direc.tory/file.ext?query=1&test=2#anchor" : function () {
				var source = "user:pass@host.com:81/direc.tory/file.ext?query=1&test=2#anchor";
				var uri = URI(source);

				assert.match(uri, {
					source : source,
					protocol : "user:",
					path : [ "pass@host.com:81", "direc.tory", "file.ext" ],
					anchor : "anchor"
				});

				assert.same(uri.toString(), source);
			}
		});
	});
});