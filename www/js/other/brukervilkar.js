myApp.onPageBeforeInit('brukervilkar', function(page) {
	$("#back-brukervilkar").click(function(event) {
		mainView.router.back();
	});
});
