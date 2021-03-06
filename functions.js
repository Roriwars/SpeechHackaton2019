var jobID;
//var furl = "https://api.havenondemand.com/1/api/async/recognizespeech/v2?url=https%3A%2F%2Fwww.havenondemand.com%2Fsample-content%2Fvideos%2Fhpnext.mp4&language_model=en-us&apikey=690c5e3e-6517-45b2-b340-9eaa372d63e7";
// TEST EN LOCAL: 'https://api.havenondemand.com/1/api/async/recognizespeech/v2?file=@MacronGJ&language_model=en-us&apikey=690c5e3e-6517-45b2-b340-9eaa372d63e7'';
//'https://api.havenondemand.com/1/api/async/recognizespeech/v2?url=@MacronGJ&language_model=en-us&apikey=690c5e3e-6517-45b2-b340-9eaa372d63e7';
var APIKEY = "4bf6fe7e-fd9b-47c6-bdc6-38e3b70da60e";
var button = document.getElementById("submit");
var loadingGif = "<p id='status'>Loading....</p><img id='loading' src='loading.gif'>";

var jsonString = "";
var JSONFILE;

//tableau de mots
var mots = [];

function getData(){
	var loc = document.getElementById("locale").value;
	if (document.getElementById("url").value == ""){
		getJobFile(loc);
	}else {
		var url = document.getElementById("url").value;
		getJobIdUrl(url, loc);
	}
}

// Recuperation du JobID -> URL
function getJobIdUrl(url, loc) {
	document.getElementById("zone").innerHTML = loadingGif;
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
	  jobID = this.responseText;
	  jobID = jobID.slice(16,jobID.length - 3);
	  console.log(jobID);
	  getJson();
    }
  };
  xhttp.open("POST", "https://api.havenondemand.com/1/api/async/recognizespeech/v2?url="+url+"&language_model="+loc+"&apikey="+APIKEY, true);
  xhttp.send();
}

// Recuperation du JSON
function getJson() {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
		reloadResponse(this.responseText);
		document.getElementById("status").value = "Done!";
		document.getElementById("loading").visibility = "hidden";
		document.getElementById("zone").innerHTML = "";
		console.log(this.responseText);
		responseText(this.responseText);
		JSONFILE = this.responseText;
    }
  };
  var link = "https://api.havenondemand.com/1/job/result/" + jobID + "?apikey="+APIKEY;
  xhttp.open("GET", link, true);
  xhttp.send();
}

function reloadResponse(dumb){
	console.log(dumb);
	var i = 0;
	//disparition et appararition des components
	var myNode = document.getElementById("firstI");
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}
	document.getElementById("secondI").style.display = "inline";
	
	//parsage JSON
	var obj = JSON.parse(dumb, function (key, value) {
	  if (key == "text") {
		jsonString = jsonString + value + " ";
		mots[i] = value;
		i = i + 1;
	  }
	});
	console.log(jsonString);
	document.getElementById("message").value = jsonString;
}

function getJobFile(locale){
	document.getElementById("zone").innerHTML = loadingGif;
	var file_data = $('#fichier').prop('files')[0];
	var form_data = new FormData();    
	form_data.append('file', file_data);
	$.ajax({
		url: 'https://api.havenondemand.com/1/api/async/recognizespeech/v2?apikey='+APIKEY+'&language_model='+locale,
		type: 'POST',
		data: form_data,
		contentType: false,
		processData: false,
		success: function(responseText){
			getJsonQ(responseText);
		}
	});
}

function getJsonQ(job){
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
	if (this.readyState == 4 && this.status == 200) {
		document.getElementById("status").value = "Done!";
		document.getElementById("loading").visibility = "hidden";
		document.getElementById("zone").innerHTML = "";
	  console.log(this.responseText);
	  reloadResponse(this.responseText);
	  JSONFILE = this.responseText;
	}
	};
	var link = "https://api.havenondemand.com/1/job/result/" + job["jobID"] + "?apikey="+APIKEY;
	xhttp.open("GET", link, true);
	xhttp.send();
}

function conditionalInput(){
	if(document.getElementById("url").value==""){
    	document.getElementById("fichier").disabled=false;
    }else{
    	document.getElementById("fichier").disabled=true;
    }
    if(document.getElementById("fichier").value==""){
    	document.getElementById("url").disabled=false;
    }else{
    	document.getElementById("url").disabled=true;
    }
}

function searchTimeS(outId){
	var out = "";
	var json = JSONFILE;
	for (var data in json.actions[0].result.items){
		if(json.actions[0].result.items[data].text == word){
			console.log(data);
			var current = json.actions[0].result.items[data];
			var precedent = "[Begin of File]";
			if(data > 1){
				precedent = json.actions[0].result.items[data-1];
			}
			var next = "[End of File]";
			if(parseInt(data, 10) < json.actions[0].result.items.length){
				next = json.actions[0].result.items[parseInt(data, 10) + 1];
			}
			var line = "<p onclick='jump("+current.start_time_offset+")'>"+precedent.text+" "+current.text+ " " + next.text+"</p>";
			out += line;
		}
	}
	document.getElementById(outId).innerHTML = out;
}

function jump(playerId, valueId){
	
	var value = document.getElementById(valueId).value;
	var player = document.getElementById(playerId);
	
	player.currentTime = value
}