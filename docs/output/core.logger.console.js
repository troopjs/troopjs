Ext.data.JsonP.core_logger_console({"meta":{},"autodetected":{},"component":false,"superclasses":["core.component.base"],"members":[{"meta":{},"tagname":"method","owner":"core.component.base","name":"configure","id":"method-configure"},{"meta":{},"tagname":"method","owner":"core.logger.console","name":"debug","id":"method-debug"},{"meta":{},"tagname":"method","owner":"core.logger.console","name":"error","id":"method-error"},{"meta":{},"tagname":"method","owner":"core.logger.console","name":"info","id":"method-info"},{"meta":{},"tagname":"method","owner":"core.logger.console","name":"log","id":"method-log"},{"meta":{},"tagname":"method","owner":"core.component.base","name":"signal","id":"method-signal"},{"meta":{},"tagname":"method","owner":"core.component.base","name":"start","id":"method-start"},{"meta":{},"tagname":"method","owner":"core.component.base","name":"stop","id":"method-stop"},{"meta":{},"tagname":"method","owner":"core.component.base","name":"task","id":"method-task"},{"meta":{},"tagname":"method","owner":"core.component.base","name":"toString","id":"method-toString"},{"meta":{},"tagname":"method","owner":"core.logger.console","name":"warn","id":"method-warn"}],"mixedInto":[],"mixins":[],"singleton":true,"tagname":"class","parentMixins":[],"subclasses":[],"requires":[],"extends":"core.component.base","name":"core.logger.console","html":"<div><pre class=\"hierarchy\"><h4>Hierarchy</h4><div class='subclass first-child'><a href='#!/api/core.component.base' rel='core.component.base' class='docClass'>core.component.base</a><div class='subclass '><strong>core.logger.console</strong></div></div><h4>Files</h4><div class='dependency'><a href='source/console.html#core-logger-console' target='_blank'>console.js</a></div></pre><div class='doc-contents'><p>Module that provides simple logging feature as a wrapper around the \"console\" global ever found.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-configure' class='member first-child inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.component.base' rel='core.component.base' class='defined-in docClass'>core.component.base</a><br/><a href='source/base2.html#core-component-base-method-configure' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.component.base-method-configure' class='name expandable'>configure</a>( <span class='pre'>[configs]</span> ) : Object<span class=\"signature\"></span></div><div class='description'><div class='short'>Add to the component configurations, possibly merge with the existing ones. ...</div><div class='long'><p>Add to the component configurations, possibly merge with the existing ones.</p>\n\n<pre><code>    var List = Component.extend({\n        \"sig/start\": function start() {\n            // configure the List.\n            this.configure({\n                \"type\": \"list\",\n                \"cls\": [\"list\"]\n            });\n        }\n    });\n    var Dropdown = List.extend({\n        \"sig/start\": function start() {\n            // configure the Dropdown.\n            this.configure({\n                \"type\": \"dropdown\",\n                \"cls\": [\"dropdown\"],\n                \"shadow\": true\n            });\n        }\n    });\n\n    var dropdown = new Dropdown();\n\n    // Overwritten: \"dropdown\"\n    print(dropdown.configuration.id);\n    // Augmented: [\"list\",\"dropdown\"]\n    print(dropdown.configuration.cls);\n    // Added: true\n    print(dropdown.configuration.shadow);\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>configs</span> : Object... (optional)<div class='sub-desc'><p>Config(s) to add.</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Object</span><div class='sub-desc'><p>The new configuration.</p>\n</div></li></ul></div></div></div><div id='method-debug' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.logger.console'>core.logger.console</span><br/><a href='source/console.html#core-logger-console-method-debug' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.logger.console-method-debug' class='name expandable'>debug</a>( <span class='pre'>msg</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the console that is debugging alike. ...</div><div class='long'><p>Writes a message to the console that is debugging alike.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>msg</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-error' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.logger.console'>core.logger.console</span><br/><a href='source/console.html#core-logger-console-method-error' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.logger.console-method-error' class='name expandable'>error</a>( <span class='pre'>msg</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the console that is actually an error. ...</div><div class='long'><p>Writes a message to the console that is actually an error.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>msg</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-info' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.logger.console'>core.logger.console</span><br/><a href='source/console.html#core-logger-console-method-info' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.logger.console-method-info' class='name expandable'>info</a>( <span class='pre'>msg</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the console that is information alike, ...</div><div class='long'><p>Writes a message to the console that is information alike,</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>msg</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-log' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.logger.console'>core.logger.console</span><br/><a href='source/console.html#core-logger-console-method-log' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.logger.console-method-log' class='name expandable'>log</a>( <span class='pre'>msg</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the console that is logging alike. ...</div><div class='long'><p>Writes a message to the console that is logging alike.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>msg</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-signal' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.component.base' rel='core.component.base' class='defined-in docClass'>core.component.base</a><br/><a href='source/base2.html#core-component-base-method-signal' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.component.base-method-signal' class='name expandable'>signal</a>( <span class='pre'>_signal</span> ) : Promise<span class=\"signature\"></span></div><div class='description'><div class='short'>Signals the component ...</div><div class='long'><p>Signals the component</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>_signal</span> : Object<div class='sub-desc'><p>{String} Signal</p>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Promise</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-start' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.component.base' rel='core.component.base' class='defined-in docClass'>core.component.base</a><br/><a href='source/base2.html#core-component-base-method-start' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.component.base-method-start' class='name expandable'>start</a>( <span class='pre'></span> ) : *<span class=\"signature\"></span></div><div class='description'><div class='short'>Start the component life-cycle. ...</div><div class='long'><p>Start the component life-cycle.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>*</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-stop' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.component.base' rel='core.component.base' class='defined-in docClass'>core.component.base</a><br/><a href='source/base2.html#core-component-base-method-stop' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.component.base-method-stop' class='name expandable'>stop</a>( <span class='pre'></span> ) : *<span class=\"signature\"></span></div><div class='description'><div class='short'>Stops the component life-cycle. ...</div><div class='long'><p>Stops the component life-cycle.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>*</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-task' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.component.base' rel='core.component.base' class='defined-in docClass'>core.component.base</a><br/><a href='source/base2.html#core-component-base-method-task' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.component.base-method-task' class='name expandable'>task</a>( <span class='pre'>resolver, [name]</span> ) : Promise<span class=\"signature\"></span></div><div class='description'><div class='short'>Schedule a new promise that runs on this component, sends a \"task\" signal once finished. ...</div><div class='long'><p>Schedule a new promise that runs on this component, sends a \"task\" signal once finished.</p>\n\n<p><strong>Note:</strong> It's recommended to use <strong>this method instead of an ad-hoc promise</strong> to do async lift on this component,\nsince in additional to an ordinary promise, it also helps to track the context of any running promise,\nincluding it's name, completion time and a given ID.</p>\n\n<pre><code>var widget = Widget.create({\n    \"sig/task\" : function(promise) {\n        print('task %s started at: %s, finished at: %s', promise.name, promise.started);\n    }\n});\n\nwidget.task(function(resolve) {\n    $(this.$element).fadeOut(resolve);\n}, 'animate');\n</code></pre>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>resolver</span> : Function<div class='sub-desc'><p>The task resolver function.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>resolve</span> : Function<div class='sub-desc'><p>Resolve the task.</p>\n</div></li><li><span class='pre'>reject</span> : Function<div class='sub-desc'><p>Reject the task.</p>\n</div></li><li><span class='pre'>notify</span> : Function<div class='sub-desc'><p>Notify the progress of this task.</p>\n</div></li></ul></div></li><li><span class='pre'>name</span> : String (optional)<div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>Promise</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-toString' class='member  inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><a href='#!/api/core.component.base' rel='core.component.base' class='defined-in docClass'>core.component.base</a><br/><a href='source/base2.html#core-component-base-method-toString' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.component.base-method-toString' class='name expandable'>toString</a>( <span class='pre'></span> ) : string<span class=\"signature\"></span></div><div class='description'><div class='short'>Gives string representation of this component instance. ...</div><div class='long'><p>Gives string representation of this component instance.</p>\n<h3 class='pa'>Returns</h3><ul><li><span class='pre'>string</span><div class='sub-desc'><p>displayName and instanceCount</p>\n</div></li></ul></div></div></div><div id='method-warn' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='core.logger.console'>core.logger.console</span><br/><a href='source/console.html#core-logger-console-method-warn' target='_blank' class='view-source'>view source</a></div><a href='#!/api/core.logger.console-method-warn' class='name expandable'>warn</a>( <span class='pre'>msg</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Writes a message to the console that is warning alike. ...</div><div class='long'><p>Writes a message to the console that is warning alike.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>msg</span> : String<div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","uses":[],"id":"class-core.logger.console","aliases":{},"alternateClassNames":[],"files":[{"href":"console.html#core-logger-console","filename":"console.js"}]});