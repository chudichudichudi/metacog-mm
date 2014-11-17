/* 

 * 
 */
Progress = function () {};

Progress.progress = null;
Progress.progressInit = false;
Progress.playerProgress = null;
Progress.timeoutCallback = null;
Progress.timeLimit = null;
Progress.startTime = 0;
Progress.currentTime = 0;
Progress.timePlayed = 0;

//////////////////////////////////////////////////////// GAME PROGRESS SECTION
Progress.init = function() {
    Progress.progress = getStepProgress(MateMarote.playerId, MateMarote.gameId);;
    Progress.currentTime = new Date();
    Progress.startTime = Progress.currentTime.getTime();
    
    if (Progress.progress === null) {
        console.log("[Progress] Progress not found [playerId:" + MateMarote.playerId + ", gameId:" + MateMarote.gameId + "]");
        Progress.progress = {
            gameData: {
                sessions_played_total: 0, //
                sessions_played_daily: 0, //
                trials_played_total: 0, //
                minutes_played_total: 0, //
                trials_won_total: 0, //
                last_session_days: 0, //
                completion_percentage: 0, //
                completed: false, //
                lastPlayed: Progress.currentTime.getTime(), //
                sessions_played_today: 0, //
                current_checkpoint: "", //
                current_trial: "" //
            },
            stepId: MateMarote.gameId
        };
    } else {
        console.log("[Progress] Progress loaded.");
    }
    //time limit
    var stepDeps = MateMarote.gameData.dependencies;
    if (stepDeps!==null){
    	for (var depKey in stepDeps) {    		
            if (depKey.indexOf("DEP")!==-1 && !stepDeps[depKey].parent && stepDeps[depKey].depId==="MINUTES_PLAYED_TOTAL"){
                    Progress.timeLimit = parseFloat(stepDeps[depKey].val);
            }
    	}
    }
    //    
    console.log("[Progress] %o",Progress.progress);
    Progress.progress.gameData.last_session_days = Progress.currentTime.getTime() - Progress.progress.gameData.lastPlayed;
    var lastPlayed = new Date(Progress.progress.gameData.lastPlayed);
    if (Progress.currentTime.getDay() !== lastPlayed.getDay()) {
        Progress.progress.gameData.sessions_played_today = 0;
    }
    Progress.progress.gameData.lastPlayed = Progress.currentTime.getTime();
    Progress.progressInit = true;
};
Progress.gameStarted = function() {
    Progress.tick();
    Metrics.addData("progress","gameStarted","gameStarted");
    Progress.progress.gameData.sessions_played_today++;
    Progress.progress.gameData.sessions_played_total++;
    if (Progress.progress.gameData.sessions_played_today > Progress.progress.gameData.sessions_played_daily) {
        Progress.progress.gameData.sessions_played_daily = Progress.progress.gameData.sessions_played_today;
    }
};
Progress.tick = function() {    
    var currentTime = Progress.currentTime.getTime();
    Progress.timePlayed = currentTime - Progress.startTime;
    
    if (Progress.timeLimit !== null && 
    	Progress.progress.gameData.minutes_played_total>=Progress.timeLimit){
	Progress.timeoutCallback();
    }
    //Metrics.addData("progress","minutePlayed",Progress.progress.gameData.minutes_played_total);
};

Progress.nextTrial = function () {
    // override me.
};

Progress.trialPlay = function() {
    Progress.tick();
    Metrics.addData("progress","trialPlay","trialPlay");
    Progress.progress.gameData.trials_played_total++;
};
Progress.trialWon = function() {
    Progress.tick();
    Metrics.addData("progress","trialWon","trialWon");
    Progress.progress.gameData.trials_won_total++;
    if (Progress.nextTrial !== null) {
        return Progress.getTrial(Progress.nextTrial(1));
    }
};
Progress.trialLost = function() {
    Progress.tick();
    Metrics.addData("progress","trialLost","trialLost");
    if (Progress.nextTrial !== null) {
        return Progress.getTrial(Progress.nextTrial(0));
    }
};

Progress.gameEnded = function () {
    Progress.tick();
    Metrics.addData("progress","gameEnded","gameEnded");
};

// if you dont want to get a new trial after winning or losing a game just pass null or ""
Progress.getTrial = function(trialName) {
    if ( trialName === null || trialName === "") {
        return null;
    }
    var trial = MateMarote.gameData.stepConfig[trialName];
    if ( trial === undefined) {
        alert('Trial: "'+trialName+'" cant be found in the config.');
        trial = null;
    }
    if ( typeof trial === "string") {
        trial = JSON.parse(trial);
    }
    Progress.progress.gameData.current_trial = trialName;
    return trial;
};

Progress.completion = function(comp) {
    console.log("[Progress]: Completion %" + Math.floor(comp));
    if (comp > 100) {
        Progress.progress.gameData.completion_percentage = 100;
    }
    if (Progress.progress.gameData.completion_percentage < comp) {
        Progress.progress.gameData.completion_percentage = comp;
    }
    if (comp >= 100) {
        Progress.progress.gameData.completed = true;
    }
    Metrics.addData("progress","completion",Progress.progress.gameData.completion_percentage);
    Progress.tick();
};
Progress.synchronize = function() {
    Progress.tick();
    var minutes = new Date( Progress.timePlayed);
    minutes = minutes.getMinutes();
    Progress.progress.gameData.minutes_played_total += minutes;

    addStepProgress(MateMarote.playerId, MateMarote.gameId, Progress.progress);
    Progress.playerProgress = $.jStorage.get(MateMarote.playerId + '_step_progress');
    console.log("[Progress] %o", Progress.playerProgress);
    ///
    var url = server + 'services/user/synch/save';
    var config = MateMarote.gameData;
    if (isTestMode(config)) {
        console.log("[Progress] Cancelled upload by TestMode.");
        return;
    }

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
        data: JSON.stringify(Progress.playerProgress),
        beforeSend: Progress.sendProgress,
        success: Progress.progressResponse,
        timeout: 15000,
        error: Progress.progressError,
        statusCode: {
            200: function() {

            }
        }
    });
};
Progress.progressError = function(e) {
    var error  = e.status + " - " + e.statusText;
    console.log("[Progress] Error sending progress to server: %s",error);
};
Progress.sendProgress = function() {
    console.log("[Progress] Sending progress to server...");
};
//               
Progress.progressResponse = function(validationResponse) {
    if (validationResponse.valid) {
        console.log("[Progress] Progress recieved by server");
        //saveProgress(null, MateMarote.playerId, MateMarote.gameId);
    } else {
        console.error("[Progress] Progress is not valid, blame server admin");
    }
};

