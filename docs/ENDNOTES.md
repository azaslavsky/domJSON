
## Performance
A major goal of this library is performance.  That being said, there is one way to _significantly_ slow it down: setting `opts.computedStyle` to `true`.  This forces the browser to run [`window.getComputedStyle()`](https://developer.mozilla.org/en-US/docs/Web/API/Window.getComputedStyle) on every node in the DOM Tree, which is [really, really slow](http://jsperf.com/getcomputedstyle-vs-style-vs-css/2), since it forces a redraw _each time it does it!_  Obviously, there are situations where this you need the computed style and this performance hit is unavoidable, but otherwise, keep `opts.computedStyle` set to `false`.  Besides that, I'm working on writing some benchmark tests to give developers an idea of how each option affects the speed of domJSON, but this will take some time!

## Tests

You can give the test suite for domJSON a quick run through in the browser of your choice [here](http://cdn.rawgit.com/azaslavsky/domJSON/master/test/jasmine.html).  You can also view results from local [Chrome tests](http://cdn.rawgit.com/azaslavsky/domJSON/master/test/results/spec/chrome.html), or the entire [browser compatibility suite](http://cdn.rawgit.com/azaslavsky/domJSON/master/test/results/spec/compatibility.html).

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