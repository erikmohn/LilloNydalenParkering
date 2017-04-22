myApp.onPageBeforeInit('endre-passord', function(page) {

});

myApp.onPageInit('endre-passord', function(page) {
	$("#send-endre-passord").click(function(event) {
		$("#old-passord-title").removeClass('input-error');
		$("#new-passord-title").removeClass('input-error');
		$("#passordBekrefte-title").removeClass('input-error');

		var validated = true;
		if ($("#nyttPassord").val() != $("#bekreftetNyttPassord").val()) {
			$("#endre-passord-msg").text("Passordene må være like");
			$("#passordBekrefte-title").addClass('input-error');
			validated = false;
		}

		if ($("#nyttPassord").val().length < 6) {
			$("#endre-passord-msg").text("Nytt passord må være lengere enn 6 tegn");
			$("#new-passord-title").addClass('input-error');
			validated = false;
		}

		if ($("#gammeltPassord").val().length < 1) {
			$("#endre-passord-msg").text("Du må fylle inn gammelt passord");
			$("#old-passord-title").addClass('input-error');
			validated = false;
		}

		if (validated) {
			$.post(SERVER_URL + "/user/password/change", {
				userId: localStorage.getItem("userId"),
				oldPassword: hex_sha256($("#gammeltPassord").val()),
				newPassword: hex_sha256($("#nyttPassord").val())
			}).done(function(result) {
				if (result.passwordChanged) {
					$("#endre-passord-msg").html("Ditt passord er endret");
				} else {
					$("#endre-passord-msg").html("Kunne ikke endre passord");
				}
			});
		}
	});

	$("#ferdig").click(function(event) {
		mainView.router.loadPage('index.html');
		myApp.loginScreen();
	});

	$("#back-endre-passord").click(function(event) {
		console.log("Going back!");
		mainView.router.back();
	});
});