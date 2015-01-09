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
| \[opts.absolutePaths=`'action', 'data', 'href', 'src'`\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | Only relevant if `opts.attributes` is not `false`; use `true` to convert all relative paths found in attribute values to absolute paths, or specify a `FilterList` of keys to boolean search |
| \[opts.attributes=`true`\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | Use `true` to copy all attribute key-value pairs, or specify a `FilterList` of keys to boolean search |
| \[opts.computedStyle=`false`\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | Use `true` to parse the results of "window.getComputedStyle()" on every node (specify a `FilterList` of CSS properties to be included via boolean search); this operation is VERY costly performance-wise! |
| \[opts.cull=`false`\] | <code>boolean</code> | Use `true` to ignore empty element properties |
| \[opts.deep=`true`\] | <code>boolean</code> \| <code>number</code> | Use `true` to iterate and copy all childNodes, or an INTEGER indicating how many levels down the DOM tree to iterate |
| \[opts.domProperties=true\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | 'false' means only 'tagName', 'nodeType', and 'nodeValue' properties will be copied, while a `FilterList` can specify DOM properties to include or exclude in the output (except for ones which serialize the DOM Node, which are handled separately by `opts.serialProperties`) |
| \[opts.htmlOnly=`false`\] | <code>boolean</code> | Use `true` to only iterate through childNodes where nodeType = 1 (aka, instances of HTMLElement); irrelevant if `opts.deep` is `true` |
| \[opts.metadata=`false`\] | <code>boolean</code> | Output a special object of the domJSON class, which includes metadata about this operation |
| \[opts.serialProperties=`true`\] | <code>boolean</code> \| <code>[FilterList](#FilterList)</code> | Use `true` to ignore the properties that store a serialized version of this DOM Node (ex: outerHTML, innerText, etc), or specify a `FilterList` of serial properties (no boolean search!) |
| \[opts.stringify=`false`\] | <code>boolean</code> | Output a JSON string, or just a JSON-ready javascript object? |

**Returns**: <code>Object</code> \| <code>string</code> - A JSON-friendly object, or JSON string, of the DOM node -> JSON conversion output  
**Todo**

- {boolean|FilterList} [opts.parse=`false`] a `FilterList` of properties that are DOM nodes, but will still be copied **PLANNED**

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
