function Locale() {
    this.currentLanguageTemp = null;
    this.currentUser = "";
    this.currentGame = "";
    this.currentLang = "";
    this.defaultLang = "en";
    this.callbackAfterLoad = null;
}

//Mensajes por idioma
Locale.loadLanguageMessages = function(localeTag, gameName) {
    //console.log("loadLanguageMessages: " + localeTag);
    $.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: server + 'services/languages/messages',
        type: 'POST',
        async: false,
        dataType: 'json',
        data: JSON.stringify({"locale": localeTag, "section": gameName}),
        cache: false,
        success: Locale.loadLanguageMessagesOK,
        timeout: 15000,
        statusCode: {
            404: function() {
                console.log("error 404");
            },
            400: function() {
                console.log("error 400");
            }
        }
    });
};

Locale.getString = function (key) {
    var msgFound = false;
    var response = "";
    if (MateMarote.gameData.i18nMessages === undefined) return key; // offline mode catch
    for (var i = 0; i < MateMarote.gameData.i18nMessages.length; i++ ){
        if ( MateMarote.gameData.i18nMessages[i].localeTag.indexOf(Locale.currentLang) >= 0) {
            if ( MateMarote.gameData.i18nMessages[i].code === key){
                msgFound = true;
                response = MateMarote.gameData.i18nMessages[i].message;
            }
        }
    }
    if (!msgFound){
        console.error("Mensaje no econtrado: "+key);
    }
    /*var s = loadStorageMessages(Locale.currentLang, key);
    if ( s === null || s === undefined) s = key;*/
    return response;
};
//
Locale.loadLanguageMessagesOK = function(datos) {
    $.each(datos, function(index, value) {
        saveStorageMessages(Locale.currentLanguageTemp, value.code, value.message);
    });
};

//DEPRECATED DONT USE
Locale.loadLanguage = function(callback) {
    // DEPRECATED, DONT USE
    callback();
    Locale.currentUser = loadStorageCurrentUser();
    Locale.currentLang = loadStorage(Locale.currentUser, "_currentLanguage");
    if (Locale.currentLang === null) {
        Locale.currentLang = Locale.defaultLang;
        saveStorage(Locale.currentUser, "_currentLanguage", Locale.currentLang);
    }
    return;
    Locale.callbackAfterLoad = callback;
    $.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: server + 'services/languages/available',
        type: 'POST',
        async: true,
        dataType: 'json',
        cache: false,
        success: Locale.loadLanguageOK,
        timeout: 15000,
        statusCode: {
            404: function() {
                console.log("error 404");
            },
            400: function() {
                console.log("error 400");
            }
        }
    });
};

//[{"id":3,"languageName":"English","image":"en-flag.jpg","localeTag":"en","enabled":true},
//{"id":5,"languageName":"Castellano","image":"sp-flag.jpg","localeTag":"es","enabled":true}] 
Locale.loadLanguageOK = function(datos) {
    //set language    
    console.log (datos);
    Locale.currentUser = loadStorageCurrentUser();
    Locale.currentLang = loadStorage(Locale.currentUser, "_currentLanguage");
    if (Locale.currentLang === null) {
        //default language = en
        Locale.currentLang = Locale.defaultLang;
        saveStorage(Locale.currentUser, "_currentLanguage", Locale.currentLang);

    }
    $.each(datos, function(index, value) {
        Locale.currentLanguageTemp = value.localeTag;
        console.log("Enviando: " +value.localeTag +", "+MateMarote.gameName);
        Locale.loadLanguageMessages(value.localeTag,MateMarote.gameName);
    });
    Locale.callbackAfterLoad();
};
