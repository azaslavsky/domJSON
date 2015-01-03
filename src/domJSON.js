/**
 * domJSON.js: A simple framework for converting DOM nodes to special JSON objects, and vice versa
 *
 * @fileOverview
 * @author  Alex Zaslavsky
 * @version 0.3
 * @license The MIT License: Copyright (c) 2013 Alex Zaslavsky
 */

/** 
 * A global variable to store domJSON
 * @namespace
 * @singleton
 */
var domJSON = {};



//Load the library
(function(domJSON, win){
	//The default metadata for a JSON object
	var metadata = {
		node: null,
		domain: win.location.href || null
	};
	
	
	
	//A list of default options for creating the JSON object
	var defaults = {
		deep: true,
		html: false,
		cull: false,
		computed: false,
		style: true,
		attributes: true,
		serials: false,
		//parse: false,
		filter: false,
		stringify: false,
		metadata: true,
		absolute: {
			base: win.location.origin + '/',
			action: false,
			href: false,
			style: false,
			src: false,
			other: false
		}
	};



	//A list of disallowed HTMLElement tags - there is no flexibility here, these cannot be processed by domJSON for security reasons!
	var banned = [
		'link',
		'script'
	]; //Consider (maybe) adding the following tags: iframe, html, audio, video, object



	//A list of node properties that must be copied if they exist; there is no user option that will remove these
	var required = [
		'nodeType',
		'nodeValue',
		'tagName'
	];
	
	
	
	//A list of node properties to specifically avoid simply copying; there is no user option that will allow these to be copied directly
	var ignored = [
		'attributes',
		'childNodes',
		'children',
		'classList',
		'dataset',
		'style'
	];
	
	
	
	//A list of serialized read-only nodes to ignore; is ovewritten if the user specifies the "filter" option
	var serials = [
		'innerHTML',
		'innerText',
		'outerHTML',
		'outerText',
		'prefix',
		'text',
		'textContent'
	];



	//Utility function to extend an object - useful for synchronizing interface submitted options with default values; same API as underscore extend
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



	//Get all of the unique values (in the order they first appeared) from one or more arrays
	var unique = function() {
		var all = Array.prototype.concat.apply([], arguments);
		for (var a = 0; a < all.length; a++) {
			if (all.indexOf(all[a]) < a) {
				all.splice(a, 1);
				a--;
			}
		}
		return all;
	};


	//Make a shallow copy of an object or array
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



	//Do a boolean intersection between an array/object and a filter array
	var boolInter = function(item, filter) {
		var output;
		if (item instanceof Array) {
			output = item.filter(function(val) { return filter.indexOf(val) > -1; });
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



	//Do a boolean difference between an array/object and a filter array
	var boolDiff = function(item, filter) {
		var output;
		if (item instanceof Array) {
			output = item.filter(function(val) { return filter.indexOf(val) === -1; });
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



	//Determine whether we want to do a boolean intersection or difference
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



	//Check if the supplied attribute contains a path, and convert it from a relative path to an absolute; some code shamelessly copped from here: http://stackoverflow.com/a/14780463/2230156
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



	//Create a copy of a node's properties
	var copyJSON = function(node, opts) {
		var copy = {};
		//Copy all of the node's properties
		for (var n in node){
			//Make sure this is an own property, and isn't a live javascript function for security reasons
			try {
				if (node.hasOwnProperty(n) && typeof node[n] !== 'function') {
					//Only allowed objects are arrays
					if ( !(node[n] instanceof Object) || node[n] instanceof Array ) {
						//If we are eliminating empty fields, make sure this value is not NULL or UNDEFINED
						if (opts.cull) {
							if (typeof node[n] !== 'null' && node[n] !== null) {
								copy[n] = node[n];
							}
						} else {
							copy[n] = node[n];
						}
					}
				}
			} catch(e) {
				console.log(e);
			}
		}

		copy = boolFilter(copy, opts.filter);
		return copy;
	};



	//Convert the attributes property of a DOM Node to a JSON ready object
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



	//Convert the style property of a DOM Node to a JSON ready object
	var styleJSON = function(node, opts) {
		//Are we copying the computed style?
		var style, css = [];
		if (opts.computed) {
			style = win.getComputedStyle(node);
		} else {
			style = node.style;
		}

		//If we have a properties filter, discard all the properties that don't match it
		if (opts.style) {
			if (style.constructor.name !== Object) {
				//This is not a simple object - change it to one, removing all frivolous methods along the way
				var newStyle = {};
				for (var s in style) {
					if (typeof style[s] !== 'function') {
						newStyle[s] = style[s];
					}
				}
			}
			style = boolFilter(newStyle, opts.style);
		}

		//Copy the style array into a new object
		if (opts.computed) {
			for (var k in style) {
				if ( k !== 'cssText' && !k.match(/\d/) && typeof style[k] === 'string' && style[k].length ) {
					css.push(k+ ': ' +style[k]+ ';');
				}
			}
			return css.join(' ');
		} else {
			return style.cssText;
		}
	};
	
	
	
	//Convert a cloned DOM node to a simple object
	var toJSON = function(node, opts, depth) {
		var copy = copyJSON(node, opts);

		//Some tags are not allowed
		if (node.nodeType === 1) {
			for (var b in banned) {
				if (node.tagName.toLowerCase() === banned[b]) {
					return null;
				}
			}
		}

		//Copy all attributes and styles, if allowed
		if (opts.attributes && node.hasOwnProperty('attributes')) { 
			copy.attributes = attrJSON(node, opts);
		}
		if (opts.style && node.hasOwnProperty('style')) {
			var style = styleJSON(node, opts);
			copy.attributes = copy.attributes || {};
			copy.attributes.style = style;
		}
		
		//Should we continue iterating?
		if (opts.deep === true || (typeof opts.deep === 'number' && opts.deep > depth)) {
			//We should!
			var kids, kidCount, thisChild, children = [];
			kids = (opts.html) ? node.children : node.childNodes;
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
	 * @param {DOMNode} node The actual DOM Node in to be parsed
	 * @param {Object} [opts] A list of all method options
	 * @param {Boolean|Number} [opts.deep=true] TRUE to iterate and copy all childNodes, or an INTEGER indicating how many levels down the DOM tree to iterate
	 * @param {Boolean} [opts.html=false] TRUE to only iterate through childNodes where nodeType = 1 (aka, isntances of HTMLElement); irrelevant if opts.deep is FALSE
	 * @param {Boolean} [opts.cull=false] TRUE to ignore empty element properties
	 * @param {Boolean} [opts.computed=false] TRUE to ignore the node's default CSSStyleDeclaration, and instead parse the results of window.getComputedStyle(); irrelevant if opts.style is false
	 * @param {Boolean|String[]} [opts.style=true] TRUE to retrieve the key-value pairs of all relevant styles (see: opts.computed), or specify an ARRAY of CSS properties to boolean search
	 * @param {Boolean|String[]} [opts.attributes=true] TRUE to copy all attribute key-value pairs, or specify an ARRAY of keys to boolean search
	 * @param {Boolean|String[]} [opts.serials=true] TRUE to ignore the properties that store a serialized version of this DOM Node (ex: outerHTML), or specify an ARRAY of serials (no boolean search!)
	 * @param {String[]|Boolean} [opts.filter=false] An ARRAY of all the non-required properties to be copied
	 * @param {String[]|Boolean} [opts.parse=false] An ARRAY of properties that are DOM nodes, but will still be copied **PLANNED**
	 * @param {Boolean} [opts.stringify=false] Output a JSON string, or just a JSON-ready javascript object?
	 * @param {Boolean} [opts.metadata=false] Output a special object of the domJSON class, which includes metadata about this operation
	 * @param {Object|Boolean} [opts.absolute=false] Specify attributes for which relative paths are to be converted to absolute
 	 * @param {String} [opts.absolute.base] The basepath from which the relative path will be "measured" to create an absolute path; will default to the location of this file!
 	 * @param {Boolean} [opts.absolute.action=false] TRUE means relative paths in "action" attributes are converted to absolute paths
 	 * @param {Boolean} [opts.absolute.data=false] TRUE means relative paths in "data" attributes are converted to absolute paths
	 * @param {Boolean} [opts.absolute.href=false] TRUE means relative paths in "href" attributes are converted to absolute paths
	 * @param {Boolean} [opts.absolute.style=false] TRUE means relative paths in "style" attributes are converted to absolute paths
	 * @param {Boolean} [opts.absolute.src=false] TRUE means relative paths in "src" attributes are converted to absolute paths
	 * @param {Boolean} [opts.absolute.other=false] TRUE means all fields that are NOT "acton," "data," "href", "style," or "src" will be checked for paths and converted to absolute if necessary - this operation is very expensive! **PLANNED**
	*/
	domJSON.toJSON = function(node, opts) {
		var copy, options = {}, output = {}, timer = new Date().getTime();
		//Update the default options w/ the user's custom settings
		for (var d in defaults) {
			options[d] = defaults[d];
		}
		for (var o in opts) {
			if (!options.hasOwnProperty(o)) {
				delete opts[o];
				continue;
			}
			options[o] = opts[o];
		}

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
		var keys = [];
		for (var k in options.absolute) {
			if (options.absolute[k] && k !== 'base') {
				keys.push(k);
			}
		}
		options.absolute.keys = keys;

		//Make lists of which DOM properties to skip and/or which are absolutely necessary
		var requiring = required.concat();
		var ignoring = ignored.concat();
		if (options.serials) {
			if (options.serials instanceof Array) {
				ignoring = ignoring.concat(options.serials);
			} else {
				ignoring = ignoring.concat(serials);
			}
		}
		if (options.filter instanceof Array) {
			if (options.filter[0] === true) {
				options.filter = boolDiff(unique(options.filter, ignoring), requiring);
			} else {
				options.filter = boolDiff(unique(options.filter, requiring), ignoring);
			}
		} else {
			options.filter = [true].concat(ignoring);
		}
		
		//Transform the node into an object literal
		copy = toJSON(node, options, 0);
		
		//Wrap our copy object in a nice object of its own to save some metadata
		if (options.metadata) {
			for (var m in metadata) {
				output[m] = metadata[m];
			}
			output.node = copy;
			output.options = options;
			output.domain = win.location.href;
			output.clock = new Date().getTime() - timer;
		} else {
			output = copy;
		}
		
		//If opts.stringify is true, turn the output object into a JSON string
		if (options.stringify) {
			return JSON.stringify(output);
		}
		return output;
	};



	//Create a node based on a given node type
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

		case 2: //Attribute
			if (typeof data.nodeName === 'string' && data.nodeName.length) {
				return doc.createAttribute(data.nodeName);
			}
			return false;

		case 3: //Text Node
			if (typeof data.nodeValue === 'string' && data.nodeValue.length) {
				return doc.createTextNode(data.nodeValue);
			}
			return doc.createTextNode('');

		case 4: //CDATA Section
			if (typeof data === 'string') {
				return doc.createCDATASection(data);
			}
			return false;

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



	//Convert a JSON object/string generated by domJSON to a DOM Node
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
	 * Take the JSON-friendly object created by the toJSON() method and rebuild it back into a DOM Node
	 * @param {Object} obj A JSON friendly object, or even JSON string, of some DOM Node
	 * @param {Boolean} [noMeta] TRUE means that this object is not wrapped in metadata, which it makes it somewhat harder to rebuild properly...
	*/
	domJSON.toDOM = function(obj, noMeta) {
		//Parse the JSON string if necessary
		if (typeof obj === 'string') {
			obj = JSON.parse(obj);
		}

		//Create a document fragment, and away we go!
		var node = document.createDocumentFragment();
		if (noMeta) {
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
})(domJSON, window);