//Open tab register request!
$("#registerRequest").on('show', function() {
	$("#request-view-loading").show();
	$("#parking-request").hide();
	$("#parking-request-fail").hide();

	var userId = localStorage.getItem("userId");
	if (userId === null) {
		$("#request-view-loading").hide();
		$("#parking-request-fail").show();
	} else {
		refreshCurrentRequest();
		$("#request-view-loading").hide();
		$("#parking-request").show();
	}
});

function initializeCurrentRequest() {
	resetCurrentRequest();


	$("#send-request").click(function() {
		var regNr = $("#request-regnr").val();

		var startTime = $("#request-fom").val();
		var endTime = $("#request-tom").val();

		if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
			$("#request-tom").css({
				'color': 'red'
			});
		} else if (!/^[A-Z]{2}\d{5}$/.test(regNr)) {
			$("#request-regnr").css({
				'color': 'red'
			});
		} else {
			$("#request-tom").css({
				'color': 'black'
			});
			$.post(SERVER_URL + "/parking/request", {
				userId: localStorage.getItem("userId"),
				regNr: regNr,
				phoneNumber: localStorage.getItem("phoneNumber"),
				starTime: moment(startTime).toDate(),
				endTime: moment(endTime).toDate(),
				registredDate: moment().toDate()
			}).done(function(data) {
				localStorage.setItem("currentRequest", data.request._id);
				refreshCurrentRequest();
			});
		}
	});

	$("#cancel-request").click(function() {
		myApp.confirm('Ønsker du å avbryte din parkeringsforespørsel?', 'Avbryt', function() {
			$.post(SERVER_URL + "/parking/cancle", {
				parkingId: localStorage.getItem("currentRequest")
			}).done(function(parking) {
				localStorage.removeItem("currentRequest");
				refreshCurrentRequest();
			});
		});
	});

	$("#done-request").click(function() {
		myApp.confirm('Er du ferdig med din bruk av parkeringsplassen?<br>' +
			'<br>' +
			'Eier får beskjed om at plassen nå er tilgjengelig for bruk',
			'Ferdigstill parkering',
			function() {
				$.post(SERVER_URL + "/parking/done", {
					parkingId: localStorage.getItem("currentRequest")
				}).done(function(parking) {
					localStorage.removeItem("currentRequest");
					refreshCurrentRequest();
				});
			});
	});
};

function resetCurrentRequest() {
	$("#request-regnr").val(localStorage.getItem("regnr"));
	$("#request-fom").val(moment().add(1, 'hours').format("YYYY-MM-DDTHH:00"));
	$("#request-tom").val(moment().add(4, 'hours').format("YYYY-MM-DDTHH:00"));

	$("#request-tom").css({
		'color': 'black'
	});

	$("#request-regnr").css({
		'color': 'black'
	});

	$("#request-tom").css({
		'color': 'black'
	});
	$("#request-regnr").prop('disabled', false);
	$("#request-fom").prop('disabled', false);
	$("#request-tom").prop('disabled', false);
};

function refreshCurrentRequest() {
	resetCurrentRequest();

	$("#request-loading").show();
	$("#send-request").hide();
	$("#cancel-request").hide();
	$("#done-request").hide();


	$("#request-tildeltParkering").hide();
	$("#request-venter-svar").hide();

	var userId = localStorage.getItem("userId");

	$.get(SERVER_URL + "/parking/user/" + userId, function(parkingRequest) {
		if (typeof parkingRequest != "undefined" && parkingRequest != null && parkingRequest.length > 0) {
			$("#request-regnr").val(parkingRequest[0].regNr).prop('disabled', true);
			$("#request-fom").val(moment(parkingRequest[0].startTime).format("YYYY-MM-DDTHH:mm")).prop('disabled', true);
			$("#request-tom").val(moment(parkingRequest[0].endTime).format("YYYY-MM-DDTHH:mm")).prop('disabled', true);

			if (parkingRequest[0].answered) {
				$("#request-parkering").val(parkingRequest[0].parkingLot);
				$("#request-eier").val(parkingRequest[0].offerParkingUser[0].userName);
				$("#request-eier-telefon").val(parkingRequest[0].offerParkingUser[0].phoneNumber);

				var now = moment();
				var parkingTime = moment(parkingRequest[0].startTime);
				var diff = parkingTime.diff(now, 'milliseconds');

				if (diff < 0) {
					$("#request-loading").hide();
					$("#done-request").show();
				} else {
					$("#request-loading").hide();
					$("#cancel-request").show();
					setTimeout(function() {
						$("#cancel-request").hide();
						$("#done-request").show();
					}, diff);
				}
				$("#request-tildeltParkering").show();
			} else {
				$("#request-loading").hide();
				$("#cancel-request").show();
				$("#request-venter-svar").show();
			}

			localStorage.setItem("currentRequest", parkingRequest[0]._id);
		} else {
			//Populate default values for parking requests
			$("#request-regnr").prop('disabled', false);
			$("#request-fom").prop('disabled', false);
			$("#request-tom").prop('disabled', false);

			$("#request-loading").hide();
			$("#send-request").show();

		}
	});
};