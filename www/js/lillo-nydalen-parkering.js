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
	window.ga.startTrackerWithId('UA-98130150-1', 30);
	window.analytics.trackEvent('Home', 'DeviceReady', 'Hits', 1);
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

	$("#oPanel").click(function() {

	})

	$("#logout").click(function() {
		$("#login-email").val("");
		$("#login-password").val("");
		localStorage.clear();
		myApp.closePanel();
		myApp.loginScreen();
		window.analytics.trackEvent('Settings', 'Logget ut', 'Hits', 1);
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
	});
};

function initializePushwoosh() {
	if (device.platform === "Android" || device.platform === "iOS") {
		var pushwoosh = cordova.require("pushwoosh-cordova-plugin.PushNotification");
		document.addEventListener('push-notification', function(event) {
			var notification = event.notification;
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
	$("#requestsLi").removeClass('currentLi');
	$("#historyLi").removeClass('currentLi');
	$("#moreLi").removeClass('currentLi');
	$(menuItem).addClass('currentLi');
}

function refreshBadges() {
	$.post(SERVER_URL + "/parking/requests", {
		userId: localStorage.getItem("userId"),
		now: new Date()
	}).done(function(parkingRequests) {
		var count = 0;
		var userId = localStorage.getItem("userId");
		parkingRequests.forEach(function(item) {
			if (item.requestUser[0]._id !== userId) {
				count++;
			}
		});
		if (count !== 0) {
			$("#offerBadge").html('<span class="badge bg-orange md-36">' + count + '</span>');
		} else {
			$("#offerBadge").empty();
		}

	})
};