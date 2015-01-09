//Reset the iframe
var reset2 = function(){
	var link, ow;
	var frameDoc = $( $('#sample2Frame').get(0).contentDocument.activeElement );
	var section = $('<section></section>');

	//Append the stylesheet
	link = $('<link rel="stylesheet" type="text/css" href="./css/frame.css">');
	frameDoc.parent().children('head').append(link);

	//Make 2500 rows
	for (var i = 0; i < 2500; i++) {
		row = $('<div>'+ i +'</div>');
		section.append(row);
	}

	frameDoc.html(section);
};
$('#reset2').click(reset2);



var checkIncrementIsNumber = function(increment){
	if ( typeof increment !== 'number' || isNaN(increment) || increment === null ) {
		alert ('Please enter an integer!');
		return false;
	}
	return true;
}



//Increment using domJSON
$('#doWithout2').click(function(){
	var increment = parseInt($('[name="increment"]').first().val().trim());
	var frameDoc = $( $('#sample2Frame').get(0).contentDocument.activeElement );
	var timer = new Date().getTime();
	if ( !checkIncrementIsNumber(increment) ) {
		return false;
	}

	//Update each row
	$('div', frameDoc).each(function(i,v){
		$(this).html( parseInt(v.innerText, 10) + increment );
	});
	$('#sample2Result').removeClass('green').html('The incrementation WITHOUT domJSON took: '+ ((new Date().getTime() - timer)/1000) +' seconds!');
});



var worker = new Worker('./js/worker2.js');
//Increment WITHOUT using domJSON
$('#doWith2').click(function(){
	var increment = parseInt($('[name="increment"]').first().val().trim());
	var frameDoc = $( $('#sample2Frame').get(0).contentDocument.activeElement );;
	var timer = new Date().getTime();
	if ( !checkIncrementIsNumber(increment) ) {
		return false;
	}

	//Update each row using a web worker and domJSON
	worker.postMessage( [domJSON.toJSON($('section', frameDoc).get(0), {
		attributes: false,
		domProperties: ['nodeValue'],
	}), increment] );
	worker.onmessage = function(e){
		var x = domJSON.toDOM(e.data);
		frameDoc.html(x);
		$('#sample2Result').addClass('green').html('The incrementation with domJSON took: '+ ((new Date().getTime() - timer)/1000) +' seconds!');
	};
});



//Load the 40,000 rows on ready
$( document ).ready(function(){
	reset2();
});