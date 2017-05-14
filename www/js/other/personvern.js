myApp.onPageBeforeInit('personvern', function(page) {
	window.ga.trackView('Personvern');
	$("#back-personvern").click(function(event) {
		if (!localStorage.getItem("userId")) {
			myApp.loginScreen();

		} else {
			mainView.router.back();
		}
	});
});