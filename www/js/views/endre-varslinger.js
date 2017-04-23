myApp.onPageBeforeInit('endre-varslinger', function(page) {
	$("#back-endre-varslinger").click(function(event) {
		mainView.router.back();
	});
});
