myApp.onPageBeforeInit('endre-bruker', function(page) {
	window.ga.trackView('Endre bruker');
	$.get(SERVER_URL + "/user/" + localStorage.getItem("userId"))
		.done(function(user) {
			$("#fornavn").val(user.firstName).focus();
			$("#etternavn").val(user.lastName).focus();
			$("#telefon").val(user.phoneNumber).focus();
			$("#email").val(user.epost).focus();
			$("#lagre-bruker").focus();
		});
});

 function photo(url){
    // Read in file
    var file = event.target.files[0];

    // Ensure it's an image
    if(file.type.match(/image.*/)) {
        console.log('An image has been loaded');

        // Load the image
        var reader = new FileReader();
        reader.onload = function (readerEvent) {
            var image = new Image();
            image.onload = function (imageEvent) {

                // Resize the image
                var canvas = document.createElement('canvas'),
                    max_size = 544,
                    width = image.width,
                    height = image.height;
                if (width > height) {
                    if (width > max_size) {
                        height *= max_size / width;
                        width = max_size;
                    }
                } else {
                    if (height > max_size) {
                        width *= max_size / height;
                        height = max_size;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                canvas.getContext('2d').drawImage(image, 0, 0, width, height);
                var dataUrl = canvas.toDataURL('image/jpeg');
                var resizedImage = dataURLToBlob(dataUrl);
                $.event.trigger({
                    type: "imageResized",
                    blob: resizedImage,
                    url: dataUrl
                });
            }
            image.src = readerEvent.target.result;
        }
        reader.readAsDataURL(file);
    }
};

function renderImage(file) {

  // generate a new FileReader object
  var reader = new FileReader();

  // inject an image with the src url
  reader.onload = function(event) {
    the_url = event.target.result
    $('#profileImage').html("<img src='" + the_url + "' />")
  }
 // when the file is read it triggers the onload event above.
  reader.readAsDataURL(file);
}

myApp.onPageInit('endre-bruker', function(page) {

	$("#profileImage").click(function(event) {
		$("#the-file-input").click();
	}); 
	$("#the-file-input").change(function(event) {

		console.log(this.files[0]);
		renderImage(this.files[0])
	});

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
								window.analytics.trackEvent('Settings', 'Bruker endret', 'Hits', 1);
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