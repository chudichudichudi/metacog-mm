//set main namespace
goog.provide('metacog');

//get requirements
goog.require('metacog.EndScene');
goog.require('metacog.CircleScene');
goog.require('metacog.SliderScene');
goog.require('metacog.BetScene');
goog.require('metacog.TrialLog');

goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');
goog.require('lime.animation.Spawn');
goog.require('lime.animation.FadeTo');
goog.require('lime.animation.ScaleTo');
goog.require('lime.animation.MoveTo');

goog.require('goog.Uri');

var config = {
  screen_width: 1024,
  screen_height: 768,
  diametro_max: 768 / 4,
  circle_size: [151, 150, 152,
                154, 155, 156,
                157, 158, 159],
  circle_color: [0, 0, 0, 0, 0, 0, 0, 0, 0],
  size_pattern: [96, 92, 97, 99, 98, 97, 93, 95],
  MAX_SIZE: 160,
  initial_treshold: 0.5,
  difficulty_step: 1.5,
  trial_amount: 50,
  payment_bet_right: 50,
  payment_bet_wrong: -300,
  payment_opt_out:  500
};

metacog.experiments = {};
metacog.experiments.current_trial = {};



metacog.create_log = function() {
}

metacog.append_log = function() {
  var update_info = { 
                      experiment_log: metacog.trials.trial_results, 
                      id: metacog.trials.log_id
                    };

  console.log(JSON.stringify(metacog.trials.trial_results));
  Metrics.addData("trials", "results", JSON.stringify(metacog.trials.trial_results[metacog.trials.trial_results.length - 1]));
  Metrics.saveMetrics();
}

metacog.sync = function() {
  try {
    Metrics.synchronize();
  } catch(e){
    console.error("Error al sincronizar metricas");
  };
  config.trials_synced += 5;
  metacog.trials_until_sync = 5;
}

metacog.calculate_max_score = function () {
  if(metacog.experiments.trials.length === 0) {
    return config.trial_amount * Math.max(config.payment_bet_right,config.payment_bet_wrong,config.payment_opt_out);
  } else {
    return goog.array.reduce(metacog.experiments.trials, function(previous_value, current_value, i, arr) {
      return previous_value + Math.max(current_value.payment_bet_right, current_value.payment_bet_wrong, Math.max.apply(Math, current_value.payment_bet_opt_out));
    }, 0);
  }
}


metacog.start = function(){
  //Ajusto la configuracion a la que vino parametrizada, sino mando todos valores default
  var uri = new goog.Uri(window.location.href);
  metacog.create_log();

  var stepConfig = MateMarote.gameData.stepConfig;

  if (offline) {
    stepConfig = config;
  };

  config.payment_bet_right = stepConfig.payment_bet_right || parseInt(uri.getParameterValue('payment_bet')) || config.payment_bet_right;
  console.log("stepconfig payment bet wrong: " + stepConfig.payment_bet_wrong);

  config.payment_bet_wrong = stepConfig.payment_bet_wrong || parseInt(uri.getParameterValue('payment_bet_wrong')) || config.payment_bet_wrong;

  console.log("payment bet wrong: " + config.payment_bet_wrong);

  config.payment_opt_out = stepConfig.payment_opt_out || parseInt(uri.getParameterValue('payment_opt_out')) || config.payment_opt_out;
  
  config.initial_treshold = stepConfig.initial_treshold || parseFloat(uri.getParameterValue('initial_treshold')) || config.initial_treshold;
  config.difficulty_step = stepConfig.difficulty_step || parseFloat(uri.getParameterValue('difficulty_step')) || config.difficulty_step;
  config.circle_color = stepConfig.circle_color || config.circle_color;
  config.size_pattern = stepConfig.size_pattern || config.size_pattern;

  metacog.experiments.trials = stepConfig.trials || [];
  metacog.experiments.current_trial = metacog.setup_current_trial();

  //Pongo la cantidad de trials dependiendo de los parametros
  config.trials_synced = 0;
  if (metacog.experiments.trials.length !== 0) {
    config.trial_amount = metacog.experiments.trials.length;

  } else {
    config.trial_amount = parseInt(uri.getParameterValue('trial_amount')) || 50;
  }

  metacog.experiments.max_score = metacog.calculate_max_score();
  
  metacog.trials_until_sync = 5;

  lime.Label.defaultFont = "Arial, Helvetica, sans-serif";
  metacog.director = new lime.Director(document.body,config.screen_width,config.screen_height);
  metacog.new_round();
};


