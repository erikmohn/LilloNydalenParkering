myApp.onPageBeforeInit('hjelp', function(page) {
	window.ga.trackView('Hjelp');
	$("#back-hjelp").click(function(event) {
		mainView.router.back();
	});
});
