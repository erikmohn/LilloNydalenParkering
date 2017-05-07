myApp.onPageBeforeInit('tilbud', function(page) {
	$("#venterTilbud").hide();
	$("#tilbudt").hide();
	$("#startetTilbud").hide();
	$("#avbruttTilbud").hide();
	$("#ferdigTilbud").hide();
	$("#messagesTilbud").hide();

	if (page.fromPage.name == "new-free-parkering") {

		$("#navigationTilbud").html('<i class="material-icons open-panel md-36">menu</i>');
	} else {
		$("#navigationTilbud").html('<i id="tilbud-back" class="material-icons md-36">navigate_before</i>');

		if (page.fromPage.name == "free-parking") {
			$("#navigationTilbud").click(function(event) {
				page.view.router.back({
					url: "views/offer/free-parking.html",
					force: true,
					ignoreCache: true
				});
			});
		} else {
			$("#navigationTilbud").click(function(event) {
				page.view.router.back({
					url: "views/history/foresporsler.html",
					force: true,
					ignoreCache: true
				});
			});
		}
	}

	var channel = pusher.subscribe("USER-" + localStorage.getItem("userId"));
	channel.bind('parking-offer', function(data) {
		mainView.router.refreshPage();
	});

	$("#tilby-parking").click(function() {
		console.log("Offer parking");
		$.post(SERVER_URL + "/parking/offer", {
			offerUserId: localStorage.getItem("userId"),
			parkingId: localStorage.getItem("currentRequest"),
			parkingLot: $("#tilbudPlasser").val(),
			answeredDate: moment().toDate()
		}).done(function(parking) {
			if (parking.alreadyAnswered) {
				myApp.alert('Noen andre har allerede tilbudt en parkeringsplass', 'Informasjon');
			} else if (parking.ongoingParking) {
				myApp.alert('Du har allerede lånt ut din parkeringsplass i denne perioden', 'Informasjon');
			} else {
				window.analytics.trackEvent('Tilby parkering', 'parkeringstilbud', 'Hits', 1);
				mainView.router.refreshPage();
			}

		}).fail(function(xhr, status, error) {
			console.log(error);
		});
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

	$.post(SERVER_URL + "/parking", {
		parkingId: localStorage.getItem("currentRequest")
	}).done(function(parking) {
		if (parking.messages) {
			$("#messagesTilbud").show();
			$("#messagesTilbud").click(function() {
				localStorage.setItem("messageThread", parking.messages);
				mainView.router.loadPage('views/messages/messages.html');
			});
		}

		var panel;
		if (parking.done || moment().isAfter(moment(parking.endTime))) {
			panel = "#ferdigTilbud"

		} else if (parking.canceled) {
			panel = "#avbruttTilbud"
			$("#tildeltParkering").show()

		} else if (parking.answered) {
			if (moment().isBefore(moment(parking.startTime))) {
				panel = "#tilbudt"
				shouldRefresh(parking);
			} else {
				panel = "#startetTilbud";

			}

		} else {
			panel = "#venterTilbud"
		}
		$(panel).show();

		$.get(SERVER_URL + "/user/parkingSpaces/" + localStorage.getItem("userId"))
			.done(function(parkingSpaces) {
				if (parkingSpaces.length == 0) {
					$('#tilbudPlasser').append($("<option></option>")
						.text("Ingen biler registrert"));
					$("#tilbud-error").html('Du må må registrere din parkeringsplass, gå til <a href="views/settings/settings.html" class="link">innstillinger</a> for registrering');
					$("#tilby-parking").hide();
				} else {
					parkingSpaces.forEach(function(parkingSpace) {
						$('#tilbudPlasser').append($("<option></option>")
							.attr("value", parkingSpace.parkingSpace)
							.text(parkingSpace.parkingSpace));
					});
				}
			});

		var user = parking.requestUser[0];
		$(panel).find("#plassnummer").html(parking.parkingLot);
		$(panel).find("#eier").html(user.firstName + " " + user.lastName + " (" + user.phoneNumber + ")");

		$(panel).find("#bruker").html(user.firstName + " " + user.lastName);
		var phone = ("" + user.phoneNumber).replace(/(\d{3})(\d{2})(\d{3})/, '$1 $2 $3');
		$(panel).find("#telefon").html('<a href="tel:' + user.phoneNumber + '" class="external">' + phone + '</a>');

		var fom = moment(parking.startTime).locale("nb");
		var tom = moment(parking.endTime).locale("nb");
		$(panel).find("#fomHour").html(fom.format(" HH:mm"));
		$(panel).find("#tomHour").html(tom.format(" HH:mm"));
		$(panel).find("#fomDay").html(fom.format("dddd"));
		$(panel).find("#tomDay").html(tom.format("dddd"));
		$(panel).find("#regNr").html(parking.regNr);
		if (parking.requestMessage.length > 1) {
			$(panel).find("#melding").html(parking.requestMessage);
		} else {
			$(panel).find("#message").hide();
		}

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

myApp.onPageInit('tilbud', function(page) {

});