domJSON
=======
[![License](https://img.shields.io/cocoapods/l/AFNetworking.svg)](https://github.com/azaslavsky/domJSON#license) [![Bower version](https://badge.fury.io/bo/domJSON.svg)](http://badge.fury.io/bo/domJSON) [![npm version](https://badge.fury.io/js/domJSON.svg)](http://badge.fury.io/js/domJSON) [![Coverage Status](https://img.shields.io/coveralls/azaslavsky/domJSON.svg)](https://coveralls.io/r/azaslavsky/domJSON?branch=master) [![Dependencies](https://david-dm.org/azaslavsky/domJSON/dev-status.svg)](https://david-dm.org/azaslavsky/domJSON#info=devDependencies&view=table) [![Travis Build](https://api.travis-ci.org/azaslavsky/domJSON.svg)](https://travis-ci.org/azaslavsky/domJSON) 

Convert DOM trees into compact JSON objects, and vice versa, as fast as possible.

## Jump To
* [Description](#description)
* [Installation](#installation)
* [Demos](#demos)
* [Usage](#usage)
* [FilterLists](#filterlists)
* [API](#api)
* [Performance](#performance)
* [Tests](#tests)
* [Contributing](#contributing)
* [License](#license)

## Description

The purpose of domJSON is create very accurate representations of the DOM as JSON, and to do it very quickly.  While there are probably dosznes of varied use cases for this project, two stick out in my mind.  The first is as a front-end debugging or snapshotting tool, by allowing end users to send reports that include "snashots" of the DOM (including computed CSS) at any given point in time.  The second is as a poor man's [virtual DOM](http://stackoverflow.com/a/21117404/2230156).  In theory, rather than updating the DOM piecemeal, forcing a redraw each time, developers can grab a branch of the DOM tree and convert it to JSON.  They could then make all of the changes in JS (which is much more performant than the DOM), then re-build the DOM and replace the branch they were working on with the updated segment.  I'm sure there are even more use cases for JSON representations of the DOM that I'm not even considering, but these are the two that make the most sense to me

Broadly speaking, the goals of this project are:

* Provide as accurate a copy of a given node's DOM properties as possible, but allow option filtering to remove useless information
* Be able to rebuild JSON nodes into DOM nodes as performantly as possible
* Speed, speed, speed
* No frivolous data: produce JSON objects that are as compact as possible, removing all information not relevant to the developer
* Keep the library lightweight, with no dependencies

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

## Demos

Coming soon...

## Usage

Using domJSON is super simple: use the [`.toJSON()`](#domJSON.toJSON) method to create a JSON representation of the DOM tree:

```javascript
var someDOMElement = document.getElementById('sampleId');
var jsonOutput = domJSON.toJSON(myDiv);
```

And then rebuild the DOM Node from that JSON using [`.toDOM()`](#domJSON.toDOM):

```javascript
var DOMDocumentFragment = domJSON.toDOM(jsonOutput);
someDOMElement.parentNode.replaceChild(someDOMElement, DOMDocumentFragment);
```
When creating the JSON object, there are many precise options available, ensuring that developers can produce very specific and compact outputs.  For example, the following will produce a JSON copy of `someDOMElement`'s DOM tree that is only two levels deep, contains no "offset*," "client*," or "scroll*" type DOM properties, only keeps the "id" attribute on each DOM Node, and outputs a string (rather than a JSON-friendly object):

```javascript
var jsonOutput = domJSON.toJSON(myDiv, {
	attributes: ['id'],
	domProperties: {
		exclude: true,
		values: ['clientHeight', 'clientLeft', 'clientTop', 'offsetWidth', 'offsetHeight', 'offsetLeft', 'offsetTop', 'offsetWidth', 'scrollHeight', 'scrollLeft', 'scrollTop', 'scrollWidth']
	},
	deep: 2,
	stringify: true
});
```

## FilterLists

A `FilterList` is a custom type for certain options passed to domJSON's [`.toJSON()`](#domJSON.toJSON) method.  It allows for very granular control over which fields are included in the final JSON output, allowing developers to eliminate useless information from the result, and produce extremely compact JSON objects.  It operates based on boolean logic: an _inclusive_ `FilterList` allows the developer to explicity sepcify which fields they would like to see in the output, while an _exclusive_ `FilterList` allows them to specify which fields they would like to omity (e.g., "Copy every available field _except_ X, Y, and Z").  The `FilterList` accepts an object as an argument, or a shorthand array (which is the recommended style, since it's much less verbose).

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


## Performance
A major goal of this library is performance.  That being said, there is one way to _significantly_ slow it down: setting `opts.computedStyle` to `true`.  This forces the browser to run [`window.getComputedStyle()`](https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle) on every node in the DOM Tree, which is [really, really slow](http://jsperf.com/getcomputedstyle-vs-style-vs-css/2), since it forces a redraw _each time it does it!_  Obviously, there are situations where this you need the computed style and this performance hit is unavoidable, but otherwise, keep `opts.computedStyle` set to `false`.  Beides that, I'm working on writing some benchmark tests to give developers an idea of how each option affects the speed of domJSON, but this will take some time!

## Tests

You can give the test suite for domJSON a quick run through in the browser of your choice [here](http://cdn.rawgit.com/azaslavsky/domJSON/v0.1.0/test/jasmine.html).  You can also view results from local [Chrome tests](http://cdn.rawgit.com/azaslavsky/domJSON/master/test/results/spec/chrome.html), or the entire [browser compatibility suite](http://cdn.rawgit.com/azaslavsky/domJSON/master/test/results/spec/compatibility.html).

## Contributing

Feel free to pull and contribute!  If you do, please make a separate branch on your Pull Request, rather than pushing your changes to the Master.  It would also be greatly appreciated if you ran the appropriate tests before submitting the request (there are three sets, listed below).

For unit testing the Chrome browser, which is the most basic target for functionality, type the following in the CLI:

```
gulp unit-chrome
```

To record the code coverage after your changes, use:

```
gulp coverage
```

And, if you have them all installed and are feeling so kind, you can also do the entire browser compatibility suite (Chrome, Canary, Firefox ESR, Firefox Developer Edition, IE 11, IE 10):

```
gulp unit-browsers
```

If you make changes that you feel need to be documented in the readme, please update the relevant files in the `/docs` directory, then run:

```
gulp docs
```
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

