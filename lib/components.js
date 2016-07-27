/*global MutationObserver */
/**
 * @fileOverview This file contains the /components/ module for emulating Web Components behavior.
 * @name components.js<src>
 * @author Etienne Prud’homme
 * @version 1.0.0
 * @link https://github.com/notetiene/components
 * @license GPLv3
 */
var components=function(){var e={},t=document.createRange();t.selectNode(document.body);var r=function(t,r,n){if(t.constructor!==String||""===t)throw new Error("Cannot register the component. The name must be a String.");if(r.constructor!==String||""===r)throw new Error("Cannot register "+t+" component. The template must be a String.");if(void 0!==e[t]&&e.hasOwnProperty(t))throw new Error(t+" is an already registered component.");var o=n||{};Object.defineProperty(e,t,{enumerable:!1,configurable:!1,writable:!1,value:{template:r,proto:o}})},n=function(r){if(!e.hasOwnProperty(r))throw new Error("“"+r+"” is not a registered component");for(var n=e[r],o=t.createContextualFragment(n.template),a=null,i=0,c=o.childNodes.length;i<c;i++)if(8!==o.childNodes[i].nodeType){a=o.childNodes[i];break}if(null===a)throw new Error("The “"+r+"” component doesn’t contain a valid node.");var l=n.proto.attachedCallback;if(l instanceof Function){var s=new MutationObserver(function(e){for(var t=0,r=e.length;t<r;t++)"childList"===e[t].type&&0===o.childNodes.length&&l.call(a)});s.observe(o,{childList:!0})}var u=n.proto.attributeChangedCallback;if(u instanceof Function){var d=new MutationObserver(function(e){for(var t=0,r=e.length;t<r;t++)"attributes"===e[t].type&&u.call(a)});d.observe(a,{attributes:!0})}return o};return{registerElement:r,createElement:n}}();