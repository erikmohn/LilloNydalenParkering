myApp.onPageBeforeInit('more', function(page) {
	window.ga.trackView('More');
	activeMenuItem("#moreLi");
});
