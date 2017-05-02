myApp.onPageBeforeInit('parkering', function(page) {
	$("#venterSvar").hide();
	$("#svarMottatt").hide();
	$("#startet").hide();
	$("#avbrutt").hide();
	$("#ferdig").hide();
	$("#messages").hide();

	var channel = pusher.subscribe("USER-" + localStorage.getItem("userId"));
	channel.bind('parking-offer', function(data) {
		mainView.router.refreshPage();
	});

	var avbryt = function() {
		myApp.confirm('Ønsker du å avbryte din parkeringsforespørsel?', 'Avbryt', function() {
			$.post(SERVER_URL + "/parking/cancle", {
				parkingId: localStorage.getItem("currentRequest")
			}).done(function(parking) {
				window.analytics.trackEvent('Parkeringsforespørsel', 'Avbrutt parkering', 'Hits', 1);
				mainView.router.refreshPage();
			});
		});
	};
	var ferdigstill = function() {
		myApp.confirm('Er du ferdig med din bruk av parkeringsplassen?<br>' +
			'<br>' +
			'Eier får beskjed om at plassen nå er tilgjengelig for bruk',
			'Ferdigstill parkering',
			function() {
				$.post(SERVER_URL + "/parking/done", {
					parkingId: localStorage.getItem("currentRequest")
				}).done(function(parking) {
					window.analytics.trackEvent('Parkeringsforespørsel', 'Ferdig parkering', 'Hits', 1);
					mainView.router.refreshPage();
				});
			});
	};

	$("#parkering-back").click(function(event) {
		localStorage.removeItem("currentRequest");
		mainView.router.back();
	});

	$.post(SERVER_URL + "/parking", {
		parkingId: localStorage.getItem("currentRequest")
	}).done(function(parking) {

		if (parking.messages) {
			$("#messages").show();
			$("#messages").click(function() {
				localStorage.setItem("messageThread", parking.messages);
				mainView.router.loadPage('views/messages/messages.html');
			});
		}

		var panel;
		if (parking.done || moment().isAfter(moment(parking.endTime))) {
			panel = "#ferdig"

		} else if (parking.canceled) {
			panel = "#avbrutt"
			if (parking.answered) {
				$("#tildeltParkering").show()
			} else {
				$("#tildeltParkering").hide()
			}

		} else if (parking.answered) {
			if (moment().isBefore(moment(parking.startTime))) {
				panel = "#svarMottatt"
				initializeClock('#waitingClock', moment(parking.startTime).toDate());
				shouldRefresh(parking);
			} else {
				panel = "#startet";
				initializeClock('#startedClock', moment(parking.endTime).toDate());
			}

		} else {
			panel = "#venterSvar"
		}
		$(panel).show();

		if (parking.answered) {
			var owner = parking.offerParkingUser[0];
			$(panel).find("#plassnummer").html("121"); //TODO
			$(panel).find("#eier").html(owner.firstName + " " + owner.lastName + " (" + owner.phoneNumber + ")");
		}

		$("#startTime").html(moment(parking.startTime).format("DD/MM/YYYY HH:mm"));
		$("#endTime").html(moment(parking.endTime).format("DD/MM/YYYY HH:mm"));
		$("#regNr").html(parking.regNr);

		if (parking.answered) {
			$(panel).find("#cancel-parking").click(ferdigstill);
		} else {
			$(panel).find("#cancel-parking").click(avbryt);
		}
	});

	$("#done").click(ferdigstill);

});

function shouldRefresh(parking) {
	setTimeout(function() {
		if (moment().isAfter(moment(parking.startTime))) {
			mainView.router.refreshPage()
		} else {
			shouldRefresh(parking);
		}
	}, 5000);

};

myApp.onPageInit('parkering', function(page) {

});


function getTimeRemaining(endtime) {
	var t = Date.parse(endtime) - Date.parse(new Date());
	var minutes = Math.floor((t / 1000 / 60) % 60);
	var hours = Math.floor((t / (1000 * 60 * 60)));
	return {
		'total': t,
		'hours': hours,
		'minutes': minutes
	};
}

function initializeClock(id, endtime) {
	var clock = $(id);
	var hoursSpan = $(id).find(".hours");
	var minutesSpan = $(id).find(".minutes");

	function updateClock() {
		var t = getTimeRemaining(endtime);

		hoursSpan.html(('0' + t.hours).slice(-2));
		minutesSpan.html(('0' + t.minutes).slice(-2));

		if (t.total <= 0) {
			clearInterval(timeinterval);
		}
	}

	updateClock();
	var timeinterval = setInterval(updateClock, 1000);
}