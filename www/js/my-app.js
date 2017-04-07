// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

var SERVER_URL = "https://lillo-nydalen-parkering.herokuapp.com"

function initPushwoosh() {
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

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

	var devicePlatform = device.platform;
	if (devicePlatform === "Android" || devicePlatform === "iOS") {
    initPushwoosh();		
	}

    // Enable pusher logging - don't include this in production
    Pusher.logToConsole = true;

    refreshUser();

	$("#user-save").click(function() {

		$.post(SERVER_URL + "/user/save",
			{
				userId: localStorage.getItem("userId"),
				userName: $("#user-nameInput").val(),
				phoneNumber: $("#user-phoneInput").val(),
				parkingSpace: $("#user-parkingLotInput").val(),
				regnr: $("#user-regnrInput").val(),
				epost: $("#user-emailInput").val(),
			}).done(function(user) {
				console.log("User has been saved! userId: " + user.user._id );
				console.log[user];
				localStorage.setItem("userId", user.user._id);
				refreshUser();
				
				$("#user-save").hide();
				$("#user-saved").show();
				//$("#request-form").show();
			});	
	});

	$("#send-request").click(function() {
		$.post(SERVER_URL + "/parking/request",
			{
				userId: localStorage.getItem("userId"),
				regNr: $("#request-regnr").val(),
				phoneNumber: $("#request-telefon").val(),
				starTime: $("#request-fom").val(),
				endTime: $("#request-tom").val()
			}).done(function(data) {
				console.log("Parking request has been sent!");
				regNr: $("#request-regnr").prop('disabled', true);
				phoneNumber: $("#request-telefon").prop('disabled', true);
				starTime: $("#request-fom").prop('disabled', true);
				endTime: $("#request-tom").prop('disabled', true);
				localStorage.setItem("currentRequest", data.request._id);
				
				$("#send-request").hide();
				$("#cancel-request").show();
				$("#request-tildeltParkering").show();
				refreshParkingRequests();
			});	
	});

	$("#cancel-request").click(function() {
		console.log("Will cancle: " + localStorage.getItem("currentRequest"));

		 $.post(SERVER_URL + "/parking/cancle", {
		 		parkingId: localStorage.getItem("currentRequest")
		 }).done(function(parking) {
		 		localStorage.removeItem("currentRequest");
				$("#send-request").show();	
				$("#cancel-request").hide();

				$("#request-regnr").val("").prop('disabled', false);
				$("#request-telefon").val("").prop('disabled', false);
				$("#request-fom").val("").prop('disabled', false);
				$("#request-tom").val("").prop('disabled', false);

				$("#request-tildeltParkering").hide();
				refreshCurrentRequest();
				console.log("Canceled parking: " + parking);
		 });

	});

	$("#send-offer").click(function() {
		var parkingId = $("#offer-currentRequest").val();
		console.log("Will offer parking for: " + parkingId);

		 $.post(SERVER_URL + "/parking/offer", {
		 		offerUserId: localStorage.getItem("userId"),
		 		parkingId: parkingId,
		 		parkingLot: $("#offer-parkingLotInput").val()
		 }).done(function(parking) {
		 		myApp.showTab('#requestsView');
				console.log("Offered parking space for: " + parking);
		 });
	});
});

//Open tab register request!
$("#registerRequest").on('show', function(){
	console.log("Open tab to register request!");
	var userId = localStorage.getItem("userId");
	
	if (userId == null) {		
		$("#request-form").hide();
	} else {
		refreshCurrentRequest();	
		$("#cancel-request").hide();
	}  
});

function refreshCurrentRequest() {
	var userId = localStorage.getItem("userId");
	
	$("#request-tildeltParkering").hide();
	$("#request-parkering").val("Ingen tilbudt parkering");
	$("#request-eier").val("");
	$("#request-eier-telefon").val("");

	//Check if user has pending parking requests
	$.get(SERVER_URL + "/parking/user/" + userId, function(parkingRequest) {
			if(typeof parkingRequest != "undefined" && parkingRequest != null && parkingRequest.length > 0) {
				console.log("Found pending parking request");
				$("#request-regnr").val(parkingRequest[0].regNr).prop('disabled', true);
				$("#request-telefon").val(parkingRequest[0].phoneNumber).prop('disabled', true);
				$("#request-fom").val(new Date(parkingRequest[0].startTime).toISOString().slice(0,16)).prop('disabled', true);
				$("#request-tom").val(new Date(parkingRequest[0].endTime).toISOString().slice(0,16)).prop('disabled', true);

				$("#send-request").hide();
				$("#cancel-request").show();
				
				$("#request-tildeltParkering").show();

				if (parkingRequest[0].answered) {
					console.log("Populate fields parking!");
					console.log(parkingRequest[0]);
					$("#request-parkering").val(parkingRequest[0].parkingLot);
					$("#request-eier").val(parkingRequest[0].offerParkingUser[0].userName);
					$("#request-eier-telefon").val(parkingRequest[0].offerParkingUser[0].phoneNumber);
				} else {
					console.log("No parking has been offered!");
					$("#request-parkering").val("Ingen plasstilbud");

				}

				localStorage.setItem("currentRequest", parkingRequest[0]._id);

			} else {
					console.log("No pending parking request");

					//Populate default values for parking requests
					$("#request-regnr").val(localStorage.getItem("regnr")).prop('disabled', false);
					$("#request-telefon").val(localStorage.getItem("phoneNumber")).prop('disabled', false);
					$("#request-fom").prop('disabled', false);
					$("#request-tom").prop('disabled', false);
					$("#send-request").show();
					$("#cancel-request").hide();
					
			}
	});
};

