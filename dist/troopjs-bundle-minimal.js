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
define("troopjs/component/base",["compose","config"],function(b,c){var d=0;return b(function(){this.instanceCount=d++},{config:c,displayName:b.required,toString:function e(){var a=this;return a.displayName+"@"+a.instanceCount}})}),define("deferred",["jquery"],function(b){return b.Deferred}),define("troopjs/pubsub/topic",["../component/base"],function(b){var c=Array;return b.extend(function(b,c,d){var e=this;e.topic=b,e.publisher=c,e.parent=d},{displayName:"pubsub/topic",toString:function d(){return this.topic},trace:function(){var b=this,d=b.constructor,e,f,g="",h,i;while(b){if(b.constructor===c){for(h=0,i=b.length;h<i;h++)f=b[h],b[h]=f.constructor===d?f.trace():f;g+=b.join(",");break}e=b.parent,g+=e?b.publisher+":":b.publisher,b=e}return g}})}),define("troopjs/pubsub/hub",["compose","../component/base","./topic"],function(b,c,d){var e=undefined,f="/**";return b.create(c,function(){var b=this;b.re=/\/\w+(?=\/)|\*{1,2}$/g,b.context={},b.topics={}},{displayName:"pubsub/hub",subscribe:function(b){var c=this,d=c.topics,e=1,f=arguments.length,g=arguments[e],h,i;g instanceof Function?g=c.context:e++;if(b in d){i=d[b].tail;for(;e<f;e++)i=i.next={callback:arguments[e],context:g};d[b].tail=i}else{h=i={callback:arguments[e++],context:g};for(;e<f;e++)i=i.next={callback:arguments[e],context:g};d[b]={head:h,tail:i}}return c},unsubscribe:function(b){var c=this,d=c.topics,f,g=arguments.length,h,i=null,j,k;a:{if(!b in d)break a;if(g===1){delete d[b];break a}h=d[b].head;for(f=1;f<g;f++){k=arguments[f],j=i=h;do{if(j.callback===k){if(j===h){h=i=j.next;continue}i.next=j.next;continue}i=j}while(j=j.next);if(h===e){delete d[b];break a}}d[b]={head:h,tail:i}}return c},publish:function(b){var c=this,e=c.topics,g=b.constructor===d?b.toString():b,h=c.re,i=new Array,j,k=0,l;while(h.test(g))i[k++]=g.substr(0,h.lastIndex)+f;k>0&&(i[k]=i[k-1].slice(0,-1),k++),i[k]=g;if(arguments.length===0){do{j=i[k];if(!(j in e))continue;l=e[j].head;do l.callback.call(l.context);while(l=l.next)}while(k-->0)}else do{j=i[k];if(!(j in e))continue;l=e[j].head;do l.callback.apply(l.context,arguments);while(l=l.next)}while(k-->0);return c}})}),define("troopjs/component/gadget",["./base","../pubsub/hub","../pubsub/topic","deferred"],function(b,c,d,e){var f=c.publish,g=c.subscribe,h=c.unsubscribe;return b.extend({publish:function(){var b=this;return f.apply(c,arguments),b},subscribe:function(){var b=this;return g.apply(c,arguments),b},unsubscribe:function(){var b=this;return h.apply(c,arguments),b},ajax:function(b,c){var e=this;return e.publish(new d("app/ajax",e),b,c),e}})}),define("troopjs/component/widget",["./gadget","jquery"],function(b,c){function l(a){function b(b,d,f){var i=this;b instanceof e?b=b.call(i,d):f=d;var j=i[h],k=c.Deferred(function(d){a.call(j,b),i.weave(j,d)}).done(function(){j.trigger(g,arguments)});return f&&k.then(f.resolve,f.reject),i}return b}var d=undefined,e=Function,f=Array.prototype.slice,g="widget/refresh",h="$element",i="displayName",j="[data-weave]",k="[data-woven]";return b.extend(function(b,d){var e=this;e[h]=c(b),d!==undefined&&(e[i]=d)},{displayName:"component/widget",weave:function(b,c){return b.find(j).weave(c),this},unweave:function(b){return b.find(k).andSelf().unweave(),this},trigger:function(b){return $element.trigger(b,f.call(arguments,1)),this},before:l(c.fn.before),after:l(c.fn.after),html:l(c.fn.html),append:l(c.fn.append),prepend:l(c.fn.prepend),empty:function(b){var d=this,e=d[h],f=c.Deferred(function(b){var c=e.contents().detach();e.trigger(g,arguments);var d=c.get();setTimeout(function(){try{c.remove(),b.resolve(d)}catch(e){b.reject(d)}},0)});return b&&f.then(b.resolve,b.reject),d},"dom/destroy":function(b,c){var f=this,g=f.destructor,i=d;return g instanceof e&&(i=g.call(f)),i!==!1&&f.unweave(f[h]),i}})}),define("troopjs/remote/ajax",["compose","../component/base","../pubsub/topic","../pubsub/hub","jquery"],function(b,c,d,e,f){function g(a,b,c){f.extend(!0,b,{headers:{"x-my-request":(new Date).getTime(),"x-my-component":a.constructor===d?a.trace():a}}),f.ajax(b).then(c.resolve,c.reject)}return b.create(c,function(){e.subscribe("hub/ajax",this,g)},{displayName:"remote/ajax"})}),define("troopjs/store/base",["compose","../component/gadget"],function(b,c){return c.extend({set:b.required,get:b.required,remove:b.required,clear:b.required})});var JSON;JSON||(JSON={}),function(){function f(a){return a<10?"0"+a:a}function quote(a){return escapable.lastIndex=0,escapable.test(a)?'"'+a.replace(escapable,function(a){var b=meta[a];return typeof b=="string"?b:"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)})+'"':'"'+a+'"'}function str(a,b){var c,d,e,f,g=gap,h,i=b[a];i&&typeof i=="object"&&typeof i.toJSON=="function"&&(i=i.toJSON(a)),typeof rep=="function"&&(i=rep.call(b,a,i));switch(typeof i){case"string":return quote(i);case"number":return isFinite(i)?String(i):"null";case"boolean":case"null":return String(i);case"object":if(!i)return"null";gap+=indent,h=[];if(Object.prototype.toString.apply(i)==="[object Array]"){f=i.length;for(c=0;c<f;c+=1)h[c]=str(c,i)||"null";return e=h.length===0?"[]":gap?"[\n"+gap+h.join(",\n"+gap)+"\n"+g+"]":"["+h.join(",")+"]",gap=g,e}if(rep&&typeof rep=="object"){f=rep.length;for(c=0;c<f;c+=1)typeof rep[c]=="string"&&(d=rep[c],e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e))}else for(d in i)Object.prototype.hasOwnProperty.call(i,d)&&(e=str(d,i),e&&h.push(quote(d)+(gap?": ":":")+e));return e=h.length===0?"{}":gap?"{\n"+gap+h.join(",\n"+gap)+"\n"+g+"}":"{"+h.join(",")+"}",gap=g,e}}typeof Date.prototype.toJSON!="function"&&(Date.prototype.toJSON=function(a){return isFinite(this.valueOf())?this.getUTCFullYear()+"-"+f(this.getUTCMonth()+1)+"-"+f(this.getUTCDate())+"T"+f(this.getUTCHours())+":"+f(this.getUTCMinutes())+":"+f(this.getUTCSeconds())+"Z":null},String.prototype.toJSON=Number.prototype.toJSON=Boolean.prototype.toJSON=function(a){return this.valueOf()});var cx=/[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,escapable=/[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,gap,indent,meta={"\b":"\\b","\t":"\\t","\n":"\\n","\f":"\\f","\r":"\\r",'"':'\\"',"\\":"\\\\"},rep;typeof JSON.stringify!="function"&&(JSON.stringify=function(a,b,c){var d;gap="",indent="";if(typeof c=="number")for(d=0;d<c;d+=1)indent+=" ";else typeof c=="string"&&(indent=c);rep=b;if(!b||typeof b=="function"||typeof b=="object"&&typeof b.length=="number")return str("",{"":a});throw new Error("JSON.stringify")}),typeof JSON.parse!="function"&&(JSON.parse=function(text,reviver){function walk(a,b){var c,d,e=a[b];if(e&&typeof e=="object")for(c in e)Object.prototype.hasOwnProperty.call(e,c)&&(d=walk(e,c),d!==undefined?e[c]=d:delete e[c]);return reviver.call(a,b,e)}var j;text=String(text),cx.lastIndex=0,cx.test(text)&&(text=text.replace(cx,function(a){return"\\u"+("0000"+a.charCodeAt(0).toString(16)).slice(-4)}));if(/^[\],:{}\s]*$/.test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,"@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:\s*\[)+/g,"")))return j=eval("("+text+")"),typeof reviver=="function"?walk({"":j},""):j;throw new SyntaxError("JSON.parse")})}(),typeof define=="function"&&typeof define.amd=="object"&&define.amd&&define("json",[],function(){return JSON}),define("troopjs/store/local",["compose","./base","json"],function(b,c,d){var e=window.localStorage;return b.create(c,{displayName:"store/local",set:function(b,c,f){e.setItem(b,d.stringify(c)),f&&f.resolve instanceof Function&&f.resolve(c)},get:function(b,c){var f=d.parse(e.getItem(b));c&&c.resolve instanceof Function&&c.resolve(f)},remove:function(b,c){e.removeItem(b),c&&c.resolve instanceof Function&&c.resolve()},clear:function(b){e.clear(),b&&b.resolve instanceof Function&&b.resolve()}})}),define("troopjs/store/session",["compose","./base","json"],function(b,c,d){var e=window.sessionStorage;return b.create(c,{displayName:"store/session",set:function(b,c,f){e.setItem(b,d.stringify(c)),f&&f.resolve instanceof Function&&f.resolve(c)},get:function(b,c){var f=d.parse(e.getItem(b));c&&c.resolve instanceof Function&&c.resolve(f)},remove:function(b,c){e.removeItem(b),c&&c.resolve instanceof Function&&c.resolve()},clear:function(b){e.clear(),b&&b.resolve instanceof Function&&b.resolve()}})})