myApp.onPageBeforeInit('brukervilkar', function(page) {
	window.ga.trackView('Brukervilkar');
	$("#back-brukervilkar").click(function(event) {
		if (!localStorage.getItem("userId")) {
			myApp.loginScreen();

		} else {
			mainView.router.back();
		}
	});
});