//Open tab register request!
$("#requestsView").on('show', function(){
	console.log("Open tab view open requests!");
	refreshParkingRequests();
});

//Open tab respond to request!
$("#offerForParkingRequestPage").on('show', function(){
	console.log("Open tab to respond to requests! For: " + localStorage.getItem("offer-currentRequest"));

	$.post(SERVER_URL + "/parking", {
		parkingId: $("#offer-currentRequest").val()
	}).done(function(parking) {
		$("#offer-navn").val(parking.requestUser[0].userName);
		$("#offer-regnr").val(parking.regNr);
		$("#offer-telefon").val(parking.phoneNumber);
		$("#offer-fom").val(parking.startTime);
		$("#offer-tom").val(parking.endTime);
	});
});

$("#userDataView").on('show', function(){
	console.log("Open tab to edit user data!");
	refreshUser();
});



function refreshUser() {
		var userId = localStorage.getItem("userId");
		$("#user-save").show();
		$("#user-saved").hide();

		if (userId != null) {

			    var pusher = new Pusher('b3268785e53213585357', {
			      cluster: 'eu',
			      encrypted: true
			    });
			    console.log("Will pusher-subscribe to: " + localStorage.getItem("userId"));
			    var channel = pusher.subscribe("USER-" + localStorage.getItem("userId"));
			    channel.bind('parking-offer', function(data) {
			    	refreshCurrentRequest();
			      	console.log("Recieved Pusher update!");
			    });

			//Get user data
			$.get(SERVER_URL + "/user/" + userId, function(user) {
					localStorage.setItem("regnr", user.regnr);
					localStorage.setItem("phoneNumber", user.phoneNumber);
					localStorage.setItem("parkingSpace", user.parkingSpace);

					//Populate fields for user data
					$("#user-nameInput").val(user.userName);
					$("#user-phoneInput").val(user.phoneNumber);
					$("#user-parkingLotInput").val(user.parkingSpace);
					$("#user-regnrInput").val(user.regnr);
					$("#user-emailInput").val(user.epost);
			});			
		}
};



function refreshParkingRequests() {
		//Fetch list av current requests
		$.get(SERVER_URL + "/parking/requests", function(parkingRequests) {
			console.log("Fetching valid current requests");
			$("#request-cards").empty();

			console.log(parkingRequests);
			$("#no-requests").hide();
			if(parkingRequests.length == 0) {
				$("#no-requests").show();
			}

			for (i in parkingRequests) {
				var parkingRequest = parkingRequests[i];
				$("#request-cards").append(
					'<div class="card">' +
	                    '<div class="card-header">'+parkingRequest.requestUser[0].userName + ' <i class="icon parking-icon right-align"></i></div>' +
	                    '<div class="card-content">' +
	                        '<div class="card-content-inner">' +
	  							'<b>Fra:</b> ' + parkingRequest.startTime + 
	  							'<br><b>Til:</b> ' + parkingRequest.endTime +
	  							'<br><b>Registrerningsnummer:</b> ' + parkingRequest.regNr + 
	  							'<br><b>Telfonnummer:</b> ' + parkingRequest.phoneNumber +
	                        '</div>' +
	                    '</div>' +
	                    '<div class="card-footer">' +
	                    '<i id="click-'+ parkingRequest._id + '" class="icon accept-icon center-align"></i>' +
	                    '</div></div>' +
					'</div>'
					);

				//Make offer for parkingId
				$("#click-" + parkingRequest._id).click(function() {
			    		$("#offer-currentRequest").val(parkingRequest._id);
						$("#offer-parkingLotInput").val(localStorage.getItem("parkingSpace"));
						localStorage.setItem("offer-currentRequest", parkingRequest._id)
			    		myApp.showTab('#offerForParkingRequestPage');

				});

			}	
		});
};


