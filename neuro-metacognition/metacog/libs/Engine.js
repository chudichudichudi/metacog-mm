/*global buildGameConfig, buildObjectManifest, objectConstructors, STATUS, Semaphore, Progress */
/*global MateMarote, Preloader, fromMobile, JSON, createjs */
/*global $, jQuery, stage:true, subStage:true, overStage:true, stageWidth:true, stageHeight:true, console */
/*exported buildObjects, addAllToSubStage, addMetrics, setProperties, gameInit */
"use strict";

// aux function 

function isTypeOf(obj, type) {
  var result = false;

  if (obj !== undefined) {

    result = obj.constructor.toString().indexOf(type) > -1;
  }
  return result;
}

function setProperties(instance, parameters) {

  if (parameters !== undefined) {

    $.each(parameters, function (key, value) {
      instance[key] = value;
    });
  }
}

/**
* class Engine
* @param {plainObject} testModeConfig
* @param {function} startGame
* @param {bool} [firstScreen]
*/

function Engine(testModeConfig, startGame, firstScreen) {
  this.initialize(testModeConfig, startGame, firstScreen);
}

Engine.prototype.initialize = function (testModeConfig, startGame, firstScreen) {
  var mobile, firstNumber, secondNumber;

  // keeping objectManifest
  this.startGame = startGame;
  this.objectsManifest = {};
  this.globalObjects = {};
  this.trialObjects = {};

  var barrier = { preloader: false, instructions: false };
  var pBarrier = new Semaphore(1);

  var myCanvas = $("#stageCanvas").get(0);

  function waitToStart(caller) {

    function criticalZone() {
      if (caller === "preloader") {
        barrier.preloader = true;
      } else if (caller === "instructions") {
        barrier.instructions = true;
      }

      if (barrier.preloader && barrier.instructions) {
        startGame();
      }

      // get out from critical zone
      pBarrier.signal();
    }

    // get in to the critical zone
    pBarrier.wait(criticalZone);
  }

  function addAllToPreloader(preloadObj) {
    var iterator, start, end;

    $.each(preloadObj, function (key, value) {
      if (isTypeOf(value, "String")) {

        Preloader.add(key, value);
      } else {

        start     = value.indexes[0];
        end       = value.indexes[1];
        for (iterator = start; iterator <= end; ++iterator) {
          Preloader.add(key + iterator, value.prefix + iterator + value.extension);
        }
      }
    });
  }

  MateMarote.instructionsClosed = firstScreen ? function () {
    console.log("[Engine] Runing in FirstScreen mode");
  } : waitToStart.bind(this, "instructions");

  MateMarote.init();
  stage     = new createjs.Stage(myCanvas);
  subStage  = new createjs.Container();
  createjs.Touch.enable(stage);

  mobile = fromMobile();
  // Autoscaling procedure
  if (mobile) {

    stageWidth    = 800;
    stageHeight   = 450;
    firstNumber   = 9;
    secondNumber  = 16;
  } else {

    stageWidth    = 800;
    stageHeight   = 600;
    firstNumber   = 3;
    secondNumber  = 4;
  }

  subStage.scaleX = myCanvas.width / stageWidth;
  subStage.scaleY = myCanvas.height / stageHeight;

  if (subStage.scaleX < subStage.scaleY) {

    subStage.scaleY = subStage.scaleX;
    myCanvas.height = (myCanvas.width * firstNumber) / secondNumber;
  } else if (subStage.scaleX > subStage.scaleY) {

    subStage.scaleX = subStage.scaleY;
    myCanvas.width  = (myCanvas.height * secondNumber) / firstNumber;
  }

  overStage         = new createjs.Container();
  overStage.scaleX  = subStage.scaleX;
  overStage.scaleY  = subStage.scaleY;
  stage.addChild(overStage);
  stage.addChild(subStage);


  Preloader.init(stage, subStage);

  // if is TestMode it must load the gameConfig from GC object in GameConfig.js
  if (MateMarote.gameData === "TestMode") {

    console.log("[Engine] Runing in TestMode");

    MateMarote.gameData = { stepConfig: testModeConfig };
    MateMarote.checkInstructions();
  }

  // Parsing stepData (this is to have compatibility whit olds APIs versions)
  $.each(MateMarote.gameData.stepConfig, function (key, value) {
    if (typeof value === "string") {
      MateMarote.gameData.stepConfig[key] = JSON.parse(value);
    }
  });

  addAllToPreloader(MateMarote.gameData.stepConfig.preload);

  if (firstScreen) {

    Preloader.start(startGame);

  } else {

    // if there isn't instructions to show. I set like instructions already showed 
    var instructions = MateMarote.gameData.stepConfig.instructions;
    if (instructions) {

      if (typeof instructions === "string") {
        instructions = JSON.parse(instructions);
      }

      if (typeof instructions.limit === "number") {

        if (instructions.limit === 0) {
          barrier.instructions = true;
        }
        if (instructions.limit !== -1) {
          if (instructions.limit < Progress.progress.gameData.sessions_played_total) {
            barrier.instructions = true;
          }
        }
      }
    } else {

      barrier.instructions = true;
    }

    Preloader.start(waitToStart.bind(this, "preloader"));
  }
};

Engine.prototype.addObjectManifest = function (objectsManifest) {

  $.extend(this.objectsManifest, objectsManifest);
};

