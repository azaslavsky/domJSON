/*
 * Jasmine test suite for domJSON
 */
(function() {
	describe('domJSON', function(){
		var stringifiedTest;
		var testArea = $('<div class="testArea" style="padding-left: 100%; position: absolute; top: 0; left: 0; z-index: -1;"></div>');
		$('body').append(testArea);

		describe('private utility APIs', function(){
			describe('FilterList custom type processing', function(){
				it('should return a boolean if provided one', function(){
					expect(domJSON.__toShorthand(true)).toBe(true);
					expect(domJSON.__toShorthand(false)).toBe(false);
				});

				it('should return true if provided a truthy value that isn\'t an object', function(){
					expect(domJSON.__toShorthand(1234)).toBe(true);
					expect(domJSON.__toShorthand('abcd')).toBe(true);
					expect(domJSON.__toShorthand(function(){})).toBe(true);
				});

				it('should return false if provided falsey value, or an invalid object (no "values" property)', function(){
					expect(domJSON.__toShorthand(null)).toBe(false);
					expect(domJSON.__toShorthand()).toBe(false);
					expect(domJSON.__toShorthand(0)).toBe(false);
					expect(domJSON.__toShorthand('')).toBe(false);
					expect(domJSON.__toShorthand({})).toBe(false);
					expect(domJSON.__toShorthand({
						exclude: true,
						val: ['abc']
					})).toBe(false);
					expect(domJSON.__toShorthand({
						exclude: true,
						values: []
					})).toBe(false);
					expect(domJSON.__toShorthand({
						exclude: true,
						values: [true, 345, function(){}]
					})).toBe(false);
				});

				it('should return a shorthand array if provided a valid object', function(){
					expect(domJSON.__toShorthand({
						exclude: true,
						values: ['a', 'b', 'c']
					})).toEqual([true, 'a', 'b', 'c']);
					expect(domJSON.__toShorthand({
						exclude: false,
						values: ['a', 'b', 'c']
					})).toEqual(['a', 'b', 'c']);
					expect(domJSON.__toShorthand({
						values: ['a', 'b', 'c']
					})).toEqual(['a', 'b', 'c']);
				});

				it('should return a shorthand array if provided a shorthand array', function(){
					expect(domJSON.__toShorthand(['a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
					expect(domJSON.__toShorthand([false, 'a', 'b', 'c'])).toEqual(['a', 'b', 'c']);
					expect(domJSON.__toShorthand([true, 'a', 'b', 'c'])).toEqual([true, 'a', 'b', 'c']);
				});

				it('should clean input arrays, and only return strings and shorthand exclude booleans in the output array', function(){
					expect(domJSON.__toShorthand({
						exclude: true,
						values: ['a', 'b', 'c', true, 1234]
					})).toEqual([true, 'a', 'b', 'c']);
					expect(domJSON.__toShorthand({
						values: ['a', 'b', 'c', true, 1234]
					})).toEqual(['a', 'b', 'c']);
					expect(domJSON.__toShorthand([true, 'a', 'b', 'c', true, 1234])).toEqual([true, 'a', 'b', 'c']);
				});
			});



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
			var container, containerNode;

			describe('for various options', function(){
				beforeEach(function(){
					//Custom matchers
					jasmine.addMatchers({
						toBeOneOf: function () {
							return {
								compare: function (actual, expected) {
									if (expected instanceof Array) {
										var matched = false;
										expected.forEach(function(v){
											if (v === actual) {
												matched = true;
											}
										});
										return {
											pass: matched,
											message: 'Expected one of the supplied values to be '+ actual
										}
									} else {
										return {
											pass: actual === expected,
											message: 'Expected '+ expected +' to be '+ actual
										}
									}
								}
							};
						}
					});

					//Make a DOM Tree with some standard test elements
					container = $('<div class="container otherClass"></div>');

					$(' \
						<div class="alpha" data-test-a="foo" data-test-b="bar" style="margin-top: 10px;"> \
							<div class="beta" data-test-c="quux" data-test-d="baz" style="color: red;"> \
								<div class="charlie" data-test-e="norf" data-test-f="woop" style="border: 1px solid green;"> \
									<p class="delta">This is a test paragraph <span class="epsilon">with a span in the middle</span> of it.</p> \
								</div> \
							</div> \
						</div> \
					').appendTo(container);

					testArea.append(container);
					containerNode = container.get(0);

					//Append a sample comment to the alpha node
					var sampleComment = document.createComment('This is a sample comment!');
					var alpha = document.querySelector('.alpha').appendChild(sampleComment);

					//Append a sample processing instruction to the alpha node
					if (window.navigator.userAgent.indexOf('MSIE') === -1 && window.navigator.userAgent.indexOf('NT 6.1') === -1 && window.navigator.userAgent.indexOf('Safari') === -1){
						//Internet Explorer and Safari processing instructions when the document isn't XML: http://msdn.microsoft.com/ko-kr/library/windows/desktop/ff975215.aspx
						var samplePI = document.createProcessingInstruction('xml-stylesheet', 'href="mycss.css" type="text/css"');
						var alpha = document.querySelector('.alpha').appendChild(samplePI);
					}

					//Save a stringified version
					if (!stringifiedTest) {
						stringifiedTest = domJSON.toJSON(containerNode, {
							stringify: true
						});
					}
				});

				afterEach(function(){
					container.remove();
				});



				describe('about basic output control', function(){
					it('should work with the default settings', function(){
						var result = domJSON.toJSON(containerNode);
						
						expect(result.node.className).toBe('container otherClass');
						expect(result.node.childNodes[0].attributes['data-test-a']).toBe('foo');
						expect(result.node.childNodes[0].childNodes[0].attributes.style).toBe('color: red;');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-f']).toBe('woop');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].tagName.toUpperCase()).toBe('P');
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
						var result = domJSON.toJSON(containerNode, {
							cull: false
						});

						expect(result.node.id).toBe('');
						expect(result.node.childNodes[0].nextSibling).toBeFalsy();
						expect(result.node.childNodes[0].childNodes[0].oncancel).toBeFalsy();
					});

					it('should be able to produce a stringified JSON output', function(){
						var result = domJSON.toJSON(containerNode, {
							stringify: true
						});

						expect(result).toBeString();
					});

					it('should be able to produce an output of just the JSONified DOM node, excluding all metadata', function(){
						var result = domJSON.toJSON(containerNode, {
							metadata: false
						});

						expect(result.meta).toBeUndefined();
						expect(result.tagName.toUpperCase()).toBe('DIV');
					});
				});



				describe('about metadata output', function(){
					it('should note the version number domJSON when the operation was performed', function(){
						var result = domJSON.toJSON(containerNode);

						expect(result.meta.version.split('.')).toBeArrayOfSize(3);
					});

					it('should sotre the options used to generate this JSON object', function(){
						var result = domJSON.toJSON(containerNode);

						expect(result.meta.options.metadata).toBeTrue();
					});

					it('should note the UTC time when the operation was performed', function(){
						var result = domJSON.toJSON(containerNode);
						var timestamp = new Date(result.meta.date).getTime();

						expect(timestamp).toBeGreaterThan(new Date().getTime() - 10);
					});

					it('should note how long it took to perform the operation', function(){
						var result = domJSON.toJSON(containerNode);

						expect(result.meta.clock).toMatch(/\d{1,}/);
					});

					it('should note the domain of the browser when the operation was performed', function(){
						var result = domJSON.toJSON(containerNode);

						expect(result.meta.href).toBe(window.location.href);
					});

					it('should note the userAgent information when the operation was performed', function(){
						var result = domJSON.toJSON(containerNode);

						expect(result.meta.userAgent).toBe(window.navigator.userAgent);
					});

					it('should note both the inner and outer dimensions of the window when the operation was performed', function(){
						var result = domJSON.toJSON(containerNode);

						expect(result.meta.dimensions).toEqual({
							inner: {
								x: window.innerWidth,
								y: window.innerHeight
							},
							outer: {
								x: window.outerWidth,
								y: window.outerHeight
							}
						});
					});
				});



				describe('about recursion depth control', function(){
					it('should be able to ignore child nodes if requested (aka, no recursion)', function(){
						var result = domJSON.toJSON(containerNode, {
							deep: false
						});

						expect(result.node.childNodes).toBeUndefined();
					});

					it('should be able to recurse through the entire depth of the DOM tree', function(){
						var result = domJSON.toJSON(containerNode, {
							deep: true
						});

						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].childNodes.length).toBe(1);
					});

					it('should be able to recurse to an arbitrary level of depth', function(){
						var result = domJSON.toJSON(containerNode, {
							deep: 2
						});

						expect(result.node.childNodes[0].tagName.toUpperCase()).toBe('DIV');
						expect(result.node.childNodes[0].childNodes[0].tagName.toUpperCase()).toBe('DIV');
						expect(result.node.childNodes[0].childNodes[0].childNodes).toBeUndefined();
					});

					it('should be able only recurse through only HTML Elements (nodeType = 1)', function(){
						var result = domJSON.toJSON(containerNode, {
							deep: true,
							htmlOnly: true
						});

						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(1);
					});
				});



				describe('about filtering which DOM properties to include in the output', function(){
					var noWhiteSpaceAroundTags = function(str){
						if (typeof str === 'string') {
							return str.replace(/[\t\r\n]*/gi, '').replace(/>[\s]*</gi, '><').replace(/>[\s]*$/gi, '>').replace(/^[\s]*</gi, '<').trim() //https://regex101.com/r/xX6iW2/3  and  https://regex101.com/r/zE0fQ9/1
						}
						return str;
					};

					it('should not perform custom filtering if passed a non-array value that isn\'t false, or not specified', function(){
						var result = domJSON.toJSON(containerNode, {
							domProperties: true
						});
						var result2 = domJSON.toJSON(containerNode, {
							domProperties: 'yes'
						});
						var result3 = domJSON.toJSON(containerNode, {
							domProperties: 12345
						});

						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(3);
						expect(result2.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(3);
						expect(result3.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes.length).toBe(3);
					});

					it('should only copy required properties (nodeType, nodeValue, tagName) when custom filtering flag is set to false', function(){
						var result = domJSON.toJSON(containerNode, {
							domProperties: false
						});

						expect(result.node.tagName.toUpperCase()).toBe('DIV');
						expect(result.node.childNodes[0].nodeType).toBe(1);
						expect(result.node.childNodes[0].clientTop).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].offsetLeft).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerHTML).toBeUndefined();
					});

					it('should be able to output only the specified DOM properties if provided an array of strings', function(){
						var result = domJSON.toJSON(containerNode, {
							domProperties: ['className', 'offsetTop', 'offsetLeft']
						});

						expect(result.node.className).toBe('container otherClass');
						expect(result.node.childNodes[0].offsetLeft).toBeNumber();
						expect(result.node.childNodes[0].offsetHeight).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].offsetTop).toBeNumber();
						expect(result.node.childNodes[0].childNodes[0].clientTop).toBeUndefined();
					});

					it('should be able to output all DOM properties except for those specified if provided an array of strings with a leading boolean true', function(){
						var result = domJSON.toJSON(containerNode, {
							domProperties: [true, 'className', 'offsetTop', 'offsetLeft']
						});

						expect(result.node.className).toBeUndefined();
						expect(result.node.childNodes[0].offsetLeft).toBeUndefined();
						expect(result.node.childNodes[0].offsetHeight).toBeNumber();
						expect(result.node.childNodes[0].childNodes[0].offsetTop).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].clientTop).toBeNumber();
					});

					it('should always exclude the following DOM properties from the output, even if they are included in a filter array: children, classList, dataset', function(){
						var result = domJSON.toJSON(containerNode, {
							domProperties: ['className', 'offsetTop', 'offsetLeft', 'children', 'dataset', 'classList']
						});

						expect(result.node.classList).toBeUndefined();
						expect(result.node.childNodes[0].children).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].dataset).toBeUndefined();
					});

					it('should always include the following DOM properties in the output, even if they are excluded by a filter array: nodeType, nodeValue, tagName', function(){
						var result = domJSON.toJSON(containerNode, {
							domProperties: [true, 'className', 'offsetTop', 'offsetLeft', 'nodeType', 'nodeValue', 'tagName']
						});

						expect(result.node.tagName.toUpperCase()).toBe('DIV');
						expect(result.node.childNodes[0].nodeType).toBe(1);
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].tagName.toUpperCase()).toBe('P');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeType).toBe(3);
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].nodeValue )).toBe('This is a test paragraph');
					});

					it('should never include DOM properties that reference other DOM Nodes (nextSibling, parentElement, etc), in order to prevent infinite recursion loops', function(){
						var nodeProps = ['children', 'parentNode', 'parentElement', 'previousSibling', 'previousElementSibling', 'nextSibling', 'nextElementSibling', 'firstChild', 'firstElementChild', 'lastChild', 'lastElementChild', 'offsetParent', 'ownerDocument']
						var result = domJSON.toJSON(containerNode, {
							domProperties: nodeProps
						});

						nodeProps.forEach(function(v){
							expect(result.node[v]).toBeUndefined();
						})
					});

					it('should be able to ignore all serialized DOM properties (like outerHTML, textContent, prefix, etc), overriding other property filters', function(){
						var result = domJSON.toJSON(containerNode, {
							serialProperties: false
						});

						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].innerText )).toBeUndefined();
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].outerHTML )).toBeUndefined();
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent )).toBeUndefined();
					});

					it('should be able to include all serialized DOM properties, overriding other property filters', function(){
						var result = domJSON.toJSON(containerNode, {
							serialProperties: true
						});

						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].textContent )).toBe('This is a test paragraph with a span in the middle of it.');
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].outerHTML )).toBe('<p class="delta">This is a test paragraph <span class="epsilon">with a span in the middle</span> of it.</p>');
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent )).toBe('This is a test paragraph');
					});

					it('should be able to include a specific set of serialized DOM properties, overriding other property filters', function(){
						var result = domJSON.toJSON(containerNode, {
							serialProperties: [true, 'outerHTML', 'textContent']
						});

						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].textContent )).toBe('This is a test paragraph with a span in the middle of it.');
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].innerHTML )).toBeUndefined();
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].outerHTML )).toBe('<p class="delta">This is a test paragraph <span class="epsilon">with a span in the middle</span> of it.</p>');
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent )).toBe('This is a test paragraph');
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].wholeText )).toBeUndefined();
					});

					it('should be able to exclude a specific set of serialized DOM properties, overriding other property filters', function(){
						var result = domJSON.toJSON(containerNode, {
							serialProperties: [false, 'outerHTML', 'textContent']
						});

						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].textContent )).toBeUndefined();
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].innerHTML )).toBe('<p class="delta">This is a test paragraph <span class="epsilon">with a span in the middle</span> of it.</p>');
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].outerHTML )).toBeUndefined();
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].textContent )).toBeUndefined();
						expect(noWhiteSpaceAroundTags( result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[0].wholeText )).toBe('This is a test paragraph');
					});
				});



				describe('about enumerating which attributes to include in the output', function(){
					it('should be able to ignore all HTML attributes', function(){
						var result = domJSON.toJSON(containerNode, {
							attributes: false
						});

						expect(result.node.childNodes[0].attributes).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].attributes).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes).toBeUndefined();
					});

					it('should be able to include all HTML attributes', function(){
						var result = domJSON.toJSON(containerNode, {
							attributes: true
						});

						expect(result.node.childNodes[0].attributes['data-test-a']).toBe('foo');
						expect(result.node.childNodes[0].attributes['data-test-b']).toBe('bar');
						expect(result.node.childNodes[0].attributes['style']).toBe('margin-top: 10px;');
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-c']).toBe('quux');
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-d']).toBe('baz');
						expect(result.node.childNodes[0].childNodes[0].attributes['style']).toBe('color: red;');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-e']).toBe('norf');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-f']).toBe('woop');
						//IE11 adds the "border-image: none" automatically for some stupid reason
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['style']).toBeOneOf(['border: 1px solid green;', 'border: 1px solid green; border-image: none;']);
					});

					it('should be able to include a set of HTML attributes, as specified by an array', function(){
						var result = domJSON.toJSON(containerNode, {
							attributes: {
								values: ['data-test-a', 'data-test-c', 'style']
							}
						});

						expect(result.node.childNodes[0].attributes['data-test-a']).toBe('foo');
						expect(result.node.childNodes[0].attributes['data-test-b']).toBeUndefined();
						expect(result.node.childNodes[0].attributes['style']).toBe('margin-top: 10px;');
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-c']).toBe('quux');
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-d']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].attributes['style']).toBe('color: red;');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-e']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-f']).toBeUndefined();
						//IE11 adds the "border-image: none" automatically for some stupid reason
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['style']).toBeOneOf(['border: 1px solid green;', 'border: 1px solid green; border-image: none;']);
					});

					it('should be able to exclude a set of HTML attributes, as specified by an array', function(){
						var result = domJSON.toJSON(containerNode, {
							attributes: {
								exclude: true,
								values: ['data-test-a', 'data-test-c', 'style']
							}
						});

						expect(result.node.childNodes[0].attributes['data-test-a']).toBeUndefined();
						expect(result.node.childNodes[0].attributes['data-test-b']).toBe('bar');
						expect(result.node.childNodes[0].attributes['style']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-c']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-d']).toBe('baz');
						expect(result.node.childNodes[0].childNodes[0].attributes['style']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-e']).toBe('norf');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-f']).toBe('woop');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['style']).toBeUndefined();
					});
				});



				describe('about enumerating which computed style properties to include in the output', function(){
					it('should be able to ignore computed styles', function(){
						var result = domJSON.toJSON(containerNode, {
							computedStyle: false
						});

						expect(result.node.childNodes[0].style).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].style).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style).toBeUndefined();
					});

					it('should be able to include all computed styles', function(){
						var result = domJSON.toJSON(containerNode, {
							computedStyle: true
						});

						expect(result.node.childNodes[0].style['bottom']).toBe('auto');
						expect(result.node.childNodes[0].style['cursor']).toBe('auto');
						expect(result.node.childNodes[0].childNodes[0].style['display']).toBe('block');
						expect(result.node.childNodes[0].childNodes[0].style['right']).toBe('auto');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style['direction']).toBe('ltr');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style['paddingTop']).toBe('0px');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].style['display']).toBe('inline');
					});

					it('should be able to include a set of computed style properties on the given nodes, as specified by an array', function(){
						var result = domJSON.toJSON(containerNode, {
							computedStyle: ['bottom', 'display', 'direction']
						});

						expect(result.node.childNodes[0].style['bottom']).toBe('auto');
						expect(result.node.childNodes[0].style['cursor']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].style['display']).toBe('block');
						expect(result.node.childNodes[0].childNodes[0].style['right']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style['direction']).toBe('ltr');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style['paddingTop']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].style['display']).toBe('inline');
					});

					it('should be able to exclude a set of computed style properties on the given nodes, as specified by an array', function(){
						var result = domJSON.toJSON(containerNode, {
							computedStyle: [true, 'bottom', 'display', 'direction']
						});

						expect(result.node.childNodes[0].style['bottom']).toBeUndefined();
						expect(result.node.childNodes[0].style['cursor']).toBe('auto');
						expect(result.node.childNodes[0].childNodes[0].style['display']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].style['right']).toBe('auto');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style['direction']).toBeUndefined();
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style['paddingTop']).toBe('0px');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[0].childNodes[1].style['display']).toBeUndefined();
					});
				});



				describe('about converting relative paths in attributes', function(){
					beforeEach(function(){
						$('.alpha').attr('data-test-a', '../fake.html');
						$('.alpha').attr('data-test-b', 'https://google.com/');
						$('.beta').attr('data-test-c', './a/b/c/fake.html');
						$('.charlie').attr('data-test-e', 'fake.html');
						$('.charlie').append('<img class="foxtrot" src="/lib/w3c_home.png">');
						$('.charlie').append('<a class="golf" href="./lib/w3c_home.png">This is a test link.</a>');
						$('.charlie').append('<form class="hotel" action="../../aa/bb/cc"></form>');
						$('.charlie').append('<object class="india" class="india" data="data:image/gif;base64,R0lGODlhEAAQAMQAAORH"></object>');
					});

					it('should be able to ignore all relative paths contained in DOM attributes, and keep them as is', function(){
						var result = domJSON.toJSON(containerNode, {
							absolutePaths: false
						});

						expect(result.node.childNodes[0].attributes['data-test-a']).toBe('../fake.html');
						expect(result.node.childNodes[0].attributes['data-test-b']).toBe('https://google.com/');
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-c']).toBe('./a/b/c/fake.html');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-e']).toBe('fake.html');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[1].attributes['src']).toBe('/lib/w3c_home.png');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[2].attributes['href']).toBe('./lib/w3c_home.png');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[3].attributes['action']).toBe('../../aa/bb/cc');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[4].attributes['data']).toBe('data:image/gif;base64,R0lGODlhEAAQAMQAAORH');
					});

					it('should be able to convert all relative paths contained in DOM attributes to absolute paths, while leaving absolute URLs and dataURIs untouched', function(){
						var result = domJSON.toJSON(containerNode, {
							absolutePaths: true
						});

						expect(result.node.childNodes[0].attributes['data-test-a']).toBe(window.location.origin +'/fake.html');
						expect(result.node.childNodes[0].attributes['data-test-b']).toBe('https://google.com/');
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-c']).toBe(window.location.origin +'/a/b/c/fake.html');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-e']).toBe(window.location.origin +'/fake.html');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[1].attributes['src']).toBe(window.location.origin +'/lib/w3c_home.png');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[2].attributes['href']).toBe(window.location.origin +'/lib/w3c_home.png');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[3].attributes['action']).toBe(window.location.origin +'/aa/bb/cc');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[4].attributes['data']).toBe('data:image/gif;base64,R0lGODlhEAAQAMQAAORH');
					});

					it('should be able to convert all relative paths contained in a specified list of DOM attributes to absolute paths, while leaving absolute URLs and dataURIs untouched', function(){
						var result = domJSON.toJSON(containerNode, {
							absolutePaths: {
								exclude: false,
								values: ['data-test-a', 'href', 'action']
							}
						});

						expect(result.node.childNodes[0].attributes['data-test-a']).toBe(window.location.origin +'/fake.html');
						expect(result.node.childNodes[0].attributes['data-test-b']).toBe('https://google.com/');
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-c']).toBe('./a/b/c/fake.html');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-e']).toBe('fake.html');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[1].attributes['src']).toBe('/lib/w3c_home.png');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[2].attributes['href']).toBe(window.location.origin +'/lib/w3c_home.png');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[3].attributes['action']).toBe(window.location.origin +'/aa/bb/cc');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[4].attributes['data']).toBe('data:image/gif;base64,R0lGODlhEAAQAMQAAORH');
					});

					it('should be able to convert all relative paths contained in DOM attributes, except those contained on a specified list, to absolute paths, while leaving absolute URLs and dataURIs untouched', function(){
						var result = domJSON.toJSON(containerNode, {
							absolutePaths: {
								exclude: true,
								values: ['data-test-a', 'href', 'action']
							}
						});

						expect(result.node.childNodes[0].attributes['data-test-a']).toBe('../fake.html');
						expect(result.node.childNodes[0].attributes['data-test-b']).toBe('https://google.com/');
						expect(result.node.childNodes[0].childNodes[0].attributes['data-test-c']).toBe(window.location.origin +'/a/b/c/fake.html');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].attributes['data-test-e']).toBe(window.location.origin +'/fake.html');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[1].attributes['src']).toBe(window.location.origin +'/lib/w3c_home.png');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[2].attributes['href']).toBe('./lib/w3c_home.png');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[3].attributes['action']).toBe('../../aa/bb/cc');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].childNodes[4].attributes['data']).toBe('data:image/gif;base64,R0lGODlhEAAQAMQAAORH');
					});
				});



				/*describe('about converting relative paths in computed styles', function(){
					it('should be able to ignore all relative paths contained in computed styles, and keep them as is', function(){
						var result = domJSON.toJSON(containerNode, {
							absStylePaths: false,
							computedStyle: true
						});

						expect(result.node.childNodes[0].style['borderImageSource']).toBe('url(../w3c_home.png)');
						expect(result.node.childNodes[0].style['backgroundImage']).toBe('url(https://google.com/images/srpr/logo11w.png)');
						expect(result.node.childNodes[0].childNodes[0].style['listStyleImage']).toBe('url(./fake)');
						expect(result.node.childNodes[0].childNodes[0].style['backgroundImage']).toBe('url(data:image/gif;base64,R0lGODlhEAAQAMQAAORH)');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style['background']).toBe('url(../../aa/bb/cc)');
						expect(result.node.childNodes[0].childNodes[0].childNodes[0].style['listStyleImage']).toBe('url(aFakeImage)');
					});

					it('should be able to convert all relative paths contained in computed styles to absolute paths, while leaving absolute URLs and dataURIs untouched', function(){
						var result = domJSON.toJSON(containerNode, {
							absStylePaths: true,
							computedStyle: true
						});
					});

					it('should be able to convert all relative paths contained in a specified list of computed styles to absolute paths, while leaving absolute URLs and dataURIs untouched', function(){
						var result = domJSON.toJSON(containerNode, {
							absStylePaths: ['data-test-a', 'href', 'action'],
							computedStyle: true
						});
					});

					it('should be able to convert all relative paths contained in computed styles, except those contained on a specified list, to absolute paths, while leaving absolute URLs and dataURIs untouched', function(){
						var result = domJSON.toJSON(containerNode, {
							absStylePaths: [true, 'data-test-a', 'href', 'action'],
							computedStyle: true
						});
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
			beforeEach(function(){
				if (!stringifiedTest) {
					stringifiedTest = '{"meta":{"domain":"http://localhost:5050/","userAgent":"Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36","version":"0.1.0","options":{"absolutePaths":["action","data","href","src"],"attributes":true,"computedStyle":false,"cull":true,"deep":true,"filter":false,"htmlOnly":false,"metadata":true,"serialProperties":false,"stringify":true,"domProperties":[true,"attributes","childNodes","children","classList","dataset","style","innerHTML","innerText","outerHTML","outerText","prefix","text","textContent","wholeText"],"absoluteBase":"http://localhost:5050/"},"clock":6},"node":{"spellcheck":true,"isContentEditable":false,"contentEditable":"inherit","hidden":false,"draggable":false,"tabIndex":-1,"translate":true,"childElementCount":1,"className":"container otherClass","scrollHeight":184,"scrollWidth":71,"scrollTop":0,"scrollLeft":0,"clientHeight":184,"clientWidth":72,"clientTop":0,"clientLeft":0,"offsetHeight":184,"offsetWidth":72,"offsetTop":10,"offsetLeft":1511,"localName":"div","namespaceURI":"http://www.w3.org/1999/xhtml","tagName":"DIV","baseURI":"http://localhost:5050/?","nodeType":1,"nodeName":"DIV","attributes":{"class":"container otherClass"},"childNodes":[{"spellcheck":true,"isContentEditable":false,"contentEditable":"inherit","hidden":false,"draggable":false,"tabIndex":-1,"translate":true,"childElementCount":1,"className":"alpha","scrollHeight":178,"scrollWidth":65,"scrollTop":0,"scrollLeft":0,"clientHeight":178,"clientWidth":66,"clientTop":3,"clientLeft":3,"offsetHeight":184,"offsetWidth":72,"offsetTop":10,"offsetLeft":1511,"localName":"div","namespaceURI":"http://www.w3.org/1999/xhtml","tagName":"DIV","baseURI":"http://localhost:5050/?","nodeType":1,"nodeName":"DIV","attributes":{"class":"alpha","data-test-a":"foo","data-test-b":"bar","style":"margin-top: 10px;"},"childNodes":[{"spellcheck":true,"isContentEditable":false,"contentEditable":"inherit","hidden":false,"draggable":false,"tabIndex":-1,"translate":true,"childElementCount":1,"className":"beta","scrollHeight":178,"scrollWidth":65,"scrollTop":0,"scrollLeft":0,"clientHeight":178,"clientWidth":66,"clientTop":0,"clientLeft":0,"offsetHeight":178,"offsetWidth":66,"offsetTop":13,"offsetLeft":1514,"localName":"div","namespaceURI":"http://www.w3.org/1999/xhtml","tagName":"DIV","baseURI":"http://localhost:5050/?","nodeType":1,"nodeName":"DIV","attributes":{"class":"beta","data-test-c":"quux","data-test-d":"baz","style":"color: red;"},"childNodes":[{"spellcheck":true,"isContentEditable":false,"contentEditable":"inherit","hidden":false,"draggable":false,"tabIndex":-1,"translate":true,"childElementCount":1,"className":"charlie","scrollHeight":176,"scrollWidth":63,"scrollTop":0,"scrollLeft":0,"clientHeight":176,"clientWidth":64,"clientTop":1,"clientLeft":1,"offsetHeight":178,"offsetWidth":66,"offsetTop":13,"offsetLeft":1514,"localName":"div","namespaceURI":"http://www.w3.org/1999/xhtml","tagName":"DIV","baseURI":"http://localhost:5050/?","nodeType":1,"nodeName":"DIV","attributes":{"class":"charlie","data-test-e":"norf","data-test-f":"woop","style":"border: 1px solid green;"},"childNodes":[{"spellcheck":true,"isContentEditable":false,"contentEditable":"inherit","hidden":false,"draggable":false,"tabIndex":-1,"translate":true,"childElementCount":1,"className":"delta","scrollHeight":144,"scrollWidth":63,"scrollTop":0,"scrollLeft":0,"clientHeight":144,"clientWidth":64,"clientTop":0,"clientLeft":0,"offsetHeight":144,"offsetWidth":64,"offsetTop":30,"offsetLeft":1515,"localName":"p","namespaceURI":"http://www.w3.org/1999/xhtml","tagName":"P","baseURI":"http://localhost:5050/?","nodeType":1,"nodeName":"P","attributes":{"class":"delta"},"childNodes":[{"length":25,"data":"This is a test paragraph ","baseURI":"http://localhost:5050/?","nodeType":3,"nodeValue":"This is a test paragraph ","nodeName":"#text","childNodes":[]},{"spellcheck":true,"isContentEditable":false,"contentEditable":"inherit","hidden":false,"draggable":false,"tabIndex":-1,"translate":true,"childElementCount":0,"className":"epsilon","scrollHeight":0,"scrollWidth":0,"scrollTop":0,"scrollLeft":0,"clientHeight":0,"clientWidth":0,"clientTop":0,"clientLeft":0,"offsetHeight":71,"offsetWidth":46,"offsetTop":84,"offsetLeft":1515,"localName":"span","namespaceURI":"http://www.w3.org/1999/xhtml","tagName":"SPAN","baseURI":"http://localhost:5050/?","nodeType":1,"nodeName":"SPAN","attributes":{"class":"epsilon"},"childNodes":[{"length":25,"data":"with a span in the middle","baseURI":"http://localhost:5050/?","nodeType":3,"nodeValue":"with a span in the middle","nodeName":"#text","childNodes":[]}]},{"length":7,"data":" of it.","baseURI":"http://localhost:5050/?","nodeType":3,"nodeValue":" of it.","nodeName":"#text","childNodes":[]}]}]}]},{"length":25,"data":"This is a sample comment!","baseURI":"http://localhost:5050/?","nodeType":8,"nodeValue":"This is a sample comment!","nodeName":"#comment","childNodes":[]},{"target":"xml-stylesheet","length":32,"data":"href=\"mycss.css\" type=\"text/css\"","baseURI":"http://localhost:5050/?","nodeType":7,"nodeValue":"href=\"mycss.css\" type=\"text/css\"","nodeName":"xml-stylesheet","childNodes":[]}]}]}}';
				}
			});

			afterEach(function(){
				testArea.html('');
			})

			it('should output a document fragment', function(){
				var result = domJSON.toDOM(JSON.parse(stringifiedTest));

				expect(result).toEqual(jasmine.any(DocumentFragment));
			});

			it('should be able to process a JSON string, with metadata', function(){
				var result = domJSON.toDOM(stringifiedTest);
				testArea.append(result);

				expect($('.testArea .alpha').attr('data-test-a')).toBe('foo');
				expect($('.testArea .alpha').attr('data-test-b')).toBe('bar');
				expect($('.testArea .alpha').get(0).style['marginTop']).toBe('10px');
				expect($('.testArea .beta').attr('data-test-c')).toBe('quux');
				expect($('.testArea .beta').attr('data-test-d')).toBe('baz');
				expect($('.testArea .beta').get(0).style['color']).toBe('red');
				expect($('.testArea .charlie').attr('data-test-e')).toBe('norf');
				expect($('.testArea .charlie').attr('data-test-f')).toBe('woop');
				expect($('.testArea .charlie').get(0).style['borderWidth']).toBe('1px');
				expect($('.testArea .charlie').get(0).style['borderStyle']).toBe('solid');
				expect($('.testArea .delta').text()).toBe('This is a test paragraph with a span in the middle of it.')
				expect($('.testArea .epsilon').text()).toBe('with a span in the middle');
			});

			it('should be able to process a JSON friendly object, with metadata', function(){
				var result = domJSON.toDOM(JSON.parse(stringifiedTest));
				testArea.append(result);

				expect($('.testArea .alpha').attr('data-test-a')).toBe('foo');
				expect($('.testArea .alpha').attr('data-test-b')).toBe('bar');
				expect($('.testArea .alpha').get(0).style['marginTop']).toBe('10px');
				expect($('.testArea .beta').attr('data-test-c')).toBe('quux');
				expect($('.testArea .beta').attr('data-test-d')).toBe('baz');
				expect($('.testArea .beta').get(0).style['color']).toBe('red');
				expect($('.testArea .charlie').attr('data-test-e')).toBe('norf');
				expect($('.testArea .charlie').attr('data-test-f')).toBe('woop');
				expect($('.testArea .charlie').get(0).style['borderWidth']).toBe('1px');
				expect($('.testArea .charlie').get(0).style['borderStyle']).toBe('solid');
				expect($('.testArea .delta').text()).toBe('This is a test paragraph with a span in the middle of it.')
				expect($('.testArea .epsilon').text()).toBe('with a span in the middle');
			});

			it('should be able to process a JSON string, without metadata', function(){
				var result = domJSON.toDOM(JSON.stringify(JSON.parse(stringifiedTest).node), {
					noMeta: true
				});
				testArea.append(result);

				expect($('.testArea .alpha').attr('data-test-a')).toBe('foo');
				expect($('.testArea .alpha').attr('data-test-b')).toBe('bar');
				expect($('.testArea .alpha').get(0).style['marginTop']).toBe('10px');
				expect($('.testArea .beta').attr('data-test-c')).toBe('quux');
				expect($('.testArea .beta').attr('data-test-d')).toBe('baz');
				expect($('.testArea .beta').get(0).style['color']).toBe('red');
				expect($('.testArea .charlie').attr('data-test-e')).toBe('norf');
				expect($('.testArea .charlie').attr('data-test-f')).toBe('woop');
				expect($('.testArea .charlie').get(0).style['borderWidth']).toBe('1px');
				expect($('.testArea .charlie').get(0).style['borderStyle']).toBe('solid');
				expect($('.testArea .delta').text()).toBe('This is a test paragraph with a span in the middle of it.')
				expect($('.testArea .epsilon').text()).toBe('with a span in the middle');
			});

			it('should be able to process a JSON friendly object, without metadata', function(){
				var result = domJSON.toDOM(JSON.parse(stringifiedTest).node, {
					noMeta: true
				});
				testArea.append(result);

				expect($('.testArea .alpha').attr('data-test-a')).toBe('foo');
				expect($('.testArea .alpha').attr('data-test-b')).toBe('bar');
				expect($('.testArea .alpha').get(0).style['marginTop']).toBe('10px');
				expect($('.testArea .beta').attr('data-test-c')).toBe('quux');
				expect($('.testArea .beta').attr('data-test-d')).toBe('baz');
				expect($('.testArea .beta').get(0).style['color']).toBe('red');
				expect($('.testArea .charlie').attr('data-test-e')).toBe('norf');
				expect($('.testArea .charlie').attr('data-test-f')).toBe('woop');
				expect($('.testArea .charlie').get(0).style['borderWidth']).toBe('1px');
				expect($('.testArea .charlie').get(0).style['borderStyle']).toBe('solid');
				expect($('.testArea .delta').text()).toBe('This is a test paragraph with a span in the middle of it.')
				expect($('.testArea .epsilon').text()).toBe('with a span in the middle');
			});
		});
	});
})();