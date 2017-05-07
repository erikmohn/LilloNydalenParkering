myApp.onPageBeforeInit('free-parking', function(page) {
	$("#cancel-free-parking").hide();
	$("#cancel-free-parking").click(function(event) {
		$.post(SERVER_URL + "/parking/free/cancle", {
			freeParkingId: localStorage.getItem("currentFreeParking")
		}).done(function(freeParking) {
			mainView.router.refreshPage();
		});
	});

	$("#free-parkering-back").click(function(event) {
		page.view.router.back({
			url: "views/history/foresporsler.html",
			force: true,
			ignoreCache: true
		});
	});
});



myApp.onPageInit('free-parking', function(page) {
	$.post(SERVER_URL + "/parking/free/get", {
		freeId: localStorage.getItem("currentFreeParking")
	}).done(function(freeParking) {
		if (!freeParking.parkingRequests) {
			statusFreeParking = "Tilgjengelig for utlån";
			statusColorFreeParking = "#ffab40";
		} else if (moment().isAfter(moment(freeParking.endTime))) {
			statusFreeParking = "Ferdig";
			statusColorFreeParking = "#78909c";
		} else if (freeParking.canceled) {
			statusFreeParking = "Stanset";
			statusColorFreeParking = "#d50000";
		} else if (freeParking.parkingRequests.length > 0) {
			statusFreeParking = "Benyttet";
			statusColorFreeParking = "#448aff";
		} else {
			statusFreeParking = "Tilgjengelig for utlån";
			statusColorFreeParking = "#ffab40";
		}

		$("#statusText").html('<span style="color:' + statusColorFreeParking + '">' + statusFreeParking + '</span>');

		var minutesFromStart = moment(freeParking.startTime).diff(moment(), 'minutes');
		var duration = moment(freeParking.startTime).diff(moment(freeParking.endTime), 'minutes');
		var progress = parseInt((minutesFromStart / duration) * 100);
		$(".progressbar").css({
			'background-color': statusColorFreeParking
		});
		myApp.setProgressbar($$('.progressbar'), Math.sqrt((progress * progress)));

		if (freeParking.parkingRequests.length > 0) {
			freeParking.parkingRequests.sort(function(a, b) {
				return new Date(a.startDate) - new Date(a.startDate);
			});

			if (!moment(freeParking.parkingRequests[0].startTime).isSame(freeParking.startTime)) {
				$(".timeline").append('	  <div class="timeline-item">' +
					'<div class="timeline-item-date">' + moment(freeParking.startTime).locale("nb").format("dd/MM/YY") + ' <span class="hourFormat">' + moment(freeParking.startTime).locale("nb").format("HH:mm") + '</div>' +
					'<div class="timeline-item-divider"></div>' +
					'<div class="timeline-item-content"></div>' +
					'</div>');
			}
		}

		freeParking.parkingRequests.forEach(function(parking) {
			var status, statusColor;
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
					status = "Aktiv";
					statusColor = "#64dd17";
				}
			}
			var fom = moment(parking.startTime).locale("nb");
			var tom = moment(parking.endTime).locale("nb");

			var timeFormat = "HH:mm (dddd)";
			var navn = parking.requestUser[0].firstName + " " + parking.requestUser[0].lastName

			$(".timeline").append(
				'<div class="timeline-item" >' +
				'<div class="timeline-item-date">' + moment(parking.startTime).locale("nb").format("dd/MM/YY") + ' <span class="hourFormat">' + moment(parking.startTime).locale("nb").format("HH:mm") + '</div>' +
				'<div class="timeline-item-divider"></div>' +
				'<div class="timeline-item-content" style="width:100%;">' +
				'<div class="list-block media-list">' +
				'<ul>' +
				'<li class="swipeout" style="background:#FFFFFF">' +
				'<a id="timelineOffer-' + parking._id + '" href="#" class="item-link item-content">' +
				'<div class="item-media">' +
				'<img class="message-avatar" style="margin-top:15px; width:50px; height:50px;" src="img/noprofile.png">' +
				'</div>' +
				'<div class="item-inner swipeout-content">' +
				'<div class="item-title-row">' +
				'<div class="item-title" style="font-size: large">' + navn + '</div> ' +
				'</div>' +
				'<div class="item-subtitle"> ' + parking.regNr + '</div>' +
				'<div class="item-text" style="color: ' + statusColor + '">' + status + '</div>' +
				'<div class="parking-status" style="height:3px; background-color: ' + statusColor + '"></div>' +
				'</div>' +
				'</a>' +
				'</li>' +
				'<ul>' +
				'</div>' +
				'</div>' +
				'</div>');

			$("#timelineOffer-" + parking._id).on('click', {
				id: parking._id
			}, function(params) {
				localStorage.setItem("currentRequest", params.data.id);
				mainView.router.loadPage('views/offer/tilbud.html');
			});


			$(".timeline").append('	  <div class="timeline-item">' +
				'<div class="timeline-item-date">' + moment(parking.endTime).locale("nb").format("dd/MM/YY") + ' <span class="hourFormat">' + moment(parking.endTime).locale("nb").format("HH:mm") + '</div>' +
				'<div class="timeline-item-divider"></div>' +
				'<div class="timeline-item-content"></div>' +
				'</div>');
		});

		if (freeParking.parkingRequests.length > 0) {
			if (!moment(freeParking.parkingRequests[freeParking.parkingRequests.length - 1].endTime).isSame(freeParking.endTime)) {
				$(".timeline").append('	  <div class="timeline-item">' +
					'<div class="timeline-item-date">' + moment(freeParking.endTime).locale("nb").format("dd/MM/YY") + ' <span class="hourFormat">' + moment(freeParking.endTime).locale("nb").format("HH:mm") + '</div>' +
					'<div class="timeline-item-divider"></div>' +
					'<div class="timeline-item-content"></div>' +
					'</div>');
			}
		}

		if (freeParking.parkingRequests.length == 0) {
			$(".timeline").append('	  <div class="timeline-item">' +
				'<div class="timeline-item-date">' + moment(freeParking.startTime).locale("nb").format("dd/MM/YY") + ' <span class="hourFormat">' + moment(freeParking.startTime).locale("nb").format("HH:mm") + '</span></div>' +
				'<div class="timeline-item-divider"></div>' +
				'<div class="timeline-item-content">Ledig</div>' +
				'</div>');
			$(".timeline").append('	  <div class="timeline-item">' +
				'<div class="timeline-item-date">' + moment(freeParking.endTime).locale("nb").format("dd/MM/YY") + ' <span class="hourFormat">' + moment(freeParking.endTime).locale("nb").format("HH:mm") + '</div>' +
				'<div class="timeline-item-divider"></div>' +
				'<div class="timeline-item-content"></div>' +
				'</div>');

		}



		if (!freeParking.canceled) {
			$("#cancel-free-parking").show();
		}

	});

});