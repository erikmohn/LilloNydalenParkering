//Open tab respond to request!
$("#offerForParkingRequestPage").on('show', function(){
	$("#parking-offer-loading").show();
	$("#parking-offer-success").hide();
	$("#parking-offer-fail").hide();
	$("#parking-offer-input").hide();

	$.post(SERVER_URL + "/parking", {
		parkingId: $("#offer-currentRequest").val()
	}).done(function(parking) {
		String.prototype.capitalizeFirstLetter = function() {
				    return this.charAt(0).toUpperCase() + this.slice(1);
		};

		$("#offer-navn").val(parking.requestUser[0].userName);
		$("#offer-regnr").val(parking.regNr);
		$("#offer-telefon").val(parking.phoneNumber);
		$("#offer-fom").val(moment(parking.startTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter());
		$("#offer-tom").val(moment(parking.endTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter());
		$("#parking-offer-loading").hide();
		$("#parking-offer-input").show();
	});
});

function initializeOffer() {
	$("#send-offer").click(function() {
		$("#parking-offer-input").hide();
 		$("#parking-offer-loading").show();
		var parkingId = $("#offer-currentRequest").val();
		 $.post(SERVER_URL + "/parking/offer", {
		 		offerUserId: localStorage.getItem("userId"),
		 		parkingId: parkingId,
		 		parkingLot: $("#offer-parkingLotInput").val()
		 }).done(function(parking) {
		 		$("#parking-offer-loading").hide();
		 		if (parking.alreadyAnswered) {
		 			$("#parking-offer-fail").show();
		 		} else {
					$("#parking-offer-success").show();
		 		} 
		 });
	});
};

