myApp.onPageBeforeInit('settings', function(page) {
	window.ga.trackView('Settings');
});

myApp.onPageInit('settings', function(page) {
	myApp.closePanel();

});



