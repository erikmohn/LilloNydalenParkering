myApp.onPageBeforeInit('foresporsler', function(page) {
	window.ga.trackView('Forespørsler');
	activeMenuItem("#requestsLi");
});

myApp.onPageInit('foresporsler', function(page) {
	myApp.closePanel();
	refreshPendingRequests();
	refreshHistoryOffers();

	var channel = pusher.subscribe("global-request-channel");
	channel.bind('request-update', function(data) {
		refreshPendingRequests();
	});

});


myApp.onPageBack('parkering', function(page) {
	mainView.router.refreshPage();
});

function refreshPendingRequests() {
	$("#noActiveCurrent").hide();
	var userId = localStorage.getItem("userId");

	$.post(SERVER_URL + "/parking/requests", {
		userId: userId,
		now: moment().toDate()
	}).done(function(parkingRequests) {
		$("#currentRequests").empty();

		var active = false;
		for (i in parkingRequests) {
			var parking = parkingRequests[i];
			if (parking.requestUser[0]._id != localStorage.getItem("userId")) {


				var fom = moment(parking.startTime).locale("nb");
				var tom = moment(parking.endTime).locale("nb");

				var timeFormat = "HH:mm (dddd)";

				var status, statusColor, message, target;
				target = "#currentRequests";
				status = "Venter på svar";
				statusColor = "#ffab40";
				active = true;
				var navn = parking.requestUser[0].firstName + " " + parking.requestUser[0].lastName

				$(target).append('<li class="swipeout" style="background:#FFFFFF">' +
					'<a id="pending-' + parking._id + '" href="#" class="item-link item-content">' +
					'<div class="item-media">' +
					'<img class="message-avatar" style="margin-top:15px; width:50px; height:50px;" src="img/noprofile.png">' +
					'</div>' +
					'<div class="item-inner swipeout-content">' +
					'<div class="item-title-row">' +
					'<div class="item-title" style="font-size: large">' + navn + '</div> ' +
					'<div class="item-after">' + moment(parking.registredDate).format("DD/MM HH:mm") + '</div>' +
					'</div>' +
					'<div class="item-subtitle">' + fom.format(timeFormat) + ' - ' + tom.format(timeFormat) + '</div>' +
					'<div class="item-subtitle"> ' + parking.regNr + '</div>' +
					'<div class="item-text" style="color: ' + statusColor + '">' + status + '</div>' +
					'<div class="parking-status" style="height:3px; background-color: ' + statusColor + '"></div>' +
					'</div>' +
					'</a>' +
					'</li>');

				$("#pending-" + parking._id).on('click', {
					id: parking._id
				}, function(params) {
					localStorage.setItem("currentRequest", params.data.id);
					mainView.router.loadPage('views/offer/tilbud.html');
				});
			}
		}
		if (!active) {
			$("#noActiveCurrent").show();
		}
	});

};

