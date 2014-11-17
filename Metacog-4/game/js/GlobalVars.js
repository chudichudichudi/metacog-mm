/*exported STATUS, stage, subStage, stageHeight, stageWidth, overStage, gameObjects*/
"use strict";

var STATUS = {
	RESUME_GAME: -2,
  DEPARTURE_POINT: -1,
  LOST: 0,
  WON: 1,
  NOT_ANSWERED: 2
};

var stage;
var subStage;
var stageHeight;
var stageWidth;
var overStage;