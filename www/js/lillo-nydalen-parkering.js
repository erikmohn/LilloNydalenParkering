var myApp = new Framework7();
var $$ = Dom7;
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

var SERVER_URL = "https://lillo-nydalen-parkering.herokuapp.com"
moment().locale("nb");

var pusher = new Pusher('b3268785e53213585357', {
  cluster: 'eu',
  encrypted: true
});

$$(document).on('deviceready', function() {
    console.log("Device is ready!");
	
	initializeUser();
	initializeCurrentRequest();
	initializeOffer();	
    initializePushwoosh();
    initializePusher();		

});

function initializePusher() {
	var channel = pusher.subscribe("global-request-channel");
			    channel.bind('request-update', function(data) {
			 		refreshParkingRequests();
			 		navigator.vibrate(500);
			    });
};

function initializePushwoosh() {
	if (device.platform === "Android" || device.platform === "iOS") {
		  var pushwoosh = cordova.require("pushwoosh-cordova-plugin.PushNotification");

		  // Should be called before pushwoosh.onDeviceReady
		  document.addEventListener('push-notification', function(event) {
		    var notification = event.notification;
		    // handle push open here
		  });

		  pushwoosh.registerDevice(function(status) {
		    var pushToken = status.pushToken;
		  },
		  function(status) {
		  }
		);
		  
		  // Initialize Pushwoosh. This will trigger all pending push notifications on start.
		  pushwoosh.onDeviceReady({
		    appid: "2D52E-A279A"
		  });
	}
};