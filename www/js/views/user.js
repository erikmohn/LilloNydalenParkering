
//Open tab edit user data
$("#userDataView").on('show', function(){
	$("#user-save").show();
	$("#user-save-loading").hide();
	$("#user-saved").hide();
});

function initializeUser() {
	refreshUser();
	
	$("#user-save").click(function() {
		$("#user-save").hide();
		$("#user-save-loading").show();
		
		$.post(SERVER_URL + "/user/save",
			{
				userId: localStorage.getItem("userId"),
				userName: $("#user-nameInput").val(),
				phoneNumber: $("#user-phoneInput").val(),
				parkingSpace: $("#user-parkingLotInput").val(),
				regnr: $("#user-regnrInput").val(),
				epost: $("#user-emailInput").val(),
			}).done(function(user) {
				$("#user-save-loading").hide();
				$("#user-saved").show();
				setTimeout(function() {
					$("#user-saved").hide();
					$("#user-save").show();
				},1500)

				localStorage.setItem("userId", user.user._id);
				refreshUser();
			});	
	});
};




function refreshUser() {
		var userId = localStorage.getItem("userId");

		if (userId != null) {
			    var channel = pusher.subscribe("USER-" + localStorage.getItem("userId"));
			    channel.bind('parking-offer', function(data) {
			    	refreshCurrentRequest();
			    	navigator.vibrate(500);
			      	console.log("Recieved Pusher update!");
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