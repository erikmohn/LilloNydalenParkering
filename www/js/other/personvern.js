myApp.onPageBeforeInit('personvern', function(page) {
	window.ga.trackView('Personvern');
	$("#back-personvern").click(function(event) {
		mainView.router.back();
	});
});
