/* 
 * Verificar el estado actual de la App
 * online - offline
 * loaded() se llama desde el body del HTML
 * onload="loaded()" ononline="loaded()" onoffline="loaded()" 
 */
var server = location.origin+"/";
var serverFront = location.origin + "/MateMarote/";
//server += "/Back/";
//console.log(server);

if (loadStorageCurrentUser()===null){
	if (fromMobile()){
		window.location.href = serverFront+"login_mobile.html";
	} else {
		window.location.href = serverFront+"login_mobile.html";
	}    
}


//VERSION
function sendVersion() {
    $.ajax({
        headers: { 
               'Accept': 'application/json',
               'Content-Type': 'application/json' 
           },
        url: server + "services/version",
        type:  'POST',
        dataType : 'html',
        success: function(datos){
			$("#versionado").html(datos);
			$("#apk_img").attr("src",server+"resources/front/img/downloadAPK.png");
			$("#epi_img").attr("src",server+"resources/front/img/epilogo.png");
			$("#sadosky_img").attr("src",server+"resources/front/img/sadosky.png");
			$("#lni_img").attr("src",server+"resources/front/img/lni.png");
			var apkURL = server+"resources/front/MateMarote.apk";
			$("#logo-apk").attr("href",apkURL);
        }
    }); 
}

function fromMobile(){
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function updateOnlineStatus(status) {
        return status;
}
function loaded() {
    
    if(navigator.onLine){ //onload
        updateOnlineStatus(true);
    } else {
        updateOnlineStatus(false);
    }
  document.body.addEventListener("offline", function () { //onoffline
    updateOnlineStatus(false);
  }, false);
  document.body.addEventListener("online", function () { //ononline
    updateOnlineStatus(true);
  }, false);
}


