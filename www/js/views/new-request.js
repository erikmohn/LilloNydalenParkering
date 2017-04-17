$("#newRequestView").on('show', function() {
	refreshNewRequests();
});

function refreshNewRequests() {
	$("#new-request-view-loading").show();
	$("#new-request-view-cards").hide();
	$("#new-request-view-fail").hide();

	var userId = localStorage.getItem("userId")

	if (userId === null) {
		$("#new-request-view-loading").hide();
		$("#new-request-view-fail").show();
	} else {
		$("#new-requests-cards").empty();

		$("#new-requests-cards").append('<div class="card request-card" id="addNewRequest">' +
			'<div class="card-header no-border">' +
			'<div class="request-name"> <b>Ny parkeringsforespørsel</b></div>' +
			'</div>' +
			'<div class="card-content">' +
			'<div class="card-content-inner center-align">' +
			'<i class="icon add-icon"></i> ' +

			'</div>' +
			'</div>');

		$("#addNewRequest").click(function() {
			localStorage.removeItem("currentRequest");
			myApp.showTab("#registerRequest");
		});

		//Add existing valid requests
		$.post(SERVER_URL + "/parking/user", {
			userId: userId,
			now: moment().toDate()
		}).done(function(parkingRequests) {
			for (i in parkingRequests) {
				var parkingRequest = parkingRequests[i];
				var statusColor, statusText;

				if (parkingRequest.answered) {
					if (moment().isAfter(moment(parkingRequest.startTime))) {
						statusColor = "color-green";
						statusText = "Pågående";
					} else {
						statusColor = "color-green";
						statusText = "Tildelt plass";
					}
				} else {
					statusColor = "color-orange";
					statusText = "Avventer svar";
				}
				duration = '<b>Fra:</b> ' + moment(parkingRequest.startTime).locale("nb").format("dddd, MMMM DD, YYYY HH:mm") +
					'<br><b>Til:</b> ' + moment(parkingRequest.endTime).locale("nb").format("dddd, MMMM DD, YYYY HH:mm");

				$("#new-requests-cards").append('<div class="card request-card" id="request-' + parkingRequest._id + '">' +
					'<div class="card-header no-border">' +
					'<div class="request-name"> <b>Parkeringsforespørsel</b></div>' +
					'</div>' +
					'<div class="card-content">' +
					'<div class="card-content-inner center-align">' +
					duration +
					'</div>' +
					'<div class="card-footer no-border">' +
					'<a href="#" class="link"><b>Status</b></a>' +
					' <p class="button button-fill ' + statusColor + '"> ' + statusText + '</p> ' +
					'</div>' +
					'</div>');

				$("#request-" + parkingRequest._id).on('click', {
					id: parkingRequest._id
				}, function(params) {
					localStorage.setItem("currentRequest", params.data.id);
					myApp.showTab("#registerRequest");
				});
			}
		});

		$("#new-request-view-loading").hide();
		$("#new-request-view-cards").show();
	}
};