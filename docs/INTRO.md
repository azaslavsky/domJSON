domJSON
=======
[![License](https://img.shields.io/cocoapods/l/AFNetworking.svg)](https://github.com/azaslavsky/domJSON#license) [![Bower version](https://badge.fury.io/bo/domjson.svg)](http://badge.fury.io/bo/domjson) [![npm version](https://badge.fury.io/js/domjson.svg)](http://badge.fury.io/js/domjson) [![Coverage Status](https://img.shields.io/coveralls/azaslavsky/domJSON.svg)](https://coveralls.io/r/azaslavsky/domJSON?branch=master) [![Dependencies](https://david-dm.org/azaslavsky/domJSON/dev-status.svg)](https://david-dm.org/azaslavsky/domJSON#info=devDependencies&view=table) [![Travis Build](https://api.travis-ci.org/azaslavsky/domJSON.svg)](https://travis-ci.org/azaslavsky/domJSON) 

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

The purpose of domJSON is to create very accurate representations of the DOM as JSON, and to do it very quickly.  While there are probably dozens of viable use cases for this project, I've made two quick demos to showcase the library's versatility.  [The first](https://azaslavsky.github.io/domJSON/#makejson) simply makes a copy of a given branch of the DOM tree, which could be useful for end user bug logging, state tracking, etc.  [The second demo](https://azaslavsky.github.io/domJSON/#webworkers) does a batch update of a large number of DOM Nodes, but much more performantly than the "traditional" jQuery select > .each() > update pattern.

Broadly speaking, the goals of this project are:

* Provide as accurate a copy of a given node's DOM properties as possible, but allow option filtering to remove useless information
* Be able to rebuild JSON nodes into DOM nodes as performantly as possible
* Speed, speed, speed
* No frivolous data: produce JSON objects that are as compact as possible, removing all information not relevant to the developer
* Keep the library lightweight, with no dependencies

DomJSON works in the following browsers (mobile and desktop versions supported):

* ![Chrome](https://azaslavsky.github.io/domJSON/img/chrome.png) Chrome 39+
* ![Chrome](https://azaslavsky.github.io/domJSON/img/ff.png) Firefox 24+
* ![Chrome](https://azaslavsky.github.io/domJSON/img/safari.png) Safari 7+
* ![Chrome](https://azaslavsky.github.io/domJSON/img/ie.png) IE 9+

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