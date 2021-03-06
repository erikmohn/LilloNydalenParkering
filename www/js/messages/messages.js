myApp.onPageBeforeInit('messages', function(page) {
	$("#message-back").click(function(event) {
		mainView.router.back();
		localStorage.removeItem("currentRequest");
	})

	$.post(SERVER_URL + "/parking", {
		parkingId: localStorage.getItem("currentRequest")
	}).done(function(parking) {
		var title = "Meldinger";
		if (parking.requestUser[0]) {
			var user = parking.requestUser[0];
			title = user.lastName + ", " + user.firstName;
		}
		$("#title").html(title);
	})
});


myApp.onPageInit('messages', function(page) {
	var lastMessageTime;

	var myMessages = myApp.messages('.messages', {
		autoLayout: true
	});

	$.get(SERVER_URL + "/messages/" + localStorage.getItem("messageThread"))
		.done(function(messages) {

			localStorage.setItem("numberOfReadMessages-" + localStorage.getItem("messageThread"), messages.length);

			messages.forEach(function(message) {
				var avatar, name, messageType;
				if (message.sender._id == localStorage.getItem("userId")) {
					messageType = 'sent'
				} else {
					messageType = 'recieved'
					avatar = 'img/noprofile.png'
					name = message.sender.firstName + " " + message.sender.lastName;
				}
				var timeDiff = moment(message.date).diff(lastMessageTime, 'minutes');
				myMessages.addMessage({
					text: message.message,
					type: messageType,
					avatar: avatar,
					name: name,
					day: timeDiff >= 0 && timeDiff < 10 ? false : moment(message.date).isSame(moment(), 'day') ? 'I dag' : moment(message.date).format("dddd, MMMM DD"),
					time: timeDiff >= 0 && timeDiff < 10 ? false : moment(message.date).format("HH:mm")
				})
				lastMessageTime = moment(message.date);
			})
		});

	var myMessagebar = myApp.messagebar('.messagebar');

	$$('.messagebar .link').on('click', function() {
		increaseNumberOfReadMessages();
		var messageText = myMessagebar.value().trim();
		if (messageText.length === 0) return;
		myMessagebar.clear()

		$.post(SERVER_URL + "/messages/new", {
			threadId: localStorage.getItem("messageThread"),
			userId: localStorage.getItem("userId"),
			message: messageText,
			sendtDate: moment().toDate()
		}).done(function(message) {});


		var timeDiff = moment().diff(lastMessageTime, 'minutes');
		var avatar, name, messageType;
		messageType = 'sent'
		myMessages.addMessage({
			text: messageText,
			type: 'sent',
			avatar: avatar,
			name: name,
			day: timeDiff >= 0 && timeDiff < 10 ? false : 'I dag',
			time: timeDiff >= 0 && timeDiff < 10 ? false : moment().format("HH:mm")
		});

	});

	var channel = pusher.subscribe("MESSAGE-" + localStorage.getItem("messageThread"));
	channel.bind('newMessage', function(data) {
		increaseNumberOfReadMessages();
		var avatar, name, messageType;
		avatar = 'img/noprofile.png';
		var timeDiff = moment().diff(lastMessageTime, 'minutes');
		$.get(SERVER_URL + "/messages/message/" + data.newMessage)
			.done(function(message) {
				if (message.sender._id !== localStorage.getItem("userId")) {
					myMessages.addMessage({
						text: message.message,
						type: 'recieved',
						avatar: avatar,
						name: message.sender.firstName + " " + message.sender.lastName,
						day: timeDiff >= 0 && timeDiff < 10 ? false : moment(message.date).isSame(moment(), 'day') ? 'I dag' : moment(message.date).format("dddd, MMMM DD"),
						time: timeDiff >= 0 && timeDiff < 10 ? false : moment(message.date).format("HH:mm")
					})
				}
			});
	});
});

function increaseNumberOfReadMessages() {
	var numberOfRead = parseInt(localStorage.getItem("numberOfReadMessages-" + localStorage.getItem("messageThread")));
	var num = numberOfRead == null ? 0 : numberOfRead + 1;
	localStorage.setItem("numberOfReadMessages-" + localStorage.getItem("messageThread"), num);
}