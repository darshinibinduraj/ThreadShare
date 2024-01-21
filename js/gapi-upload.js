// TODO: Set the below credentials
const CLIENT_ID = '483843549561-c4thk9hm4td736jj9icpqomcgll8fv8q.apps.googleusercontent.com';
const API_KEY = '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';

// Discovery URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

// Set API access scope before proceeding authorization request
const SCOPES = 'https://www.googleapis.com/auth/drive';
let tokenClient;
let gapiInited = false;
let gisInited = false;

//document.getElementById('authorize_button').style.visibility = 'hidden';
//document.getElementById('signout_button').style.visibility = 'hidden';

/**
 * Callback after api.js is loaded.
 */
function gapiLoaded() {
	gapi.load('client', initializeGapiClient);
}

/**
 * Callback after the API client is loaded. Loads the
 * discovery doc to initialize the API.
 */
async function initializeGapiClient() {
	await gapi.client.init({
		apiKey: API_KEY,
		discoveryDocs: [DISCOVERY_DOC],
	});
	gapiInited = true;
	maybeEnableButtons();
}

/**
 * Callback after Google Identity Services are loaded.
 */
function gisLoaded() {
	tokenClient = google.accounts.oauth2.initTokenClient({
		client_id: CLIENT_ID,
		scope: SCOPES,
		callback: '', // defined later
	});
	gisInited = true;
	maybeEnableButtons();
}

/**
 * Enables user interaction after all libraries are loaded.
 */
function maybeEnableButtons() {
	if (gapiInited && gisInited) {
		//document.getElementById('authorize_button').style.visibility = 'visible';
	}
}

/**
 *  Sign in the user upon button click.
 */
function handleAuthClick(syncResult) {
	tokenClient.callback = async (resp) => {
		if (resp.error !== undefined) {
			throw (resp);
		}
		//document.getElementById('signout_button').style.visibility = 'visible';
		//document.getElementById('authorize_button').value = 'Refresh';
		if (!syncResult)
		{
			handleUpload();
		}else
		{
			openImage();
		}
	};

	if (gapi.client.getToken() === null) {
		// Prompt the user to select a Google Account and ask for consent to share their data
		// when establishing a new session.
		tokenClient.requestAccessToken({ prompt: 'consent' });
	} else {
		// Skip display of account chooser and consent dialog for an existing session.
		tokenClient.requestAccessToken({ prompt: '' });
	}
}

/**
 *  Sign out the user upon button click.
 */
function handleSignoutClick() {
	const token = gapi.client.getToken();
	if (token !== null) {
		google.accounts.oauth2.revoke(token.access_token);
		gapi.client.setToken('');
		document.getElementById('content').style.display = 'none';
		document.getElementById('content').innerHTML = '';
		//document.getElementById('authorize_button').value = 'Authorize';
		//document.getElementById('signout_button').style.visibility = 'hidden';
	}
}


async function handleUpload()
{
    await handleDeleteFilesClick();
	// Get the element
	const element = document.getElementById('image-container-preview');

	// Check if the element contains a class
	if (!element.classList.contains('d-none')) {
    	 var fileInput = document.getElementById('file-upload')
    	 var file = fileInput.files[0];
	     uploadFile(file);
	} else {
    	await uploadFileBase64();
	}

}



// Upload Base64 encoded image to Google Drive
async function uploadFileBase64() {

  const link = document.getElementById('download-photo');
  const href = link.getAttribute('href');

  const base64Data = href;
  const fileName = 'image.png'; // Set the desired file name

  const metadata = {
    name: fileName,
    mimeType: 'image/png',
    parents:  ['1igHRt59wd1mzZq-0pyjFppRIQXh3dKQD']
  };

  const fileData = base64Data.split(',')[1];
  const byteCharacters = atob(fileData);
  const byteArrays = [];
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, { type: metadata.mimeType });

  const reader = new FileReader();
  reader.onloadend = (e) => {
    const content = e.target.result;

    const fileMetadata = {
      name: fileName,
      mimeType: metadata.mimeType,
      parents:  ['1igHRt59wd1mzZq-0pyjFppRIQXh3dKQD']
    };

    const accessToken = gapi.auth.getToken().access_token;

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(fileMetadata)], { type: 'application/json' }));
    form.append('file', blob);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          console.log('File uploaded successfully. File ID:', response.id);

          document.getElementById('content').innerHTML = "File uploaded successfully. The Google Drive file id is <b>" + xhr.response.id + "</b>";
		  document.getElementById('content').style.display = 'block';
			$('#image-container').addClass('d-none');
			$('#co2score').addClass('d-none');
			setTimeout(openImage, 10000);
          //var exit_app = document.getElementById('exit-app');
          //exit_app.click();
        } else {
			document.getElementById('content').innerHTML = "File uploaded failed." + xhr.statusText + "</b>";
			document.getElementById('content').style.display = 'block';
            console.error('Error uploading file:', xhr.statusText);
        }
      }
    };
    xhr.send(form);
  };

  reader.readAsDataURL(blob);
}

