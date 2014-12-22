/* 
 * MateMarote API
 * @Author: Patricio Guerra
 */
MateMarote = function() {  
};

MateMarote.gameData = null;
MateMarote.playerId = null;
MateMarote.gameId = null;
MateMarote.gameName = null;
MateMarote.currentLang = "";
MateMarote.instructionsLimit = -1;

/*
 * Initializes the API, this must be called before preloading assets or initializing the game.
 * @callback[function]: This function is called when the instruction closes
 */
MateMarote.init = function(){
    console.log("[Initializing MateMarote API]");
    
    //MateMarote.gameData contains all the config data of the selected game.
    MateMarote.gameData = loadStepData();
    
    if (offline) {
        MateMarote.gameData = "TestMode";
    }
    
    if (MateMarote.gameData === null){
        //serverFront is defined in statusApp.js
        //window.location.href = serverFront + "gameflow.html";
        return;
    }

    if (MateMarote.gameData.hasOwnProperty("stepConfig")) {
        $.each(MateMarote.gameData.stepConfig, function(key,value) {
            MateMarote.gameData.stepConfig[key] = JSON.parse(value);
        });
    }
    
    MateMarote.playerId = loadStorageCurrentUser(); // id of the player
    MateMarote.gameId = MateMarote.gameData.id; // id of the game
    MateMarote.currentLang = loadStorage(MateMarote.playerId, "_currentLanguage"); // en, es
    
    //initializes progress
    Progress.init();
    Progress.gameStarted();
    
    if (MateMarote.playerId === null)
        MateMarote.playerId = -1;
    if (MateMarote.gameId === null)
        MateMarote.gameId = -1;
    
    // initializes timers.
    GlobalTime.initialize();
    MateMarote.checkInstructions();
    
};

MateMarote.instructionsClosed = function () {
    // override me.
};

MateMarote.checkInstructions = function () {
    var current_protocol = window.location.protocol; //http: or https:
    //check game config for existent instructions
    console.log("[MateMarote] Checking instructions");
    if ( !MateMarote.gameData.stepConfig ) {
        console.error("[MateMarote] There is no stepConfig loaded therefore no instructions");
        return;
    }
    var instructions = MateMarote.gameData.stepConfig.instructions;
    var has_content = false;
        if ( instructions ) {
                if (typeof instructions === "string") {
            instructions = JSON.parse(instructions);
        }
        if (typeof instructions.limit === "number") {
            if ( instructions.limit === 0 ) return;
            if ( instructions.limit !== -1 ){
                if ( instructions.limit < Progress.progress.gameData.sessions_played_total ) return;
            }
        } else {
            console.error("[Instructions] Limit object must be int.");
        }
        if ( instructions.content ) {
            // get all content from instructions
            for ( var i = 0; i < instructions.content.length ; i++ ) {
                var content_object = instructions[instructions.content[i]];
                console.log("[Instructions] %o",content_object);
                if ( !content_object ) {
                    console.log("[MateMarote] The instruction: "+instructions.content[i]+" has not been declared.");
                } else {
                    // check if the content has the apropiate data structure
                    if (! content_object.type) {
                        console.log("[MateMarote] The instruction: "+instructions.content[i]+" has no type.");
                    } else {
                        if ( content_object.type === "text") {
                            if ( content_object.code ) {
                                $("<p>"+MateMarote.getLocaleString(content_object.code)+"</p>").appendTo($("#instructionsBody"));
                            } else if ( content_object.text ) {
                                $("<p>"+content_object.text+"</p>").appendTo($("#instructionsBody"));
                            }
                        }
                        if ( content_object.type === "link") {
                            var localized_text = "";
                            if ( content_object.code ) {
                               localized_text = MateMarote.getLocaleString(content_object.code);
                            } else if ( content_object.text ) {
                               localized_text = content_object.text;
                            }
                            var text_link = "<a href=\""+content_object.url+"\" target='_blank'>"+localized_text+"</a>";
                            $(text_link).appendTo($("#instructionsBody"));
                        }
                        if ( content_object.type === "img") {
                            var new_url = current_protocol+"//"+content_object.url;
                            $("<img src=\""+new_url+"\">").appendTo($("#instructionsBody"));
                        }
                        if ( content_object.type === "video") {
                            var new_url = current_protocol+"//"+content_object.url;
                            $('<iframe width="420" height="315" src="'+new_url+'" frameborder="0" allowfullscreen></iframe>').appendTo($("#instructionsBody"));
                        }
                        has_content = true;
                    }
                }
            }
        } else {
            console.error("[MateMarote] Instructions content must be declared.");
        }
    }
    if (has_content === true) {
        $("#instructionsDialog").show();
        $("#crossButton").click(function() {
            $("#instructionsDialog").hide();
            MateMarote.instructionsClosed();
        });
        $("#closeButton").click(function() {
            $("#instructionsDialog").hide();
            MateMarote.instructionsClosed();
        });
    }

};
/*
 * Redirects to gameflow url.
 */
MateMarote.returnToGameflow = function () {
    //serverFront is defined in statusApp.js
    if (!fromMobile()) {
        window.location.href = serverFront + "gameflow.html";
    } else {
        window.location.href = serverFront + "gameflow_mobile.html";
    }
};

/*
 * Gets a string defined by language in locale files.
 * @key: Key of the string, must match the one defined in locale files. Ex: "Game.example.text".
 */
MateMarote.getLocaleString = function (key) {
    var msgFound = false;
    var response = key;
    if (MateMarote.gameData.i18nMessages !== undefined) // localhost wont have i18nMessages
    {
        for (var i = 0; i < MateMarote.gameData.i18nMessages.length; i++ ){
            //compare current language with the language tag of the string
            if ( MateMarote.gameData.i18nMessages[i].localeTag.indexOf(MateMarote.currentLang) >= 0) {
                // compare keys 
                if ( MateMarote.gameData.i18nMessages[i].code === key){
                    msgFound = true;
                    response = MateMarote.gameData.i18nMessages[i].message;
                }
            }
        }
    }
    if (!msgFound){
        console.log('[MateMarote] Locale string "'+key+'" Not found.');
    }
    return response;
};

/*
 * This function sends all (current and stored) progress and metrics data to the server.
 * If player is offline all the data is stored in local storage.
 */
MateMarote.synchronize = function () {
    console.log("[MateMarote] Synchronizing...");
    Progress.synchronize();
    Metrics.synchronize();
};
