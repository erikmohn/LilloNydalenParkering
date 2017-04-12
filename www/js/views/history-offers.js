$("#historyViewOffers").on('show', function() {
	$("#history-view-offers-loading").show();
	$("#history-view-offers").hide();
	$("#history-view-offers-none").hide();

	var userId = localStorage.getItem("userId");
	$.post(SERVER_URL + "/parking/offers/past", {
		userId: userId
	}).done(function(parkingOffers) {
		$("#history-offers-cards").empty();

		String.prototype.capitalizeFirstLetter = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		}

		for (i in parkingOffers) {
			var parkingOffer = parkingOffers[i];

			var duration;
			var start = moment(parkingOffer.startTime);
			var end = moment(parkingOffer.endTime);
			if (start.isSame(end, 'year') && start.isSame(end, 'month') && start.isSame(end, 'day')) {
				duration = '<b>Tidspunkt:</b> ' + moment(parkingOffer.startTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter() +
					' - ' + moment(parkingOffer.endTime).format("HH:mm");
			} else {
				duration = '<b>Fra:</b> ' + moment(parkingOffer.startTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter() +
					'<br><b>Til:</b> ' + moment(parkingOffer.endTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter();
			}

			$("#history-offers-cards").append(
				'<div class="card request-card" id="click-' + parkingOffer._id + '">' +
				'<div class="card-header no-border">' +
				'<div class="request-icon"><i class="icon parking-icon"></i></div>' +
				'<div class="request-name">' + parkingOffer.requestUser[0].userName + '</div>' +
				'<div class="request-date">' + moment(parkingOffer.registredDate).locale("nb").format("dddd, MMMM DD, YYYY HH:mm").capitalizeFirstLetter() + '</div>' +
				'</div>' +
				'<div class="card-content">' +
				'<div class="card-content-inner">' +
				duration +
				'<br><b>Regnr:</b> ' + parkingOffer.regNr +
				'<br><b>Telfon:</b> ' + parkingOffer.phoneNumber +
				'</div>' +
				'</div>' +
				'<div class="card-footer no-border">' +
				'' +
				'<a href="#" class="link">Tilby parkering</a>' +
				' <i class="icon arrow-icon"></i> ' +
				'</div></div>' +
				'</div>');
		}


		$("#history-view-offers-loading").hide();
		if (parkingOffers.length === 0) {
			$("#history-view-offers-none").show();
		} else {
			$("#history-view-offers").show();
		}

	});
});



function initializeHistoryOffers() {

}