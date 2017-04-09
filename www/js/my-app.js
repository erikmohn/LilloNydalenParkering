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
moment().locale("nb");

var pusher = new Pusher('b3268785e53213585357', {
  cluster: 'eu',
  encrypted: true
});

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

	//StatusBar.styleDefault();
	//StatusBar.styleLightContent();
	//StatusBar.styleBlackTranslucent();
	StatusBar.styleBlackOpaque();

	var devicePlatform = device.platform;
	if (devicePlatform === "Android" || devicePlatform === "iOS") {
    initPushwoosh();		
	}

	var channel = pusher.subscribe("global-request-channel");
			    channel.bind('request-update', function(data) {
			 		refreshParkingRequests();
			    });

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
	$('#request-fom').setNow();
	$('#request-tom').setThreeHoursFromNow();
	
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

//Open tab view requests
$("#requestsView").on('show', function(){
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
		$("#offer-fom").html(moment(parking.startTime).locale("nb").format(" dddd HH:mm"));
		$("#offer-tom").val(moment(parking.endTime).locale("nb").format(" dddd HH:mm"));
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
		$("#requests-view-loading").show();
		$("#requests-view-done").hide();
		$("#requests-view-cards").hide();

		//Fetch list av current requests
		$.get(SERVER_URL + "/parking/requests", function(parkingRequests) {
			$("#request-cards").empty();
			if(parkingRequests.length == 0) {
				$("#requests-view-loading").hide();
				$("#requests-view-done").show();
			} else {
				for (i in parkingRequests) {
					var parkingRequest = parkingRequests[i];
					$("#request-cards").append(
						'<div class="card">' +
		                    '<div class="card-header">'+parkingRequest.requestUser[0].userName + ' <i class="icon parking-icon right-align"></i></div>' +
		                    '<div class="card-content">' +
		                        '<div class="card-content-inner">' +
		  							'<b>Fra:</b> ' + moment(parkingRequest.startTime).locale("nb").format(" dddd HH:mm") + 
		  							'<br><b>Til:</b> ' + moment(parkingRequest.endTime).locale("nb").format(" dddd HH:mm") +
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
				$("#requests-view-loading").hide();
				$("#requests-view-cards").show();
			}


		});
};

$.fn.setThreeHoursFromNow = function(onlyBlank) {
  var now = new Date(moment().add(5, 'hours'));
  var formattedDateTime = defaultValueDateTime(now)
  if ( onlyBlank === true && $(this).val() ) {
    return this;
  }
  $(this).val(formattedDateTime);
  return this;
};

$.fn.setNow = function (onlyBlank) {
  var now = new Date(moment().add(1, 'hours'));
  var formattedDateTime = defaultValueDateTime(now)
  if ( onlyBlank === true && $(this).val() ) {
    return this;
  }
  $(this).val(formattedDateTime);
  return this;
}


function defaultValueDateTime(now) {
  var year = now.getFullYear();
  var month = now.getMonth().toString().length === 1 ? '0' + (now.getMonth() + 1).toString() : now.getMonth() + 1;
  var date = now.getDate().toString().length === 1 ? '0' + (now.getDate()).toString() : now.getDate();
  var hours = now.getHours().toString().length === 1 ? '0' + now.getHours().toString() : now.getHours();
  return year + '-' + month + '-' + date + 'T' + hours + ':' + '00' + ':' + '00';
  
}