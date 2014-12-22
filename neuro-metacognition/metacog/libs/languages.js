currentLanguage = loadStorage(loadStorageCurrentUser(), "_currentLanguage");

if (currentLanguage===null) {    
    currentLanguage="en";
    if (loadStorageCurrentUser()!==null)
        saveStorage(loadStorageCurrentUser(), "_currentLanguage", currentLanguage);
}

//Mensajes por idioma
function loadLanguageMessages(localeTag){
    //console.log("loadLanguageMessages: " + localeTag);
       $.ajax({
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            url:   server + 'services/languages/messages',
            type:  'POST',
            async: false,
            dataType : 'json',
            data: JSON.stringify({"locale": localeTag,"section":"services"}),
            cache: false, 
            success: loadLanguageMessagesOK,
            timeout:15000,
            statusCode: {
                404: function() {
                  console.log("error 404");
                },
                400: function() {
                  console.log("error 400");
                }
            }
        });
   }
//
function loadLanguageMessagesOK(datos){
    $.each(datos, function (index, value) {
         saveStorageMessages(currentLanguageTemp, value.code, value.message);                
    });
}             

//Language 
function loadLanguage(){
       $.ajax({
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            url:   server + 'services/languages/available',
            type:  'POST',
            async: true,
            dataType : 'json',
            cache: false, 
            success: loadLanguageOK,
            timeout:15000,
            statusCode: {
                404: function() {
                  console.log("error 404");
                },
                400: function() {
                  console.log("error 400");
                }
            }
        });
   }
   
 //[{"id":3,"languageName":"English","image":"en-flag.jpg","localeTag":"en","enabled":true},
 //{"id":5,"languageName":"Castellano","image":"sp-flag.jpg","localeTag":"es","enabled":true}] 
function loadLanguageOK(datos){
    //set language    
    idUser = loadStorageCurrentUser();
    currentLanguage = loadStorage(idUser, "_currentLanguage");
    if (currentLanguage===null) {
        //default language = en
        currentLanguage="en";
        saveStorage(idUser, "_currentLanguage", currentLanguage);
        
    }    
    var languageSelector = "";
     $.each(datos, function (index, value) {
         if(value.enabled){
            languageSelector += "<a class=\"bandera\" href=\"#\" id=\"" + value.localeTag + "\">" + value.localeTag + "</a>&nbsp;";
            //llamada por los idiomas definidos
            currentLanguageTemp = value.localeTag;
            loadLanguageMessages(value.localeTag);
        }
      });
     saveLanguagesList(languageSelector);
     initPageMessages(false);
}

function initPageMessages(){ 
    setLanguageSelector();
    resolveBannerLinks();
    $(".language").each(function() {
        if ($(this).attr("class").indexOf("btn") !== -1){
            $(this).val(loadStorageMessages(currentLanguage, $(this).attr("data-language")));    
        } else {
            $(this).html(loadStorageMessages(currentLanguage, $(this).attr("data-language")));    
        }        
    });
}

function resolveBannerLinks(){
    
	$("#registerItem").hide();
	$("#loginItem").hide();
	$("#gameflowItem").show();
	$("#gameflowItem").css("color","#0245A5");
	$("#homeItem").show();
	$("#logoutItem").show();
    
	var myURL = window.location.href.toString().split(window.location.host)[1];
    var tempIsGame = myURL.indexOf("games");
    if( tempIsGame > 0 ){
        $("#languageSelector").hide();
    }
}

function setLanguageSelector(){
    var languageSelector = getLanguagesList();
    $("#languageSelector").html(languageSelector);
    $(".bandera").click( function() {
        currentLanguage = $(this).attr('id');
        //currentLanguage al localStorage
        var idUser = loadStorageCurrentUser();
        if (idUser!==null){
            saveStorage(idUser, "_currentLanguage", currentLanguage);
            var userData = loadUserData(idUser);
            userData.playerData.locale = currentLanguage;
            saveUserData(idUser,userData);
            changeLanguage(currentLanguage,idUser);
        }
        initPageMessages();
     });
}

function setBanner(){
    $("#logoutItem").attr("href", server + "j_spring_security_logout");
    $("#logoutItem").click(function(e) {
        cleanCurrentUser();
      });
    _id= loadStorageCurrentUser();
    
    var playerId= loadStorageCurrentUser();
    var login = loadStorage(playerId,"_loginData");
    if (login!==null){
        $("#gameflowItem").attr("href", serverFront+login.playerHome);
    }
    if(login!==null && login.isAdmin) {
        $("#adminItem").attr("href", login.adminHome);
        $("#adminItem").show();
    } else {
        $("#adminItem").hide();
    }    
    $("#profileItem").attr("href", serverFront+"form_profile.html");
    $("#homeItem").attr("href", serverFront+login.playerHome);
    $("#homeItemLogo").attr("href", serverFront+login.playerHome);
      
    initPageMessages();
}

function changeLanguage(localeTag,userId){
    //console.log("loadLanguageMessages: " + localeTag);
       $.ajax({
            headers: { 
                'Accept': 'application/json',
                'Content-Type': 'application/json' 
            },
            url:   server + 'services/languages/change',
            type:  'POST',
            async: false,
            dataType : 'json',
            data: JSON.stringify({"new_locale": localeTag,"playerId":userId}),
            cache: false, 
            timeout:15000,
            statusCode: {
                404: function() {
                  console.log("error 404");
                },
                400: function() {
                  console.log("error 400");
                }
            }
        });
   }
