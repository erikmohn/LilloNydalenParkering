
//Open tab register request!
$("#registerRequest").on('show', function(){
	console.log("Open tab to register request!");
	var userId = localStorage.getItem("userId");
	
	$('#request-fom').setNow();
	$('#request-tom').setThreeHoursFromNow();
	
	if (userId == null) {		
		$("#request-form").hide();
	} else {
		$("#request-form").show();
		refreshCurrentRequest();	
	}  
});

function initializeCurrentRequest() {
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
			localStorage.setItem("currentRequest", data.request._id);
			refreshCurrentRequest();
		});	
	});

	$("#cancel-request").click(function() {
		 $.post(SERVER_URL + "/parking/cancle", {
		 		parkingId: localStorage.getItem("currentRequest")
		 }).done(function(parking) {
		 		localStorage.removeItem("currentRequest");
				refreshCurrentRequest();
		 });

	});

	$("#done-request").click(function() {
	 $.post(SERVER_URL + "/parking/done", {
	 		parkingId: localStorage.getItem("currentRequest")
	 }).done(function(parking) {
	 		localStorage.removeItem("currentRequest");
			refreshCurrentRequest();
	 });

	});
};

function refreshCurrentRequest() {
	$("#request-loading").show();
	$("#send-request").hide();
	$("#cancel-request").hide();
	$("#done-request").hide();
	

	$("#request-tildeltParkering").hide();
	$("#request-venter-svar").hide();
	
	var userId = localStorage.getItem("userId");
	
	$.get(SERVER_URL + "/parking/user/" + userId, function(parkingRequest) {
			if(typeof parkingRequest != "undefined" && parkingRequest != null && parkingRequest.length > 0) {
				console.log("Found pending parking request!!!");
				$("#request-regnr").val(parkingRequest[0].regNr).prop('disabled', true);
				$("#request-telefon").val(parkingRequest[0].phoneNumber).prop('disabled', true);
				$("#request-fom").val(new Date(parkingRequest[0].startTime).toISOString().slice(0,16)).prop('disabled', true);
				$("#request-tom").val(new Date(parkingRequest[0].endTime).toISOString().slice(0,16)).prop('disabled', true);
					
				if (parkingRequest[0].answered) {
					$("#request-parkering").val(parkingRequest[0].parkingLot);
					$("#request-eier").val(parkingRequest[0].offerParkingUser[0].userName);
					$("#request-eier-telefon").val(parkingRequest[0].offerParkingUser[0].phoneNumber);
					
					$("#request-loading").hide();
					$("#done-request").show();

					$("#request-tildeltParkering").show();
				} else {
					$("#request-loading").hide();
					$("#cancel-request").show();
					
					$("#request-venter-svar").show();
				}

				localStorage.setItem("currentRequest", parkingRequest[0]._id);
			} else {
					console.log("No pending parking request found");
					
					//Populate default values for parking requests
					$("#request-regnr").val(localStorage.getItem("regnr")).prop('disabled', false);
					$("#request-telefon").val(localStorage.getItem("phoneNumber")).prop('disabled', false);
					$("#request-fom").prop('disabled', false);
					$("#request-tom").prop('disabled', false);
					
					$("#request-loading").hide();
					$("#send-request").show();
					
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