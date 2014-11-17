goog.provide('metacog.CircleScene');

goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');


function shuffle(o) {
    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x){};
    return o;
};

metacog.CircleScene = function(){};

metacog.CircleScene.get_offset = function(diametro) {
  var sign;
  if (Math.random() > 0.5) {
      sign = 1;
  } else {
      sign = -1;
  };
  return (config.diametro_max - diametro) * Math.random() * sign / 2;
};

metacog.CircleScene.get_layer = function(x, y, pos) {
  var off_x = metacog.CircleScene.get_offset(config.circle_size[pos]);
  var off_y = metacog.CircleScene.get_offset(config.circle_size[pos]);
  var layer = new lime.Layer().setPosition(x + off_x,y + off_y);
  layer.original_pos = {};
  layer.original_pos.pos = pos;
  layer.original_pos.label_text = '('+ pos +')';
  layer.original_pos.x = x;
  layer.original_pos.y = y;
  return layer;
};

metacog.CircleScene.get_circle = function(pos) {
  var size = metacog.trials.get_current_circle_size()[pos];
  return new lime.Circle().setSize(size,size).setFill(config.circle_color[pos],config.circle_color[pos],0);
};

metacog.CircleScene.createScene = function (scale) {

  metacog.trials.get_current_circle_size();
  var scene = new lime.Scene();

  var width_step = config.screen_width / 4;
  var height_step = config.screen_height / 4;
  
  var layer_1 = metacog.CircleScene.get_layer(width_step * 1, height_step * 1, 0);
  var layer_2 = metacog.CircleScene.get_layer(width_step * 2, height_step * 1, 1);
  var layer_3 = metacog.CircleScene.get_layer(width_step * 3, height_step * 1, 2);
  var layer_4 = metacog.CircleScene.get_layer(width_step * 1, height_step * 2, 3);
  var layer_5 = metacog.CircleScene.get_layer(width_step * 2, height_step * 2, 4);
  var layer_6 = metacog.CircleScene.get_layer(width_step * 3, height_step * 2, 5);
  var layer_7 = metacog.CircleScene.get_layer(width_step * 1, height_step * 3, 6);
  var layer_8 = metacog.CircleScene.get_layer(width_step * 2, height_step * 3, 7);
  var layer_9 = metacog.CircleScene.get_layer(width_step * 3, height_step * 3, 8);

  var circle_1 = metacog.CircleScene.get_circle(0);
  var circle_2 = metacog.CircleScene.get_circle(1);
  var circle_3 = metacog.CircleScene.get_circle(2);
  var circle_4 = metacog.CircleScene.get_circle(3);
  var circle_5 = metacog.CircleScene.get_circle(4);
  var circle_6 = metacog.CircleScene.get_circle(5);
  var circle_7 = metacog.CircleScene.get_circle(6);
  var circle_8 = metacog.CircleScene.get_circle(7);
  var circle_9 = metacog.CircleScene.get_circle(8);
  
  layer_1.appendChild(circle_1);
  layer_2.appendChild(circle_2);
  layer_3.appendChild(circle_3);
  layer_4.appendChild(circle_4);
  layer_5.appendChild(circle_5);
  layer_6.appendChild(circle_6);
  layer_7.appendChild(circle_7);
  layer_8.appendChild(circle_8);
  layer_9.appendChild(circle_9);

  scene.appendChild(layer_1);
  scene.appendChild(layer_2);
  scene.appendChild(layer_3);
  scene.appendChild(layer_4);
  scene.appendChild(layer_5);
  scene.appendChild(layer_6);
  scene.appendChild(layer_7);
  scene.appendChild(layer_8);
  scene.appendChild(layer_9);

  var manage_click = function(e) {
    var choosed = this.original_pos.pos;
    metacog.trials.set_elected_circle(choosed);
    metacog.finish_selection();
  };

  goog.events.listen(layer_1, ['mousedown','touchstart'],manage_click, false, layer_1);
  goog.events.listen(layer_2, ['mousedown','touchstart'],manage_click, false, layer_2);
  goog.events.listen(layer_3, ['mousedown','touchstart'],manage_click, false, layer_3);
  goog.events.listen(layer_4, ['mousedown','touchstart'],manage_click, false, layer_4);
  goog.events.listen(layer_5, ['mousedown','touchstart'],manage_click, false, layer_5);
  goog.events.listen(layer_6, ['mousedown','touchstart'],manage_click, false, layer_6);
  goog.events.listen(layer_7, ['mousedown','touchstart'],manage_click, false, layer_7);
  goog.events.listen(layer_8, ['mousedown','touchstart'],manage_click, false, layer_8);
  goog.events.listen(layer_9, ['mousedown','touchstart'],manage_click, false, layer_8);
  /*goog.events.listen(layer_9, ['mousedown','touchstart'],function () {
      metacog.slider();
  });*/
  
  return scene;
};