var myApp = new Framework7();
var $$ = Dom7;
var mainView = myApp.addView('.view-main', {
	dynamicNavbar: true
});

//var SERVER_URL = "https://lillo-nydalen-parkering.herokuapp.com"
var SERVER_URL = "http://localhost"
moment().locale("nb");

var pusher = new Pusher('b3268785e53213585357', {
	cluster: 'eu',
	encrypted: true
});

myApp.onPageBeforeInit('*', function(page) {
	$(".navbar").css({
		"background-color": "#979797"
	});
});


$$(document).on('deviceready', function() {
	//localStorage.setItem("userId","58f6fa9aae6c971300a2bed3");
	if (!localStorage.getItem("userId")) {
		myApp.loginScreen();
	}
	initializePushwoosh();
	initializePusher();

	$("#login").click(function() {
		$.post(SERVER_URL + "/user/email", {
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
					//TODO: Clear credentials

				}

			}
		});
	});

	$("#logout").click(function() {
		localStorage.clear();
		myApp.closePanel();
		myApp.loginScreen();
	});

	$("#newUser").click(function() {
		
		mainView.router.loadPage('views/user.html');
		myApp.closePanel();
		myApp.closeModal();
	});
});


function initializePusher() {
	var channel = pusher.subscribe("global-request-channel");
	channel.bind('request-update', function(data) {
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