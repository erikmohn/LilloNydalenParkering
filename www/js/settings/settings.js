myApp.onPageBeforeInit('settings', function(page) {
	window.ga.trackView('Settings');
	activeMenuItem("#settingsLi");

});

myApp.onPageInit('settings', function(page) {
	myApp.closePanel();

});



