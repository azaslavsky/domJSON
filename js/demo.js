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