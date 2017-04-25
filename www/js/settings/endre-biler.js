var i = 0;
myApp.onPageBeforeInit('endre-biler', function(page) {
	$("#back-endre-biler").click(function(event) {
		mainView.router.back();
	});

	refreshCars();
	$("#addCar").click(function(event) {
		i++;
		$("#noCars").remove();
		if ($("#cars > li").length < 5) {
			$("#cars").append(
				'<li id="liA' + i + '" hidden>' +
				'<div class="item-content">' +
				'<div class="item-media">' +
				'<i class="material-icons">directions_car</i>' +
				'</div>' +
				'<div class="item-inner">' +
				'<div class="item-title floating-label">Registreringsnummer</div>' +
				'<div class="item-input">' +
				'<input id="car" type="text">' +
				'</div>' +
				'</div>' +
				'<div class="item-media">' +
				'<i id="removeCarA' + i + '" class="material-icons" style="color:#919292">remove_circle</i>' +
				'</div>' +
				'</div>' +
				'</li>'
			);
			$("#liA" + i).animate({
				width: 'toggle'
			}, 350);

			$("#removeCarA" + i).click(function(event) {
				$(this).parent().parent().parent().animate({
					width: 'toggle'
				}, 350, function() {
					$(this).remove();
					if ($("#cars").children().length == 0) {
						addNoCars();
					}
				})
			})
		}
	});

	$("#save-car").click(function(event) {
		$("#car-error").text("");
		var cars = [];
		var validated = true;
		$("#cars").children().each(function(index, value) {
			var car = $(this).find("#car");
			if (car.val()) {
				if (!/^[A-Z]{2}\d{5}$/.test(car.val())) {
					$("#cars-error").text("Registreringsnummer har feil format (XX12345)");
					validated = false
				}
				cars.push({
					regNr: car.val()
				});
			}

		});

		if (validated) {
			$.post(SERVER_URL + "/user/cars/save", {
					userId: localStorage.getItem("userId"),
					cars: cars
				})
				.done(function(result) {
					$("#cars-error").text("Dine biler er lagret");
				});
		} 
	});

});

myApp.onPageInit('endre-biler', function(page) {

});

function refreshCars() {
	$("#cars").empty();
	$("#cars").parent().addClass('inputs-list');

	$.get(SERVER_URL + "/user/cars/" + localStorage.getItem("userId"))
		.done(function(cars) {
			if (cars.length == 0) {
				addNoCars();
			} else {
				var i = 0;
				cars.forEach(function(car) {
					i++;
					$("#cars").append(
						'<li>' +
						'<div class="item-content">' +
						'<div class="item-media">' +
						'<i class="material-icons">directions_car</i>' +
						'</div>' +
						'<div class="item-inner">' +
						'<div class="item-title floating-label">Registreringsnummer</div>' +
						'<div class="item-input">' +
						'<input id="car" type="text" value="' + car.regNr + '">' +
						'</div>' +
						'</div>' +
						'<div class="item-media">' +
						'<i id="removeCarB' + i + '" class="material-icons" style="color:#919292">remove_circle</i>' +
						'</div>' +
						'</div>' +
						'</li>'
					);

					$("#removeCarB" + i).click(function(event) {
						$(this).parent().parent().parent().animate({
							width: 'toggle'
						}, 350, function() {
							$(this).remove();
							if ($("#cars").children().length == 0) {
								addNoCars();
							}
						})

					});
				});

				$("input").each(function(index) {
					$(this).focus();
					$("#save-car").focus();
				})
			}
		});
}

function addNoCars() {
	$("#cars").append(
		'<li id="noCars" hidden>' +
		'<div class="item-content">' +
		'<div class="item-inner">' +
		'<input type="text" value="Ingen biler registrert" disabled>' +
		'</div>' +
		'</div>' +
		'</li>');

	$("#noCars").animate({
		width: 'toggle'
	}, 350)
}