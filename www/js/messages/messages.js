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

		var conversationStarted = false;

	// Init Messages
	var myMessages = myApp.messages('.messages', {
		autoLayout: true
	});

	// Init Messagebar
	var myMessagebar = myApp.messagebar('.messagebar');

	$$('.messagebar .link').on('click', function() {
		// Message text
		var messageText = myMessagebar.value().trim();
		// Exit if empy message
		if (messageText.length === 0) return;

		// Empty messagebar
		myMessagebar.clear()

		// Random message type
		var messageType = (['sent', 'received'])[Math.round(Math.random())];

		// Avatar and name for received message
		var avatar, name;
		if (messageType === 'received') {
			avatar = 'http://lorempixel.com/output/people-q-c-100-100-9.jpg';
			name = 'Kate';
		}
		// Add message
		myMessages.addMessage({
			// Message text
			text: messageText,
			// Random message type
			type: messageType,
			// Avatar and name:
			avatar: avatar,
			name: name,
			// Day
			day: !conversationStarted ? 'Today' : false,
			time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
		})

		// Update conversation flag
		conversationStarted = true;
	});

});