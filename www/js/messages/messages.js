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
					avatar = 'img/noprofile.png'
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
		myMessages.addMessage({
			text: messageText,
			type: 'sent',
			avatar: avatar,
			name: name,
			day: !conversationStarted ? 'Today' : false,
			time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
		})

		// Update conversation flag
		conversationStarted = true;
	});

	var channel = pusher.subscribe("MESSAGE-" + localStorage.getItem("messageThread"));
	channel.bind('newMessage', function(data) {
		var avatar, name, messageType;
		console.log("recieved pusher update about new message!");;
		avatar = 'img/noprofile.png';
		$.get(SERVER_URL + "/messages/message/" + data.newMessage)
			.done(function(message) {
				if (message.sender._id !== localStorage.getItem("userId")) {
					myMessages.addMessage({
						text: message.message,
						type: 'recieved',
						avatar: avatar,
						name: message.sender.firstName + " " + message.sender.lastName,
						day: !conversationStarted ? 'Today' : false,
						time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
					})
				}
			});
	});
});