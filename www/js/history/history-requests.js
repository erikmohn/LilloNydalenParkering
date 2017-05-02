myApp.onPageBeforeInit('history', function(page) {
	window.ga.trackView('History');

	$("#history-cards-view").hide();
	$("#history-view-none").hide();
	activeMenuItem("#historyLi");
});

myApp.onPageInit('history', function(page) {
	myApp.closePanel();
	refreshHistoryRequests();
});
myApp.onPageBack('parkering', function(page) {
	console.log("Reinit history");
	refreshHistoryRequests();
});


function refreshHistoryRequests() {
	var userId = localStorage.getItem("userId");

	$.post(SERVER_URL + "/parking/requests/past", {
		userId: userId
	}).done(function(parkingRequests) {
		$("#requests").empty();

		for (i in parkingRequests) {
			var parking = parkingRequests[i];

			var fom = moment(parking.startTime).locale("nb");
			var tom = moment(parking.endTime).locale("nb");

			var timeFormat = "HH:mm (dddd)";

			var status, statusColor, message;

			if (parking.done || moment().isAfter(moment(parking.endTime))) {
				status = "Ferdig";
				statusColor = "#78909c";
			} else if (parking.canceled) {
				status = "Avbrutt";
				statusColor = "#d50000";
			} else if (parking.answered) {
				if (moment().isBefore(moment(parking.startTime))) {
					status = "Tildelt plass";
					statusColor = "#448aff";
				} else {
					status = "Pågående";
					statusColor = "#64dd17";
				}
			} else {
				status = "Venter på svar";
				statusColor = "#ffab40";
			}

			if (parking.messages) {
				message = '<div class="swipeout-actions-right">' +
					'<a id="chat-' + parking.messages + '" href="#"><i class="material-icons md-24 color-white">chat</i></a>' +
					'</div>';
			} else {message =""}


			$("#requests").append('<li class="swipeout" style="background:#FFFFFF">' +
				'<a id="history-' + parking._id + '" href="#" class="item-link item-content">' +
				'<div class="item-inner swipeout-content">' +
				'<div class="item-title-row">' +
				'<div class="item-title" style="font-size: large">' + parking.regNr + '</div>' +
				'<div class="item-after">' + moment(parking.registredDate).format("DD/MM HH:mm") + '</div>' + //13/04 17:14
				'</div>' +
				'<div class="item-subtitle"> ' + fom.format(timeFormat) + ' - ' + tom.format(timeFormat) + '</div>' + //
				'<div class="item-text" style="color: ' + statusColor + '">' + status + '</div>' +
				'<div class="parking-status" style="height:3px; background-color: ' + statusColor + '"></div>' +
				'</div>' +
				'</a>' +
				message +
				'</li>');

			$("#history-" + parking._id).on('click', {
				id: parking._id
			}, function(params) {
				localStorage.setItem("currentRequest", params.data.id);
				mainView.router.loadPage('views/request/parking.html');
			});

			$("#chat-" + parking.messages).on('click', {
				id: parking.messages,
				parking: parking._id
			}, function(params) {
				localStorage.setItem("messageThread", params.data.id);
				localStorage.setItem("currentRequest", params.data.parking);
				mainView.router.loadPage('views/messages/messages.html');
			});
		}
	});

};