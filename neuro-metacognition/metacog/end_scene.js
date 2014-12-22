goog.provide('metacog.EndScene');

goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');

metacog.EndScene = function(){};

metacog.EndScene.createScene = function (scale) {
  var scene = new lime.Scene();
  var layer_sure = new lime.Layer().setPosition(512,256);
  var label_thanks = new lime.Label().setPosition(0,0).setText("Eso es todo, ¡Gracias!.").setFontSize(50).setFontWeight("bold");

  var label_try_again = new lime.Label().setPosition(0,250).setText("Volver.").setFontSize(20).setFontWeight("bold");
  layer_sure.appendChild(label_thanks);
  layer_sure.appendChild(label_try_again);

  goog.events.listen(label_try_again, ['mousedown', 'touchstart'],function(e) {
    MateMarote.returnToGameflow();
  });
  scene.appendChild(layer_sure);
  return scene;
};