myApp.onPageBeforeInit('foresporsler', function(page) {
	$("#requests-view-loading").show();
	$("#requests-view-done").hide();
	$("#requests-view-cards").hide();
	$("#requests-view-fail").hide();
	activeMenuItem("#requestsLi");
});

var ptrContent = $$('.pull-to-refresh-content');

ptrContent.on('ptr:refresh', function (e) {
	refreshParkingRequests();
	myApp.pullToRefreshDone();
});

myApp.onPageInit('foresporsler', function(page) {
	myApp.closePanel();
	refreshParkingRequests();
});

function refreshParkingRequests() {


	var userId = localStorage.getItem("userId");
	if (userId === null) {
		$("#requests-view-loading").hide();
		$("#requests-view-fail").show();
	} else {
		$.post(SERVER_URL + "/parking/requests", {
			userId: userId,
			now: new Date()
		}).done(function(parkingRequests) {
			$("#request-cards").empty();

			String.prototype.capitalizeFirstLetter = function() {
				return this.charAt(0).toUpperCase() + this.slice(1);
			}

			var numberOfRequests = 0;
			for (i in parkingRequests) {
				var parkingRequest = parkingRequests[i];
				if (parkingRequest.requestUser[0]._id.toString() != userId.toString()) {
					numberOfRequests++;
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

					$("#request-cards").append(
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
						'<br><b>Telefon:</b> ' + parkingRequest.phoneNumber +
						'</div>' +
						'</div>' +
						'<div class="card-footer no-border">' +
						'<a href="#" class="link">Tilby parkering</a>' +
						'<i class="icon arrow-icon"></i> ' +
						'</div>' +
						'</div>'
					);
					$("#click-" + parkingRequest._id).on('click', {
						id: parkingRequest._id
					}, function(params) {
						localStorage.setItem("offer-currentRequest", params.data.id);
						mainView.router.loadPage('views/offer.html');
					});

					$("#requests-view-loading").hide();
					$("#requests-view-cards").show();
				}
			}

			if (numberOfRequests === 0) {
				$("#requests-view-loading").hide();
				$("#requests-view-done").show();
			}
		});
	}
};