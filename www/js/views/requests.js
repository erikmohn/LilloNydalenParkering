//Open tab view requests
$("#requestsView").on('show', function(){
	refreshParkingRequests();	
});

function refreshParkingRequests() {
	$("#requests-view-loading").show();
	$("#requests-view-done").hide();
	$("#requests-view-cards").hide();
	$("#requests-view-fail").hide();

	var userId = localStorage.getItem("userId");
	if (userId === null) {
		$("#requests-view-loading").hide();
		$("#requests-view-fail").show();
	} else {
		$.post(SERVER_URL + "/parking/requests", {
			userId: userId,
			now: new Date() 
		}).done(function(parkingRequests) {
			$("#request-cards").empty();

			String.prototype.capitalizeFirstLetter = function() {
			    return this.charAt(0).toUpperCase() + this.slice(1);
			}
			 
				var numberOfRequests = 0;
				for (i in parkingRequests) {
					var parkingRequest = parkingRequests[i];
					if (parkingRequest.requestUser[0]._id.toString() != userId.toString()) {
						numberOfRequests++;
						$("#request-cards").append('<div class="card" id="click-'+ parkingRequest._id + '">' +
			                    '<div class="card-header">'+parkingRequest.requestUser[0].userName + ' <i class="icon parking-icon right-align"></i></div>' +
			                    '<div class="card-content">' +
			                        '<div class="card-content-inner">' +
			  							'<b>Fra:</b> ' + moment(parkingRequest.startTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter() + 
			  							'<br><b>Til:</b> ' + moment(parkingRequest.endTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter() +
			  							'<br><b>Registrerningsnummer:</b> ' + parkingRequest.regNr + 
			  							'<br><b>Telfonnummer:</b> ' + parkingRequest.phoneNumber +
			                        '</div>' +
			                    '</div>' +  
								'<div class="card-footer">' +
			                    '<i class="icon accept-icon center-align"></i>' +
			                    '</div></div>'+ 
			                    '</div>');
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

			if(numberOfRequests === 0) {
				$("#requests-view-loading").hide();
				$("#requests-view-done").show();
			}
		});
	}
};