function refreshHistoryOffers() {
	$("#noActiveOffers").hide();
	$("#noHistoryOffers").hide();
	$("#activeOffers").empty();
	$("#historyOffers").empty();
	var userId = localStorage.getItem("userId");
	var active = false;
	var history = false;

	$.post(SERVER_URL + "/parking/free/past", {
		userId: userId
	}).done(function(parkingRequests) {
		for (i in parkingRequests) {
			var parking = parkingRequests[i];

			var fom = moment(parking.startTime).locale("nb");
			var tom = moment(parking.endTime).locale("nb");

			var timeFormat = "HH:mm (dddd)";

			var status, statusColor, message, target;

			if (parking.singleParkingRequest) {
				target = "#activeOffers";
				$("#badgeOffer-" + parking.singleParkingRequest.messages).html("");
				if (parking.singleParkingRequest.done || moment().isAfter(moment(parking.endTime))) {
					status = "Ferdig";
					statusColor = "#78909c";
					target = "#historyOffers";
					history = true;
				} else if (parking.singleParkingRequest.canceled) {
					status = "Avbrutt";
					statusColor = "#d50000";
					target = "#historyOffers";
					history = true;
				} else if (parking.singleParkingRequest.answered) {
					if (moment().isBefore(moment(parking.startTime))) {
						status = "Benyttet";
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

				if (parking.singleParkingRequest.messages) {
					message = '<div class="swipeout-actions-right">' +
						'<a id="chatOffer-' + parking.singleParkingRequest.messages + '" href="#"><i class="material-icons md-24 color-white">chat</i></a>' +
						'</div>';
				} else {
					message = ""
				}

				var navn = parking.singleParkingRequest.requestUser[0].firstName + " " + parking.singleParkingRequest.requestUser[0].lastName


				$(target).append('<li class="swipeout" style="background:#FFFFFF">' +
					'<a id="historyOffer-' + parking.singleParkingRequest._id + '" href="#" class="item-link item-content">' +
					'<div class="item-media">' +
					'<img class="message-avatar" style="margin-top:15px; width:50px; height:50px;" src="img/noprofile.png">' +
					'</div>' +
					'<div class="item-inner swipeout-content">' +
					'<div class="item-title-row">' +
					'<div class="item-title" style="font-size: large">' + navn + '</div> ' +
					'<div class="item-after">' + moment(parking.registredDate).format("DD/MM HH:mm") + '</div>' +
					'</div>' +
					'<div class="item-subtitle">' + fom.format(timeFormat) + ' - ' + tom.format(timeFormat) + '</div>' +
					'<div class="item-subtitle"> ' + parking.singleParkingRequest.regNr + '</div>' +
					'<div class="item-text" style="color: ' + statusColor + '">' + status + '</div>' +
					'<div class="parking-status" style="height:3px; background-color: ' + statusColor + '"></div>' +
					'</div>' +
					'</a>' +
					message +
					'</li>');

				$("#historyOffer-" + parking.singleParkingRequest._id).on('click', {
					id: parking.singleParkingRequest._id
				}, function(params) {
					localStorage.setItem("currentRequest", params.data.id);
					mainView.router.loadPage('views/offer/tilbud.html');
				});

				$("#chatOffer-" + parking.messages).on('click', {
					id: parking.singleParkingRequest.messages,
					parking: parking._id
				}, function(params) {
					localStorage.setItem("messageThread", params.data.id);
					localStorage.setItem("currentRequest", params.data.parking);
					mainView.router.loadPage('views/messages/messages.html');
				});

				$("#badgeOffer-" + parking.singleParkingRequest.messages).hide();
				if (parking.messages) {
					$.get(SERVER_URL + "/messages/num/" + parking.singleParkingRequest.messages)
						.done(function(response) {
							var numberOfReadMessages = localStorage.getItem("numberOfReadMessages-" + response.id);
							if (numberOfReadMessages == null) {
								numberOfReadMessages = 0;
							}
							var result = (response.numberOfMessages - numberOfReadMessages);
							if (numberOfReadMessages < response.numberOfMessages) {
								$("#badgeOffer-" + response.id).html(response.numberOfMessages - numberOfReadMessages);
								$("#badgeOffer-" + response.id).show();
							}
						});


					var channel = pusher.subscribe("MESSAGE-" + parking.singleParkingRequest.messages);
					channel.bind('newMessage', function(data) {
						var badge = "#badgeOffer-" + data.id;
						$(badge).show();
						console.log('Current value: "' + $(badge).html() + '"');
						var num = isNaN(parseInt($(badge).html())) ? 1 : (parseInt($(badge).html()) + 1)
						$(badge).html(num);
						console.log('Current value: "' + $(badge).html() + '"');
					});
				}
			} else {
				target = "#activeOffers";
				if (moment().isAfter(moment(parking.endTime))) {
					status = "Ferdig";
					statusColor = "#78909c";
					target = "#historyOffers";
					history = true;
				} else if (parking.canceled) {
					status = "Stanset";
					statusColor = "#d50000";
					target = "#historyOffers";
					history = true;
				} else if (parking.parkingRequests.length > 0) {
					status = "Tildelt plass";
					statusColor = "#448aff";
					active = true;
				} else {
					status = "Tilgjengelig for utlån";
					statusColor = "#ffab40";
					active = true;
				}

				$(target).append('<li class="swipeout" style="background:#FFFFFF">' +
					'<a id="freeParking-' + parking._id + '" href="#" class="item-link item-content">' +
					'<div class="item-inner swipeout-content">' +
					'<div class="item-title-row">' +
					'<div class="item-title" style="font-size: large">Ledig parkeringsplass</div> ' +
					'<div class="item-after">' + moment(parking.registredDate).format("DD/MM HH:mm") + '</div>' +
					'</div>' +
					'<div class="item-subtitle"> ' + fom.format(timeFormat) + ' - ' + tom.format(timeFormat) + '</div>' + //
					'<div class="item-text" style="color: ' + statusColor + '">' + status + '</div>' +
					'<div class="parking-status" style="height:3px; background-color: ' + statusColor + '"></div>' +
					'</div>' +
					'</a>' +
					'</li>');

				$("#freeParking-" + parking._id).on('click', {
					id: parking._id
				}, function(params) {
					localStorage.setItem("currentFreeParking", params.data.id);
					mainView.router.loadPage('views/offer/free-parking.html');
				});

			}

		}

		if (!active) {
			$("#noActiveOffers").show();
		}

		if (!history) {
			$("#noHistoryOffers").show();
		}
	});

};