myApp.onPageBeforeInit('new-free-parkering', function(page) {
	window.ga.trackView('Ny parkeringsforespørsel');

	$("#tilbud-fom").val(moment().add(1, 'hours').format("YYYY-MM-DDTHH:00"));
	$("#tilbud-tom").val(moment().add(4, 'hours').format("YYYY-MM-DDTHH:00"));


	$("#lagre-free-parking").click(function() {
		var startTime = $("#tilbud-fom").val();
		var endTime = $("#tilbud-tom").val();

		var validated = true;

		if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
			$("#new-free-parkering-error").html("Starttidspunkt må være før slutttidspunkt");
			validated = false;
		}

		if ($('#parkeringsplasser option:selected').length == 0) {
			$("#new-free-parkering-error").html("Du må velge en parkeringsplass");
			validated = false;
		}

		if (validated) {
			var numberOfSelected = $('#parkeringsplasser option:selected').length;
			var i = 0;
			$('#parkeringsplasser > option:selected').each(function() {
				$.post(SERVER_URL + "/parking/free", {
					userId: localStorage.getItem("userId"),
					parkingSpace: $(this).val(),
					startTime: moment(startTime).toDate(),
					endTime: moment(endTime).toDate(),
					registredDate: moment().toDate()
				}).done(function(data) {
					i++;
					window.analytics.trackEvent('Nytt parkeringstilbud', 'Nytt parkeringstilbud', 'Hits', 1);

					if (numberOfSelected == 1) {
						localStorage.setItem("currentFreeParking", data.request._id);
						mainView.router.loadPage('views/offer/free-parking.html');
					} else if (i == numberOfSelected) {
						mainView.router.loadPage('views/history/foresporsler.html');
					}

				});
			});



		}
	});
});


myApp.onPageInit('new-free-parkering', function(page) {
	$.get(SERVER_URL + "/user/parkingSpaces/" + localStorage.getItem("userId"))
		.done(function(parkingSpaces) {
			if (parkingSpaces.length == 0) {
				$("#new-free-parkering-error").html('Du må må registrere din parkeringsplass, gå til <a href="views/settings/settings.html" class="link">innstillinger</a> for registrering');
				$("#lagre-parkering").hide();
			} else {
				parkingSpaces.forEach(function(parkingSpace) {
					myApp.smartSelectAddOption('.smart-select select', '<option value="' + parkingSpace.parkingSpace + '">' + parkingSpace.parkingSpace + '</option>');

				});
			}
		});

});