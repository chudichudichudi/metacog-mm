/* 
 * Para guardar y cargar localStorage
 * jStorage-master/jstorage.js
 * 
 */

//cargar mensajes por idioma en el localstorage
function loadStorageMessages(lang, clave) 
{
    //$.jStorage.get('en' + 'services.register.form.label.email');
    //console.log("lang.clave: "+lang + '.' + clave);
    value = $.jStorage.get(lang + '.' + clave);
    //console.log("value: "+value);
    return value;
}
//guardar mensajes por idioma en el localstorage
function saveStorageMessages(lang, clave, valor) 
{
    //$.jStorage.set('en'+'services.register.form.label.email', 'E-mail');
    $.jStorage.set(lang + '.' + clave, valor);
}

//cargar info del localstorage
function loadStorage(id, clave) 
{
    //id:idPlayer  clave:_nombre de la variable  
    //$.jStorage.get(id + '_first_name');
    value = $.jStorage.get(id + clave);
    return value;
}

//guardar info en el localstorage
function saveStorage(id, clave, valor) 
{
    //id:idPlayer  clave:_nombre de la variable  valor:la variable
    //$.jStorage.set(id+'_first_name', valor);
    $.jStorage.set(id + clave, valor);
}

function cleanStorage(id, clave) {
	$.jStorage.deleteKey(id + clave);
}

function saveStorageCurrentUser(id) 
{
    $.jStorage.set("currentUser", id);
}
function loadStorageCurrentUser() 
{ 
    value = $.jStorage.get("currentUser");
    return value;
}
function cleanCurrentUser(){
    $.jStorage.deleteKey("currentUser");
}



function saveUserData(id,data){
    var userdata = JSON.stringify(data);
    saveStorage(id, "_user_data", userdata);
}

function loadUserData(id){
    var userdata = loadStorage(id,"_user_data");
    return JSON.parse(userdata);
}

//guardar usuario actual en el userArray
function saveStorageCurrentUserList(id) 
{
    _userArray = $.jStorage.get("userArray"); 
    if(_userArray === null){ //se crea con el 1er login
        var ArrayData = [id];//el usuario actual
        $.jStorage.set("userArray", JSON.stringify(ArrayData));
    } else { //se agrega a las lista de usuarios que ya iniciaron sesión
       var storedData = $.jStorage.get("userArray");
       ArrayData = JSON.parse(storedData);
       isExist = jQuery.inArray( id , ArrayData );
       if(isExist === -1){ //no exist
           ArrayData.push( id );
           $.jStorage.set("userArray", JSON.stringify(ArrayData));
       } 
    }
}

function isTestMode(jsonConfigData){
	return jsonConfigData === null || (jsonConfigData.id === -1 && jsonConfigData.shelf === -1); 
}

//mostrar usuarios en el userArray
function loadStorageUserList() 
{
    _userArray = $.jStorage.get("userArray"); 
    if(_userArray === null){ //no existe la Lista
        alert("No hay usuarios en la Lista");
        return false;
    } else { //se muestran
       var storedData = $.jStorage.get("userArray");
       ArrayData = JSON.parse(storedData);
       return ArrayData; 
    }    
}

function saveLanguagesList(selector){
    $.jStorage.set("lang_list", selector);
}

function getLanguagesList(){
    return $.jStorage.get("lang_list");
}

//add progress for player, and create new if it doesn't exist

//player progress {"playerId":93,"achievements":[1040,1041,1031,1106],"gameflowProgress":[{"gameflowStepId":660,"completionPercentage":100,"gameData":{"stars":"4","points":"140"}},{"gameflowStepId":661,"completionPercentage":80,"gameData":{"goldcoins":"660","silvercoins":"343"}},{"gameflowStepId":663,"completionPercentage":60,"gameData":{"coins":"5","speed":"1400","lastpicture":"duck"}}]}
//step progress {"gameflowStepId":660,"completionPercentage":100,"gameData":{"stars":"4","points":"140"}}
function addStepProgress(playerId, stepId, progress)
{
    if (playerId === null) playerId = -1;
    if (stepId === null ) stepId = -1;
    var playerProgress = $.jStorage.get(playerId + '_step_progress');
    //create new progress if it doesn't exists yet
    if (playerProgress === null || playerProgress === undefined) {
        playerProgress = {'playerId': playerId, 'achievements': new Array(), 'stepsData': new Array()};
    }
    //add or replace progress
    var gameflowProgress = playerProgress.stepsData;

    var stepProgress = getStepProgress(playerId, stepId);
    if (stepProgress === null)
        gameflowProgress.push(progress);
    else {
        for (var i = 0; i < gameflowProgress.length; i++) {
            if (gameflowProgress[i].stepId === stepId) {
                gameflowProgress[i] = progress;
            }
        }
    }

    //save new values
    playerProgress.stepsData = gameflowProgress;
    $.jStorage.set(playerId + '_step_progress', playerProgress);
}

function getStepProgress(playerId, stepId) {
    var playerProgress = $.jStorage.get(playerId + '_step_progress');
    if ( playerProgress === null ) return null;
    var gameflowProgress = playerProgress.stepsData;
    for (var i = 0; i < gameflowProgress.length; i++) {
        
        if (gameflowProgress[i].stepId === stepId) {
            return gameflowProgress[i];
        }
    }
    return null;
}


function saveMetrics( data, stepId, playerId ) {
    $.jStorage.set(playerId + '_' + stepId + '_metrics', data);
}

function getMetrics( stepId, playerId ) {
    return $.jStorage.get(playerId + '_' + stepId + '_metrics');
}

function saveStepData(stepData){
    saveStorage(loadStorageCurrentUser(),"_currentStep",stepData);
}

function loadStepData(){
    var stepData = loadStorage(loadStorageCurrentUser(),"_currentStep");
    cleanStorage(loadStorageCurrentUser(), "_currentStep");
    if (stepData==="TestMode"){
        return stepData;
    }            
    if (stepData===null || stepData===undefined){
        return null;
    }
    if (location.href.indexOf("/"+stepData.gameName+stepData.gameVersion+"/")!==-1){
        //i'm in correct game
        
        return stepData;
    }    
    return null;
}