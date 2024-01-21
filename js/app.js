const webcamElement = document.getElementById('webcam');

const canvasElement = document.getElementById('canvas');

const snapSoundElement = document.getElementById('snapSound');

const webcam = new Webcam(webcamElement, 'user', canvasElement, snapSoundElement);


$("#webcam-switch").change(function () {
    if(this.checked){
        $('.md-modal').addClass('md-show');
            cameraStarted();
    }
    else {
        cameraStopped();
    }
});

$('#cameraFlip').click(function() {
    webcam.flip();
    webcam.start();
});

/*$('#camera_switchon').click(function() {
    webcam.start();
    webcamStart();
});*/

/*$('#camera_switchoff').click(function() {
    webcam.stop();
    webcamStop()
});*/

$('#closeError').click(function() {
    $("#webcam-switch").prop('checked', false).change();
});

function displayError(err = ''){
    if(err!=''){
        $("#errorMsg").html(err);
    }
    $("#errorMsg").removeClass("d-none");
}

function cameraStarted(){
    $("#errorMsg").addClass("d-none");
    $('.flash').hide();
    $("#webcam-caption").html("Stop");
    //$("#webcam-control").removeClass("webcam-off");
    //$("#webcam-control").addClass("webcam-on");
    $(".webcam-container").removeClass("d-none");
    if( webcam.webcamList.length > 1){
        $("#cameraFlip").removeClass('d-none');
    }
    $("#wpfront-scroll-top-container").addClass("d-none");
    window.scrollTo(0, 0);
    $('body').css('overflow-y','hidden');
	$("#message").removeClass("d-none");
	$("#upload-image").removeClass("d-none");
    //webcamStop();
}

function cameraStopped(){
    $("#errorMsg").addClass("d-none");
    $("#wpfront-scroll-top-container").removeClass("d-none");
    //$("#webcam-control").removeClass("webcam-on");
    //$("#webcam-control").addClass("webcam-off");
    $("#cameraFlip").addClass('d-none');
    $(".webcam-container").addClass("d-none");
    $("#webcam-caption").html("Start");
    $('.md-modal').removeClass('md-show');

	$("#upload-image").addClass("d-none");
	$("#message").addClass("d-none");
	//$("#camera_switchon").addClass("d-none");
	//$("#camera_switchoff").addClass("d-none");
}

function webcamStart() {
	$("#take-photo").removeClass("d-none");
	//$("#camera_switchon").addClass("d-none");
	//$("#camera_switchoff").removeClass("d-none");
	$("#upload-image").addClass("d-none");
}

function webcamStop() {
	$("#take-photo").addClass("d-none");
	//$("#camera_switchon").removeClass("d-none");
	$("#upload-image").removeClass("d-none");
	//$("#camera_switchoff").addClass("d-none");
}


$("#take-photo").click(function () {
    beforeTakePhoto();
    let picture = webcam.snap();
    document.querySelector('#download-photo').href = picture;
    afterTakePhoto();
});

function beforeTakePhoto(){
    $('.flash')
        .show()
        .animate({opacity: 0.3}, 500)
        .fadeOut(500)
        .css({'opacity': 0.7});
    window.scrollTo(0, 0);
    $('#webcam-control').addClass('d-none');
    $('#cameraControls').addClass('d-none');
}

function loadFile(event) {
	    var output = document.getElementById('image-container-preview');

	    var download = document.getElementById('download-photo');

	    output.src = URL.createObjectURL(event.target.files[0]);
	    output.onload = function() {
	    URL.revokeObjectURL(output.src) // free memory
    	}

    	download.src = URL.createObjectURL(event.target.files[0]);
    	afterTakePhoto();
    	chooseFile();
}

function afterTakePhoto(){
    webcam.stop();
    $('#canvas').removeClass('d-none');
    $('#take-photo').addClass('d-none');
    $('#exit-app').removeClass('d-none');
    $('#download-photo').removeClass('d-none');
    $('#resume-camera').removeClass('d-none');
    $('#cameraControls').removeClass('d-none');

    $('#upload-photo').removeClass('d-none');
    $('#sync-result').removeClass('d-none');
    $('#refresh').removeClass('d-none');
    $('#close').removeClass('d-none');
    $('#webcam-control').addClass('d-none');
	$("#message").addClass("d-none");
	$("#upload-image").addClass("d-none");
	  //$("#camera_switchoff").addClass("d-none");
	  //$("#camera_switchon").addClass("d-none");
}

function chooseFile() {
	  $('#canvas').addClass('d-none');
	  $('#image-container-preview').removeClass('d-none');
	  $('#webcam-control').addClass('d-none');
	  //$("#camera_switchoff").addClass("d-none");
	  //$("#camera_switchon").addClass("d-none");
}

function removeCapture(){
    $('#canvas').addClass('d-none');
    $('#webcam-control').removeClass('d-none');
    $('#cameraControls').removeClass('d-none');
    $('#take-photo').removeClass('d-none');
    $('#exit-app').addClass('d-none');
    $('#download-photo').addClass('d-none');
    $('#resume-camera').addClass('d-none');

    $('#upload-photo').addClass('d-none');
    $('#sync-result').addClass('d-none');
    $('#refresh').addClass('d-none');
    $('#close').addClass('d-none');
    $('#image-container-preview').addClass('d-none');
    //$("#camera_switchon").addClass("d-none");
    //$("#camera_switchoff").removeClass("d-none");
}

$("#resume-camera").click(function () {
	removeCapture();
	cameraStarted();
   /* webcam.stream()
        .then(facingMode =>{
            removeCapture();
        });*/
});

$("#exit-app").click(function () {
    removeCapture();
    $("#webcam-switch").prop("checked", false).change();
});


