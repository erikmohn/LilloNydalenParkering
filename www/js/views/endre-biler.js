var i = 0;
myApp.onPageBeforeInit('endre-biler', function(page) {
	$("#back-endre-biler").click(function(event) {
		mainView.router.back();
	});

	refreshCars();
	$("#addCar").click(function(event) {
		i++;
		$("#noCars").remove();
		$("#cars").append(
			'<li>' +
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

		$("#removeCarA" + i).click(function(event) {
			$(this).parent().parent().parent().remove()
			if ($("#cars").children().length == 0) {
				addNoCars();
			}
		})
	});

	$("#save-car").click(function(event) {
		$("#car-error").text("");
		var cars = [];
		var validated = true;
		$("#cars").children().each(function(index, value) {
			if ($(this).find("#car").val().length !== 7) {
				validated = false
			}
			cars.push({
				regNr: $(this).find("#car").val()
			});
		});

		if (validated) {
			$.post(SERVER_URL + "/user/cars/save", {
					userId: localStorage.getItem("userId"),
					cars: cars
				})
				.done(function(result) {
					$("#cars-error").text("Lagret dine biler");
				});
		} else {
			$("#cars-error").text("Du må fylle inn registreringsnummer");
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
						'<i id="removeCarB' + i +'" class="material-icons" style="color:#919292">remove_circle</i>' +
						'</div>' +
						'</div>' +
						'</li>'
					);

					$("#removeCarB" + i).click(function(event) {
						$(this).parent().parent().parent().remove()
						if ($("#cars").children().length == 0) {
							addNoCars();
						}
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
		'<li id="noCars">' +
		'<div class="item-content">' +
		'<div class="item-inner">' +
		'<div> Ingen biler registrert</div>' +
		'<div class="item-input"></div>' +
		'</div>' +
		'</div> ' +
		'</li>');
}