myApp.onPageBeforeInit('brukervilkar', function(page) {
	window.ga.trackView('Brukervilkar');
	$("#back-brukervilkar").click(function(event) {
		mainView.router.back();
	});
});
