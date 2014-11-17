goog.provide('metacog.SliderScene');

goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.MoveTo');
goog.require('lime.animation.MoveBy');
goog.require('lime.animation.ScaleBy');
goog.require('lime.animation.Spawn');

metacog.SliderScene = function(){
	//goog.base(this);
};

metacog.SliderScene.create_slider_layer = function() {
	var posy = 50;
	var sliderWidth = config.screen_width - 250;
	var defaultValue= sliderWidth / 2;
	var width_pos = 125;
  var height_pos = config.screen_height / 3;

  var layer = new lime.Layer().setPosition(config.screen_width / 2,height_pos);

  
	var background_line = new lime.Sprite();
	background_line.setSize(sliderWidth, 5).setFill(0, 0, 0, 1);

	var background_touch_area = new lime.Sprite();
	background_touch_area.setSize(sliderWidth, 300).setFill(0, 0, 0, 0);

	goog.events.listen(background_touch_area, ['mousedown', 'touchstart'],function(e) {
		var circle = new lime.Circle().setPosition(e.position.x,0);
		circle.setSize(10,10).setFill(0,0,0,1);

		var value = e.position.x;
		metacog.trials.current_trial.trust = Math.floor(( (value/sliderWidth).toFixed(2) * 100) + 50);
		console.log(metacog.trials.current_trial.trust);

		var zoomout_sure = new lime.animation.Spawn(
      new lime.animation.ScaleTo(20).setDuration(0.5),
      new lime.animation.FadeTo(0).setDuration(0.5)
    );

    goog.events.listen(zoomout_sure,lime.animation.Event.STOP,function(){
			metacog.manage_slider_fin();
		});

    zoomout_sure.addTarget(circle);

    layer.appendChild(circle);
		zoomout_sure.play();
	}, false, background_touch_area);
	
	layer.appendChild(background_line);
	layer.appendChild(background_touch_area);

  /*layer.appendChild(slider_sprite);*/

	return layer;
};

metacog.SliderScene.create_done_button = function () {
	var layer_button = new lime.Layer().setPosition(0,(config.screen_height / 6) * 3 );
	var low_text = new lime.Label().setText("Very low").setFontSize(50).setFontWeight("bold");
	low_text.setPosition(125,0);
	var high_text = new lime.Label().setText("Very high").setFontSize(50).setFontWeight("bold");
	high_text.setPosition(config.screen_width - 125,0);

	layer_button.appendChild(low_text);
	layer_button.appendChild(high_text);

	return layer_button;
};

metacog.SliderScene.createScene = function () {
	var layer_slider = metacog.SliderScene.create_slider_layer();
	var layer_button = metacog.SliderScene.create_done_button();
	
	var scene = new lime.Scene();
	scene.appendChild(layer_slider);
	scene.appendChild(layer_button);

  return scene;
};