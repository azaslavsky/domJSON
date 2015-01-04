/*
 * Jasmine test suite for domJSON
 */
(function() {
	describe('domJSON', function(){
		describe('private utility APIs', function(){
			/*describe('FieldSpec custom typing', function(){
			});*/



			describe('object extension', function(){
				it('should return an empty object if there are no arguments', function(){
					expect(domJSON.__extend()).toEqual({});
				});

				it('should return the first argument if it\'s the only one provided', function(){
					var test = {
						foo: 'bar',
						baz: 'quux'
					};

					expect(domJSON.__extend(test)).toEqual({
						foo: 'bar',
						baz: 'quux'
					});
				});

				it('should extend an existing object to contain both new values and replacements for old values', function(){
					var test = {
						foo: 'bar',
						baz: 'quux'
					};

					expect(domJSON.__extend(test, {
						baz: 'norf',
						test: 'success'
					})).toEqual({
						foo: 'bar',
						baz: 'norf',
						test: 'success'
					});
				});

				it('should extend an empty object with multiple supplied objects, without altering the originals', function(){
					var testA = {
						foo: 'bar',
						baz: 'quux'
					};
					var testB = {
						baz: 'norf',
						test: 'success'
					};
					var testC = {
						baz: 'norf2',
						test: 'success2',
						alpha: 'beta'
					};

					expect(domJSON.__extend({}, testA, testB, testC)).toEqual({
						foo: 'bar',
						baz: 'norf2',
						test: 'success2',
						alpha: 'beta'
					});
				});
			});



			describe('unique array union', function(){
				it('should return only the unique values from a single input array', function(){
					expect(domJSON.__unique()).toEqual([]);
					expect(domJSON.__unique(['a', 'b', 'c', 'a', 'd', 'd', 'b'])).toEqual(['a', 'b', 'c', 'd']);
				});

				it('should combine several arrays with distinct values', function(){
					var arr1 = ['a', 'b'];
					var arr2 = ['c', 'd'];
					var arr3 = ['e', 'f'];

					expect(domJSON.__unique(arr1, arr2, arr3)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
				});

				it('should combine several arrays with internally non-distinct values', function(){
					var arr1 = ['a', 'b', 'b', 'a'];
					var arr2 = ['c', 'd'];
					var arr3 = ['e', 'f', 'e'];

					expect(domJSON.__unique(arr1, arr2, arr3)).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
				});

				it('should combine several arrays with non-distinct values, both internally and relative to each other', function(){
					var arr1 = ['a', 'b', 'b'];
					var arr2 = ['b', 'c'];
					var arr3 = ['c', 'd', 'a', 'd'];

					expect(domJSON.__unique(arr1, arr2, arr3)).toEqual(['a', 'b', 'c', 'd']);
				});
			});



			describe('shallow copying', function(){
				it('should copy only the first level of an array', function(){
					var testObj = {
						foo: 'bar'
					};
					var testArr = [testObj, 'a', 'b', 'c', 'd', 'e'];
					var result = domJSON.__copy(testArr);

					expect(result).toEqual(testArr);
					expect(result).not.toBe(testArr);
					expect(result[0]).toBe(testObj);
				});

				it('should copy only the first level of an object', function(){
					var nestedObj = {
						a: 'b'
					};
					var nestedMethod = function(){};
					var testObj = {
						foo: 'bar',
						baz: 'quux',
						method: nestedMethod,
						object: nestedObj
					};
					var result = domJSON.__copy(testObj);

					expect(result).toEqual(testObj);
					expect(result).not.toBe(testObj);
					expect(result.method).toBe(testObj.method);
					expect(result.object).toBe(testObj.object);
				});
			});



			describe('boolean intersection', function(){
				it('should, if provided an array, return a new array containing only the values that match a second filter array', function(){
					var testArr = ['a', 'b', 'c', 'd', 'e', 'f'];
					var filter = ['b', 'd', 'e'];
					var result = domJSON.__boolInter(testArr, filter);

					expect(result).toEqual(filter);
					expect(result).not.toBe(filter);
				});

				it('should, if provided an object, return a new object keeping only the properties that match a provided filter array', function(){
					var testObj = {
						foo: 'bar',
						baz: 'quux',
						norf: 'foo2',
						bar2: 'baz2'
					};
					var filter = ['foo', 'norf', 'fake'];
					var result = domJSON.__boolInter(testObj, filter);

					expect(result).toEqual({
						foo: 'bar',
						norf: 'foo2'
					});
					expect(result).not.toBe(testObj);
				});
			});



			describe('boolean difference', function(){
				it('should, if provided an array, return only the values that match are absent from a second filter array', function(){
					var testArr = ['a', 'b', 'c', 'd', 'e', 'f'];
					var filter = ['b', 'd', 'e'];
					var result = domJSON.__boolDiff(testArr, filter);

					expect(result).toEqual(['a', 'c', 'f']);
				});

				it('should, if provided an object, return a new object keeping only the properties that are absent from a provided filter array', function(){
					var testObj = {
						foo: 'bar',
						baz: 'quux',
						norf: 'foo2',
						bar2: 'baz2'
					};
					var filter = ['foo', 'norf', 'fake'];
					var result = domJSON.__boolDiff(testObj, filter);

					expect(result).toEqual({
						baz: 'quux',
						bar2: 'baz2'
					});
					expect(result).not.toBe(testObj);
				});
			});



			describe('boolean filtering', function(){
				var testObj, testArr;
				beforeEach(function(){
					testObj = {
						foo: 'bar',
						baz: 'quux',
						norf: 'foo2',
						bar2: 'baz2'
					};
					testArr = ['a', 'b', 'c', 'd', 'e', 'f'];
				});

				it('should return a shallow copy of the provided object/array if a filter property is not specified', function(){
					var newObj = domJSON.__boolFilter(testObj);
					var newArr = domJSON.__boolFilter(testArr);

					expect(newObj).toEqual(testObj);
					expect(newObj).not.toBe(testObj);
					expect(newArr).toEqual(testArr);
					expect(newArr).not.toBe(testArr);
				});

				it('should return a shallow copy of the provided object/array if a filter property is boolean true', function(){
					var newObj = domJSON.__boolFilter(testObj, true);
					var newArr = domJSON.__boolFilter(testArr, true);
					var newObj2 = domJSON.__boolFilter(testObj, [true]);
					var newArr2 = domJSON.__boolFilter(testArr, [true]);

					expect(newObj).toEqual(testObj);
					expect(newObj).not.toBe(testObj);
					expect(newArr).toEqual(testArr);
					expect(newArr).not.toBe(testArr);
					expect(newObj2).toEqual(testObj);
					expect(newObj2).not.toBe(testObj);
					expect(newArr2).toEqual(testArr);
					expect(newArr2).not.toBe(testArr);
				});

				it('should return an empty object/array if the filter property is boolean false', function(){
					expect(domJSON.__boolFilter(testObj, false)).toEqual({});
					expect(domJSON.__boolFilter(testArr, false)).toEqual([]);
					expect(domJSON.__boolFilter(testObj, [false])).toEqual({});
					expect(domJSON.__boolFilter(testArr, [false])).toEqual([]);
				});

				it('should do a difference if the first value of the provided filtering array is a boolean true', function(){
					var newObj = domJSON.__boolFilter(testObj, [true, 'foo', 'norf']);
					var newArr = domJSON.__boolFilter(testArr, [true, 'a', 'e', 'd']);

					expect(newObj).toEqual({
						baz: 'quux',
						bar2: 'baz2'
					});
					expect(newArr).toEqual(['b', 'c', 'f']);
				});

				it('should do an intersection if the first value of the provided filtering array is a boolean false', function(){
					var newObj = domJSON.__boolFilter(testObj, [false, 'foo', 'norf']);
					var newArr = domJSON.__boolFilter(testArr, [false, 'a', 'e', 'd']);

					expect(newObj).toEqual({
						foo: 'bar',
						norf: 'foo2'
					});
					expect(newArr).toEqual(['a', 'd', 'e']);
				});

				it('should do an intersection if the leading boolean is omitted from the provided filtering array', function(){
					var newObj = domJSON.__boolFilter(testObj, ['foo', 'norf']);
					var newArr = domJSON.__boolFilter(testArr, ['a', 'e', 'd']);

					expect(newObj).toEqual({
						foo: 'bar',
						norf: 'foo2'
					});
					expect(newArr).toEqual(['a', 'd', 'e']);
				});
			});
		});



		describe('JSON object creation [.toJSON() method]', function(){
			var container, testArea = $('<div class="testArea" style="padding-left: 100%; position: absolute; top: 0; left: 0; z-index: -1;"></div>');
			$('body').append(testArea);

			afterEach(function(){
				container.remove();
			});



			describe('for various options', function(){
				beforeEach(function(){
					//Make a DOM Tree with some standard test elements
					container = $('<div class="container otherClass"></div>');

					$(' \
						<div data-test-a="foo" data-test-b="bar" style="margin-top: 10px;"> \
							<div data-test-c="quux" data-test-d="baz" style="color: red;"> \
								<div data-test-e="norf" data-test-f="woop" style="border: 1px solid green;"> \
									<p>This is a test paragraph <span>with a span in the middle</span> of it.</p> \
								</div> \
							</div> \
						</div> \
					').appendTo(container);

					testArea.append(container);
				});



				describe('about basic output control', function(){
					it('should work with the default settings', function(){
						var result = domJSON.toJSON(container.get(0));
						
						expect(result.node.className).toBe('container otherClass');
						expect(result.node.childNodes[0].attributes['data-test-a']).toBe('foo');
						expect(result.node.childNodes[0].childNodes[0].style).toBe('color: red;');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-f']).toBe('woop');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].tagName).toBe('P');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeType).toBe(3);
					});

					it('should always ignore "link" and "script" tags', function(){
						var fails = 0;
						domJSON.toJSON($('head').get(0)).node.childNodes.forEach(function(v,i){
							if (v.tagName === 'SCRIPT' || v.tagName === 'LINK') {
								fails++;
							}
						});
						domJSON.toJSON($('body').get(0)).node.childNodes.forEach(function(v,i){
							if (v.tagName === 'SCRIPT' || v.tagName === 'LINK') {
								fails++;
							}
						});
						
						expect(fails).toBe(0);
					});

					it('should be able to not cull falsey DOM properties (excepting 0 and boolean false) from the output object', function(){
						var result = domJSON.toJSON(container.get(0), {
							cull: false
						});

						expect(result.node.id).toBe('');
						expect(result.node.childNodes[0].nextSibling).toBe(null);
						expect(result.node.childNodes[0].childNodes[0].oncancel).toBe(null);
					});

					it('should be able to produce a stringified JSON output', function(){
						var result = domJSON.toJSON(container.get(0), {
							stringify: true
						});

						expect(result).toBeString();
					});

					it('should be able to produce an output of just the JSONified DOM node, excluding all metadata', function(){
						var result = domJSON.toJSON(container.get(0), {
							metadata: false
						});

						expect(result.meta).toBeUndefined();
						expect(result.tagName).toBe('DIV');
					});
				});



				describe('about recursion depth control', function(){
					it('should be able to ignore child nodes if requested (aka, no recursion)', function(){
						var result = domJSON.toJSON(container.get(0), {
							deep: false
						});

						expect(result.node.childNodes).toBeUndefined();
					});

					it('should be able to recurse through the entire depth of the DOM tree', function(){
						var result = domJSON.toJSON(container.get(0), {
							deep: true
						});

						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes.length).toBe(1);
					});

					it('should be able to recurse to an arbitrary level of depth', function(){
						var result = domJSON.toJSON(container.get(0), {
							deep: 2
						});

						expect(result.node.childNodes[0].tagName).toBe('DIV');
						expect(result.node.childNodes[0].childNodes[0].tagName).toBe('DIV');
						expect(result.node.childNodes[0].childNodes[0].childNodes).toBeUndefined();
					});

					it('should be able only recurse through only HTML Elements (nodeType = 1)', function(){
						var result = domJSON.toJSON(container.get(0), {
							deep: true,
							htmlOnly: true
						});

						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(1);
					});
				});



				/*describe('about filtering which DOM properties to include in the output', function(){
					it('should perform no custom filtering if passed a non-array value, or not specified', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to output only the specified DOM properties if provided an array of strings', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to output all DOM properties except for those specified if provided an array of strings with a leading boolean true', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should always exclude the following DOM properties in the output, even if they are included in a filter array: children, classList, dataset', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should always include the following DOM properties in the output, even if they are excluded by a filter array: nodeType, nodeValue, tagName', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to ignore all serialized DOM properties (like outerText, innerText, prefix, etc), overriding other property filters', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to include all serialized DOM properties, overriding other property filters', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to include a specific set of serialized DOM properties, overriding other property filters', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to exclude a specific set of serialized DOM properties, overriding other property filters', function(){
						var result = domJSON.toJSON(container.get(0));
					});
				});



				describe('about enumerating which attributes to include in the output', function(){
					it('should be able to ignore all HTML attributes', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to include all HTML attributes', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to include a set of HTML attributes as specified by an array', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to exclude a set of HTML attributes as specified by an array', function(){
						var result = domJSON.toJSON(container.get(0));
					});
				});



				describe('about enumerating which style properties to include in the output', function(){
					it('should be able to ignore all styles specified on the element', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to include all styles specified on the element', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to include all computed styles specified on the element', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to include a set of style properties on the element as specified by an array', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to include a set of computed style properties on the element as specified by an array', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to exclude a set of style properties on the element as specified by an array', function(){
						var result = domJSON.toJSON(container.get(0));
					});

					it('should be able to exclude a set of computed style properties on the element as specified by an array', function(){
						var result = domJSON.toJSON(container.get(0));
					});
				});*/
			});



			/*describe('for different node types', function(){
				//Inline elements
				$(' \
					<div data-testA="foo" data-testB="bar"> \
						<h1>Header 1</h1> \
						<h2>Header 2</h2> \
						<h3>Header 3</h3> \
						<h4>Header 4</h4> \
						<h5>Header 5</h5> \
						<h6>Header 6</h6> \
						<p style="color: red;" data-testP="paragraph" class="pClass"> \
							This is some sample text for testing <span class="spanClass spanClass2" data-testSpan="span" style="color: green;">inline elements</span>.  We need to examine <b class="boldClass boldClass2" data-testBold="bold">bold text</b> as well as <i>italicized segments</i> <strong>(strong text is important too!)</strong>.  <sup>Superscripts</sup> and <sub>subscripts</sub> are also vital.  There will <small><u>even <s>not</s> need to be nested segments</u></small>.  This next part will be: <q>a quote</q>.  Finally, we have <a href="http://theonion.com/">a link</a>. \
						</p> \
						<br/> \
						<hr/> \
						<pre> \
						  This here is a code sample.  It is bad code. \
						</pre> \
					</div> \
				').appendTo(container);
			});*/
		});

		describe('DOM node creation [.toDOM() method]', function(){
		});
	});
})();