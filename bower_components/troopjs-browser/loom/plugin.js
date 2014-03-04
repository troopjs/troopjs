/*
 * TroopJS browser/loom/plugin
 * @license MIT http://troopjs.mit-license.org/ © Mikael Karon mailto:mikael@karon.se
 */
define([
	"jquery",
	"when",
	"./config",
	"./weave",
	"./unweave",
	"./woven",
	"troopjs-utils/getargs",
	"poly/array"
], function WeaveModule($, when, config, weave, unweave, woven, getargs) {
	"use strict";

	var UNDEFINED;
	var $FN = $.fn;
	var $EXPR = $.expr;
	var $CREATEPSEUDO = $EXPR.createPseudo;
	var WEAVE = "weave";
	var UNWEAVE = "unweave";
	var WOVEN = "woven";
	var ATTR_WEAVE = config[WEAVE];
	var ATTR_WOVEN = config[WOVEN];
	var RE_SEPARATOR = /[\s,]+/;

	/*
	 * Tests if element has a data-weave attribute
	 * @param element to test
	 * @returns {boolean}
	 * @private
	 */
	function hasDataWeaveAttr(element) {
		return $(element).attr(ATTR_WEAVE) !== UNDEFINED;
	}

	/*
	 * Tests if element has a data-woven attribute
	 * @param element to test
	 * @returns {boolean}
	 * @private
	 */
	function hasDataWovenAttr(element) {
		return $(element).attr(ATTR_WOVEN) !== UNDEFINED;
	}

	/*
	 * :weave expression
	 */
	$EXPR[":"][WEAVE] = $CREATEPSEUDO
		// If we have jQuery >= 1.8 we want to use .createPseudo
		? $CREATEPSEUDO(function (widgets) {
			// If we don't have widgets to test, quick return optimized expression
			if (widgets === UNDEFINED) {
				return hasDataWeaveAttr;
			}

			// Convert widgets to RegExp
			widgets = new RegExp(getargs.call(widgets).map(function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Return expression
			return function (element) {
				// Get weave attribute
				var weave = $(element).attr(ATTR_WEAVE);

				// Check that weave is not UNDEFINED, and that widgets test against a processed weave
				return weave !== UNDEFINED && widgets.test(weave.replace(RE_SEPARATOR, "\n"));
			};
		})
		// Otherwise fall back to legacy
		: function (element, index, match) {
			var weave = $(element).attr(ATTR_WEAVE);

			return weave === UNDEFINED
				? false
				: match === UNDEFINED
					? true
					: new RegExp(getargs.call(match[3]).map(function (widget) {
							return "^" + widget;
						}).join("|"), "m").test(weave.replace(RE_SEPARATOR, "\n"));
			};

	/*
	 * :woven expression
	 */
	$EXPR[":"][WOVEN] = $CREATEPSEUDO
		// If we have jQuery >= 1.8 we want to use .createPseudo
		? $CREATEPSEUDO(function (widgets) {
			// If we don't have widgets to test, quick return optimized expression
			if (widgets === UNDEFINED) {
				return hasDataWovenAttr;
			}

			// Convert widgets to RegExp
			widgets = new RegExp(getargs.call(widgets).map(function (widget) {
				return "^" + widget;
			}).join("|"), "m");

			// Return expression
			return function (element) {
				var attr_woven = $(element).attr(ATTR_WOVEN);

				// Check that attr_woven is not UNDEFINED, and that widgets test against a processed attr_woven
				return attr_woven !== UNDEFINED && widgets.test(attr_woven.replace(RE_SEPARATOR, "\n"));
			};
		})
		// Otherwise fall back to legacy
		: function (element, index, match) {
			var attr_woven = $(element).attr(ATTR_WOVEN);

			return attr_woven === UNDEFINED
				? false
				: match === UNDEFINED
					? true
					: new RegExp(getargs.call(match[3]).map(function (widget) {
						return "^" + widget;
					}).join("|"), "m").test(attr_woven.replace(RE_SEPARATOR, "\n"));
		};

	/**
	 * @class $
	 */

	/**
	 * Weaves elements
	 * @member $
	 * @method weave
	 * @returns {Promise} of weaving
	 */
	$FN[WEAVE] = weave;

	/**
	 * Unweaves elements
	 * @member $
	 * @method unweave
	 * @returns {Promise} of unweaving
	 */
	$FN[UNWEAVE] = unweave;

	/**
	 * Gets woven widgets
	 * @method woven
	 * @returns {Promise} of woven widgets
	 */
	$FN[WOVEN] = woven;
});
