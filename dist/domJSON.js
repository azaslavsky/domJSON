var domJSON = {};

(function(domJSON, win) {
    var metadata = {
        node: null,
        domain: win.location.href
    };
    var defaults = {
        deep: true,
        html: false,
        cull: false,
        computed: false,
        style: true,
        attributes: true,
        serials: false,
        filter: false,
        stringify: false,
        metadata: true,
        absolute: {
            base: win.location.origin + "/",
            action: false,
            href: false,
            style: false,
            src: false,
            other: false
        }
    };
    var banned = [ "link", "script" ];
    var required = [ "nodeType", "nodeValue", "tagName" ];
    var ignored = [ "attributes", "childNodes", "children", "classList", "dataset", "style" ];
    var serials = [ "innerHTML", "innerText", "outerHTML", "outerText", "prefix", "text", "textContent" ];
    var boolFilter = function(item, filter) {
        if (filter && filter instanceof Array && filter.length) {
            if (typeof filter[0] === "boolean") {
                if (filter.length > 1) {
                    if (filter[0] === true) {
                        return boolDiff(item, filter.slice(1));
                    } else {
                        return boolInter(item, filter.slice(1));
                    }
                } else {
                    if (filter[0] === true) {
                        return item;
                    } else {
                        return {};
                    }
                }
            } else {
                return boolInter(item, filter);
            }
        } else {
            return item;
        }
    };
    var boolInter = function(item, filter) {
        var output;
        if (item instanceof Array) {
            output = filter.filter(function(val) {
                return item.indexOf(val) > -1;
            });
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
    var boolDiff = function(item, filter) {
        if (item instanceof Array) {
            item = item.filter(function(val) {
                return filter.indexOf(val) === -1;
            });
        } else {
            for (var f in filter) {
                if (item.hasOwnProperty(filter[f])) {
                    delete item[filter[f]];
                }
            }
        }
        return item;
    };
    var boolUnion = function() {
        var all = [].concat.apply([], arguments);
        for (var a = 0; a < all.length; a++) {
            if (all.indexOf(all[a]) < a) {
                all.splice(a, 1);
                a--;
            }
        }
        return all;
    };
    var toAbsolute = function(node, name, value, settings) {
        if (settings.keys.indexOf(name) !== -1) {
            if (node[name]) {
                var sub = node[name].indexOf(value);
                if (sub !== -1) {
                    return node[name];
                }
            }
            if (value.match(/(?:^data\:|^[\w\-\+\.]*?\:\/\/|^\/\/)/i)) {
                return value;
            }
            if (value.substr(0, 1) === "/") {
                return settings.base + value.substr(1);
            }
            var stack = settings.base.split("/");
            var parts = value.split("/");
            stack.pop();
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] == ".") {
                    continue;
                }
                if (parts[i] == "..") {
                    stack.pop();
                } else {
                    stack.push(parts[i]);
                }
            }
            return stack.join("/");
        }
        return value;
    };
    var copyJSON = function(node, opts) {
        var copy = {};
        for (var n in node) {
            try {
                if (node.hasOwnProperty(n) && typeof node[n] !== "function") {
                    if (!(node[n] instanceof Object) || node[n] instanceof Array) {
                        if (opts.cull) {
                            if (typeof node[n] !== "null" && node[n] !== null) {
                                copy[n] = node[n];
                            }
                        } else {
                            copy[n] = node[n];
                        }
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
        copy = boolFilter(copy, opts.filter);
        return copy;
    };
    var attrJSON = function(node, opts) {
        var attributes = {};
        var attr = node.attributes;
        var length = attr.length;
        if (opts.absolute.keys.length > 1 || opts.absolute.keys.length === 1 && opts.absolute.keys[0] !== "style") {
            for (var i = 0; i < length; i++) {
                attributes[attr[i].name] = toAbsolute(node, attr[i].name, attr[i].value, opts.absolute);
            }
        } else {
            for (var i = 0; i < length; i++) {
                attributes[attr[i].name] = attr[i].value;
            }
        }
        if (opts.attributes) {
            attributes = boolFilter(attributes, opts.attributes);
        }
        return attributes;
    };
    var styleJSON = function(node, opts) {
        var style, css = [];
        if (opts.computed) {
            style = win.getComputedStyle(node);
        } else {
            style = node.style;
        }
        if (opts.style) {
            if (style.constructor.name !== Object) {
                var newStyle = {};
                for (var s in style) {
                    if (typeof style[s] !== "function") {
                        newStyle[s] = style[s];
                    }
                }
            }
            style = boolFilter(newStyle, opts.style);
        }
        if (opts.computed) {
            for (var k in style) {
                if (k !== "cssText" && !k.match(/\d/) && typeof style[k] === "string" && style[k].length) {
                    css.push(k + ": " + style[k] + ";");
                }
            }
            return css.join(" ");
        } else {
            return style.cssText;
        }
    };
    var toJSON = function(node, opts, depth) {
        var copy = copyJSON(node, opts);
        if (node.nodeType === 1) {
            for (var b in banned) {
                if (node.tagName.toLowerCase() === banned[b]) {
                    return null;
                }
            }
        }
        if (opts.attributes && node.hasOwnProperty("attributes")) {
            copy.attributes = attrJSON(node, opts);
        }
        if (opts.style && node.hasOwnProperty("style")) {
            var style = styleJSON(node, opts);
            copy.attributes = copy.attributes || {};
            copy.attributes.style = style;
        }
        if (opts.deep === true || typeof opts.deep === "number" && opts.deep > depth) {
            var kids, kidCount, thisChild, children = [];
            kids = opts.html ? node.children : node.childNodes;
            kidCount = kids.length;
            for (var c = 0; c < kidCount; c++) {
                thisChild = toJSON(kids[c], opts, depth + 1);
                if (thisChild) {
                    children.push(thisChild);
                }
            }
            copy.childNodes = children;
        }
        return copy;
    };
    domJSON.toJSON = function(node, opts) {
        var copy, options = {}, output = {}, timer = new Date().getTime();
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
        options.absolute = {
            base: typeof options.absolute === "string" ? win.location.origin + "/" : options.absolute.base || win.location.origin + "/",
            action: typeof options.absolute === "boolean" ? options.absolute : options.absolute.action || false,
            href: typeof options.absolute === "boolean" ? options.absolute : options.absolute.href || false,
            style: typeof options.absolute === "boolean" ? options.absolute : options.absolute.style || false,
            src: typeof options.absolute === "boolean" ? options.absolute : options.absolute.src || false,
            other: typeof options.absolute === "boolean" ? options.absolute : options.absolute.other || false
        };
        options.absolute.other = false;
        var keys = [];
        for (var k in options.absolute) {
            if (options.absolute[k] && k !== "base") {
                keys.push(k);
            }
        }
        options.absolute.keys = keys;
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
                options.filter = boolDiff(boolUnion(options.filter, ignoring), requiring);
            } else {
                options.filter = boolDiff(boolUnion(options.filter, requiring), ignoring);
            }
        } else {
            options.filter = [ true ].concat(ignoring);
        }
        copy = toJSON(node, options, 0);
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
        if (options.stringify) {
            return JSON.stringify(output);
        }
        return output;
    };
    var createNode = function(type, doc, data) {
        if (doc instanceof DocumentFragment) {
            doc = doc.ownerDocument;
        }
        switch (type) {
          case 1:
            if (typeof data.tagName === "string") {
                return doc.createElement(data.tagName);
            }
            return false;

          case 2:
            if (typeof data.nodeName === "string" && data.nodeName.length) {
                return doc.createAttribute(data.nodeName);
            }
            return false;

          case 3:
            if (typeof data.nodeValue === "string" && data.nodeValue.length) {
                return doc.createTextNode(data.nodeValue);
            }
            return doc.createTextNode("");

          case 4:
            if (typeof data === "string") {
                return doc.createCDATASection(data);
            }
            return false;

          case 7:
            if (data.hasOwnProperty("target") && data.hasOwnProperty("data")) {
                return doc.implementation.createHTMLDocument(data.target, data.data);
            }
            return false;

          case 8:
            if (typeof data === "string") {
                return doc.createComment(data);
            }
            return doc.createComment("");

          case 9:
            return doc.implementation.createHTMLDocument(data);

          case 10:
            if (data.hasOwnProperty("name") && data.hasOwnProperty("publicId") && data.hasOwnProperty("systemId")) {
                return doc.implementation.createDocumentType(data.name, data.publicId, data.systemId);
            }
            return false;

          case 11:
            return doc.implementation.createDocumentFragment();

          default:
            return false;
        }
    };
    var toDOM = function(obj, parent, doc) {
        if (obj.nodeType) {
            var node = createNode(obj.nodeType, doc, obj);
            parent.appendChild(node);
        } else {
            return false;
        }
        for (var x in obj) {
            if (!(obj[x] instanceof Object)) {
                node[x] = obj[x];
            }
        }
        var src;
        if (obj.nodeType === 1 && obj.tagName) {
            if (obj.attributes) {
                for (var a in obj.attributes) {
                    node.setAttribute(a, obj.attributes[a]);
                }
            }
        }
        if (obj.childNodes && obj.childNodes.length) {
            for (var c in obj.childNodes) {
                toDOM(obj.childNodes[c], node, doc);
            }
        }
    };
    domJSON.toDOM = function(obj, noMeta) {
        if (typeof obj === "string") {
            obj = JSON.parse(obj);
        }
        var node = document.createDocumentFragment();
        if (noMeta) {
            toDOM(obj, node, node);
        } else {
            toDOM(obj.node, node, node);
        }
        return node;
    };
})(domJSON, window);