/*!
 * TroopJS base component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS deferred component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS pubsub/topic module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS pubsub/hub module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS gadget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS widget component
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS remote/ajax module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS store/base module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS store/local module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS store/session module
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS jQuery action plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS jQuery destroy plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS jQuery dimensions plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS jQuery hashchange plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS jQuery weave plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/*!
 * TroopJS jQuery wire plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
/**
 * @license RequireJS text 1.0.7 Copyright (c) 2010-2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/requirejs for details
 */
/*!
 * TroopJS RequireJS template plug-in
 * @license TroopJS 0.0.1 Copyright 2012, Mikael Karon <mikael@karon.se>
 * Released under the MIT license.
 */
define("troopjs/component/base",["compose","config"],function(b,c){var d=0;return b(function(){this.instanceCount=d++},{config:c,displayName:b.required,toString:function e(){var a=this;return a.displayName+"@"+a.instanceCount}})}),define("deferred",["jquery"],function(b){return b.Deferred}),define("troopjs/pubsub/topic",["../component/base"],function(b){var c=Array;return b.extend(function(b,c,d){var e=this;e.topic=b,e.publisher=c,e.parent=d},{displayName:"pubsub/topic",toString:function d(){return this.topic},trace:function(){var b=this,d=b.constructor,e,f,g="",h,i;while(b){if(b.constructor===c){for(h=0,i=b.length;h<i;h++)f=b[h],b[h]=f.constructor===d?f.trace():f;g+=b.join(",");break}e=b.parent,g+=e?b.publisher+":":b.publisher,b=e}return g}})}),define("troopjs/pubsub/hub",["compose","../component/base","./topic"],function(b,c,d){var e=undefined,f="/**";return b.create(c,function(){var b=this;b.re=/\/\w+(?=\/)|\*{1,2}$/g,b.context={},b.topics={}},{displayName:"pubsub/hub",subscribe:function(b){var c=this,d=c.topics,e=1,f=arguments.length,g=arguments[e],h,i;g instanceof Function?g=c.context:e++;if(b in d){i=d[b].tail;for(;e<f;e++)i=i.next={callback:arguments[e],context:g};d[b].tail=i}else{h=i={callback:arguments[e++],context:g};for(;e<f;e++)i=i.next={callback:arguments[e],context:g};d[b]={head:h,tail:i}}return c},unsubscribe:function(b){var c=this,d=c.topics,f,g=arguments.length,h,i=null,j,k;a:{if(!b in d)break a;if(g===1){delete d[b];break a}h=d[b].head;for(f=1;f<g;f++){k=arguments[f],j=i=h;do{if(j.callback===k){if(j===h){h=i=j.next;continue}i.next=j.next;continue}i=j}while(j=j.next);if(h===e){delete d[b];break a}}d[b]={head:h,tail:i}}return c},publish:function(b){var c=this,e=c.topics,g=b.constructor===d?b.toString():b,h=c.re,i=new Array,j,k=0,l;while(h.test(g))i[k++]=g.substr(0,h.lastIndex)+f;k>0&&(i[k]=i[k-1].slice(0,-1),k++),i[k]=g;if(arguments.length===0){do{j=i[k];if(!(j in e))continue;l=e[j].head;do l.callback.call(l.context);while(l=l.next)}while(k-->0)}else do{j=i[k];if(!(j in e))continue;l=e[j].head;do l.callback.apply(l.context,arguments);while(l=l.next)}while(k-->0);return c}})}),define("troopjs/component/gadget",["./base","../pubsub/hub","../pubsub/topic","deferred"],function(b,c,d,e){var f=c.publish,g=c.subscribe,h=c.unsubscribe;return b.extend({publish:function(){var b=this;return f.apply(c,arguments),b},subscribe:function(){var b=this;return g.apply(c,arguments),b},unsubscribe:function(){var b=this;return h.apply(c,arguments),b},ajax:function(b,c){var e=this;return e.publish(new d("app/ajax",e),b,c),e}})}),define("troopjs/component/widget",["./gadget","jquery"],function(b,c){function l(a){function b(b,d,f){var i=this;b instanceof e?b=b.call(i,d):f=d;var j=i[h],k=c.Deferred(function(d){a.call(j,b),i.weave(j,d)}).done(function(){j.trigger(g,arguments)});return f&&k.then(f.resolve,f.reject),i}return b}var d=undefined,e=Function,f=Array.prototype.slice,g="widget/refresh",h="$element",i="displayName",j="[data-weave]",k="[data-woven]";return b.extend(function(b,d){var e=this;e[h]=c(b),d!==undefined&&(e[i]=d)},{displayName:"component/widget",weave:function(b,c){return b.find(j).weave(c),this},unweave:function(b){return b.find(k).andSelf().unweave(),this},trigger:function(b){return $element.trigger(b,f.call(arguments,1)),this},before:l(c.fn.before),after:l(c.fn.after),html:l(c.fn.html),append:l(c.fn.append),prepend:l(c.fn.prepend),empty:function(b){var d=this,e=d[h],f=c.Deferred(function(b){var c=e.contents().detach();e.trigger(g,arguments);var d=c.get();setTimeout(function(){try{c.remove(),b.resolve(d)}catch(e){b.reject(d)}},0)});return b&&f.then(b.resolve,b.reject),d},"dom/destroy":function(b,c){var f=this,g=f.destructor,i=d;return g instanceof e&&(i=g.call(f)),i!==!1&&f.unweave(f[h]),i}})}),define("troopjs/remote/ajax",["compose","../component/base","../pubsub/topic","../pubsub/hub","jquery"],function(b,c,d,e,f){function g(a,b,c){f.extend(!0,b,{headers:{"x-my-request":(new Date).getTime(),"x-my-component":a.constructor===d?a.trace():a}}),f.ajax(b).then(c.resolve,c.reject)}return b.create(c,function(){e.subscribe("hub/ajax",this,g)},{displayName:"remote/ajax"})}),define("troopjs/store/base",["compose","../component/gadget"],function(b,c){return c.extend({set:b.required,get:b.required,remove:b.required,clear:b.required})}),define("troopjs/store/local",["compose","./base"],function(b,c){var d=window.localStorage;return b.create(c,{displayName:"store/local",set:function(b,c,e){d.setItem(b,JSON.stringify(c)),e&&e.resolve instanceof Function&&e.resolve(c)},get:function(b,c){var e=JSON.parse(d.getItem(b));c&&c.resolve instanceof Function&&c.resolve(e)},remove:function(b,c){d.removeItem(b),c&&c.resolve instanceof Function&&c.resolve()},clear:function(b){d.clear(),b&&b.resolve instanceof Function&&b.resolve()}})}),define("troopjs/store/session",["compose","./base"],function(b,c){var d=window.sessionStorage;return b.create(c,{displayName:"store/session",set:function(b,c,e){d.setItem(b,JSON.stringify(c)),e&&e.resolve instanceof Function&&e.resolve(c)},get:function(b,c){var e=JSON.parse(d.getItem(b));c&&c.resolve instanceof Function&&c.resolve(e)},remove:function(b,c){d.removeItem(b),c&&c.resolve instanceof Function&&c.resolve()},clear:function(b){d.clear(),b&&b.resolve instanceof Function&&b.resolve()}})}),define("troopjs-jquery/action",["jquery"],function(b){function p(a,b){return a?a+"."+g:e}function q(a){var c=b(this),e=f.call(arguments,1),h=i in a?a[i].type:g,j=a[g];a.type=g+"/"+j+"."+h,c.trigger(a,e),a.result!==d&&(a.type=g+"/"+j+"!",c.trigger(a,e),a.result!==d&&(a.type=g+"."+h,c.trigger(a,e)))}function r(a){var d=b(a.target).closest("[data-action]");if(d.length===0)return;var f=d.data(),i=j.exec(f[g]);if(i===e)return;var p=i[1],q=i[2],r=i[3];if(q!==c&&!RegExp(q.split(l).join("|")).test(a.type))return;var s=r!==c?r.split(k):[];b.each(s,function(b,c){c in f?s[b]=f[c]:m.test(c)?s[b]=c.slice(1,-1):n.test(c)?s[b]=Number(c):o.test(c)&&(s[b]=c===h)}),d.trigger(b.Event(a,{type:g+"!",action:p}),s)}var c=undefined,d=!1,e=null,f=Array.prototype.slice,g="action",h="true",i="originalEvent",j=/^([\w\d\s_\-\/]+)(?:\.([\w\.]+))?(?:\((.*)\))?$/,k=/[\s,]+/,l=/\.+/,m=/^(["']).*\1$/,n=/^\d+$/,o=/^false|true$/;b.event.special[g]={setup:function(c,d,e){b(this).bind(g,c,q)},add:function(c){var d=b.map(c.namespace.split(l),p);d.length!==0&&b(this).bind(d.join(" "),r)},remove:function(c){var d=b.map(c.namespace.split(l),p);d.length!==0&&b(this).unbind(d.join(" "),r)},teardown:function(c){b(this).unbind(g,q)}},b.fn[g]=function(c){return b(this).trigger({type:g+"!",action:c},f.call(arguments,1))}}),define("troopjs-jquery/destroy",["jquery"],function(b){b.event.special.destroy={remove:function(c){var d=this;c.handler.call(d,b.Event({type:c.type,data:c.data,namespace:c.namespace,target:d}))}}}),define("troopjs-jquery/dimensions",["jquery"],function(b){function j(a,b){return a<b?1:a>b?-1:0}function k(a){var c=b(this),e=c.width(),j=c.height();b.each(c.data(d),function(k,l){var m=l[f],n=m.length-1,o=l[g],p=o.length-1,q=b.grep(m,function(a,b){return a<=e||b===n})[0],r=b.grep(o,function(a,b){return a<=j||b===p})[0];if(q!==l[h]||r!==l[i])l[h]=q,l[i]=r,c.trigger(d+"."+k,[q,r])})}var c=/(w|h)(\d*)/g,d="dimensions",e="resize."+d,f="w",g="h",h="_"+f,i="_"+g;b.event.special[d]={setup:function(c,f,g){b(this).bind(e,k).data(d,{})},add:function(e){var h=e.namespace,i={},k=i[f]=[],l=i[g]=[],m;while(m=c.exec(h))i[m[1]].push(parseInt(m[2]));k.sort(j),l.sort(j),b.data(this,d)[h]=i},remove:function(c){delete b.data(this,d)[c.namespace]},teardown:function(c){b(this).removeData(d).unbind(e,k)}}}),define("troopjs-jquery/hashchange",["jquery"],function(b){function i(a){var b=f.exec(a.location.href);return b&&b[1]?decodeURIComponent(b[1]):""}function j(a){var b=this,c;b.element=c=a.createElement("iframe"),c.src="about:blank",c.style.display="none"}var c="interval",d="hashchange",e="on"+d,f=/#(.*)$/,g=/\?/,h=!1;j.prototype={getElement:function(){return this.element},getHash:function(){return this.element.contentWindow.frameHash},update:function(b){var c=this,d=c.element.contentWindow.document;if(c.getHash()===b)return;d.open(),d.write("<html><head><title>' + document.title + '</title><script type='text/javascript'>var frameHash='"+b+"';</script></head><body>&nbsp;</body></html>"),d.close()}},b.event.special[d]={setup:function(f,k,l){var m=this;if(e in m)return!1;if(!b.isWindow(m))throw new Error("Unable to bind 'hashchange' to a non-window object");var n=b(m),o=i(m),p=m.location;n.data(c,m.setInterval(h?function(){var b=m.document,c=p.protocol==="file:",e=new j(b);return b.body.appendChild(e.getElement()),e.update(o),function(){var b=o,f,h=i(m),j=e.getHash();j!==o&&j!==h?(f=decodeURIComponent(j),o!==f&&(o=f,e.update(o),n.trigger(d,[f,b])),p.hash="#"+encodeURI(c?j.replace(g,"%3F"):j)):h!==o&&(f=decodeURIComponent(h),o!==f&&(o=f,n.trigger(d,[f,b])))}}():function(){var b=o,c,e=i(m);e!==o&&(c=decodeURIComponent(e),o!==c&&(o=c,n.trigger(d,[c,b])))},25))},teardown:function(d){var f=this;if(e in f)return!1;f.clearInterval(b.data(f,c))}}}),define("troopjs-jquery/weave",["jquery"],function(b){var c=undefined,d=null,e="",f=Function,g=Array,h=g.prototype.join,i=b.when,j="weave",k="unweave",l="woven",m="widget/"+j,n="widget/"+k,o="data-"+j,p="data-"+l,q=/[\s,]+/,r=/@\d+/g;b.fn[j]=function(g){var j=[],k=0,n=b(this);return n.each(function(g,n){var r=b(n),s=r.attr(o)||e,t=s.split(q),u=k,v,w;r.data(l,t).removeAttr(o);for(v=0,w=t.length;v<w;v++)j[k++]=b.Deferred(function(b){var e=v,g=t[e];try{require([g],function(h){if(h===d||h===c)throw new Error("no widget");h instanceof f?h=new h(n,g):h.init instanceof f&&h.init(n,g),r.wire(h).triggerHandler(m,[h]),t[e]=h,b.resolve(h)})}catch(h){t[e]=c,b.resolve(g)}});i.apply(b,j.slice(u,k)).done(function(){r.attr(p,h.call(arguments," "))})}),g&&i.apply(b,j).then(g.resolve,g.reject),n},b.fn[k]=function(){return b(this).each(function(e,f){var h=b(f),i=$elemen.data(l),j;if(!i instanceof g)return;h.removeData(l);while(j=i.shift()){if(j===d||j===c)continue;h.triggerHandler(n,[j]),h.unwire(j)}}).attr(o,function(c,d){return b(this).attr(p).replace(r,e)}).removeAttr(p)}}),define("troopjs-jquery/wire",["jquery","troopjs/pubsub/hub"],function(b,c){function s(a,b,c){return function(){return d.call(arguments,a),c.apply(b,arguments)}}var d=Array.prototype.unshift,e=Function,f=undefined,g=null,h=!1,i=/^(hub|dom)(?::(\w+))?\/([^\.]+(?:\.(.+))?)/,j="hub",k="dom",l="one",m="bind",n="wire",o="unwire",p="beforeWire",q="beforeUnwire",r="proxies";b.fn[n]=function(d){return b(this).each(function(n,o){var q=f,t,u,v,w,x;if(p in d){x=d[p];if(x instanceof e&&x.call(d,o)===h)return h}w=d[r]=r in d?d[r]:{};for(q in d){t=d[q],u=i.exec(q);if(u!==g){v=u[3];switch(u[1]){case j:c.subscribe(v,d,t);break;case k:w[v]=t=s(v,d,t),b(o)[u[2]===l?l:m](v,d,t)}}}})},b.fn[o]=function(d){return b(this).each(function(j,l){var m=f,n,o,p,s;if(q in d){s=d[q];if(s instanceof e&&s.call(d,l)===h)return h}o=d[r]=r in d?d[r]:{};for(m in d){n=i.exec(m);if(n!==g){p=n[3];switch(n[1]){case APP:c.unsubscribe(p,d[m]);break;case k:b(l).unbind(p,o[p])}}}})}}),function(){var a=["Msxml2.XMLHTTP","Microsoft.XMLHTTP","Msxml2.XMLHTTP.4.0"],b=/^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im,c=/<body[^>]*>\s*([\s\S]+)\s*<\/body>/im,d=typeof location!="undefined"&&location.href,e=d&&location.protocol&&location.protocol.replace(/\:/,""),f=d&&location.hostname,g=d&&(location.port||undefined),h=[];define("text",[],function(){var i,j,k;return typeof window!="undefined"&&window.navigator&&window.document?j=function(a,b){var c=i.createXhr();c.open("GET",a,!0),c.onreadystatechange=function(a){c.readyState===4&&b(c.responseText)},c.send(null)}:typeof process!="undefined"&&process.versions&&!!process.versions.node?(k=require.nodeRequire("fs"),j=function(a,b){var c=k.readFileSync(a,"utf8");c.indexOf("﻿")===0&&(c=c.substring(1)),b(c)}):typeof Packages!="undefined"&&(j=function(a,b){var c="utf-8",d=new java.io.File(a),e=java.lang.System.getProperty("line.separator"),f=new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream(d),c)),g,h,i="";try{g=new java.lang.StringBuffer,h=f.readLine(),h&&h.length()&&h.charAt(0)===65279&&(h=h.substring(1)),g.append(h);while((h=f.readLine())!==null)g.append(e),g.append(h);i=String(g.toString())}finally{f.close()}b(i)}),i={version:"1.0.7",strip:function(a){if(a){a=a.replace(b,"");var d=a.match(c);d&&(a=d[1])}else a="";return a},jsEscape:function(a){return a.replace(/(['\\])/g,"\\$1").replace(/[\f]/g,"\\f").replace(/[\b]/g,"\\b").replace(/[\n]/g,"\\n").replace(/[\t]/g,"\\t").replace(/[\r]/g,"\\r")},createXhr:function(){var b,c,d;if(typeof XMLHttpRequest!="undefined")return new XMLHttpRequest;for(c=0;c<3;c++){d=a[c];try{b=new ActiveXObject(d)}catch(e){}if(b){a=[d];break}}if(!b)throw new Error("createXhr(): XMLHttpRequest not available");return b},get:j,parseName:function(a){var b=!1,c=a.indexOf("."),d=a.substring(0,c),e=a.substring(c+1,a.length);return c=e.indexOf("!"),c!==-1&&(b=e.substring(c+1,e.length),b=b==="strip",e=e.substring(0,c)),{moduleName:d,ext:e,strip:b}},xdRegExp:/^((\w+)\:)?\/\/([^\/\\]+)/,useXhr:function(a,b,c,d){var e=i.xdRegExp.exec(a),f,g,h;return e?(f=e[2],g=e[3],g=g.split(":"),h=g[1],g=g[0],(!f||f===b)&&(!g||g===c)&&(!h&&!g||h===d)):!0},finishLoad:function(a,b,c,d,e){c=b?i.strip(c):c,e.isBuild&&(h[a]=c),d(c)},load:function(a,b,c,h){if(h.isBuild&&!h.inlineText){c();return}var j=i.parseName(a),k=j.moduleName+"."+j.ext,l=b.toUrl(k),m=h&&h.text&&h.text.useXhr||i.useXhr;!d||m(l,e,f,g)?i.get(l,function(b){i.finishLoad(a,j.strip,b,c,h)}):b([k],function(a){i.finishLoad(j.moduleName+"."+j.ext,j.strip,a,c,h)})},write:function(a,b,c,d){if(b in h){var e=i.jsEscape(h[b]);c.asModule(a+"!"+b,"define(function () { return '"+e+"';});\n")}},writeFile:function(a,b,c,d,e){var f=i.parseName(b),g=f.moduleName+"."+f.ext,h=c.toUrl(f.moduleName+"."+f.ext)+".js";i.load(g,c,function(b){var c=function(a){return d(h,a)};c.asModule=function(a,b){return d.asModule(a,h,b)},i.write(a,g,c,e)},e)}},i})}(),define("template",["text"],function(b){function k(a){function k(a,c,d){return b[j]=c?'" +'+d+'+ "':'";'+d+'o += "',"<%"+String(j++)+"%>"}function l(a,c){return b[c]}function m(a,b){return i[b]||b}var b=[],j=0;return new Function("data",('var o; o = "'+a.replace(c,"").replace(d,k).replace(f,m).replace(e,l)+'"; return o;').replace(g,h))}var c=/^[\n\t\r]+|[\n\t\r]+$/g,d=/<%(=)?([\S\s]*?)%>/g,e=/<%(\d+)%>/gm,f=/(["\n\t\r])/gm,g=/o \+= "";| \+ ""/gm,h="",i={'"':'\\"',"\n":"\\n","\t":"\\t","\r":"\\r"},j={};return{load:function(a,c,d,e){b.load(a,c,function(b){var c=j[a]=k(b);c.displayName=a,d(c)},e)},write:function(a,b,d,e){b in j&&d.asModule(a+"!"+b,"define(function () { return "+j[b].toString().replace(c,h)+";});\n")}}})