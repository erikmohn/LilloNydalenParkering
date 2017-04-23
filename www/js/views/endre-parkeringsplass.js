var i = 0;
myApp.onPageBeforeInit('endre-parkerigsplass', function(page) {
	$("#back-endre-parkeringsplass").click(function(event) {
		mainView.router.back();
	});

	refreshParkering();
	$("#addParking").click(function(event) {
		i++;
		$("#noParkingSpaces").remove();
		$("#parkeringsplasser").append(
			'<li>' +
			'<div class = "item-content">' +
			'<div class="item-media">' +
			'<i id="removeCar' + i + '"class="material-icons">place</i>' +
			'</div>' +
			'<div class="item-inner">' +
			'<div class="item-title floating-label">Plassnummer</div>' +
			'<div class="item-input">' +
			'<input id="parkering" type="text">' +
			'</div>' +
			'</div>' +
			'<div class="item-media">' +
			'<i id="removeParkingA' + i + '" class="material-icons" style="color:#919292">remove_circle</i>' +
			'</div>' +
			'</div>' +
			'</li>'
		);
		$("#removeParkingA" + i).click(function(event) {
			$(this).parent().parent().parent().remove()
			if ($("#parkeringsplasser").children().length == 0) {
				addNoParkingSpaces();
			}
		})
	});

	$("#save-parkering").click(function(event) {
		$("#parking-error").text("");
		var parkeringsplasser = [];
		var validated = true;
		$("#parkeringsplasser").children().each(function(index, value) {
			//!/^[A-Z]{2}\d{5}$/.test(regNr)
			if ($(this).find("#parkering").val() < 1) {
				validated = false
			}
			parkeringsplasser.push({
				parkingSpace: $(this).find("#parkering").val()
			});
		});

		if (validated) {
			$.post(SERVER_URL + "/user/parkingSpaces/save", {
					userId: localStorage.getItem("userId"),
					parkingSpaces: parkeringsplasser
				})
				.done(function(result) {
					$("#parking-error").text("Lagret dine parkeringsplasser");
				});
		} else {
			$("#parking-error").text("Du må fylle inn plassnummer");
		}
	});

});

myApp.onPageInit('endre-parkering', function(page) {

});

function refreshParkering() {
	$("#parkeringsplasser").empty();
	$("#parkeringsplasser").parent().addClass('inputs-list');
	$.get(SERVER_URL + "/user/parkingSpaces/" + localStorage.getItem("userId"))
		.done(function(parkingSpaces) {
			if (parkingSpaces.length == 0) {
				addNoParkingSpaces();
			} else {
				var i = 0;
				parkingSpaces.forEach(function(parkingSpace) {
					i++;
					$("#parkeringsplasser").append(
						'<li>' +
						'<div class="item-content">' +
						'<div class="item-media">' +
						'<i id="removeCar' + i + '"class="material-icons">place</i>' +
						'</div>' +
						'<div class="item-inner">' +
						'<div class="item-title floating-label">Plassnummer</div>' +
						'<div class="item-input">' +
						'<input id="parkering" type="text" value="' + parkingSpace.parkingSpace + '">' +
						'</div>' +
						'</div>' +
						'<div class="item-media">' +
						'<i id="removeParkingB' + i + '" class="material-icons" style="color:#919292">remove_circle</i>' +
						'</div>' +
						'</div>' +
						'</li>'
					);
					$("#removeParkingB" + i).click(function(event) {
						$(this).parent().parent().parent().remove()
						if ($("#parkeringsplasser").children().length == 0) {
							addNoParkingSpaces();
						}
					})

				})
				$("input").each(function(index) {
					$(this).focus();
					$("#save-parkering").focus();
				})
			}
		});
}

function addNoParkingSpaces() {
	$("#parkeringsplasser").append(
		'<li id="noParkingSpaces">' +
		'<div class="item-content">' +
		'<div class="item-inner">' +
		'<div>Ingen parkeringsplasser registrert</div>' +
		'<div class="item-input"></div>' +
		'</div>' +
		'</div> ' +
		'</li>');
}