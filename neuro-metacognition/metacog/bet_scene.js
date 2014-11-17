goog.provide('metacog.BetScene');

goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');

metacog.BetScene = function(){
};

metacog.BetScene.createScene = function () {
	var scene = new lime.Scene();  
  var layer_score = new lime.Layer().setPosition(512,256);
  var score = new lime.Label().setPosition(0,0).setText( "Score: " + metacog.trials.score ).setFontSize(100).setFontWeight("bold");

  layer_score.appendChild(score);

  var layer_not_sure = new lime.Layer().setPosition(768,512);
  var not_sure_button = new lime.Label().setPosition(0,0).setText("Opt out").setFontSize(50).setFontWeight("bold");
  var not_sure_label = new lime.Label().setPosition(0,75).setText("Score + "+config.payment_opt_out).setFontSize(25);
  layer_not_sure.appendChild(not_sure_button);
  layer_not_sure.appendChild(not_sure_label);
  
  var layer_sure = new lime.Layer().setPosition(256,512);
  var sure_button = new lime.Label().setPosition(0,0).setText("Bet").setFontSize(50).setFontWeight("bold");
  var sure_label = new lime.Label().setPosition(0,75).setText("Score +" + config.payment_bet).setFontSize(30);
  var sure__wrong_label = new lime.Label().setPosition(0,105).setText("Score -" + config.payment_bet_wrong).setFontSize(30);
  layer_sure.appendChild(sure_button);
  layer_sure.appendChild(sure__wrong_label);
  layer_sure.appendChild(sure_label);

  var zoomout_sure = new lime.animation.Spawn(
      new lime.animation.ScaleTo(5).setDuration(0.5),
      new lime.animation.FadeTo(0).setDuration(0.5)
    );

  zoomout_sure.addTarget(score);

  goog.events.listen(layer_sure,['mousedown','touchstart'],function() {
    zoomout_sure.play();
  });

  goog.events.listen(zoomout_sure,lime.animation.Event.STOP,function(){
      metacog.trials.sure_bet();
      layer_score.removeChild(score);
      layer_score.appendChild(new lime.Label().setPosition(0,0).setText( "Score: " + metacog.trials.score ).setFontSize(100).setFontWeight("bold"));
      lime.scheduleManager.callAfter(function () {
        metacog.manage_bet_sure();
      }, false, 500);
  });

  goog.events.listen(layer_not_sure,['mousedown','touchstart'],function() {
    
    var zoomout_not_sure = new lime.animation.Spawn(
      new lime.animation.ScaleTo(5).setDuration(0.5),
      new lime.animation.FadeTo(0).setDuration(0.5)
    );

    zoomout_not_sure.addTarget(score);
    zoomout_not_sure.play();

    goog.events.listen(zoomout_not_sure,lime.animation.Event.STOP,function(){
      metacog.trials.not_sure_bet();

      layer_score.removeChild(score);

      layer_score.appendChild(new lime.Label().setPosition(0,0).setText( "Score: " + metacog.trials.score ).setFontSize(100).setFontWeight("bold"));

      lime.scheduleManager.callAfter(function () {
        metacog.manage_bet_not_sure();
      }, false, 500);
    });
  });

  scene.appendChild(layer_sure);
  scene.appendChild(layer_not_sure);
  scene.appendChild(layer_score);

  return scene;
};

metacog.BetScene.createScoreBoard = function() {
  var layer_score = new lime.Layer().setPosition(0,0);
  var score_slider = new lime.Sprite().setSize(683 + 5, 100).setStroke(5,'#c00');
  layer_score.appendChild(score_slider);
  return layer_score;
}