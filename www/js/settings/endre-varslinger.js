myApp.onPageBeforeInit('endre-varslinger', function(page) {
	window.ga.trackView('Endre varslinger');
	$("#back-endre-varslinger").click(function(event) {
		mainView.router.back();
	});
});
