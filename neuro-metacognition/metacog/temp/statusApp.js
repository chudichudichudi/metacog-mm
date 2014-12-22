/* 
 * Verificar el estado actual de la App
 * online - offline
 * loaded() se llama desde el body del HTML
 * onload="loaded()" ononline="loaded()" onoffline="loaded()" 
 */
var server = "http://" + location.host;
var serverFront = "http://" + location.host + "/MateMarote/";
server += "/Back/";
//console.log(server);




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


