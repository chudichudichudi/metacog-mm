
function Metrics() {};

Metrics.currentMetrics = {};
Metrics.fullMetrics = null;
Metrics.savedMetrics = null;

//////////////////////////////////////////////////////// GAME METRICS SECTION
// Metrics.currentMetrics = [timeStamp,{ "tagName": { "eventName":(timeStamp,data) } }]

Metrics.addData = function(tagName, eventName, data) {
        
    var tag = null;
    var event = null;
    // Get existent tags of same name
    if ( Metrics.currentMetrics[tagName] !== null && Metrics.currentMetrics[tagName] !== undefined ) {
        tag = Metrics.currentMetrics[tagName];
    } else {
        tag = {};
    }
    // Get existent events of same name
    if ( tag[eventName] !== null && tag[eventName] !== undefined ) {
        event = tag[eventName];
    } else {
        event = new Array();
    }
    var metric = null;
    var date = new Date();
    
    if (data !== null) {
        metric = new Array();
        metric.push( date.getTime() );
        metric.push( data );
    } else {
        metric = date.getTime();
    }
    
    //console.log("Uncompressed: "+metric+"");
    // COMPRESS STRING INTO UTF-16
    //metric = LZString.compress(metric+"");
    /*console.log("Compressed: "+metric);
    metric = LZString.decompress(metric);
    console.log("Decompressed: "+metric);*/
    
    
    event.push(metric); // push metric into event
    tag[eventName] = event; // store event into tag
    Metrics.currentMetrics[tagName] = tag; // store tag into currentMetrics
        
};

// "measurements": [ {"savedMetricTimestamp": Date().getTime() , "metrics": Metrics.currentMetrics }, ... ]
// this function is called by Synchronize for preventing data loss in offline mode.
Metrics.saveMetrics = function() {
    var savedMetrics = getMetrics(MateMarote.playerId, MateMarote.gameId);
    if (savedMetrics === null || savedMetrics === undefined) {
        savedMetrics = new Array();
    }
    var date = new Date();
    var currentMetrics = {"saveTimestamp": date.getTime(), "metrics":Metrics.currentMetrics};
    savedMetrics.push(currentMetrics);
    saveMetrics(savedMetrics, MateMarote.playerId, MateMarote.gameId);
    
    console.log("[Metrics] Metrics saved.");

};

Metrics.synchronize = function() {
    Metrics.saveMetrics();

    var url = server + 'services/user/metrics/save';
    var config = MateMarote.gameData;
    if (isTestMode(config)) {
        url += "/" + config.gameName + "/" + config.gameVersion + "/" + config.level;
    }

    var savedMetrics = getMetrics(MateMarote.playerId, MateMarote.gameId);
    if ( savedMetrics === null) {
        savedMetrics = Metrics.fullMetrics;
    }

   /* var date = new Date();
    var sendData = {"playerId": MateMarote.playerId, "gameflowStepId": MateMarote.gameId, "userSynchDate":date.getTime(), "measurements": savedMetrics};
    
    var totalUncompressed = JSON.stringify(sendData).length;
    */
    /*for ( var i = 0; i < savedMetrics.length ; i++){
        for (var tag in savedMetrics[i].metrics) {
            var value = savedMetrics[i].metrics[tag];
            //var leng = JSON.stringify(value).length;

            savedMetrics[i].metrics[tag] = LZString.compressToBase64(JSON.stringify(value));
            //var leng2 = savedMetrics[i].metrics[tag].length;
            //var compression = 100 - ((savedMetrics[i].metrics[tag].length*100)/leng);
            //console.log("Data Compressed "+compression+"% - ["+leng+"/"+leng2+"]");
        }
    }*/

    var date = new Date();
    var sendData = {"playerId": MateMarote.playerId, "gameflowStepId": MateMarote.gameId, "userSynchDate":date.getTime(), "measurements": savedMetrics};
    /*var totalCompressed = JSON.stringify(sendData).length;
    
    console.log(totalUncompressed+"/"+totalCompressed);
    console.log("Total Compression ratio: "+ (100 - ((totalCompressed*100)/totalUncompressed)));*/
    
    console.log("[Metrics] %o", sendData);
    
    sendData = JSON.stringify(sendData);
    
    $.ajax({
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        url: url,
        type: 'POST',
        async: true,
        dataType: 'json',
        cache: false,
        data: sendData,
        beforeSend: Metrics.sendingMetrics,
        timeout: 15000,
        error: Metrics.serverError,
        statusCode: {
            204: function() {
                //console.log("200");
                //console.log(newData);
            }
        }
    });
};

Metrics.serverError = function(e) {
    var error = e.status + " - " + e.statusText;
    console.error("[Metrics] Error sending metrics: %s",error);
    //console.log(e);
};
Metrics.sendingMetrics = function() {
    console.log("[Metrics] Sending metrics to server...");
};
//               
Metrics.serverResponse = function(validationResponse) {
    if (validationResponse.valid) {
        console.log("[Metrics] Metrics recieved by server");
        saveMetrics(null, MateMarote.playerId, MateMarote.gameId);
        console.log("[Metrics] saved Metrics have been deleted");
    } else {
        console.error("[Metrics] Metrics are not valid, blame the server admin");
    }
};