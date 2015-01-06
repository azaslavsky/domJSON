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