/**
 * Upload file to Google Drive.
 */
async function uploadFile(file) {
	var metadata = {
	   name: file.name,
	   mimeType: file.type,
	   parents:  ['1igHRt59wd1mzZq-0pyjFppRIQXh3dKQD']
	};

  const permissions = {
    role: 'writer',
    type: 'anyone',
    allowFileDiscovery: false,
    additionalRoles: ['delete']
  };

/*	var fileContent = 'Hello World'; // As a sample, upload a text file.
	var file = new Blob([fileContent], { type: 'text/plain' });
	var metadata = {
		'name': 'sample-file-via-js', // Filename at Google Drive
		'mimeType': 'text/plain', // mimeType at Google Drive
		// TODO [Optional]: Set the below credentials
		// Note: remove this parameter, if no target is needed
		'parents': ['1d8Qlfgs6DA3_jmlLVVt_S-g_mkB--4rk'], // Folder ID at Google Drive which is optional
	}; */

	var accessToken = gapi.auth.getToken().access_token; // Here gapi is used for retrieving the access token.
	var form = new FormData();
	form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
	form.append('file', file);

	var xhr = new XMLHttpRequest();
	xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id');
	xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
	xhr.responseType = 'json';
	xhr.onload = () => {
		document.getElementById('content').innerHTML = "File uploaded successfully. The Google Drive file id is <b>" + xhr.response.id + "</b>";
		document.getElementById('content').style.display = 'block';
		$('#image-container').addClass('d-none');
		$('#co2score').addClass('d-none');
		setTimeout(openImage, 10000);

	};
	xhr.send(form);
}

async function handleDeleteFilesClick() {
  var folderId = '1qeZ2dHlRLAZfhjNZsnuyEIREh6W8hNMv';

  gapi.client.drive.files.list({
    q: "'" + folderId + "' in parents",
    fields: 'files(id)'
  }).then(function(response) {
    var files = response.result.files;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var fileId = files[i].id;
        deleteFile(fileId);
      }
    }
  }).catch(function(error) {
    console.error('Error retrieving files:', error);
  });
}

function deleteFile(fileId) {
  gapi.client.drive.files.delete({
    fileId: fileId
  }).then(function(response) {
    console.log('File deleted:', fileId);
  }).catch(function(error) {
    console.error('Error deleting file:', error);
  });
}

function openImage()
{
	checkDownload(30000,function(done) {
		if (done)
		{
			console.log('file downloaded');
		}else
		{
			console.log('not downloaded');
		}

	});
}

function checkDownload(timeout,callBack) {
    var startTime = Date.now();
    var folderId = '1qeZ2dHlRLAZfhjNZsnuyEIREh6W8hNMv';
	function handleOpenImageClick() {
	  var imageContainer = document.getElementById('image-container');
	  gapi.client.drive.files.list({
		pageSize: 10,
		fields: 'files(id, name, webViewLink)',
		q: "'" + folderId + "' in parents and (mimeType='image/jpeg' or mimeType='image/png' or mimeType='application/json')",
		orderBy: 'createdTime desc'
	  }).then(function(response) {
		var files = response.result.files;
		if (files && files.length > 1) {
		  files.forEach(function(file) {
		   console.log("downloaded: " + file.id);
		   var fileId = file.id;
		   var extension = file.name.split('.').pop();

		   if (extension.toUpperCase() != "JSON")
		   {
		  	   var webViewLink = file.webViewLink;
		  	   //var imageUrl = webViewLink.replace(/\/file\/d\/(.*)\/view.*/, '/uc?id=$1');
		  	   var imageUrl = "https://drive.google.com/uc?export=view&id="+fileId;
		  	   //imageContainer.src = imageUrl;
		  	   convertImageToBase64(fileId);
		  	   $('#image-container').removeClass('d-none');
			   $('#co2score').removeClass('d-none');
		   } else
		   {
				getFileContent(fileId, function(content) {
				try {
					  var jsonObject = JSON.parse(content);

						co2Calculator(jsonObject);
					} catch (error) {
					  console.error('Error parsing JSON:', error);
					}
				});
		   }
	     });
		 callBack(true);
		}else
		{
			var elapsedTime = Date.now() - startTime;
			if (elapsedTime >= timeout) {
			  callBack(false); // Timeout: File is not available
			} else {
			  setTimeout(handleOpenImageClick, 1000); // Retry after 1 second
			}
		}
	  }).catch(function(error) {
		console.error('Error retrieving image:', error);
		callBack(false);
	  });
	}

	handleOpenImageClick();
}

