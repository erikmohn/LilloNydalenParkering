myApp.onPageBeforeInit('endre-bruker', function(page) {
	$.get(SERVER_URL + "/user/" + localStorage.getItem("userId"))
		.done(function(user) {
			$("#fornavn").val(user.firstName).focus();
			$("#etternavn").val(user.lastName).focus();
			$("#telefon").val(user.phoneNumber).focus();
			$("#email").val(user.epost).focus();
			$("#lagre-bruker").focus();
		});
});

myApp.onPageInit('endre-bruker', function(page) {
	$("#lagre-bruker").click(function(event) {
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
			$.get(SERVER_URL + "/user/email", {
				epost: $("#email").val()
			}).done(function(result) {
				if (result.userAlreadyExists) {
					$("#user-error").html("En annen bruker med samme epost er allerede registrert");
					validated = false;
				}

				if (validated) {
					$.post(SERVER_URL + "/user/save", {
							userId: localStorage.getItem("userId"),
							firstName: $("#fornavn").val(),
							lastName: $("#etternavn").val(),
							phoneNumber: $("#telefon").val(),
							epost: $("#email").val().toLowerCase()
						})
						.done(function(user) {
							if (user.userAlreadyExists) {
								$("#user-error").html("En annen bruker er allerede registrert med samme e-post");
							} else {
								$("#user-error").html("Brukerinformasjon lagret");

							}
						});
				}
			});
		}

	});

	$("#back-endre-bruker").click(function(event) {
		mainView.router.back();
	});

});