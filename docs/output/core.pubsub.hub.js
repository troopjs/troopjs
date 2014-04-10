Ext.data.JsonP.core_pubsub_hub({"tagname":"class","name":"core.pubsub.hub","autodetected":{},"files":[{"filename":"hub.js","href":"hub.html#core-pubsub-hub"}],"extends":"core.event.emitter","singleton":true,"members":[{"name":"displayName","tagname":"property","owner":"core.mixin.base","id":"property-displayName","meta":{"private":true,"readonly":true}},{"name":"handlers","tagname":"property","owner":"core.event.emitter","id":"property-handlers","meta":{"protected":true,"readonly":true}},{"name":"instanceCount","tagname":"property","owner":"core.mixin.base","id":"property-instanceCount","meta":{"private":true,"readonly":true}},{"name":"assert","tagname":"method","owner":"log.console","id":"method-assert","meta":{}},{"name":"debug","tagname":"method","owner":"log.console","id":"method-debug","meta":{"deprecated":{"text":"<p>An alias for <a href=\"#!/api/log.console-method-log\" rel=\"log.console-method-log\" class=\"docClass\">log</a>. This was added to improve compatibility with existing sites already using <code>debug()</code>. However, you should use <a href=\"#!/api/log.console-method-log\" rel=\"log.console-method-log\" class=\"docClass\">log</a> instead.</p>\n"}}},{"name":"dir","tagname":"method","owner":"log.console","id":"method-dir","meta":{}},{"name":"emit","tagname":"method","owner":"core.pubsub.hub","id":"method-emit","meta":{"private":true}},{"name":"error","tagname":"method","owner":"log.console","id":"method-error","meta":{}},{"name":"info","tagname":"method","owner":"log.console","id":"method-info","meta":{}},{"name":"log","tagname":"method","owner":"log.console","id":"method-log","meta":{}},{"name":"off","tagname":"method","owner":"core.pubsub.hub","id":"method-off","meta":{"private":true}},{"name":"on","tagname":"method","owner":"core.pubsub.hub","id":"method-on","meta":{"private":true}},{"name":"peek","tagname":"method","owner":"core.pubsub.hub","id":"method-peek","meta":{}},{"name":"publish","tagname":"method","owner":"core.pubsub.hub","id":"method-publish","meta":{}},{"name":"subscribe","tagname":"method","owner":"core.pubsub.hub","id":"method-subscribe","meta":{"chainable":true}},{"name":"time","tagname":"method","owner":"log.console","id":"method-time","meta":{}},{"name":"timeEnd","tagname":"method","owner":"log.console","id":"method-timeEnd","meta":{}},{"name":"toString","tagname":"method","owner":"core.mixin.base","id":"method-toString","meta":{"protected":true}},{"name":"trace","tagname":"method","owner":"log.console","id":"method-trace","meta":{}},{"name":"unsubscribe","tagname":"method","owner":"core.pubsub.hub","id":"method-unsubscribe","meta":{"chainable":true}},{"name":"warn","tagname":"method","owner":"log.console","id":"method-warn","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-core.pubsub.hub","short_doc":"The centric \"bus\" that handlers publishing and subscription. ...","classIcon":"icon-singleton","superclasses":["core.mixin.base","core.event.emitter"],"subclasses":[],"mixedInto":[],"implementedBy":[],"mixins":[],"implements":["compose.mixin"],"parentMixins":["log.logger"],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/core.mixin.base' rel='core.mixin.base' class='docClass'>core.mixin.base</a><div class='subclass '><a href='#!/api/core.event.emitter' rel='core.event.emitter' class='docClass'>core.event.emitter</a><div class='subclass '><strong>core.pubsub.hub</strong></div></div></div><h4>Implements</h4><div class='dependency'><a href='#!/api/compose.mixin' rel='compose.mixin' class='docClass'>compose.mixin</a></div><h4>Inherited mixins</h4><div class='dependency'><a href='#!/api/log.logger' rel='log.logger' class='docClass'>log.logger</a></div><h4>Files</h4><div class='dependency'><a href='source/hub.html#core-pubsub-hub' target='_blank'>hub.js</a></div></pre><div class='doc-contents'><p>The centric \"bus\" that handlers publishing and subscription.</p>\n\n<h2>Memorized emitting</h2>\n\n<p>A fired event will memorize the \"current\" value of each event. Each executor may have it's own interpretation\nof what \"current\" means.</p>\n\n<p><strong>Note:</strong> It's NOT necessarily to pub/sub on this module, prefer to\nuse methods like <a href=\"#!/api/core.component.gadget-method-publish\" rel=\"core.component.gadget-method-publish\" class=\"docClass\">publish</a> and <a href=\"#!/api/core.component.gadget-method-subscribe\" rel=\"core.component.gadget-method-subscribe\" class=\"docClass\">subscribe</a>\nthat are provided as shortcuts.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-displayName' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.mixin.base' rel='core.mixin.base' class='defined-in docClass'>core.mixin.base</a><br/><a href='source/base2.html#core-mixin-base-property-displayName' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.mixin.base-property-displayName' class='name expandable'>displayName</a> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='private' >private</span><span class='readonly' >readonly</span></span></div><div class='description'><div class='short'>The hierarchical namespace for this component that indicates it's functionality. ...</div><div class='long'><p>The hierarchical namespace for this component that indicates it's functionality.</p>\n<p>Defaults to: <code>&quot;core/mixin/base&quot;</code></p></div></div></div><div id='property-handlers' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.event.emitter' rel='core.event.emitter' class='defined-in docClass'>core.event.emitter</a><br/><a href='source/emitter.html#core-event-emitter-property-handlers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.event.emitter-property-handlers' class='name expandable'>handlers</a> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><span class=\"signature\"><span class='protected' >protected</span><span class='readonly' >readonly</span></span></div><div class='description'><div class='short'><p>Handlers attached to this component, addressable either by key or index</p>\n</div><div class='long'><p>Handlers attached to this component, addressable either by key or index</p>\n</div></div></div><div id='property-instanceCount' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.mixin.base' rel='core.mixin.base' class='defined-in docClass'>core.mixin.base</a><br/><a href='source/base2.html#core-mixin-base-property-instanceCount' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.mixin.base-property-instanceCount' class='name expandable'>instanceCount</a> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><span class=\"signature\"><span class='private' >private</span><span class='readonly' >readonly</span></span></div><div class='description'><div class='short'><p>Instance counter</p>\n</div><div class='long'><p>Instance counter</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-assert' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-assert' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-assert' class='name expandable'>assert</a>( <span class='pre'>expression, payload, [obj]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message and stack trace to the log if first argument is false ...</div><div class='long'><p>Writes a message and stack trace to the log if first argument is false</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>expression</span> : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><div class='sub-desc'><p>Conditional expression</p>\n</div></li><li><span class='pre'>payload</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>|<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>Initial payload</p>\n</div></li><li><span class='pre'>obj</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>... (optional)<div class='sub-desc'><p>Supplementary payloads</p>\n\n<ul>\n<li>If <code>payload</code> is of type <code>Object</code> the string representations of each of these objects are appended together in the order listed and output.</li>\n<li>If <code>payload</code> is of type <code>String</code> these are JavaScript objects with which to replace substitution strings within payload.</li>\n</ul>\n\n</div></li></ul></div></div></div><div id='method-debug' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-debug' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-debug' class='name expandable'>debug</a>( <span class='pre'>payload, [obj]</span> )<span class=\"signature\"><span class='deprecated' >deprecated</span></span></div><div class='description'><div class='short'>Writes a message to the log with level debug ...</div><div class='long'><p>Writes a message to the log with level <code>debug</code></p>\n        <div class='rounded-box deprecated-box deprecated-tag-box'>\n        <p>This method has been <strong>deprecated</strong> </p>\n        <p>An alias for <a href=\"#!/api/log.console-method-log\" rel=\"log.console-method-log\" class=\"docClass\">log</a>. This was added to improve compatibility with existing sites already using <code>debug()</code>. However, you should use <a href=\"#!/api/log.console-method-log\" rel=\"log.console-method-log\" class=\"docClass\">log</a> instead.</p>\n\n        </div>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>payload</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>|<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>Initial payload</p>\n\n\n\n</div></li><li><span class='pre'>obj</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>... (optional)<div class='sub-desc'><p>Supplementary payloads</p>\n\n\n\n\n<ul>\n<li>If <code>payload</code> is of type <code>Object</code> the string representations of each of these objects are appended together in the order listed and output.</li>\n<li>If <code>payload</code> is of type <code>String</code> these are JavaScript objects with which to replace substitution strings within payload.</li>\n</ul>\n\n\n\n</div></li></ul></div></div></div><div id='method-dir' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-dir' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-dir' class='name expandable'>dir</a>( <span class='pre'>object</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Displays an interactive list of the properties of the specified JavaScript object. ...</div><div class='long'><p>Displays an interactive list of the properties of the specified JavaScript object. The output is presented as a hierarchical listing that let you see the contents of child objects.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>object</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>A JavaScript object whose properties should be output</p>\n</div></li></ul></div></div></div><div id='method-emit' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.pubsub.hub'>core.pubsub.hub</span><br/><a href='source/hub.html#core-pubsub-hub-method-emit' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.pubsub.hub-method-emit' class='name expandable'>emit</a>( <span class='pre'>event, [args]</span> ) : *<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Trigger an event which notifies each of the listeners of their subscribing,\noptionally pass data values to the listen...</div><div class='long'><p>Trigger an event which notifies each of the listeners of their subscribing,\noptionally pass data values to the listeners.</p>\n\n<p> A sequential runner, is the default runner for this module, in which all handlers are running\n with the same argument data specified by the <a href=\"#!/api/core.pubsub.hub-method-emit\" rel=\"core.pubsub.hub-method-emit\" class=\"docClass\">emit</a> function.\n Each handler will wait for the completion for the previous one if it returns a promise.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>event</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a>|<a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>The event type to emit, or an event object</p>\n<ul><li><span class='pre'>type</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a> (optional)<div class='sub-desc'><p>The event type name.</p>\n</div></li><li><span class='pre'>runner</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a> (optional)<div class='sub-desc'><p>The runner function that determinate how the handlers are executed, overrides the\ndefault behaviour of the event emitting.</p>\n</div></li></ul></div></li><li><span class='pre'>args</span> : ...* (optional)<div class='sub-desc'><p>Data params that are passed to the listener function.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>*</span><div class='sub-desc'><p>Result returned from runner.</p>\n</div></li></ul><p>Overrides: <a href=\"#!/api/core.event.emitter-method-emit\" rel=\"core.event.emitter-method-emit\" class=\"docClass\">core.event.emitter.emit</a></p></div></div></div><div id='method-error' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-error' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-error' class='name expandable'>error</a>( <span class='pre'>payload, [obj]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the log with level error ...</div><div class='long'><p>Writes a message to the log with level <code>error</code></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>payload</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>|<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>Initial payload</p>\n\n\n\n</div></li><li><span class='pre'>obj</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>... (optional)<div class='sub-desc'><p>Supplementary payloads</p>\n\n\n\n\n<ul>\n<li>If <code>payload</code> is of type <code>Object</code> the string representations of each of these objects are appended together in the order listed and output.</li>\n<li>If <code>payload</code> is of type <code>String</code> these are JavaScript objects with which to replace substitution strings within payload.</li>\n</ul>\n\n\n\n</div></li></ul></div></div></div><div id='method-info' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-info' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-info' class='name expandable'>info</a>( <span class='pre'>payload, [obj]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the log with level info. ...</div><div class='long'><p>Writes a message to the log with level <code>info</code>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>payload</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>|<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>Initial payload</p>\n\n\n\n</div></li><li><span class='pre'>obj</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>... (optional)<div class='sub-desc'><p>Supplementary payloads</p>\n\n\n\n\n<ul>\n<li>If <code>payload</code> is of type <code>Object</code> the string representations of each of these objects are appended together in the order listed and output.</li>\n<li>If <code>payload</code> is of type <code>String</code> these are JavaScript objects with which to replace substitution strings within payload.</li>\n</ul>\n\n\n\n</div></li></ul></div></div></div><div id='method-log' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-log' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-log' class='name expandable'>log</a>( <span class='pre'>payload, [obj]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the log with level log ...</div><div class='long'><p>Writes a message to the log with level <code>log</code></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>payload</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>|<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>Initial payload</p>\n\n\n\n</div></li><li><span class='pre'>obj</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>... (optional)<div class='sub-desc'><p>Supplementary payloads</p>\n\n\n\n\n<ul>\n<li>If <code>payload</code> is of type <code>Object</code> the string representations of each of these objects are appended together in the order listed and output.</li>\n<li>If <code>payload</code> is of type <code>String</code> these are JavaScript objects with which to replace substitution strings within payload.</li>\n</ul>\n\n\n\n</div></li></ul></div></div></div><div id='method-off' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.pubsub.hub'>core.pubsub.hub</span><br/><a href='source/hub.html#core-pubsub-hub-method-off' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.pubsub.hub-method-off' class='name expandable'>off</a>( <span class='pre'>type, [context], [callback]</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Remove callback(s) from a subscribed event type, if no callback is specified,\nremove all callbacks of this type. ...</div><div class='long'><p>Remove callback(s) from a subscribed event type, if no callback is specified,\nremove all callbacks of this type.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The event type subscribed to</p>\n\n</div></li><li><span class='pre'>context</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> (optional)<div class='sub-desc'><p>The context to scope the callback to remove</p>\n\n</div></li><li><span class='pre'>callback</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a> (optional)<div class='sub-desc'><p>The event listener function to remove</p>\n\n</div></li></ul><p>Overrides: <a href=\"#!/api/core.event.emitter-method-off\" rel=\"core.event.emitter-method-off\" class=\"docClass\">core.event.emitter.off</a></p></div></div></div><div id='method-on' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.pubsub.hub'>core.pubsub.hub</span><br/><a href='source/hub.html#core-pubsub-hub-method-on' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.pubsub.hub-method-on' class='name expandable'>on</a>( <span class='pre'>type, context, callback, [data]</span> )<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Adds a listener for the specified event type. ...</div><div class='long'><p>Adds a listener for the specified event type.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The event type to subscribe to.</p>\n\n</div></li><li><span class='pre'>context</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>The context to scope the callback to.</p>\n\n</div></li><li><span class='pre'>callback</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a><div class='sub-desc'><p>The event listener function.</p>\n\n</div></li><li><span class='pre'>data</span> : * (optional)<div class='sub-desc'><p>Handler data</p>\n\n</div></li></ul><p>Overrides: <a href=\"#!/api/core.event.emitter-method-on\" rel=\"core.event.emitter-method-on\" class=\"docClass\">core.event.emitter.on</a></p></div></div></div><div id='method-peek' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.pubsub.hub'>core.pubsub.hub</span><br/><a href='source/hub.html#core-pubsub-hub-method-peek' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.pubsub.hub-method-peek' class='name expandable'>peek</a>( <span class='pre'>type, [value]</span> ) : *<span class=\"signature\"></span></div><div class='description'><div class='short'>Returns value in handlers MEMORY ...</div><div class='long'><p>Returns value in handlers MEMORY</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>event type to peek at</p>\n</div></li><li><span class='pre'>value</span> : * (optional)<div class='sub-desc'><p>Value to use <em>only</em> if no memory has been recorder</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>*</span><div class='sub-desc'><p>Value in MEMORY</p>\n</div></li></ul></div></div></div><div id='method-publish' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.pubsub.hub'>core.pubsub.hub</span><br/><a href='source/hub.html#core-pubsub-hub-method-publish' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.pubsub.hub-method-publish' class='name expandable'>publish</a>( <span class='pre'>type, [args]</span> ) : <a href=\"#!/api/when.Promise\" rel=\"when.Promise\" class=\"docClass\">Promise</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Emit a public event that can be subscribed by other components. ...</div><div class='long'><p>Emit a public event that can be subscribed by other components.</p>\n\n<p>Handlers are run in a pipeline, in which each handler will receive muted\ndata params depending on the return value of the previous handler:</p>\n\n<ul>\n<li>The original data params from <a href=\"#!/api/core.pubsub.hub-method-publish\" rel=\"core.pubsub.hub-method-publish\" class=\"docClass\">publish</a> if this's the first handler, or the previous handler returns <code>undefined</code>.</li>\n<li>One value as the single argument if the previous handler return a non-array.</li>\n<li>Each argument value deconstructed from the returning array of the previous handler.</li>\n</ul>\n\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The topic to publish.</p>\n</div></li><li><span class='pre'>args</span> : ...* (optional)<div class='sub-desc'><p>Additional params that are passed to the handler function.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/when.Promise\" rel=\"when.Promise\" class=\"docClass\">Promise</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-subscribe' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.pubsub.hub'>core.pubsub.hub</span><br/><a href='source/hub.html#core-pubsub-hub-method-subscribe' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.pubsub.hub-method-subscribe' class='name expandable'>subscribe</a>( <span class='pre'>type, context, callback, [data]</span> ) : <a href=\"#!/api/core.pubsub.hub\" rel=\"core.pubsub.hub\" class=\"docClass\">core.pubsub.hub</a><span class=\"signature\"><span class='chainable' >chainable</span></span></div><div class='description'><div class='short'>Listen to an event that are emitted publicly. ...</div><div class='long'><p>Listen to an event that are emitted publicly.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The event type to subscribe to.</p>\n\n</div></li><li><span class='pre'>context</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>The context to scope the callback to.</p>\n\n</div></li><li><span class='pre'>callback</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a><div class='sub-desc'><p>The event listener function.</p>\n\n</div></li><li><span class='pre'>data</span> : * (optional)<div class='sub-desc'><p>Handler data</p>\n\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/core.pubsub.hub\" rel=\"core.pubsub.hub\" class=\"docClass\">core.pubsub.hub</a></span><div class='sub-desc'><p>this</p>\n</div></li></ul></div></div></div><div id='method-time' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-time' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-time' class='name expandable'>time</a>( <span class='pre'>timerName</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Starts a timer you can use to track how long an operation takes. ...</div><div class='long'><p>Starts a timer you can use to track how long an operation takes. You give each timer a unique name, and may have up to 10,000 timers running on a given page.\nWhen you call <a href=\"#!/api/log.console-method-timeEnd\" rel=\"log.console-method-timeEnd\" class=\"docClass\">timeEnd</a> with the same name, the log will output the time, in milliseconds, that elapsed since the timer was started.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>timerName</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The name to give the new timer. This will identify the timer; use the same name when calling <a href=\"#!/api/log.console-method-timeEnd\" rel=\"log.console-method-timeEnd\" class=\"docClass\">timeEnd</a> to stop the timer and get the time written to the log</p>\n</div></li></ul></div></div></div><div id='method-timeEnd' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-timeEnd' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-timeEnd' class='name expandable'>timeEnd</a>( <span class='pre'>timerName</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Stops a timer that was previously started by calling time. ...</div><div class='long'><p>Stops a timer that was previously started by calling <a href=\"#!/api/log.console-method-time\" rel=\"log.console-method-time\" class=\"docClass\">time</a>.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>timerName</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The name of the timer to stop. Once stopped, the elapsed time is automatically written to the log</p>\n</div></li></ul></div></div></div><div id='method-toString' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.mixin.base' rel='core.mixin.base' class='defined-in docClass'>core.mixin.base</a><br/><a href='source/base2.html#core-mixin-base-method-toString' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.mixin.base-method-toString' class='name expandable'>toString</a>( <span class='pre'></span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"><span class='protected' >protected</span></span></div><div class='description'><div class='short'>Gives string representation of this component instance. ...</div><div class='long'><p>Gives string representation of this component instance.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'><p><a href=\"#!/api/core.mixin.base-property-displayName\" rel=\"core.mixin.base-property-displayName\" class=\"docClass\">displayName</a><code>@</code><a href=\"#!/api/core.mixin.base-property-instanceCount\" rel=\"core.mixin.base-property-instanceCount\" class=\"docClass\">instanceCount</a></p>\n</div></li></ul></div></div></div><div id='method-trace' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-trace' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-trace' class='name expandable'>trace</a>( <span class='pre'></span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Outputs a stack trace to the log. ...</div><div class='long'><p>Outputs a stack trace to the log.</p>\n</div></div></div><div id='method-unsubscribe' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.pubsub.hub'>core.pubsub.hub</span><br/><a href='source/hub.html#core-pubsub-hub-method-unsubscribe' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.pubsub.hub-method-unsubscribe' class='name expandable'>unsubscribe</a>( <span class='pre'>type, [context], [callback]</span> ) : <a href=\"#!/api/core.pubsub.hub\" rel=\"core.pubsub.hub\" class=\"docClass\">core.pubsub.hub</a><span class=\"signature\"><span class='chainable' >chainable</span></span></div><div class='description'><div class='short'>Remove a public event listener. ...</div><div class='long'><p>Remove a public event listener.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>type</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>The event type subscribed to</p>\n\n</div></li><li><span class='pre'>context</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a> (optional)<div class='sub-desc'><p>The context to scope the callback to remove</p>\n\n</div></li><li><span class='pre'>callback</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a> (optional)<div class='sub-desc'><p>The event listener function to remove</p>\n\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/core.pubsub.hub\" rel=\"core.pubsub.hub\" class=\"docClass\">core.pubsub.hub</a></span><div class='sub-desc'><p>this</p>\n</div></li></ul></div></div></div><div id='method-warn' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/log.console' rel='log.console' class='defined-in docClass'>log.console</a><br/><a href='source/console2.html#log-console-method-warn' target='_blank' class='view-source'>view source</a></div><a href='#!/api/log.console-method-warn' class='name expandable'>warn</a>( <span class='pre'>payload, [obj]</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the log with level warn ...</div><div class='long'><p>Writes a message to the log with level <code>warn</code></p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>payload</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>|<a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'><p>Initial payload</p>\n\n\n\n</div></li><li><span class='pre'>obj</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a>... (optional)<div class='sub-desc'><p>Supplementary payloads</p>\n\n\n\n\n<ul>\n<li>If <code>payload</code> is of type <code>Object</code> the string representations of each of these objects are appended together in the order listed and output.</li>\n<li>If <code>payload</code> is of type <code>String</code> these are JavaScript objects with which to replace substitution strings within payload.</li>\n</ul>\n\n\n\n</div></li></ul></div></div></div></div></div></div></div>","meta":{"singleton":true}});