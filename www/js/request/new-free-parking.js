myApp.onPageBeforeInit('new-free-parkering', function(page) {
	window.ga.trackView('Ny parkeringsforespørsel');

	$.get(SERVER_URL + "/user/parkingSpaces/" + localStorage.getItem("userId"))
		.done(function(parkingSpaces) {
			if (parkingSpaces.length == 0) {
				$('#parkeringsplasser').append($("<option></option>")
					.text("Ingen biler registrert"));
				$("#new-parkering-error").html('Du må må registrere din parkeringsplass, gå til <a href="views/settings/settings.html" class="link">innstillinger</a> for registrering');
				$("#lagre-parkering").hide();
			} else {
				parkingSpaces.forEach(function(parkingSpace) {
					$('#parkeringsplasser').append($("<option></option>")
						.attr("value", parkingSpace.parkingSpace)
						.text(parkingSpace.parkingSpace));
				});
			}
		});

	$("#tilbud-fom").val(moment().add(1, 'hours').format("YYYY-MM-DDTHH:00"));
	$("#tilbud-tom").val(moment().add(4, 'hours').format("YYYY-MM-DDTHH:00"));


	$("#lagre-free-parking").click(function() {
		var startTime = $("#tilbud-fom").val();
		var endTime = $("#tilbud-tom").val();

		var validated = true;

		if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
			$("#new-parkering-error").text("Starttidspunkt må være før slutttidspunkt");
			validated = false;
		}

		if (validated) {
			$.post(SERVER_URL + "/parking/free", {
				userId: localStorage.getItem("userId"),
				parkingSpace: $("#parkeringsplasser").val(),
				starTime: moment(startTime).toDate(),
				endTime: moment(endTime).toDate(),
				registredDate: moment().toDate()
			}).done(function(data) {
				window.analytics.trackEvent('Nytt parkeringstilbud', 'Nytt parkeringstilbud', 'Hits', 1);
				mainView.router.loadPage('index.html');
			});
		}
	});
});


myApp.onPageInit('new-free-parkering', function(page) {

});