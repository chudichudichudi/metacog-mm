goog.provide('metacog.TrialLog');

goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.Circle');
goog.require('lime.Label');

metacog.TrialLog = function(initial_treshold){
  this.initial_treshold = initial_treshold;
  this.trial_results = [];
  this.current_trial = {};
  this.score = 0;
};

metacog.TrialLog.prototype.get_win_loss_ratio = function() {
  var win_count = 0;
  for (var i = 0; i < this.trial_results.length; i++) {
    var elem = this.trial_results[i];
    if(elem.choosed === elem.winner){
      win_count++;
    }
  };

  if(win_count === 0 || this.trial_results.length < 5 ){
    return 0.5;
  } else {
    metacog.trials.current_trial.type_of_test = "normal"
    return win_count / this.trial_results.length;
  }
};

metacog.TrialLog.prototype.sure_bet = function () {
  if (this.current_trial.winner === this.current_trial.choosed) {
    this.score += config.payment_bet;
  } else {
    this.score -= config.payment_bet_wrong;
    if(this.score <= 0){
      this.score = 0;
    }
  }
}

metacog.TrialLog.prototype.not_sure_bet = function () {
  this.score += config.payment_opt_out;
}

metacog.TrialLog.prototype.get_scale = function(){
  var ratio = this.get_win_loss_ratio();
  if (ratio > this.initial_treshold ){
    return Math.min(ratio * config.difficulty_step,1);;
  } else {
    return ratio;
  }
};

metacog.TrialLog.prototype.who_is_the_winner = function (circle_sizes) {
  var max, index_max;
  var max = 0;
  for (var i = 0; i < circle_sizes.length; i++) {
    if(circle_sizes[i] > max) {
      max = circle_sizes[i];
      index_max = i;
    }
  };
  return index_max;
};

metacog.TrialLog.prototype.new_trial = function () {
  var trial = {
    circle_size: [],
    choosed: -1,
    winner: -1,
    time_betting: 0,
    time_trust: 0,
    time_choosing_circle: 0,
    scale: 0,
    trust: -1,
    type_of_test: "calibration",
    second_screen: "bet"
  };
  if (this.trial_results.length === 0){ //trial inicial
    console.log('trial inicial')
    trial.circle_size = goog.array.clone(config.circle_size);
    trial.winner = this.who_is_the_winner(trial.circle_size);
    trial.scale = this.initial_treshold;
  } else {
    console.log('trial: ' + this.trial_results.length);
    trial.circle_size = this.generate_sizes(this.get_scale());
    trial.winner = this.who_is_the_winner(trial.circle_size);
    trial.scale = this.get_scale();
  }
  this.current_trial = trial;
  this.trial_results.push(trial);
};

metacog.TrialLog.prototype.generate_sizes = function(scale) {
  var sizes = [];
  for (var i = 0; i < config.size_pattern.length; i++) {
    sizes.push(Math.min(config.size_pattern[i]*scale*1.5, config.MAX_SIZE -1));
  };
  sizes.push(config.MAX_SIZE);
  shuffle(sizes);
  return sizes;
};

metacog.TrialLog.prototype.get_current_circle_size = function() {
  return this.current_trial.circle_size;
};

metacog.TrialLog.prototype.set_elected_circle = function(circle) {
  console.log('seleccione: ' + circle + ' el ganador es: ' + this.trial_results[this.trial_results.length - 1].winner);
  this.trial_results[this.trial_results.length - 1].choosed = circle;
};