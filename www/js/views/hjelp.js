myApp.onPageBeforeInit('hjelp', function(page) {
	$("#back-hjelp").click(function(event) {
		mainView.router.back();
	});
});
