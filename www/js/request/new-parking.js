myApp.onPageBeforeInit('new-parkering', function(page) {
	window.ga.trackView('Ny parkeringsforespørsel');
	$("#back-new-parkering").click(function(event) {
		mainView.router.back();
	});

	$("#requestMessage").focus(function(event) {
		var style = $(this).attr('style'),
			id = $(this).attr('id'),
			textbox = $(document.createElement('textarea')).attr('style', style).attr('id', id);
		$(this).replaceWith(textbox);
	});

	$("#requestMessage").focusout(function(event) {
		var style = $(this).attr('style'),
			id = $(this).attr('id'),
			textbox = $(document.createElement('input')).attr('style', style).attr('id', id);
		$(this).replaceWith(textbox);
	})

	$.get(SERVER_URL + "/user/cars/" + localStorage.getItem("userId"))
		.done(function(cars) {
			if (cars.length == 0) {
				$('#cars').append($("<option></option>")
					.text("Ingen biler registrert"));
				$("#new-parkering-error").html('Du må må registrere din bil, gå til <a href="views/settings/settings.html" class="link">innstillinger</a> for registrering');
				$("#lagre-parkering").hide();
			} else {
				cars.forEach(function(car) {
					$('#cars').append($("<option></option>")
						.attr("value", car.regNr)
						.text(car.regNr));
				});
			}
		});

	$("#request-fom").val(moment().add(1, 'hours').format("YYYY-MM-DDTHH:00"));
	$("#request-tom").val(moment().add(4, 'hours').format("YYYY-MM-DDTHH:00"));


	$("#lagre-parkering").click(function() {
		var startTime = $("#request-fom").val();
		var endTime = $("#request-tom").val();

		var validated = true;

		if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
			$("#new-parkering-error").text("Starttidspunkt må være før slutttidspunkt");
			validated = false;
		}

		if (validated) {
			$.post(SERVER_URL + "/parking/request", {
				userId: localStorage.getItem("userId"),
				regNr: $("#cars").val(),
				phoneNumber: localStorage.getItem("phoneNumber"),
				starTime: moment(startTime).toDate(),
				endTime: moment(endTime).toDate(),
				registredDate: moment().toDate(),
				requestMessage: $("#requestMessage").val()
			}).done(function(data) {
				window.analytics.trackEvent('Ny parkeringsforespørsel', 'ny parkeringsforespørsel', 'Hits', 1);
				mainView.router.loadPage('views/request/new-request.html');
			});
		}
	});
});


myApp.onPageInit('new-parkering', function(page) {


});