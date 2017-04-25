var myApp = new Framework7({
	material: true,
	swipePanel: 'left'
});
var $$ = Dom7;
var mainView = myApp.addView('.view-main', {
	dynamicNavbar: true
});

var SERVER_URL = "http://api.lillonydalenparkering.no"
moment().locale("nb");

var pusher = new Pusher('b3268785e53213585357', {
	cluster: 'eu',
	encrypted: true
});

$$('.panel-left').on('panel:open', function() {
	$(".views").removeClass('grow')
	$(".views").addClass('shrink')
	//$("#start").addClass('panel-background')
	refreshBadges();
});


$$('.panel-left').on('panel:close', function() {
	$(".views").removeClass('shrink')
	$(".views").addClass('grow')
});

myApp.onPageBeforeInit('*', function(page) {
	$(".navbar").css({
		"background-color": "#f2862a" //"#979797"
	});
});

$$('.panel-left').on('panel:open', function() {
	refreshBadges();
});



$$(document).on('deviceready', function() {

	//localStorage.setItem("userId","58f6fa9aae6c971300a2bed3");
	//localStorage.clear()
	if (!localStorage.getItem("userId")) {
		myApp.loginScreen();
	} else {
		initializePushwoosh();
		initializePusher();
	}

	$("#login").click(function() {
		$.post(SERVER_URL + "/user/authenticate", {
			username: $("#login-email").val(),
			password: hex_sha256($("#login-password").val())
		}).done(function(user) {
			if (user) {
				if (user.notAuthenticated) {
					myApp.alert("Pålogging feilet!");
				} else {
					$("#login-email").val("");
					$("#login-password").val("");
					localStorage.setItem("userId", user._id);
					$(".navbar").css({
						"background-color": "#f2862a"
					});
					mainView.router.loadPage('index.html');
					myApp.closeModal();
				}

			}
		});
	});

	$("#oPanel").click(function()  {

	})

	$("#logout").click(function() {
		$("#login-email").val("");
		$("#login-password").val("");
		localStorage.clear();
		myApp.closePanel();
		myApp.loginScreen();
	});

	$("#newUser").click(function() {
		mainView.router.loadPage('views/login/new-user.html');
		myApp.closePanel();
		myApp.closeModal();
	});

	$("#glemtPassord").click(function() {
		mainView.router.loadPage('views/login/glemt-passord.html');
		myApp.closePanel();
		myApp.closeModal();
	});
});


function initializePusher() {
	var channel = pusher.subscribe("global-request-channel");
	channel.bind('request-update', function(data) {
		refreshBadges();
		refreshParkingRequests();
	});
};

function initializePushwoosh() {
	if (device.platform === "Android" || device.platform === "iOS") {
		var pushwoosh = cordova.require("pushwoosh-cordova-plugin.PushNotification");
		document.addEventListener('push-notification', function(event) {
			var notification = event.notification;
			// handle push open here
		});

		pushwoosh.registerDevice(function(status) {
				var pushToken = status.pushToken;
				localStorage.setItem("pushToken", status.pushToken);
			},
			function(status) {}
		);

		pushwoosh.onDeviceReady({
			appid: "2D52E-A279A"
		});
	}
};

function activeMenuItem(menuItem) {
	$("#myRequestLi").removeClass('currentLi');
	$("#requestsLi").removeClass('currentLi');
	$("#historyLi").removeClass('currentLi');
	$("#settingsLi").removeClass('currentLi');
	$(menuItem).addClass('currentLi');
}

function refreshBadges() {
	$.post(SERVER_URL + "/parking/requests", {
		userId: localStorage.getItem("userId"),
		now: new Date()
	}).done(function(parkingRequests) {
		var count = 0;
		var userId = localStorage.getItem("userId");
		console.log(parkingRequests.length);
		parkingRequests.forEach(function(item) {
			if (item.requestUser[0]._id !== userId) {
				count++;
			}
		});
		if (count !== 0) {
			$("#offerBadge").html('<span class="badge bg-grey right-align">' + count + '</span>');
		} else {
			$("#offerBadge").empty();
		}

	})
};