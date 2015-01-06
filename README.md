domJSON
=======
[![License](https://img.shields.io/cocoapods/l/AFNetworking.svg)](https://github.com/azaslavsky/domJSON#license) [![Bower version](https://badge.fury.io/bo/domJSON.svg)](http://badge.fury.io/bo/domJSON) [![npm version](https://badge.fury.io/js/domJSON.svg)](http://badge.fury.io/js/domJSON) [![Coverage Status](https://img.shields.io/coveralls/azaslavsky/domJSON.svg)](https://coveralls.io/r/azaslavsky/domJSON?branch=master) [![Dependencies](https://david-dm.org/azaslavsky/domJSON/dev-status.svg)](https://david-dm.org/azaslavsky/domJSON#info=devDependencies&view=table) [![Travis Build](https://api.travis-ci.org/azaslavsky/domJSON.svg)](https://travis-ci.org/azaslavsky/domJSON) 

Convert DOM trees into compact JSON objects, and vice versa, as fast as possible.

## Jump To
* [Installation](#installation)
* [FilterLists](#filterlists)
* [API](#api)
* [License](#license)

## Installation

Installing domJSON is easy.  You can pull it from Bower...

```
bower install domjson
```

...or grab it from NPM and manually include it as a script tag...

```
npm install domjson --save
```

or just download this repo manually and include the file as a dependency.

```html
<script src="./lib/domJSON.js"></script>
```


##FilterLists

A `FilterList` is a custom type for certain options passed to domJSON's [`.toJSON()` method](#domJSON.toJSON).  It allows for very granular control over which fields are included in the final JSON output, allowing developers to eliminate useless information from the result, and produce extremely compact JSON objects.  It operates based on boolean logic: an _inclusive_ `FilterList` allows the developer to explicity sepcify which fields they would like to see in the output, while an _exclusive_ `FilterList` allows them to specify which fields they would like to omity (e.g., "Copy every available field _except_ X, Y, and Z").  The `FilterList` accepts an object as an argument, or a shorthand array (which is the recommended style, since it's much less verbose).

Take this example: suppose we have a single `div` that we would like to convert into a JSON object using domJSON.  It looks like this in its native HTML:

```html
<div id="myDiv" class="testClass" style="margin-top: 10px;" data-foo="bar" data-quux="baz">
	This is some sample text.
</div>
```

Let's try and make a JSON object out of this field, but _only_ include the `class` and `style` attributes, and only the `offsetTop` and `offsetLeft` DOM properties.  Both of the following inputs will have the same output:

```javascript
var myDiv = document.getElementById('myDiv');

//Using object notation for our filterLists
var jsonOutput = domJSON.toJSON(myDiv, {
	attributes: {
		values: ['class', 'style']
	},
	domProperties: {
		values: ['offsetLeft', 'offsetTop']
	},
	metadata: false
});

//Same thing, using the array notation
var jsonOutput = domJSON.toJSON(myDiv, {
	attributes: [false, 'class', 'style'],
	domProperties: [false, 'offsetLeft', 'offsetTop'],
	metadata: false
});
```

The result:
```json
{
	"attributes": {
		"class": "testClass",
		"style": "margin-top: 10px;"
	},
	"childNodes": [{
		"nodeType": 3,
		"nodeValue": "This is some sample text"
	}],
	"nodeType": 1,
	"nodeValue": "This is some sample text",
	"offsetLeft": 123,
	"offsetTop": 456,
	"tagName": "DIV"
}
```

The array notation is much shorter, and very easy to parse: the first value is a boolean that determines whether the list is exclusive or not, and the remaining elements are just the filter values themselves.  Here is an example for making an exclusive list of attributes on the same `div` as above:

```javascript
var myDiv = document.getElementById('myDiv');

//Using object notation for our filterLists, but this time specify values to EXCLUDE
var jsonOutput = domJSON.toJSON(myDiv, {
	attributes: {
		exclude: true,
		values: ['class', 'style']
	},
	domProperties: {
		values: ['offsetLeft', 'offsetTop']
	},
	metadata: false
});

//Same thing, using the array notation
var jsonOutput = domJSON.toJSON(myDiv, {
	attributes: [true, 'class', 'style'],
	domProperties: [false, 'offsetLeft', 'offsetTop'],
	metadata: false
});
```

The result:
```json
{
	"attributes": {
		"id": "myDiv",
		"data-foo": "bar",
		"data-quux": "baz"
	},
	"childNodes": [{
		"nodeType": 3,
		"nodeValue": "This is some sample text"
	}],
	"nodeType": 1,
	"nodeValue": "This is some sample text",
	"offsetLeft": 123,
	"offsetTop": 456,
	"tagName": "DIV"
}
```
##API
domJSON is a global variable to store two methods: `.toJSON()` to convert a DOM Node into a JSON object, and `.toDOM()` to turn that JSON object back into a DOM Node


* [domJSON](#domJSON)
  * [.toJSON(node, [opts])](#domJSON.toJSON) ⇒ <code>Object</code> \| <code>string</code>
  * [.toDOM(obj, [opts])](#domJSON.toDOM) ⇒ <code>DocumentFragment</code>

<a name="domJSON.toJSON"></a>

* * *
####domJSON.toJSON(node, [opts]) ⇒ <code>Object</code> \| <code>string</code>
Take a DOM node and convert it to simple object literal (or JSON string) with no circular references and no functions or events

| Param | Type | Description |
| ----- | ---- | ----------- |
| node | <code>Node</code> | The actual DOM Node which will be the starting point for parsing the DOM Tree |
| \[opts\] | <code>Object</code> | A list of all method options |
| \[opts.absolutePaths=`'action', 'data', 'href', 'src'`\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | Only relevant if `opts.attributes` is not `false`; use `true` to convert all relative paths found in attribute values to absolute paths, or specify an `Array` of keys to boolean search |
| \[opts.attributes=`true`\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | Use `true` to copy all attribute key-value pairs, or specify an `Array` of keys to boolean search |
| \[opts.computedStyle=`false`\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | Use `true` to parse the results of "window.getComputedStyle()" on every node (specify an `Array` of CSS proerties to be included via boolean search); this operation is VERY costrly performance-wise! |
| \[opts.cull=`false`\] | <code>boolean</code> | Use `true` to ignore empty element properties |
| \[opts.deep=`true`\] | <code>boolean</code> \| <code>number</code> | Use `true` to iterate and copy all childNodes, or an INTEGER indicating how many levels down the DOM tree to iterate |
| \[opts.domProperties\] | <code>[FilterList](#FilterList)</code> | An `Array` of all the non-required properties to be copied; if unspecified, all of the DOM properties will be copied (except for ones which serialize the DOM Node, which are handled separately by `opts.serialProperties`) |
| \[opts.htmlOnly=`false`\] | <code>boolean</code> | Use `true` to only iterate through childNodes where nodeType = 1 (aka, isntances of HTMLElement); irrelevant if `opts.deep` is `true` |
| \[opts.metadata=`false`\] | <code>boolean</code> | Output a special object of the domJSON class, which includes metadata about this operation |
| \[opts.serialProperties=`true`\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | Use `true` to ignore the properties that store a serialized version of this DOM Node (ex: outerHTML, innerText, etc), or specify an `Array` of serial properties (no boolean search!) |
| \[opts.stringify=`false`\] | <code>boolean</code> | Output a JSON string, or just a JSON-ready javascript object? |

**Returns**: <code>Object</code> \| <code>string</code> - A JSON-friendly object, or JSON string, of the DOM node -> JSON conversion output  
**Todo**

- {boolean|FilterList} [opts.parse=`false`] An `Array` of properties that are DOM nodes, but will still be copied **PLANNED**

<a name="domJSON.toDOM"></a>

* * *
####domJSON.toDOM(obj, [opts]) ⇒ <code>DocumentFragment</code>
Take the JSON-friendly object created by the `.toJSON()` method and rebuild it back into a DOM Node

| Param | Type | Description |
| ----- | ---- | ----------- |
| obj | <code>Object</code> | A JSON friendly object, or even JSON string, of some DOM Node |
| \[opts\] | <code>Object</code> | A list of all method options |
| \[opts.noMeta=`false`\] | <code>boolean</code> | `true` means that this object is not wrapped in metadata, which it makes it somewhat more difficult to rebuild properly... |

**Returns**: <code>DocumentFragment</code> - A `DocumentFragment` (nodeType 11) containing the result of unpacking the input `obj`  

##License

The MIT License (MIT)

Copyright (c) 2014 Alex Zaslavsky

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

