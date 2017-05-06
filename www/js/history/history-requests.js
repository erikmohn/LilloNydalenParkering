myApp.onPageBeforeInit('history', function(page) {
	window.ga.trackView('History');
	activeMenuItem("#historyLi");

});

myApp.onPageInit('history', function(page) {
	myApp.closePanel();
	refreshHistoryRequests();

	var channel = pusher.subscribe("USER-" + localStorage.getItem("userId"));
	channel.bind('parking-offer', function(data) {
		refreshHistoryRequests();
	});

});
myApp.onPageBack('parkering', function(page) {
	
	mainView.router.refreshPage();
	mainView.router.refreshPreviousPage();
});



function refreshHistoryRequests() {
	$("#noActive").hide();
	$("#noHistory").hide();
	var userId = localStorage.getItem("userId");

	$.post(SERVER_URL + "/parking/requests/past", {
		userId: userId
	}).done(function(parkingRequests) {
		$("#activeRequests").empty();
		$("#historyRequests").empty();

		var active = false;
		var history = false;
		for (i in parkingRequests) {
			var parking = parkingRequests[i];

			var fom = moment(parking.startTime).locale("nb");
			var tom = moment(parking.endTime).locale("nb");

			var timeFormat = "HH:mm (dddd)";

			var status, statusColor, message, target;

			target = "#activeRequests";
			if (parking.done || moment().isAfter(moment(parking.endTime))) {
				status = "Ferdig";
				statusColor = "#78909c";
				target = "#historyRequests";
				history = true;
			} else if (parking.canceled) {
				status = "Avbrutt";
				statusColor = "#d50000";
				target = "#historyRequests";
				history = true;
			} else if (parking.answered) {
				if (moment().isBefore(moment(parking.startTime))) {
					status = "Tildelt plass";
					statusColor = "#448aff";
				} else {
					status = "Pågående";
					statusColor = "#64dd17";
				}
				active = true;
			} else {
				status = "Venter på svar";
				statusColor = "#ffab40";
				active = true;
			}

			if (parking.messages) {
				message = '<div class="swipeout-actions-right">' +
					'<a id="chat-' + parking.messages + '" href="#"><i class="material-icons md-24 color-white">chat</i></a>' +
					'</div>';
			} else {
				message = ""
			}


			$(target).append('<li class="swipeout" style="background:#FFFFFF">' +
				'<a id="history-' + parking._id + '" href="#" class="item-link item-content">' +
				'<div class="item-inner swipeout-content">' +
				'<div class="item-title-row">' +
				'<div class="item-title" style="font-size: large">' + parking.regNr + '</div> ' +
				'<div class="item-after">' + moment(parking.registredDate).format("DD/MM HH:mm") + '</div>' + //13/04 17:14
				'</div>' +
				'<div class="item-subtitle"> ' + fom.format(timeFormat) + ' - ' + tom.format(timeFormat) + ' <span id="badge-' + parking._id + '" class="badge color-red" style="position:absolute; right:0;"></span></div>' + //
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

			$("#badge-" + parking._id).hide();
			if (parking.messages) {
				var badge = "#badge-" + parking._id;
				(function(badge, p) {
					$.get(SERVER_URL + "/messages/num/" + p.messages)
						.done(function(response) {
							var numberOfReadMessages = localStorage.getItem("numberOfReadMessages-" + p.messages);
							if (numberOfReadMessages == null) {
								numberOfReadMessages = 0;
							}
							var result = (response.numberOfMessages - numberOfReadMessages);
							if (numberOfReadMessages < response.numberOfMessages) {
								$(badge).html(response.numberOfMessages - numberOfReadMessages);
								$(badge).show();
							}
						});
				})(badge, parking);

				var channel = pusher.subscribe("MESSAGE-" + parking.messages);
				channel.bind('newMessage', function(data) {
				
				});
			}
		}

		if (!active) {
			$("#noActive").show();
		}

		if (!history) {
			$("#noHistory").show();
		}
	});

};