function isImage(fileId, callback) {
  gapi.client.drive.files.get({
    fileId: fileId,
    fields: 'mimeType'
  }).then(function (response) {
    var mimeType = response.result.mimeType;
    var isImage = mimeType.startsWith('image/');
    callback(true);
  }).catch(function (error) {
    console.error('Error checking if file is an image:', error);
    callback(false);
  });
}

function getFileContent(fileId, callback) {
  gapi.client.drive.files.get({
    fileId: fileId,
    alt: 'media'
  }).then(function (response) {
    var content = response.body;
    callback(content);
  }).catch(function (error) {
    console.error('Error reading file:', error);
  });
}

function registerClick(){
	disableAll();
	$('#registerform').removeClass('d-none');
}

function registerDone(){
	disableAll();
	$('#registerform').addClass('d-none');
	$('#loginform').removeClass('d-none');
}

function loginClick(){
	disableAll();
}

function addclothes(){
	disableAll();
	$('#addclothes').removeClass('d-none');
}

function addUserClothes()
{
	  addClothModal.style.display = "block";

}

function closeModal()
{
	  addClothModal.style.display = "none";

}

function logout() {
	disableAll();
	$('#loginform').removeClass('d-none');
}

function signin() {
	disableAll();
	$('#monthlyscore').removeClass('d-none');
}

function cities() {
	disableAll();
	$('#cities').removeClass('d-none');
}

function schools() {
	disableAll();
	$('#schools').removeClass('d-none');
}


function join() {
	disableAll();
	$('#schoollist').removeClass('d-none');
}

function livermoreschools() {
	disableAll();
	$('#livermoreschools').removeClass('d-none');
}

function scoreboard() {
	disableAll()
	$('#leaderboard').removeClass('d-none');
}

function disableAll()
{
	$('#loginform').addClass('d-none');
	$('#monthlyscore').addClass('d-none');
	$('#leaderboard').addClass('d-none');
	$('#navbarCollapse').addClass('d-none');
	$('#navbarCollapse').removeClass('d-show');
	$('#cities').addClass('d-none');
	$('#schools').addClass('d-none');
	$('#livermoreschools').addClass('d-none');
	$('#schoollist').addClass('d-none');
	$('#addclothes').addClass('d-none');
	$('#registerform').addClass('d-none');
}


function togglenav() {
	// Get the element
	const element = document.getElementById('navbarCollapse');

	// Check if the element contains a class
	if (element.classList.contains('d-show')) {
	  $('#navbarCollapse').removeClass('d-show');
	} else {
	  $('#navbarCollapse').addClass('d-show');
	}
}

function convertImageToBase64(fileId) {
  // Set up the Google Drive API client
// Set up the Google Drive API client
  gapi.client.load('drive', 'v3', function() {
    // Retrieve the image file
    gapi.client.drive.files.get({
      fileId: fileId,
      alt: 'media'
    }).then(function(response) {
      var base64Data = btoa(response.body);
      var imageContainer = document.getElementById('image-container');
      imageContainer.src = 'data:image/jpeg;base64,' + base64Data;
    });
  });
}

function co2Calculator(jsonObject)
{
	console.log('JSON object:', jsonObject);
	var recycled = new Object();
	recycled["Bottle"] = 0.822;
	recycled["Aluminum"] = 0.988;
	recycled["Plastic"] = 0.60;
	recycled["Brush"] = 0.100;
	recycled["Glass"] = 0.200;

	// Accumulate the sum of all values
	let sum = 0;
	let count = 0;
	Object.keys(jsonObject).forEach(key => {

	  var rKey = Object.keys(recycled).find(r => r.toLowerCase() === key.toLowerCase())
	  var value = 0.200;
	  if (rKey != undefined && rKey != "" && rKey != null)
		 value = recycled[rKey];

	  // Add an integer to each value
	  sum += (jsonObject[key] * value) * 2.2;
	  count += jsonObject[key];
	});


	const button = document.getElementById('co2score');
	button.innerText = count + " items recycled." + " You Saved " + Math.round(sum * 100)/100 + " lbs of CO2";
}

//https://www.epa.gov/warm/recycled-content-recon-tool
//1 Aluminum 0.04lbs - 98.8g CO2
//1 glass 0.67lbs - 200g CO2
//1 plastic bottle - 82.8gms for 500 milli
//1 Aluminum foil sheet - 3000g
// 1 brush - 100g

/*  "Bottle": 12,
    "Tube": 3,
    "Lid": 1,
    "Brush": 2,
    "Foil": 2,
    "Jar": 1,
    "Can": 1,
    "Mirror": 1,
    "Cosmetic": 1,
    "Box": 1,
    "Cassette-&-tape": 1 */
