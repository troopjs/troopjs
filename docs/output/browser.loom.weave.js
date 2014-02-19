Ext.data.JsonP.browser_loom_weave({"uses":[],"mixedInto":[],"alternateClassNames":[],"parentMixins":[],"aliases":{},"html":"<div><div class='doc-contents'>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-weave' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='browser.loom.weave'>browser.loom.weave</span><br/><a href='source/weave.html#browser-loom-weave-method-weave' target='_blank' class='view-source'>view source</a></div><a href='#!/api/browser.loom.weave-method-weave' class='name expandable'>weave</a>( <span class='pre'>[arg]</span> ) : Promise<span class=\"signature\"></span></div><div class='description'><div class='short'>Instantiate all widget instances specified in the weave attribute\nof this element, and to signal the widget for start...</div><div class='long'><p>Instantiate all widget instances specified in the <a href=\"#!/api/browser.loom.config-cfg-weave\" rel=\"browser.loom.config-cfg-weave\" class=\"docClass\">weave attribute</a>\nof this element, and to signal the widget for start with the arguments. The weaving will result in:</p>\n\n<ul>\n<li>Updates the <a href=\"#!/api/browser.loom.config-cfg-weave\" rel=\"browser.loom.config-cfg-weave\" class=\"docClass\">woven attribute</a> with the created widget instances names.</li>\n<li>The <a href=\"#!/api/browser.loom.config-cfg-S-warp\" rel=\"browser.loom.config-cfg-S-warp\" class=\"docClass\">$warp data property</a> will reference the widget instances.</li>\n</ul>\n\n\n<p><strong>Note:</strong> It's not commonly to use this method directly, use instead <a href=\"#!/api/$-method-weave\" rel=\"$-method-weave\" class=\"docClass\">jQuery.fn.weave</a>.</p>\n\n<pre><code>// Create element for weaving.\nvar $el = $('&lt;div data-weave=\"my/widget(option)\"&gt;&lt;/div&gt;').data(\"option\",{\"foo\":\"bar\"});\n// Instantiate the widget defined in \"my/widget\" module, with one param read from the element's custom data.\n$el.weave();\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>arg</span> : Mixed... (optional)<div class='sub-desc'><p>The params that used to start the widget.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Promise</span><div class='sub-desc'><p>Promise to the completion of weaving all widgets.</p>\n</div></li></ul></div></div></div></div></div></div></div>","tagname":"class","members":[{"owner":"browser.loom.weave","tagname":"method","meta":{},"name":"weave","id":"method-weave"}],"superclasses":[],"meta":{},"subclasses":[],"name":"browser.loom.weave","files":[{"href":"","filename":""}],"requires":[],"mixins":[],"component":false});