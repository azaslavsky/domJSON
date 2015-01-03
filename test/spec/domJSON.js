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

				it('should should return a shallow copy of the provided object/array if a filter property is not specified', function(){
					var newObj = domJSON.__boolFilter(testObj);
					var newArr = domJSON.__boolFilter(testArr);

					expect(newObj).toEqual(testObj);
					expect(newObj).not.toBe(testObj);
					expect(newArr).toEqual(testArr);
					expect(newArr).not.toBe(testArr);
				});

				it('should should return a shallow copy of the provided object/array if a filter property is boolean true', function(){
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

				it('should should return an empty object/array if the filter property is boolean false', function(){
					expect(domJSON.__boolFilter(testObj, false)).toEqual({});
					expect(domJSON.__boolFilter(testArr, false)).toEqual([]);
					expect(domJSON.__boolFilter(testObj, [false])).toEqual({});
					expect(domJSON.__boolFilter(testArr, [false])).toEqual([]);
				});

				it('should should do a difference if the first value of the provided filtering array is a boolean true', function(){
					var newObj = domJSON.__boolFilter(testObj, [true, 'foo', 'norf']);
					var newArr = domJSON.__boolFilter(testArr, [true, 'a', 'e', 'd']);

					expect(newObj).toEqual({
						baz: 'quux',
						bar2: 'baz2'
					});
					expect(newArr).toEqual(['b', 'c', 'f']);
				});

				it('should should do an intersection if the first value of the provided filtering array is a boolean false', function(){
					var newObj = domJSON.__boolFilter(testObj, [false, 'foo', 'norf']);
					var newArr = domJSON.__boolFilter(testArr, [false, 'a', 'e', 'd']);

					expect(newObj).toEqual({
						foo: 'bar',
						norf: 'foo2'
					});
					expect(newArr).toEqual(['a', 'd', 'e']);
				});

				it('should should do an intersection if the leading boolean is omitted from the provided filtering array', function(){
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
		});

		describe('DOM node creation [.toDOM() method]', function(){
		});
	});
})();