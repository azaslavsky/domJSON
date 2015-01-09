$('#submit1').click(function(){
	//Get options
	var output, options = {}, booleanSelects = ['absolutePaths', 'attributes', 'computedStyle', 'cull', 'deep', 'htmlOnly', 'metadata', 'serialProperties'];

	booleanSelects.forEach(function(v,i){
		options[v] = $('[name="'+ v +'"]').first().val() === 'true' ? true : false;
	});

	options.domProperties = true;

	output = domJSON.toJSON( $('#sample1Container>div').get(0), options );
	console.log(output);
});