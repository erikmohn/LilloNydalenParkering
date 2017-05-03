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

	var mySwiper = myApp.swiper('.swiper-container', {
		pagination: '.swiper-pagination'
	});

});
myApp.onPageBack('parkering', function(page) {
	refreshPendingRequests();
});

function refreshHistoryOffers() {
	$("#noActiveOffers").hide();
	$("#noHistoryOffers").hide();
	var userId = localStorage.getItem("userId");

	$.post(SERVER_URL + "/parking/offer/past", {
		userId: userId
	}).done(function(parkingRequests) {
		$("#activeOffers").empty();
		$("#historyOffers").empty();

		var active = false;
		var history = false;
		for (i in parkingRequests) {
			var parking = parkingRequests[i];

			var fom = moment(parking.startTime).locale("nb");
			var tom = moment(parking.endTime).locale("nb");

			var timeFormat = "HH:mm (dddd)";

			var status, statusColor, message, target;

			target = "#activeOffers";
			if (parking.done || moment().isAfter(moment(parking.endTime))) {
				status = "Ferdig";
				statusColor = "#78909c";
				target = "#historyOffers";
				history = true;
			} else if (parking.canceled) {
				status = "Avbrutt";
				statusColor = "#d50000";
				target = "#historyOffers";
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
					'<a id="chatOffer-' + parking.messages + '" href="#"><i class="material-icons md-24 color-white">chat</i></a>' +
					'</div>';
			} else {
				message = ""
			}


			$(target).append('<li class="swipeout" style="background:#FFFFFF">' +
				'<a id="historyOffer-' + parking._id + '" href="#" class="item-link item-content">' +
				'<div class="item-inner swipeout-content">' +
				'<div class="item-title-row">' +
				'<div class="item-title" style="font-size: large">' + parking.parkingLot + '</div> ' +
				'<div class="item-after">' + moment(parking.registredDate).format("DD/MM HH:mm") + '</div>' + //13/04 17:14
				'</div>' +
				'<div class="item-subtitle"> ' + fom.format(timeFormat) + ' - ' + tom.format(timeFormat) + ' <span id="badgeOffer-' + parking._id + '" class="badge color-red" style="position:absolute; right:0;"></span></div>' + //
				'<div class="item-text" style="color: ' + statusColor + '">' + status + '</div>' +
				'<div class="parking-status" style="height:3px; background-color: ' + statusColor + '"></div>' +
				'</div>' +
				'</a>' +
				message +
				'</li>');

			$("#historyOffer-" + parking._id).on('click', {
				id: parking._id
			}, function(params) {
				localStorage.setItem("currentRequest", params.data.id);
				mainView.router.loadPage('views/offer/tilbud.html');
			});

			$("#chatOffer-" + parking.messages).on('click', {
				id: parking.messages,
				parking: parking._id
			}, function(params) {
				localStorage.setItem("messageThread", params.data.id);
				localStorage.setItem("currentRequest", params.data.parking);
				mainView.router.loadPage('views/messages/messages.html');
			});

			$("#badgeOffer-" + parking._id).hide();
			if (parking.messages) {

				var channel = pusher.subscribe("MESSAGE-" + parking.messages);
				channel.bind('newMessage', function(data) {
					$(badge).html($(badge).html() +1);
				});

				var badge = "#badgeOffer-" + parking._id;
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