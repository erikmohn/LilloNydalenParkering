myApp.onPageBeforeInit('free-parking', function(page) {


});



myApp.onPageInit('free-parking', function(page) {
	$.post(SERVER_URL + "/parking/free/get", {
		freeId: localStorage.getItem("currentFreeParking")
	}).done(function(freeParking) {

		$(".timeline").append('	  <div class="timeline-item">' +
			'<div class="timeline-item-date">' + moment(freeParking.startTime).locale("nb").format("dd/MM/YY HH:mm") + '</div>' +
			'<div class="timeline-item-divider"></div>' +
			'<div class="timeline-item-content">Ingen tildelte parkeringer</div>' +
			'</div>');

		$(".timeline").append('	  <div class="timeline-item">' +
			'<div class="timeline-item-date">' + moment(freeParking.endTime).locale("nb").format("dd/MM/YY HH:mm") + '</div>' +
			'<div class="timeline-item-divider"></div>' +
			'<div class="timeline-item-content"></div>' +
			'</div>');

	});

});