myApp.onPageBeforeInit('new-user', function(page) {
	window.ga.trackView('Ny bruker');
	$("#newUserinformation").show();
	$("#newUserPassword").hide();
	$("#newUserParkering").hide();
	$("#newUserNotifications").hide();
	$("#newUserFacebook").hide();
});

myApp.onPageInit('new-user', function(page) {
	$("#next1").click(function(event) {
		$("#fornavn-title").removeClass('input-error');
		$("#etternavn-title").removeClass('input-error');
		$("#phone-title").removeClass('input-error');
		$("#email-title").removeClass('input-error');
		$("#user-error").text("");

		var validated = true;
		if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($("#email").val())) {
			$("#email-title").addClass('input-error');
			$("#user-error").text("Du må angi en gyldig e-post");
			validated = false;
		}

		if (!/^\d{8}$/.test($("#telefon").val())) {
			$("#phone-title").addClass('input-error');
			$("#user-error").text("Telefonnummer må bestå av 8 siffer");
			validated = false;
		}

		if (!/^.+$/.test($("#etternavn").val())) {
			$("#user-error").text("Mangler etternavn");
			$("#etternavn-title").addClass('input-error');
			validated = false;
		}
		if (!/^.+$/.test($("#fornavn").val())) {
			$("#fornavn-title").addClass('input-error');
			$("#user-error").text("Mangler fornavn");
			validated = false;
		}

		if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test($("#email").val())) {
			$.post(SERVER_URL + "/user/email", {
				epost: $("#email").val()
			}).done(function(result) {

				if (result.userAlreadyExists) {
					$("#user-error").html("En annen bruker med samme epost er allerede registrert,  <a href='/views/login/glemt-passord.html'> glemt passord? </a> ");
					validated = false;
				}

				if (validated) {
					$("#newUserinformation").slideUp();
					$("#newUserPassword").show();
				}
			});
		}

	});

	$("#next2").click(function(event) {
		var validated = true;
		$("#password-error").text("");
		$("#passord-title").removeClass('input-error');
		$("#passordBekrefte-title").removeClass('input-error');

		if ($("#passord").val().length < 6) {
			$("#password-error").text("Passordet må være lengere enn 6 tegn");
			$("#passord-title").addClass('input-error');
			validated = false;
		}

		if ($("#passord").val() != $("#bekreftPassord").val()) {
			$("#password-error").text("Passordene må være like");
			$("#passordBekrefte-title").addClass('input-error');
			validated = false;
		}

		if (validated) {
			$("#newUserPassword").slideUp();
			$("#newUserParkering").show();
		}
	});

	$("#next3").click(function(event) {
		if (true) {
			$("#newUserParkering").slideUp();
			$("#newUserNotifications").show();
		}
	});

	$("#next4").click(function(event) {
		$("#newUserNotifications").slideUp();
		$("#newUserFacebook").show();
	});

	$("#FBConnect").click(function(event) {
		FB.logout(function(response) {
			console.log("Logged out of facebook");
		});
		FB.login(function(response) {
			if (response.authResponse) {
				console.log("Login to facebook done");
				FB.api('/me/picture', function(response) {
					$("#profilePicture").attr({
						'src': response.data.url
					});
				});
			} else {
				alert('Login Failed!');
			}
		}, {
			scope: 'public_profile'
		});
	})

	$("#new-user-done").click(function(event) {
		mainView.router.loadPage('index.html');

		$.post(SERVER_URL + "/user/new", {
				firstName: $("#fornavn").val(),
				lastName: $("#etternavn").val(),
				phoneNumber: $("#telefon").val(),
				parkingSpace: $("#parkering").val(),
				regnr: $("#regnr").val(),
				epost: $("#email").val().toLowerCase(),
				hasParkingspace: $("#has-parking").val(),
				needsParkingspace: $("#needs-parking").val(),
				wantsPush: $("#wants-push").val(),
				pushToken: localStorage.getItem("pushToken"),
				password: hex_sha256($("#passord").val()),
				fbProfilePictureUrl: $('#profilePicture').attr('src')
			})
			.done(function(user) {
				localStorage.setItem("userId", user.user._id);
				initializePushwoosh();
				initializePusher();
				window.analytics.trackEvent('Ny bruker', 'bruker registrert', 'Hits', 1);
				mainView.router.loadPage('index.html');
			});

	});
	$("#avbryt").click(function(event) {
		mainView.router.loadPage('index.html');
		myApp.loginScreen();
	});
});