metacog.fill_missing_parameters = function(trial) {
  return trial;
};

metacog.generate_trial = function() {
  if (Math.random() > 0.5) {
    return {payment_bet_right: config.payment_bet_right,
          payment_bet_wrong: config.payment_bet_wrong,
          payment_bet_opt_out: [config.payment_opt_out],
          bet_or_trust: "bet"};
  } else {
    return {payment_bet_right: config.payment_bet_right,
          payment_bet_wrong: config.payment_bet_wrong,
          payment_bet_opt_out: [config.payment_opt_out],
          bet_or_trust: "trust"};
  }

  
};

metacog.setup_current_trial = function() {
  var trial;
  if (metacog.experiments.trials.length > 0) {
    trial = metacog.fill_missing_parameters(metacog.experiments.trials.shift());
  } else {
    trial = metacog.generate_trial();
    /*console.log(trial);*/
  }
  return trial;
};

metacog.new_round = function() {
  metacog.trials = new metacog.TrialLog(config.initial_treshold);
  metacog.create_trial();
};

metacog.create_trial = function() {
  if(config.trials_synced >= config.trial_amount){
    var end_scene = metacog.EndScene.createScene();
    metacog.director.replaceScene(end_scene);
    return;
  }
  metacog.trials.new_trial();

  var circle_scene = metacog.CircleScene.createScene(metacog.trials.get_scale());

  metacog.trials.current_trial.time_choosing_circle = goog.now();

  metacog.director.replaceScene(circle_scene);
};

metacog.end_trial = function() {
  /*console.log(metacog.trials.trial_results[metacog.trials.trial_results.length - 1]);
  console.log(metacog.trials.score);*/
};

metacog.new_trial = function () {
  metacog.end_trial();
  var t0 = goog.now();
  metacog.append_log();

  if (metacog.trials_until_sync === 0) {
    metacog.sync();
  } else {
    metacog.trials_until_sync--;
  }

  /*console.log(goog.now() - t0);*/
  metacog.create_trial();
};

metacog.finish_selection = function() {
  metacog.trials.current_trial.time_choosing_circle =  goog.now() - metacog.trials.current_trial.time_choosing_circle;
  metacog.bet_or_trust();    
};

metacog.bet_or_trust = function() {
  metacog.experiments.current_trial = metacog.setup_current_trial();
  if(metacog.experiments.current_trial.bet_or_trust == "bet") {
    /*console.log("bet");*/
    metacog.bet();
  } else {
    /*console.log("trust");*/
    metacog.slider();
  }
};

metacog.manage_bet_sure = function() {
  metacog.trials.current_trial.time_betting =  goog.now() - metacog.trials.current_trial.time_betting;
  metacog.new_trial();
};

metacog.manage_bet_not_sure = function() {
  metacog.trials.current_trial.time_betting =  goog.now() - metacog.trials.current_trial.time_betting;
  metacog.new_trial();
};

metacog.bet = function() {
  var idx = Math.floor(Math.random() * metacog.experiments.current_trial.payment_bet_opt_out.length);
  var opt_out_payment =  metacog.experiments.current_trial.payment_bet_opt_out[idx];
  var bet_scene = metacog.BetScene.createScene(opt_out_payment);
  metacog.trials.current_trial.time_betting =  goog.now();
  metacog.trials.current_trial.second_screen = "bet";
  metacog.director.replaceScene(bet_scene);
};

metacog.slider = function() {
  metacog.trials.current_trial.second_screen = "trust";
  metacog.trials.current_trial.time_trust =  goog.now();
  var slider_scene = metacog.SliderScene.createScene();
  metacog.director.replaceScene(slider_scene);
};

metacog.manage_slider_fin = function() {
  metacog.trials.current_trial.time_trust =  goog.now() - metacog.trials.current_trial.time_trust;
  metacog.new_trial();
};

//this is required for outside access after code is compiled in ADVANCED_COMPILATIONS mode
goog.exportSymbol('metacog.start', metacog.start);