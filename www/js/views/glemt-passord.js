myApp.onPageBeforeInit('glemt-passord', function(page) {
	$("#start-glemt-passord").show();
	$("#done-glemt-passord").hide();

});

myApp.onPageInit('glemt-passord', function(page) {

	$("#send-glemt-passord").click(function(event) {
		if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($("#email").val())) {
			$.post(SERVER_URL + "/user/password/reset", {
				epost: $("#email").val()
			}).done(function(result) {
				console.log(result);
				$("#start-glemt-passord").hide();
				$("#done-glemt-passord").show();
				if (result.passwordReset) {
					$("#glemt-passord-msg").html("En e-post med et nytt passord har blitt sendt");
				} else {
					$("#glemt-passord-msg").html("Brukerinformasjon ikke funnet");
				}

			});
		} else {
			$("#glemt-passord-error-msg").html("Du må fylle inn en gyldig e-post addresse");
		}

	});

	$("#avbryt").click(function(event) {
		mainView.router.loadPage('index.html');
		myApp.loginScreen();
	});

	$("#ferdig").click(function(event) {
		mainView.router.loadPage('index.html');
		myApp.loginScreen();
	});
});