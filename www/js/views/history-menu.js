$("#historyMenuView").on('show', function() {
	$("#history-view-menu-loading").show();
	$("#history-view-menu-fail").hide();
	$("#history-view-menu").hide();

	var userId = localStorage.getItem("userId");
	if (userId === null) {
		$("#history-view-menu-loading").hide();
		$("#history-view-menu-fail").show();
	} else {
		$("#history-view-menu-loading").hide();
		$("#history-view-menu").show();
	}
});

function initializeHistoryMenu() {

	$('#open-history-requests').click(function() {
		myApp.showTab('#historyViewRequests');
	});

	$('#open-history-offers').click(function() {
		myApp.showTab('#historyViewOffers');
	});
};