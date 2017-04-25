myApp.onPageBeforeInit('newRequest', function(page) {
	$("#new-request-view-loading").show();
	$("#new-request-view-cards").hide();
	$("#new-request-view-fail").hide();
	activeMenuItem("#myRequestLi");
});

myApp.onPageInit('newRequest', function(page) {
	myApp.closePanel();
	refreshNewRequests();
});

function refreshNewRequests() {
	var userId = localStorage.getItem("userId")

	if (userId === null) {
		$("#new-request-view-loading").hide();
		$("#new-request-view-fail").show();
	} else {
		$("#new-requests-cards").empty();

		$("#new-requests-cards").append('<div class="card request-card" id="addNewRequest">' +
			'<div class="card-header">' +
			'<div class="request-name" style="font-size: large;"> <center>Ny parkering</center></div>' +
			'</div>' +
			'<div class="card-content">' +
			'<div class="card-content-inner center-align">' +
			'<i id="addParking" class="material-icons md-36" style="color:#ff9100;">add_circle</i>' +

			'</div>' +
			'</div>');

		$("#addNewRequest").click(function() {
			localStorage.removeItem("currentRequest");
			mainView.router.loadPage('views/request/new-parking.html');

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
				duration = '<b>Fra:</b> ' + moment(parkingRequest.startTime).format("dddd, MMMM DD, HH:mm") +
					'<br><b>Til:</b> ' + moment(parkingRequest.endTime).format("dddd, MMMM DD, HH:mm");

				$("#new-requests-cards").append('<div class="card request-card" id="request-' + parkingRequest._id + '">' +
					'<div class="card-header" style="background-color:' + statusColor + '; color:#FFFFFF">' +
					'<div class="request-name" style="font-size: large"> <center> ' + statusText + '</center></div>' +
					'</div>' +
					'<div class="card-content">' +
					'<div class="card-content-inner"><center>' +
					'  <table>'+
					'	<tbody>'+
					'	<tr>'+
					'		<td class="label-cell color-gray"><b>Fra:</b></td>'+
					'		<td class="label-cell"><i class="material-icons md-18 color-gray">date_range</i>'+moment(parkingRequest.startTime).format("DD/MM/YY")+'</td>'+
					'		<td class="label-cell"><i class="material-icons md-18 color-gray">access_time</i>'+moment(parkingRequest.startTime).format("HH:mm")+'</td>'+
					'	</tr>'+
					'	<tr>'+
					'		<td class="label-cell color-gray"><b>Fra:</b></td>'+
					'		<td class="label-cell"><i class="material-icons md-18 color-gray">date_range</i>'+moment(parkingRequest.endTime).format("DD/MM/YY")+'</td>'+
					'		<td class="label-cell"><i class="material-icons md-18 color-gray">access_time</i>'+moment(parkingRequest.endTime).format("HH:mm")+'</td>'+
					'	</tr>'+
					'</tbody>  </table>'+
					'</center></div>' +
					'<div class="card-footer">' +
					'<a></a><i class="material-icons" style="color:#f2862a">play_circle_outline</i>' +
					'</div>' +
					'</div>');

				$("#request-" + parkingRequest._id).on('click', {
					id: parkingRequest._id
				}, function(params) {
					localStorage.setItem("currentRequest", params.data.id);
					mainView.router.loadPage('views/request/request.html');
				});
			}
		});

		$("#new-request-view-loading").hide();
		$("#new-request-view-cards").show();
	}
};