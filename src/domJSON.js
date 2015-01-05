/**
 * domJSON.js: A simple framework for converting DOM nodes to special JSON objects, and vice versa
 *
 * @fileOverview
 * @author  Alex Zaslavsky
 * @version 0.3
 * @license The MIT License: Copyright (c) 2013 Alex Zaslavsky
 */



//Load the library
;(function(root, factory) {
	/* istanbul ignore next */
	if (typeof define === 'function' && define.amd) { //AMD
		define(function(){
			return factory(root);
		});
	} else if (typeof exports !== 'undefined') { //CommonJS/node.js
		var domJSON = factory(root);
		if (typeof module !== 'undefined' && module.exports) {
			module.exports = domJSON;
		}
		exports = dmoJSON;
	} else { //Browser global
		window.domJSON = factory(root);
	}
})(this, function(win){
	"use strict";

	/** 
	 * domJSON is a global variable to store two methods: `.toJSON()` to convert a DOM Node into a JSON object, and `.toDOM()` to turn that JSON object back into a DOM Node
	 * @namespace domJSON
	 * @global
	 */
	var domJSON = {};



	/** 
	 * Default metadata for a JSON object
	 * @private
	 * @ignore
	 */
	var metadata = {
		domain: win.location.href || null,
		userAgent: window.navigator && window.navigator.userAgent ? window.navigator.userAgent : null,
		version: /* version */'0.1.0'/* end-version */
	};
	
	
	
	/** 
	 * Default options for creating the JSON object
	 * @private
	 * @ignore
	 */
	var defaultsForToJSON = {
		absolute: {
			base: win.location.origin + '/',
			action: false,
			href: false,
			style: false,
			src: false,
			other: false
		},
		attributes: true,
		computedStyle: false,
		cull: true,
		deep: true,
		filter: false,
		htmlOnly: false,
		metadata: true,
		//parse: false,
		serials: false,
		stringify: false
	};



	/** 
	 * Default options for creating a DOM node from a previously generated domJSON object
	 * @private
	 * @ignore
	 */
	var defaultsForToDOM = {
		noMeta: false
	};



	/** 
	 * A list of disallowed HTMLElement tags - there is no flexibility here, these cannot be processed by domJSON for security reasons!
	 * @private
	 * @ignore
	 */
	var banned = [
		'link',
		'script'
	]; //Consider (maybe) adding the following tags: iframe, html, audio, video, object



	/** 
	 * A list of node properties that must be copied if they exist; there is no user option that will remove these
	 * @private
	 * @ignore
	 */
	var required = [
		'nodeType',
		'nodeValue',
		'tagName'
	];
	
	
	
	/** 
	 * A list of node properties to specifically avoid simply copying; there is no user option that will allow these to be copied directly
	 * @private
	 * @ignore
	 */
	var ignored = [
		'attributes',
		'childNodes',
		'children',
		'classList',
		'dataset',
		'style'
	];
	
	
	
	/** 
	 * A list of serialized read-only nodes to ignore; these can ovewritten if the user specifies the "filter" option
	 * @private
	 * @ignore
	 */
	var serials = [
		'innerHTML',
		'innerText',
		'outerHTML',
		'outerText',
		'prefix',
		'text',
		'textContent',
		'wholeText'
	];



	/**
	 * Utility function to extend an object - useful for synchronizing user-submitted options with default values; same API as underscore extend
	 * @param {Object} [target] The object that will be extended
	 * @param {...Object} [added] Additional objects that will extend the target
	 * @private
	 * @ignore
	*/
	var extend = function(target) {
		if (!arguments.length) {
			return arguments[0] || {};
		}

		//Overwrite matching properties on the target from the added object
		for (var p in arguments[1]) {
			target[p] = arguments[1][p];
		}

		//If we have more arguments, run the function recursively
		if (arguments.length > 2) {
			var moreArgs = [target].concat(Array.prototype.slice.call(arguments, 2));
			return extend.apply( null, moreArgs);
		} else {
			return target;
		}
	};



	/**
	 * Get all of the unique values (in the order they first appeared) from one or more arrays
	 * @param {...Array} constituent An array to combine into a larger array of unique values
	 * @private
	 * @ignore
	*/
	var unique = function() {
		if (!arguments.length) {
			return [];
		}

		var all = Array.prototype.concat.apply([], arguments);
		for (var a = 0; a < all.length; a++) {
			if (all.indexOf(all[a]) < a) {
				all.splice(a, 1);
				a--;
			}
		}
		return all;
	};


	/**
	 * Make a shallow copy of an object or array
	 * @param {Object|string[]} item The object/array that will be copied
	 * @private
	 * @ignore
	*/
	var copy = function(item) {
		if (item instanceof Array) {
			return item.slice();
		} else {
			var output = {};
			for (var i in item) {
				output[i] = item[i];
			}
			return output;
		}
	};



	/**
	 * Do a boolean intersection between an array/object and a filter array
	 * @param {Object|string[]} item The object/array that will be intersected with the filter
	 * @param {boolean|string[]} filter Specifies which properties to select from the "item" (or element to keep, if "item is an array")
	 * @private
	 * @ignore
	*/
	var boolInter = function(item, filter) {
		var output;
		if (item instanceof Array) {
			output = unique(item.filter(function(val) { return filter.indexOf(val) > -1; }));
		} else {
			output = {};
			for (var f in filter) {
				if (item.hasOwnProperty(filter[f])) {
					output[filter[f]] = item[filter[f]];
				}
			}
		}
		return output;
	};



	/**
	 * Do a boolean difference between an array/object and a filter array
	 * @param {Object|string[]} item The object/array that will be differntiated with the filter
	 * @param {boolean|string[]} filter Specifies which properties to exclude from the "item" (or element to remove, if "item is an array")
	 * @private
	 * @ignore
	*/
	var boolDiff = function(item, filter) {
		var output;
		if (item instanceof Array) {
			output = unique(item.filter(function(val) { return filter.indexOf(val) === -1; }));
		} else {
			output = {};
			for (var i in item) {
				output[i] = item[i];
			}
			for (var f in filter) {
				if (output.hasOwnProperty(filter[f])) {
					delete output[filter[f]];
				}
			}
		}
		return output;
	};



	/**
	 * Determine whether we want to do a boolean intersection or difference
	 * @param {Object|string[]} item The object/array that will be differntiated with the filter
	 * @param {boolean|Array} filter Specifies which a filter behavior; if it is an array, the first value can be a boolean, indicating whether the filter array is intended for differentiation (true) or intersection (false)
	 * @private
	 * @ignore
	*/
	var boolFilter = function(item, filter) {
		//A "false" filter means we return an empty copy of item
		if (filter === false){
			return (item instanceof Array) ? [] : {};
		}

		if (filter instanceof Array && filter.length) {
			if (typeof filter[0] === 'boolean') {
				if (filter.length == 1 && typeof(filter[0]) === 'boolean') {
					//There is a filter array, but its only a sigle boolean
					if (filter[0] === true) {
						return copy(item);
					} else {
						return (item instanceof Array) ? [] : {};
					}
				} else {
					//The filter operation has been set explicitly; true = difference
					if (filter[0] === true) {
						return boolDiff(item, filter.slice(1));
					} else {
						return boolInter(item, filter.slice(1));
					}
				}
			} else {
				//There is no explicit operation on the filter, meaning it defaults to an intersection
				return boolInter(item, filter);
			}
		} else {
			return copy(item);
		}
	};



	/**
	 * Check if the supplied attribute contains a path, and convert it from a relative path to an absolute; some code shamelessly copped from here: http://stackoverflow.com/a/14780463/2230156
	 * @param {Node} node The DOM Node whose path containing attributes will be converted to absolute paths
	 * @param {string} name The name of the attribute to try and convert
	 * @param {string} value The value of that attribute
	 * @param {Object} settings The previously specified path conversion settings
	 * @private
	 * @ignore
	*/
	var toAbsolute = function(node, name, value, settings) {
		if (settings.keys.indexOf(name) !== -1){
			if (node[name]){
				//We can just grab the compiled URL directly from the DOM element - easy peasy
				var sub = node[name].indexOf(value);
				if (sub !== -1) {
					return node[name];
				}
			}

			//Check to make sure we don't already have an absolute path, or even a dataURI
			if ( value.match(/(?:^data\:|^[\w\-\+\.]*?\:\/\/|^\/\/)/i) ){
				return value;
			}

			//If we are using the root URL, start from there
			if ( value.substr(0,1) === '/' ){
				return settings.base + value.substr(1);
			}

			//Gotta do it the hard way and figure this sucker out...
			var stack = settings.base.split('/');
			var parts = value.split('/');

			//The value after the last slash is ALWAYS considered a filename, not a directory, so always have trailing slashes on paths ending at directories!
			stack.pop();

			//Cycle through the relative path, changing the stack as we go
			for (var i=0; i<parts.length; i++) {
				if (parts[i] == '.') {
					continue;
				}
				if (parts[i] == '..') {
					stack.pop();
				} else {
					stack.push(parts[i]);
				}
			}
			return stack.join('/');
		}
		return value;
	};



	/**
	 * Create a copy of a node's properties, ignoring nasty things like event handles and functions
	 * @param {Node} node The DOM Node whose properties will be copied
	 * @param {Object} [opts] The options object passed down from the .toJSON() method; includes all options, even those not relevant to this function
	 * @private
	 * @ignore
	*/
	var copyJSON = function(node, opts) {
		var copy = {};
		//Copy all of the node's properties
		for (var n in node){
			//Make sure this is an own property, and isn't a live javascript function for security reasons
			if (node.hasOwnProperty(n) && typeof node[n] !== 'function') {
				//Only allowed objects are arrays
				if ( !(node[n] instanceof Object) || node[n] instanceof Array ) {
					//If we are eliminating empty fields, make sure this value is not NULL or UNDEFINED
					if (opts.cull) {
						if (node[n] || node[n] === 0 || node[n] === false) {
							copy[n] = node[n];
						}
					} else {
						copy[n] = node[n];
					}
				}
			}
		}

		copy = boolFilter(copy, opts.filter);
		return copy;
	};



	/**
	 * Convert the attributes property of a DOM Node to a JSON ready object
	 * @param {Node} node The DOM Node whose attributes will be copied
	 * @param {Object} [opts] The options object passed down from the .toJSON() method; includes all options, even those not relevant to this function
	 * @private
	 * @ignore
	*/
	var attrJSON = function(node, opts) {
		var attributes = {};
		var attr = node.attributes;
		var length = attr.length;

		//Are we going to replace relative paths?
		if (opts.absolute.keys.length > 1 || (opts.absolute.keys.length === 1 && opts.absolute.keys[0] !== 'style') ) {
			//Yes - we need to test for absolute paths
			for (var i = 0; i < length; i++) {
				attributes[attr[i].name] = toAbsolute(node, attr[i].name, attr[i].value, opts.absolute);
			}
		} else {
			//Make a simple object storing just the attribute name-value pairs
			for (var i = 0; i < length; i++) {
				attributes[attr[i].name] = attr[i].value;
			}
		}

		if (opts.attributes) {
			attributes = boolFilter(attributes, opts.attributes);
		}
		return attributes;
	};



	/**
	 * Grab a DOM Node's computed style
	 * @param {Node} node The DOM Node whose computed style will be calculated
	 * @param {Object} [opts] The options object passed down from the .toJSON() method; includes all options, even those not relevant to this function
	 * @private
	 * @ignore
	*/
	var styleJSON = function(node, opts) {
		//Grab the computed style
		var style, css = {};
		if (opts.computedStyle && node.style instanceof CSSStyleDeclaration) {
			style = win.getComputedStyle(node);
		} else {
			return null;
		}

		//Get the relevant properties from the computed style
		for (var k in style) {
			if ( k !== 'cssText' && !k.match(/\d/) && typeof style[k] === 'string' && style[k].length ) {
				//css.push(k+ ': ' +style[k]+ ';');
				css[k] = style[k];
			}
		}

		//Filter the style object
		return (opts.computedStyle instanceof Array) ? boolFilter(css, opts.computedStyle) : css;
	};
	
	
	
	//Convert a single DOM node into a simple object
	/**
	 * Convert a single DOM Node into a simple object
	 * @param {Node} node The DOM Node that will be converted
	 * @param {Object} [opts] The options object passed down from the .toJSON() method; includes all options, even those not relevant to this function
	 * @private
	 * @ignore
	*/
	var toJSON = function(node, opts, depth) {
		var style, kids, kidCount, thisChild, children, copy = copyJSON(node, opts);

		//Some tags are not allowed
		if (node.nodeType === 1) {
			for (var b in banned) {
				if (node.tagName.toLowerCase() === banned[b]) {
					return null;
				}
			}
		} else if (node.nodeType === 3 && !node.nodeValue.trim()) {
			//Ignore empty buffer text nodes
			return null;
		}

		//Copy all attributes and styles, if allowed
		if (opts.attributes && node.hasOwnProperty('attributes')) { 
			copy.attributes = attrJSON(node, opts);
		}
		if (opts.computedStyle && (style = styleJSON(node, opts))) {
			copy.style = style;
		}
		
		//Should we continue iterating?
		if (opts.deep === true || (typeof opts.deep === 'number' && opts.deep > depth)) {
			//We should!
			children = [];
			kids = (opts.htmlOnly) ? node.children : node.childNodes;
			kidCount = kids.length;
			for (var c = 0; c < kidCount; c++) {
				thisChild = toJSON(kids[c], opts, depth + 1);
				if (thisChild) {
					children.push(thisChild);
				}
			}

			//Append the children in the appropriate place
			copy.childNodes = children;
		}
		return copy;
	};
	
	
	
	/**
	 * Take a DOM node and convert it to simple object literal (or JSON string) with no circular references and no functions or events
	 * @param {Node} node The actual DOM Node in to be parsed
	 * @param {Object} [opts] A list of all method options
	 * @param {Object|Boolean} [opts.absolute=false] Specify attributes for which relative paths are to be converted to absolute
	 * @param {string} [opts.absolute.base] The basepath from which the relative path will be "measured" to create an absolute path; will default to the domain origin
 	 * @param {boolean} [opts.absolute.action=false] `true` means relative paths in "action" attributes are converted to absolute paths
 	 * @param {boolean} [opts.absolute.data=false] `true` means relative paths in "data" attributes are converted to absolute paths
	 * @param {boolean} [opts.absolute.href=false] `true` means relative paths in "href" attributes are converted to absolute paths
	 * @param {boolean} [opts.absolute.style=false] `true` means relative paths in "style" attributes are converted to absolute paths
	 * @param {boolean} [opts.absolute.src=false] `true` means relative paths in "src" attributes are converted to absolute paths
	 * @todo {boolean} [opts.absolute.other=false] `true` means all fields that are NOT "acton," "data," "href", "style," or "src" will be checked for paths and converted to absolute if necessary - this operation is very expensive! **PLANNED**
	 * @param {boolean|string[]} [opts.attributes=true] `true` to copy all attribute key-value pairs, or specify an `Array` of keys to boolean search
	 * @param {boolean|string[]} [opts.computedStyle=false] `true` parse the results of "window.getComputedStyle()"" on every node (specify an `Array` of CSS proerties to be included via boolean search); this operation is VERY costrly performance-wise!
	 * @param {boolean} [opts.cull=false] `true` to ignore empty element properties
	 * @param {boolean|number} [opts.deep=true] `true` to iterate and copy all childNodes, or an INTEGER indicating how many levels down the DOM tree to iterate
	 * @param {string[]|boolean} [opts.filter=false] An `Array` of all the non-required properties to be copied
	 * @param {boolean} [opts.htmlOnly=false] `true` to only iterate through childNodes where nodeType = 1 (aka, isntances of HTMLElement); irrelevant if `opts.deep` is `true`
	 * @param {boolean} [opts.metadata=false] Output a special object of the domJSON class, which includes metadata about this operation
	 * @todo {string[]|boolean} [opts.parse=false] An `Array` of properties that are DOM nodes, but will still be copied **PLANNED**
	 * @param {boolean|string[]} [opts.serials=true] `true` to ignore the properties that store a serialized version of this DOM Node (ex: outerHTML), or specify an `Array` of serials (no boolean search!)
	 * @param {boolean} [opts.stringify=false] Output a JSON string, or just a JSON-ready javascript object?
	 * @return {Object|string} A JSON-friendly object, or JSON string, of the DOM node -> JSON conversion output
	 * @method
	 * @memberof domJSON
	*/
	domJSON.toJSON = function(node, opts) {
		var copy, keys = [], options = {}, output = {};
		var timer = new Date().getTime();
		var requiring = required.slice();
		var ignoring = ignored.slice();
		//Update the default options w/ the user's custom settings
		options = extend({}, defaultsForToJSON, opts);

		//Make sure the "attributes" option is properly formatted
		options.absolute = {
			base: (typeof options.absolute === 'string') ? (win.location.origin + '/') : ((options.absolute.base) || (win.location.origin + '/') ),
			action: (typeof options.absolute === 'boolean') ? options.absolute : ((options.absolute.action) || false),
			href: (typeof options.absolute === 'boolean') ? options.absolute : ((options.absolute.href) || false),
			style: (typeof options.absolute === 'boolean') ? options.absolute : ((options.absolute.style) || false),
			src: (typeof options.absolute === 'boolean') ? options.absolute : ((options.absolute.src) || false),
			other: (typeof options.absolute === 'boolean') ? options.absolute : ((options.absolute.other) || false),
		};
		options.absolute.other = false; //Disable "other" absolute pathing for now
		for (var k in options.absolute) {
			if (options.absolute[k] && k !== 'base') {
				keys.push(k);
			}
		}
		options.absolute.keys = keys;

		//Make lists of which DOM properties to skip and/or which are absolutely necessary
		if (options.serials !== true) {
			if (options.serials instanceof Array && options.serials.length) {
				if (options.serials[0]) {
					ignoring = ignoring.concat( boolDiff(serials, options.serials) );
				} else {
					ignoring = ignoring.concat( boolInter(serials, options.serials) );
				}
			} else {
				ignoring = ignoring.concat( serials );
			}
		}
		if (options.filter instanceof Array) {
			if (options.filter[0] === true) {
				options.filter = boolDiff( unique(options.filter, ignoring), requiring );
			} else {
				options.filter = boolDiff( unique(options.filter, requiring), ignoring );
			}
		} else {
			options.filter = [true].concat(ignoring);
		}
		
		//Transform the node into an object literal
		copy = toJSON(node, options, 0);
		
		//Wrap our copy object in a nice object of its own to save some metadata
		if (options.metadata) {
			output.meta = extend({}, metadata, {
				options: options,
				clock: new Date().getTime() - timer
			});
			output.node = copy;
		} else {
			output = copy;
		}
		
		//If opts.stringify is true, turn the output object into a JSON string
		if (options.stringify) {
			return JSON.stringify(output);
		}
		return output;
	};



	/**
	 * Create a node based on a given nodeType
	 * @param {number} type The type of DOM Node (only the integers 1, 3, 7, 8, 9, 10, 11 are valid, see https://developer.mozilla.org/en-US/docs/Web/API/Node.nodeType); currently, only nodeTypes 1,3, and 11 have been tested and are officially supported
	 * @param {DocumentFragment} doc The document fragment to which this newly created DOM Node will be added
	 * @param {Object} data The saved DOM properties that are part of the JSON representation of this DOM Node
	 * @private
	 * @ignore
	*/
	var createNode = function(type, doc, data) {
		if (doc instanceof DocumentFragment) {
			doc = doc.ownerDocument;
		}
		switch(type) {
		case 1: //HTMLElement
			if (typeof data.tagName === 'string') {
				return doc.createElement(data.tagName);
			}
			return false;

		case 3: //Text Node
			if (typeof data.nodeValue === 'string' && data.nodeValue.length) {
				return doc.createTextNode(data.nodeValue);
			}
			return doc.createTextNode('');

		case 7: //Processing Instruction
			if (data.hasOwnProperty('target') && data.hasOwnProperty('data')) {
				return doc.implementation.createHTMLDocument(data.target, data.data);
			}
			return false;

		case 8: //Comment Node
			if (typeof data === 'string') {
				return doc.createComment(data);
			}
			return doc.createComment('');

		case 9: //HTML Document
			return doc.implementation.createHTMLDocument(data);

		case 10: //DocType
			if (data.hasOwnProperty('name') && data.hasOwnProperty('publicId') && data.hasOwnProperty('systemId')) {
				return doc.implementation.createDocumentType(data.name, data.publicId, data.systemId);
			}
			return false;

		case 11: //Document Fragment
			return doc.implementation.createDocumentFragment();

		default: //Failed
			return false;
		}
	};



	//Recursively convert a JSON object generated by domJSON to a DOM Node
	/**
	 * Do the work of converting a JSON object/string generated by domJSON to a DOM Node
	 * @param {Object} obj The JSON representation of the DOM Node we are about to create
	 * @param {HTMLElement} parent The HTML Element to which this DOM Node will be appended
	 * @param {DocumentFragment} doc The document fragment to which this newly created DOM Node will be added
	 * @private
	 * @ignore
	*/
	var toDOM = function(obj, parent, doc) {
		//Create the node, if possible
		if (obj.nodeType) {
			var node = createNode(obj.nodeType, doc, obj);
			parent.appendChild(node);
		} else {
			return false;
		}

		//Copy all available properties that are not arrays or objects
		for (var x in obj) {
			if (!(obj[x] instanceof Object)) {
				node[x] = obj[x];
			}
		}

		//If this is an HTMLElement, set the attributes
		var src;
		if (obj.nodeType === 1 && obj.tagName) {
			if (obj.attributes) {
				//Check for cross-origin
				/*src = obj.attributes.src ? 'src' : (obj.attributes.href ? 'href' : null);
				if (src) {
					obj.attributes[src] += ( (obj.attributes[src].indexOf('?') === -1) ? '?' : '&'+Math.random().toString(36).slice(-2)+'=' ) + Math.random().toString(36).slice(-4);
					obj.attributes.crossorigin = 'anonymous';
					//node.setAttribute('crossorigin', 'anonymous');
				}*/
				for (var a in obj.attributes) {
					node.setAttribute(a, obj.attributes[a]);
				}
			}
		}

		//Finally, if we have childNodes, recurse through them
		if (obj.childNodes && obj.childNodes.length) {
			for (var c in obj.childNodes) {
				toDOM(obj.childNodes[c], node, doc);
			}
		}
	};



	/**
	 * Take the JSON-friendly object created by the `.toJSON()` method and rebuild it back into a DOM Node
	 * @param {Object} obj A JSON friendly object, or even JSON string, of some DOM Node
	 * @param {Object} [opts] A list of all method options
	 * @param {boolean} [opts.noMeta] `true` means that this object is not wrapped in metadata, which it makes it somewhat more difficult to rebuild properly...
	 * @return {DocumentFragment} A `DocumentFragment` (nodeType 11) containing the result of unpacking the input `obj`
	 * @method
	 * @memberof domJSON
	*/
	domJSON.toDOM = function(obj, opts) {
		var options, node;
		//Parse the JSON string if necessary
		if (typeof obj === 'string') {
			obj = JSON.parse(obj);
		}
		//Update the default options w/ the user's custom settings
		options = extend({}, defaultsForToDOM, opts);

		//Create a document fragment, and away we go!
		node = document.createDocumentFragment();
		if (options.noMeta) {
			toDOM(obj, node, node);
		} else {
			toDOM(obj.node, node, node);
		}
		return node;
	};



	//The code below is only included for private API testing, and needs to be removed in distributed builds
	/* test-code */
	domJSON.__extend = extend;
	domJSON.__unique = unique;
	domJSON.__copy = copy;
	domJSON.__boolFilter = boolFilter;
	domJSON.__boolInter = boolInter;
	domJSON.__boolDiff = boolDiff;
	domJSON.__toAbsolute = toAbsolute;
	/* end-test-code */

	return domJSON;
});