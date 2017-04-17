$("#historyView").on('show', function() {
	refreshHistoryRequests();
});

function refreshHistoryRequests() {
	$("#history-cards-view").hide();
	$("#history-view-fail").hide();
	$("#history-view-none").hide();
	$("#history-view-loading").show();

	$("#history-view-loading").show();
	var userId = localStorage.getItem("userId");

	if (userId === null) {
		$("#history-view-loading").hide();
		$("#history-view-fail").show();
	} else {
		$.post(SERVER_URL + "/parking/requests/past", {
			userId: userId
		}).done(function(parkingRequests) {
			$("#history-cards").empty();

			String.prototype.capitalizeFirstLetter = function() {
				return this.charAt(0).toUpperCase() + this.slice(1);
			}

			for (i in parkingRequests) {
				var parkingRequest = parkingRequests[i];

				var duration;
				var start = moment(parkingRequest.startTime);
				var end = moment(parkingRequest.endTime);
				var  icon, body, statusColor, statusText;

				if (parkingRequest.requestUser[0]._id === userId) {
					
					icon = "parking-request-icon";
					if (parkingRequest.answered) {
						body = '<h3>Parkeringsforespørsel</h3><b>Utlånt av:</b> ' + parkingRequest.offerParkingUser[0].userName + ' <br />' +
							'<b>Telefon:</b> ' + parkingRequest.offerParkingUser[0].phoneNumber + ' <br />' +
							'<b>Parkeringsplass:</b> ' + parkingRequest.parkingLot +
							'<br>';
					} else {
						body = "<h3>Parkeringsforespørsel</h3>";
					}
				} else {

					icon = "parking-icon";
					body = '<h3>Tilbudt parkering</h3><b>Utlånt til:</b> ' + parkingRequest.requestUser[0].userName + ' <br />' +
						'<b>Telefon:</b> ' + parkingRequest.requestUser[0].phoneNumber + ' <br />' +
						'<b>Regnr:</b> ' + parkingRequest.requestUser[0].regnr +
						'<br>';
				}

				if (moment().isAfter(moment(parkingRequest.endTime))) {
					statusColor = "#8e8e93";
					statusText = "Utløpt";
				} else if (parkingRequest.canceled) {
					statusColor = "#ff3b30";
					statusText = "Avsluttet";
				} else if (parkingRequest.done) {
					statusColor = "color-gray";
					statusText = "Ferdig";
				} else if (parkingRequest.answered) {
					if (moment().isAfter(moment(parkingRequest.startTime))) {
						statusColor = "#4cd964";
						statusText = "Aktiv";
					} else {
						statusColor = "#4cd964";
						statusText = "Tildelt plass";
					}
				} else {
					statusColor = "#ff9500";
					statusText = "Avventer svar";
				}

				duration = '<b>Fra:</b> ' + moment(parkingRequest.startTime).locale("nb").format("dddd, MMMM DD, YYYY HH:mm").capitalizeFirstLetter() +
					'<br><b>Til:</b> ' + moment(parkingRequest.endTime).locale("nb").format("dddd, MMMM DD, YYYY HH:mm").capitalizeFirstLetter();
				$("#history-cards").append(
					'<div class="card request-card" id="click-' + parkingRequest._id + '">' +
					'<div class="card-header" style="background-color:' + statusColor + '; color:#FFFFFF;">' +
					//'<div class="request-icon"><i class="icon ' + icon + '"></i></div>' +
					//+ '<b> ' + statusText + '</b>' +
					'<div class="request-name" style="font-size: large"><center>' + statusText + '</center></div>' +
					//'<div class="request-date">' + moment(parkingRequest.registredDate).locale("nb").format("dddd, MMMM DD, YYYY HH:mm").capitalizeFirstLetter() + '</div>' +
					'</div>' +
					'<div class="card-content">' +
					'<div class="card-content-inner">' +
					body +
					duration  +
					'</div>' +
					'</div>' +
					'<div class="card-footer">' +
					'' +
					//'<a href="#" class="link"><b>Status</b></a>' +
					//' <p class="button button-fill ' + statusColor + '"> ' + statusText + '</p> ' +
					'<a></a><i class="icon arrow-icon"></i>' +
					'</div></div>' +
					'</div>');
			}

			$("#history-view-loading").hide();
			if (parkingRequests.length === 0) {
				$("#history-view-none").show();
			} else {
				$("#history-cards-view").show();
			}

		});
	}
};