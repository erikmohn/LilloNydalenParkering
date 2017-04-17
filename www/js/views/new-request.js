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
				duration = '<b>Fra:</b> ' + moment(parkingRequest.startTime).locale("nb").format("dddd, MMMM DD, YYYY HH:mm") +
					'<br><b>Til:</b> ' + moment(parkingRequest.endTime).locale("nb").format("dddd, MMMM DD, YYYY HH:mm");

				$("#new-requests-cards").append('<div class="card request-card" id="request-' + parkingRequest._id + '">' +
					'<div class="card-header" style="background-color:' + statusColor + '; color:#FFFFFF">' +
					'<div class="request-name" style="font-size: large"> <center> ' + statusText + '</center></div>' +
					'</div>' +
					'<div class="card-content">' +
					'<div class="card-content-inner">' +
					duration +
					'</div>' +
					'<div class="card-footer">' +
					'<a></a><i class="icon arrow-icon"></i>' +
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