## Objects

<dl>
<dt><a href="#domJSON">domJSON</a> : <code>object</code></dt>
<dd><p>domJSON is a global variable to store two methods: <code>.toJSON()</code> to convert a DOM Node into a JSON object, and <code>.toDOM()</code> to turn that JSON object back into a DOM Node</p>
</dd>
</dl>

## Typedefs

<dl>
<dt><a href="#FilterList">FilterList</a> : <code>Object</code> | <code>Array</code></dt>
<dd><p>An object specifying a list of fields and how to filter it, or an array with the first value being an optional boolean to convey the same information</p>
</dd>
</dl>

<a name="domJSON"></a>

## domJSON : <code>object</code>
domJSON is a global variable to store two methods: `.toJSON()` to convert a DOM Node into a JSON object, and `.toDOM()` to turn that JSON object back into a DOM Node

**Kind**: global namespace  

* [domJSON](#domJSON) : <code>object</code>
    * [.toJSON(node, [opts])](#domJSON.toJSON) ⇒ <code>Object</code> &#124; <code>string</code>
    * [.toDOM(obj, [opts])](#domJSON.toDOM) ⇒ <code>DocumentFragment</code>

<a name="domJSON.toJSON"></a>


* * *
#### domJSON.toJSON(node, [opts]) ⇒ <code>Object</code> &#124; <code>string</code>
Take a DOM node and convert it to simple object literal (or JSON string) with no circular references and no functions or events

**Kind**: static method of <code>[domJSON](#domJSON)</code>  
**Returns**: <code>Object</code> &#124; <code>string</code> - A JSON-friendly object, or JSON string, of the DOM node -> JSON conversion output  
**Todo**

- [ ] {boolean|FilterList} [opts.parse=`false`] a `FilterList` of properties that are DOM nodes, but will still be copied **PLANNED**


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| node | <code>Node</code> |  | The actual DOM Node which will be the starting point for parsing the DOM Tree |
| [opts] | <code>Object</code> |  | A list of all method options |
| [opts.allowDangerousElements] | <code>boolean</code> | <code>&#x60;false&#x60;</code> | Use `true` to parse the potentially dangerous elements `<link>` and `<script>` |
| [opts.absolutePaths] | <code>boolean</code> &#124; <code>[FilterList](#FilterList)</code> | <code>&#x60;&#x27;action&#x27;, &#x27;data&#x27;, &#x27;href&#x27;, &#x27;src&#x27;&#x60;</code> | Only relevant if `opts.attributes` is not `false`; use `true` to convert all relative paths found in attribute values to absolute paths, or specify a `FilterList` of keys to boolean search |
| [opts.attributes] | <code>boolean</code> &#124; <code>[FilterList](#FilterList)</code> | <code>&#x60;true&#x60;</code> | Use `true` to copy all attribute key-value pairs, or specify a `FilterList` of keys to boolean search |
| [opts.computedStyle] | <code>boolean</code> &#124; <code>[FilterList](#FilterList)</code> | <code>&#x60;false&#x60;</code> | Use `true` to parse the results of "window.getComputedStyle()" on every node (specify a `FilterList` of CSS properties to be included via boolean search); this operation is VERY costly performance-wise! |
| [opts.cull] | <code>boolean</code> | <code>&#x60;false&#x60;</code> | Use `true` to ignore empty element properties |
| [opts.deep] | <code>boolean</code> &#124; <code>number</code> | <code>&#x60;true&#x60;</code> | Use `true` to iterate and copy all childNodes, or an INTEGER indicating how many levels down the DOM tree to iterate |
| [opts.domProperties] | <code>boolean</code> &#124; <code>[FilterList](#FilterList)</code> | <code>true</code> | 'false' means only 'tagName', 'nodeType', and 'nodeValue' properties will be copied, while a `FilterList` can specify DOM properties to include or exclude in the output (except for ones which serialize the DOM Node, which are handled separately by `opts.serialProperties`) |
| [opts.htmlOnly] | <code>boolean</code> | <code>&#x60;false&#x60;</code> | Use `true` to only iterate through childNodes where nodeType = 1 (aka, instances of HTMLElement); irrelevant if `opts.deep` is `true` |
| [opts.metadata] | <code>boolean</code> | <code>&#x60;false&#x60;</code> | Output a special object of the domJSON class, which includes metadata about this operation |
| [opts.serialProperties] | <code>boolean</code> &#124; <code>[FilterList](#FilterList)</code> | <code>&#x60;true&#x60;</code> | Use `true` to ignore the properties that store a serialized version of this DOM Node (ex: outerHTML, innerText, etc), or specify a `FilterList` of serial properties (no boolean search!) |
| [opts.stringify] | <code>boolean</code> | <code>&#x60;false&#x60;</code> | Output a JSON string, or just a JSON-ready javascript object? |

<a name="domJSON.toDOM"></a>


* * *
#### domJSON.toDOM(obj, [opts]) ⇒ <code>DocumentFragment</code>
Take the JSON-friendly object created by the `.toJSON()` method and rebuild it back into a DOM Node

**Kind**: static method of <code>[domJSON](#domJSON)</code>  
**Returns**: <code>DocumentFragment</code> - A `DocumentFragment` (nodeType 11) containing the result of unpacking the input `obj`  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| obj | <code>Object</code> |  | A JSON friendly object, or even JSON string, of some DOM Node |
| [opts] | <code>Object</code> |  | A list of all method options |
| [opts.allowDangerousElements] | <code>boolean</code> | <code>&#x60;false&#x60;</code> | Use `true` to include the potentially dangerous elements `<link>` and `<script>` |
| [opts.noMeta] | <code>boolean</code> | <code>&#x60;false&#x60;</code> | `true` means that this object is not wrapped in metadata, which it makes it somewhat more difficult to rebuild properly... |

<a name="FilterList"></a>

## FilterList : <code>Object</code> &#124; <code>Array</code>
An object specifying a list of fields and how to filter it, or an array with the first value being an optional boolean to convey the same information

**Kind**: global typedef  
**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| exclude | <code>boolean</code> | <code>false</code> | If this is set to `true`, the `filter` property will specify which fields to exclude from the result (boolean difference), not which ones to include (boolean intersection) |
| values | <code>Array.&lt;string&gt;</code> |  | An array of strings which specify the fields to include/exclude from some broader list |

