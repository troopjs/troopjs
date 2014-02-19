/*
 * TroopJS core/net/uri
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 *
 * Parts of code from parseUri 1.2.2 Copyright Steven Levithan <stevenlevithan.com>
 */
define([ "../mixin/base" ], function URIModule(Base) {
	"use strict";

	var NULL = null;
	var ARRAY_PROTO = Array.prototype;
	var OBJECT_PROTO = Object.prototype;
	var ARRAY_PUSH = ARRAY_PROTO.push;
	var STRING_SPLIT = String.prototype.split;
	var TOSTRING = OBJECT_PROTO.toString;
	var TOSTRING_OBJECT = TOSTRING.call(OBJECT_PROTO);
	var TOSTRING_ARRAY = TOSTRING.call(ARRAY_PROTO);
	var TOSTRING_FUNCTION = TOSTRING.call(Function.prototype);
	var RE_URI = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?(?:([^?#]*)(?:\?([^#]*))?(?:#(.*))?)/;

	var PROTOCOL = "protocol";
	var AUTHORITY = "authority";
	var PATH = "path";
	var QUERY = "query";
	var ANCHOR = "anchor";

	var KEYS = [ "source",
		PROTOCOL,
		AUTHORITY,
		"userInfo",
		"user",
		"password",
		"host",
		"port",
		PATH,
		QUERY,
		ANCHOR ];

	/**
	 * Parse the **query** part of an URI.
	 * @class core.net.uri.Query
	 */
	function Query(arg) {
		/*jshint forin:false*/
		var result = {};
		var matches;
		var key = NULL;
		var value;
		var re = /(?:&|^)([^&=]*)=?([^&]*)/g;

		result.toString = Query.toString;

		if (TOSTRING.call(arg) === TOSTRING_OBJECT) {
			for (key in arg) {
				result[key] = arg[key];
			}
		} else {
			while ((matches = re.exec(arg)) !== NULL) {
				key = matches[1];

				if (key in result) {
					value = result[key];

					if (TOSTRING.call(value) === TOSTRING_ARRAY) {
						value[value.length] = matches[2];
					}
					else {
						result[key] = [ value, matches[2] ];
					}
				}
				else {
					result[key] = matches[2];
				}
			}
		}

		return result;
	}

	/**
	 * Serialize the query in url encoded format like `key1=value1&key2=value2` without having it encoded.
	 * @member core.net.uri.Query
	 */
	Query.toString = function QueryToString() {
		/*jshint forin:false*/
		var me = this;
		var key;
		var value;
		var values;
		var query = [];
		var i = 0;
		var j;

		for (key in me) {
			if (TOSTRING.call(me[key]) === TOSTRING_FUNCTION) {
				continue;
			}

			query[i++] = key;
		}

		query.sort();

		while (i--) {
			key = query[i];
			value = me[key];

			if (TOSTRING.call(value) === TOSTRING_ARRAY) {
				values = value.slice(0);

				values.sort();

				j = values.length;

				while (j--) {
					value = values[j];

					values[j] = value === ""
						? key
						: key + "=" + value;
				}

				query[i] = values.join("&");
			}
			else {
				query[i] = value === ""
					? key
					: key + "=" + value;
			}
		}

		return query.join("&");
	};

	/**
	 * Parse the **path** part of an URI.
	 * @class core.net.uri.Path
	 */
	function Path(arg) {
		// Extend on the instance of array rather than subclass it
		var result = [];

		result.toString = Path.toString;

		ARRAY_PUSH.apply(result, TOSTRING.call(arg) === TOSTRING_ARRAY
			? arg
			: STRING_SPLIT.call(arg, "/"));

		return result;
	}

	/**
	 * Serialize the URI path using back-slash as delimiter.
	 * @member core.net.uri.Path
	 */
	Path.toString = function PathToString() {
		return this.join("/");
	};

	/**
	 * @class core.net.uri
	 * @extends core.mixin.base
	 * The universal URI parser and serializer.
	 */
	var URI = Base.extend(function URI(str) {
		var me = this;
		var value;
		var matches;
		var i;

		if ((matches = RE_URI.exec(str)) !== NULL) {
			i = matches.length;

			while (i--) {
				value = matches[i];

				if (value) {
					me[KEYS[i]] = value;
				}
			}
		}

		if (QUERY in me) {
			me[QUERY] = Query(me[QUERY]);
		}

		if (PATH in me) {
			me[PATH] = Path(me[PATH]);
		}
	}, {
		"displayName" : "core/net/uri",

		/**
		 * Serialize into the URI string.
		 * @return {String}
		 */
		"toString" : function URIToString() {
			var me = this;
			var uri = [ PROTOCOL , "://", AUTHORITY, PATH, "?", QUERY, "#", ANCHOR ];
			var i;
			var key;

			if (!(PROTOCOL in me)) {
				uri[0] = uri[1] = "";
			}

			if (!(AUTHORITY in me)) {
				uri[2] = "";
			}

			if (!(PATH in me)) {
				uri[3] = "";
			}

			if (!(QUERY in me)) {
				uri[4] = uri[5] = "";
			}

			if (!(ANCHOR in me)) {
				uri[6] = uri[7] = "";
			}

			i = uri.length;

			while (i--) {
				key = uri[i];

				if (key in me) {
					uri[i] = me[key];
				}
			}

			return uri.join("");
		}
	});

	URI.Path = Path;

	URI.Query = Query;

	return URI;
});
