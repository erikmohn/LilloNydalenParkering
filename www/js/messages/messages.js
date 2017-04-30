myApp.onPageBeforeInit('messages', function(page) {

	console.log("Open page for messages");

	$("#message-back").click(function(event) {
		mainView.router.back();
	})

	$.get(SERVER_URL + "/messages/" + localStorage.getItem("messageThread"))
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
});


myApp.onPageInit('messages', function(page) {

});