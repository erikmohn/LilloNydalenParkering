myApp.onPageBeforeInit('new-parkering', function(page) {
	$("#back-new-parkering").click(function(event) {
		mainView.router.back();
	});

	$.get(SERVER_URL + "/user/cars/" + localStorage.getItem("userId"))
		.done(function(cars) {
			cars.forEach(function(car) {
				$('#cars')
					.append($("<option></option>")
						.attr("value", car.regNr)
						.text(car.regNr));
			});
		});

	$("#request-fom").val(moment().add(1, 'hours').format("YYYY-MM-DDTHH:00"));
	$("#request-tom").val(moment().add(4, 'hours').format("YYYY-MM-DDTHH:00"));


	$("#lagre-parkering").click(function() {
		var startTime = $("#request-fom").val();
		var endTime = $("#request-tom").val();

		var validated = true;

		if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
			//TODO: Error message
			validated = false;
		}

		if (validated) {
			$.post(SERVER_URL + "/parking/request", {
				userId: localStorage.getItem("userId"),
				regNr: $("#cars").val(),
				phoneNumber: localStorage.getItem("phoneNumber"),
				starTime: moment(startTime).toDate(),
				endTime: moment(endTime).toDate(),
				registredDate: moment().toDate(),
				requestMessage: $("#requestMessage").val()
			}).done(function(data) {
				mainView.router.loadPage('views/new-request.html');
			});
		}
	});
});


myApp.onPageInit('new-parkering', function(page) {


});