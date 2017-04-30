myApp.onPageBeforeInit('messages', function(page) {

	console.log("Open page for messages");

	$("#message-back").click(function(event) {
		mainView.router.back();
	})
});


myApp.onPageInit('messages', function(page) {

	var conversationStarted = false;

	var myMessages = myApp.messages('.messages', {
		autoLayout: true
	});

	$.get(SERVER_URL + "/messages/" + localStorage.getItem("messageThread"))
		.done(function(messages) {

			messages.forEach(function(message) {

				var avatar, name, messageType;
				if (message.sender._id == localStorage.getItem("userId")) {
					messageType = 'sent'
				} else {
					messageType = 'recieved'
				}

				myMessages.addMessage({
					text: message.message,
					type: messageType,
					avatar: avatar,
					name: message.sender.firstName + " " + message.sender.lastName,
					day: !conversationStarted ? 'Today' : false,
					time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
				})
			})
		});

	var myMessagebar = myApp.messagebar('.messagebar');

	$$('.messagebar .link').on('click', function() {
		var messageText = myMessagebar.value().trim();
		if (messageText.length === 0) return;
		myMessagebar.clear()

		$.post(SERVER_URL + "/messages/new", {
			threadId: localStorage.getItem("messageThread"),
			userId: localStorage.getItem("userId"),
			message: messageText,
			sendtDate: moment().toDate()
		}).done(function(message) {
			console.log("Message saved!");
		});

		var avatar, name, messageType;
		messageType = 'sent'
			// Add message
		myMessages.addMessage({
			// Message text
			text: messageText,
			// Random message type
			type: 'sent',
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

	var channel = pusher.subscribe("MESSAGE-" + localStorage.getItem("messageThread"));
	channel.bind('newMessage', function(data) {
		var avatar, name, messageType;
		console.log("recieved pusher update about new message!");
		$.get(SERVER_URL + "/messages/message/" + data.newMessage)
			.done(function(message) {
				if (message.sender._id !== localStorage.getItem("userId")) {
					myMessages.addMessage({
						// Message text
						text: message.message,
						// Random message type
						type: 'recieved',
						// Avatar and name:
						avatar: avatar,
						name: message.sender.firstName + " " + message.sender.lastName,
						// Day
						day: !conversationStarted ? 'Today' : false,
						time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
					})
				}
			});
	});
});