$('#submit1').click(function(){
	//Get options
	var deep, props, output, options = {}, booleanSelects = ['absolutePaths', 'attributes', 'computedStyle', 'cull', 'htmlOnly', 'metadata', 'serialProperties'];

	booleanSelects.forEach(function(v,i){
		options[v] = $('[name="'+ v +'"]').first().val() === 'true' ? true : false;
	});

	//Get "deep" setting
	deep = parseInt($('[name="deep"]').first().val(), 10);
	options.deep = typeof deep === 'number' ? true : $('[name="deep"]').first().val() === 'true' ? true : false;

	//Get "domProperties" setting
	props = $('[name="domProperties"]').first().val().trim().replace(/\s/gi, '');
	if (props.length) {
		props = props.split(',');
		if ( $('[name="dpExclude"]').first().val() === 'exclude' ) {
			props.unshift(true);
		}
		options.domProperties = props;
	}

	console.log(options);
	output = domJSON.toJSON( $('#sample1Container>div').get(0), options );

	$('#sample1Result').html( renderjson.set_show_to_level(4)(output) );
});