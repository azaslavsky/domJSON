domJSON
=======
[![License](https://img.shields.io/cocoapods/l/AFNetworking.svg)](https://github.com/azaslavsky/domJSON#license) [![Bower version](https://badge.fury.io/bo/domJSON.svg)](http://badge.fury.io/bo/domJSON) [![npm version](https://badge.fury.io/js/domJSON.svg)](http://badge.fury.io/js/domJSON) [![Coverage Status](https://img.shields.io/coveralls/azaslavsky/domJSON.svg)](https://coveralls.io/r/azaslavsky/domJSON?branch=master) [![Dependencies](https://david-dm.org/azaslavsky/domJSON/dev-status.svg)](https://david-dm.org/azaslavsky/domJSON#info=devDependencies&view=table) [![Travis Build](https://api.travis-ci.org/azaslavsky/domJSON.svg)](https://travis-ci.org/azaslavsky/domJSON) 

Convert DOM trees into compact JSON objects, and vice versa, as fast as possible.

## Jump To
* [Installation](#installation)
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
| \[opts.absolutePaths=`'action', 'data', 'href', 'src'`\] | <code>boolean</code> \| <code>Array.&lt;string&gt;</code> | Only relevant if `opts.attributes` is not `false`; use `true` to convert all relative paths found in attribute values to absolute paths, or specify an `Array` of keys to boolean search |
| \[opts.attributes=`true`\] | <code>boolean</code> \| <code>Array.&lt;string&gt;</code> | Use `true` to copy all attribute key-value pairs, or specify an `Array` of keys to boolean search |
| \[opts.computedStyle=`false`\] | <code>boolean</code> \| <code>Array.&lt;string&gt;</code> | Use `true` to parse the results of "window.getComputedStyle()" on every node (specify an `Array` of CSS proerties to be included via boolean search); this operation is VERY costrly performance-wise! |
| \[opts.cull=`false`\] | <code>boolean</code> | Use `true` to ignore empty element properties |
| \[opts.deep=`true`\] | <code>boolean</code> \| <code>number</code> | Use `true` to iterate and copy all childNodes, or an INTEGER indicating how many levels down the DOM tree to iterate |
| \[opts.filter=`false`\] | <code>Array.&lt;string&gt;</code> \| <code>boolean</code> | An `Array` of all the non-required properties to be copied |
| \[opts.htmlOnly=`false`\] | <code>boolean</code> | Use `true` to only iterate through childNodes where nodeType = 1 (aka, isntances of HTMLElement); irrelevant if `opts.deep` is `true` |
| \[opts.metadata=`false`\] | <code>boolean</code> | Output a special object of the domJSON class, which includes metadata about this operation |
| \[opts.serials=`true`\] | <code>boolean</code> \| <code>Array.&lt;string&gt;</code> | Use `true` to ignore the properties that store a serialized version of this DOM Node (ex: outerHTML), or specify an `Array` of serials (no boolean search!) |
| \[opts.stringify=`false`\] | <code>boolean</code> | Output a JSON string, or just a JSON-ready javascript object? |

**Returns**: <code>Object</code> \| <code>string</code> - A JSON-friendly object, or JSON string, of the DOM node -> JSON conversion output  
**Todo**

- {string[]|boolean} [opts.parse=`false`] An `Array` of properties that are DOM nodes, but will still be copied **PLANNED**

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

