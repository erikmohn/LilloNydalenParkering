$("#historyViewRequests").on('show', function() {
	$("#history-view-requests-loading").show();
	$("#history-view-requests").hide();
	$("#history-view-requests-none").hide();

	var userId = localStorage.getItem("userId");
	$.post(SERVER_URL + "/parking/requests/past", {
		userId: userId
	}).done(function(parkingRequests) {
		$("#history-requests-cards").empty();

		String.prototype.capitalizeFirstLetter = function() {
			return this.charAt(0).toUpperCase() + this.slice(1);
		}

		for (i in parkingRequests) {
			var parkingRequest = parkingRequests[i];

			var duration;
			var start = moment(parkingRequest.startTime);
			var end = moment(parkingRequest.endTime);
			if (start.isSame(end, 'year') && start.isSame(end, 'month') && start.isSame(end, 'day')) {
				duration = '<b>Tidspunkt:</b> ' + moment(parkingRequest.startTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter() +
					' - ' + moment(parkingRequest.endTime).format("HH:mm");
			} else {
				duration = '<b>Fra:</b> ' + moment(parkingRequest.startTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter() +
					'<br><b>Til:</b> ' + moment(parkingRequest.endTime).locale("nb").format("dddd HH:mm").capitalizeFirstLetter();
			}

			$("#history-requests-cards").append(
				'<div class="card request-card" id="click-' + parkingRequest._id + '">' +
				'<div class="card-header no-border">' +
				'<div class="request-icon"><i class="icon parking-icon"></i></div>' +
				'<div class="request-name">' + parkingRequest.requestUser[0].userName + '</div>' +
				'<div class="request-date">' + moment(parkingRequest.registredDate).locale("nb").format("dddd, MMMM DD, YYYY HH:mm").capitalizeFirstLetter() + '</div>' +
				'</div>' +
				'<div class="card-content">' +
				'<div class="card-content-inner">' +
				duration +
				'<br><b>Regnr:</b> ' + parkingRequest.regNr +
				'<br><b>Telfon:</b> ' + parkingRequest.phoneNumber +
				'</div>' +
				'</div>' +
				'<div class="card-footer no-border">' +
				'' +
				'<a href="#" class="link">Tilby parkering</a>' +
				' <i class="icon arrow-icon"></i> ' +
				'</div></div>' +
				'</div>');
		}


		$("#history-view-requests-loading").hide();
		if (parkingRequests.length === 0) {
			$("#history-view-requests-none").show();
		} else {
			$("#history-view-requests").show();
		}

	});

});

function initializeHistoryRequests() {



};