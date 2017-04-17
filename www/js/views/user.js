//Open tab edit user data
$("#userDataView").on('show', function() {
	$("#user-save").show();
	$("#user-save-loading").hide();
	$("#user-saved").hide();
	resetErrorColors();

	$("#user-regnrInput").focusout(function(event) {
		this.value = this.value.toUpperCase();
	});
});

function initializeUser() {
	refreshUser();
	$("#user-save").click(function() {
		$("#user-save").hide();
		$("#user-save-loading").show();
		if (validateInput()) {
			resetErrorColors()
			$.post(SERVER_URL + "/user/save", {
				userId: localStorage.getItem("userId"),
				userName: $("#user-nameInput").val(),
				phoneNumber: $("#user-phoneInput").val(),
				parkingSpace: $("#user-parkingLotInput").val(),
				regnr: $("#user-regnrInput").val(),
				epost: $("#user-emailInput").val(),
				pushToken: localStorage.getItem("pushToken")
			})
			.done(function(user) {
				$("#user-save-loading").hide();
				$("#user-saved").show();
				setTimeout(function() {
					$("#user-saved").hide();
					$("#user-save").show();
				}, 1500)

				localStorage.setItem("userId", user.user._id);
				refreshUser();
			});
		}
	});
};

function resetErrorColors() {
	$("#user-nameInput").css({
		'color': 'black'
	});
	$("#user-phoneInput").css({
		'color': 'black'
	});
	$("#user-parkingLotInput").css({
		'color': 'black'
	});
	$("#user-regnrInput").css({
		'color': 'black'
	});
	$("#user-emailInput").css({
		'color': 'black'
	});
};

function validateInput() {
	var name = $("#user-nameInput");
	var phone = $("#user-phoneInput");
	var parkingSpace = $("#user-parkingLotInput");
	var regNr = $("#user-regnrInput");
	var email = $("#user-emailInput");

	var validated = true;
	if (!/^.+$/.test(name.val())) {
		name.css({
			'color': 'red'
		});
		$("#user-save").show();
		$("#user-save-loading").hide();
		validated = false;
	}
	if (!/^\d{8}$/.test(phone.val())) {
		phone.css({
			'color': 'red'
		});
		$("#user-save-loading").hide();
		$("#user-save").show();
		validated = false;
	}
	if (!/^[A-Z]{2}\d{5}$/.test(regNr.val())) {
		regNr.css({
			'color': 'red'
		});
		$("#user-save-loading").hide();
		$("#user-save").show();
		validated = false;
	}
	if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.val())) {
		email.css({
			'color': 'red'
		});
		$("#user-save-loading").hide();
		$("#user-save").show();
		validated = false;
	}
	return validated;
}


function refreshUser() {
	var userId = localStorage.getItem("userId");

	if (userId != null) {
		var channel = pusher.subscribe("USER-" + localStorage.getItem("userId"));
		channel.bind('parking-offer', function(data) {
			//Refresh everything, when something happens for this user
			refreshCurrentRequest();
			refreshNewRequests();
			refreshHistoryRequests();
			console.log("Data:");
			console.log(data);
			if(data.parkingAnswered) {
				myApp.alert("Du har mottatt svar på din parkeringsforespørsel!","Mottatt svar");	
			} else if (data.parkingDone) {
				myApp.alert(data.msg,"Avsluttet parkering");
			} else if (data.parkingCanceled) {
				myApp.alert(data.msg,"Avbrutt parkering");
			}
			
		});

		//Get user data
		$.get(SERVER_URL + "/user/" + userId, function(user) {
			localStorage.setItem("regnr", user.regnr);
			localStorage.setItem("phoneNumber", user.phoneNumber);
			localStorage.setItem("parkingSpace", user.parkingSpace);

			//Populate fields for user data
			$("#user-nameInput").val(user.userName);
			$("#user-phoneInput").val(user.phoneNumber);
			$("#user-parkingLotInput").val(user.parkingSpace);
			$("#user-regnrInput").val(user.regnr);
			$("#user-emailInput").val(user.epost);
		});
	}
};