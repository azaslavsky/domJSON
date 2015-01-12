//Toggle the sidebar
$('#sidebar-toggle').click(function(e) {
	e.preventDefault();
	$('#wrapper').toggleClass('toggled');
	if ( $('#wrapper').hasClass('toggled') ) {
		$('i', this).addClass('fa-navicon').removeClass('fa-close');
	} else {
		$('i', this).addClass('fa-close').removeClass('fa-navicon');
	}
});

//Highlight the Sample 1 boundaries
$('#boundary-highlight').mouseover(function(e) {
	$('#makejson').css('border', '1px dashed red');
});
$('#boundary-highlight').mouseout(function(e) {
	$('#makejson').css('border', '');
});



//Do the first Sample
$('#makejsonSubmit').click(function(){
	$('#makejsonSubmit').prop('disabled', true);

	//Get options
	var deep, props, output, options = {}, booleanSelects = ['absolutePaths', 'attributes', 'computedStyle', 'cull', 'htmlOnly', 'metadata', 'serialProperties'];

	booleanSelects.forEach(function(v,i){
		options[v] = $('[name="'+ v +'"]').first().val() === 'true' ? true : false;
	});

	//Get "deep" setting
	options.deep = 4;

	//Get "domProperties" setting
	props = $('[name="domProperties"]').first().val().trim().replace(/\s/gi, '');
	if (props.length) {
		props = props.split(',');
		if ( $('[name="dpExclude"]').first().val() === 'exclude' ) {
			props.unshift(true);
		}
		options.domProperties = props;
	}

	output = domJSON.toJSON( $('#makejson').get(0), options );

	$('#makejsonOutput').html( renderjson.set_show_to_level(3)(output) );
});



//Reset the first Sample
$('#makejsonReset').click(function(){
	$('#makejsonSubmit').prop('disabled', false);
	$('#makejsonOutput').html('');
});



//Sample 2
var checkIncrementIsNumber = function(increment){
	if ( typeof increment !== 'number' || isNaN(increment) || increment === null ) {
		alert ('Please enter an integer!');
		return false;
	}
	return true;
}



//Increment using domJSON
$('#webworkersJQuery').click(function(){
	var increment = parseInt($('[name="increment"]').first().val().trim());
	var frameDoc = $( $('#webworkersFrame').get(0).contentDocument.activeElement );
	var timer = new Date().getTime();
	if ( !checkIncrementIsNumber(increment) ) {
		return false;
	}

	//Update each row
	$('div', frameDoc).each(function(i,v){
		$(this).html( parseInt(v.textContent, 10) + increment );
	});
	$('#webworkersResults').prepend('<div class="webworkers-red">Using jQuery iteration, the incrementation took: '+ ((new Date().getTime() - timer)/1000) +' seconds!</div>');
});



//Increment WITHOUT using domJSON
var worker = new Worker('./demo/js/worker2.js');
$('#webworkersDomJSON').click(function(){
	var increment = parseInt($('[name="increment"]').first().val().trim());
	var frameDoc = $( $('#webworkersFrame').get(0).contentDocument.activeElement );
	var timer = new Date().getTime();
	if ( !checkIncrementIsNumber(increment) ) {
		return false;
	}

	//Update each row using a web worker and domJSON
	worker.postMessage( [domJSON.toJSON($('section', frameDoc).get(0), {
		attributes: false,
		domProperties: false,
	}), increment] );
	worker.onmessage = function(e){
		var x = domJSON.toDOM(e.data);
		frameDoc.html(x);
		$('#webworkersResults').prepend('<div class="webworkers-green">Using domJSON and Web Workers, the incrementation took: '+ ((new Date().getTime() - timer)/1000) +' seconds!</div>');
	};
});


//Reset the iframe
var reset = function(){
	var link, ow;
	var frameDoc = $( $('#webworkersFrame').get(0).contentDocument.activeElement );
	var section = $('<section></section>');

	//Append the stylesheet
	link = $('<link rel="stylesheet" type="text/css" href="./demo/css/frame.css">');
	frameDoc.parent().children('head').append(link);

	//Make 2500 rows
	for (var i = 0; i < 2500; i++) {
		row = $('<div>'+ i +'</div>');
		section.append(row);
	}

	frameDoc.html(section);
};
$('#webworkersReset').click(reset);



//Load the rows
$( document ).ready(function(){
	reset();
});