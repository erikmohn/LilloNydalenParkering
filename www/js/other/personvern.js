myApp.onPageBeforeInit('personvern', function(page) {
	$("#back-personvern").click(function(event) {
		mainView.router.back();
	});
});