Engine.prototype.addAllToSubStage = function (global) {
  var objectsList = [];
  var iterator;
  var cantObjects;
  var result;
  var wantTobeAdded;
  var correctNameSpace;
  var nameSpace;
  var compare = function (a, b) {

    // undefined zIndex are the biger positions
    if ((a.zIndex !== undefined) && (b.zIndex !== undefined)) {

      if (b.zIndex < a.zIndex) {
        result = 1;
      } else if (b.zIndex === a.zIndex) {
        result = 0;
      } else {
        result = -1;
      }

    } else if ((b.zIndex === undefined)) {
      result = -1;
    } else {
      result = 1;
    }

    return result;
  };

  this.trialConfig = this.trialConfig || {};

  nameSpace = global ? this.globalObjects : this.trialObjects;

  $.each(this.objectsManifest, function (key, value) {

    correctNameSpace = global ? (value.global === true) : (value.global !== true);
    wantTobeAdded = value.hasOwnProperty("addToStage") ? value.addToStage : true;
    if (wantTobeAdded && correctNameSpace) {
      objectsList.push({key: key, zIndex: value.zIndex});
    }
  });

  if (this.trialConfig.hasOwnProperty("trialObjects") && !global) {

    $.each(this.trialConfig.trialObjects, function (key, value) {

      objectsList.push({key: key, zIndex: value.zIndex});
    });
  }

  objectsList.sort(compare);

  cantObjects = objectsList.length;
  for (iterator = 0; iterator < cantObjects; ++iterator) {
    subStage.addChild(nameSpace[objectsList[iterator].key]);
    console.log("[Template] object added " + objectsList[iterator].key);
  }
};

Engine.prototype.build = function (objectsManifest, objects) {
  var member;
  var queu = [];
  var key;
  var currentObject;

  // deleting old objects
  for (member in objects) {
    if (objects.hasOwnProperty(member)) {
      delete objects[member];
    }
  }

  // puting all objects in the creation queu
  $.each(objectsManifest, function (key) {
    queu.push(key);
  });

  // creating object
  while (queu.length > 0) {
    key = queu.shift();
    currentObject = objectsManifest[key];

    // if the object has all dependencies ready or hi hasn't dependencies the object is created
    // if there is some dependencies that need to be created before, the object isn't created and is returned to the queu whaiting for his dependencies
    if (this.dependenciesReady(key)) {

      if (isTypeOf(currentObject.constructor, "String")) {

        objects[key] = new objectConstructors[currentObject.constructor](currentObject.parameters);
      } else {

        objects[key] = new currentObject.constructor(currentObject.parameters);
      }
      console.log("[Template] object created " + key);
    } else {
      console.log("[Template] Dependencies not ready for " + key);
      queu.push(key);
    }
  }

  return objects;
};

Engine.prototype.buildTrialObjects = function () {
  var objectsToBuild = {};
  var isGlobal;
  var trialConfig = this.trialConfig;

  this.trialConfig = this.trialConfig || {};

  // obtaining the objects to build
  $.each(this.objectsManifest, function (key, value) {
    isGlobal = value.hasOwnProperty("global") ? value.global : false;

    if (!isGlobal) {
      objectsToBuild[key] = $.extend({}, value);

      // ading trial configuration
      if (trialConfig.hasOwnProperty(key)) {

        $.extend(objectsToBuild[key].parameters, trialConfig[key]);
      }
    }
  });

  if (this.trialConfig.hasOwnProperty("trialObjects")) {
    $.each(this.trialConfig.trialObjects, function (key, value) {
      objectsToBuild[key] = $.extend({}, value);
    });
  }

  return this.build(objectsToBuild, this.trialObjects);
};

Engine.prototype.buildGlobalObjects = function () {
  var objectsToBuild    = {};
  var isGlobal;

  // obtaining the objects to build
  $.each(this.objectsManifest, function (key, value) {
    isGlobal = value.hasOwnProperty("global") ? value.global : false;

    if (isGlobal) {
      objectsToBuild[key] = $.extend({}, value);
    }
  });

  return this.build(objectsToBuild, this.globalObjects);
};

Engine.prototype.addObjects = function (keyObj, value) {

  if (isTypeOf(keyObj, "String")) {

    this.objectsManifest[keyObj] = value;
  } else {
    this.objectsManifest = $.extend(this.objectsManifest, keyObj);
  }
};

Engine.prototype.nextTrial = function (status) {

  if ((status === STATUS.DEPARTURE_POINT) || (status === STATUS.RESUME_GAME)) {
    this.trialConfig = Progress.getTrial(Progress.nextTrial(status));
  } else {
    this.trialConfig = (status === STATUS.WON) ? Progress.trialWon() : Progress.trialLost();
  }

  this.decodeTrialConfig();
};

Engine.prototype.decodeTrialConfig = function () {

  // override this method
  console.log("[Engine] functio decodeTrialConfig must be overrided");
};

Engine.prototype.dependenciesReady = function (obj) {
  var result = true;
  var numDependencies;
  var iterator;
  var dependencies = this.objectsManifest[obj].dependencies;
  if (isTypeOf(dependencies, "Array")) {

    numDependencies = dependencies.length;
    for (iterator = 0; iterator < numDependencies; ++iterator) {

      if (!(this.globalObjects.hasOwnProperty(dependencies[iterator]) || this.trialObjects.hasOwnProperty(dependencies[iterator]))) {
        result = false;
      }
    }
  }

  return result;
};