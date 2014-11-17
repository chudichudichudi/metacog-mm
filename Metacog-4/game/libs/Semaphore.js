/*global createjs, Preloader, setProperties*/
function Semaphore(number) {
  "use strict";
  this.initialize(number);
}

Semaphore.prototype.initialize = function (number) {

  this.signals        = number || 0;
  this.tasks          = [];
  this.mutex          = false;
  this.sleepFunc      = function () {
    return true;
  };
};

Semaphore.prototype.signal = function () {
  var nexExect;

  // busy waiting only arpobed here...
  while (this.mutex) {
    setTimeout(this.sleepFunc, 50);
  }

  this.mutex = true;
  // citical section
  if (this.tasks.length > 0) {
    setTimeout(this.tasks.shift(),0);
  } else {
    ++this.signals;
  }
  this.mutex = false;
  // end critical section
};

Semaphore.prototype.multSignal = function (number) {

  // busy waiting only arpobed here...
  while (this.mutex) {
    setTimeout(this.sleepFunc, 50);
  }

  this.mutex = true;
  // citical section
  if (this.tasks.length > 0) {
    while ((this.tasks.length > 0) && (number > 0)) {
      setTimeout(this.tasks.shift(), 0);
      --number;
    }
  }
  // end critical section
  this.mutex = false;
};

Semaphore.prototype.wait = function (exect) {

  // busy waiting only arpobed here...
  while (this.mutex) {
    setTimeout(this.sleepFunc, 50);
  }

  this.mutex = true;
  // citical section
  if (this.signals > 0) {
    setTimeout(exect, 0);
    --this.signals;
  } else {
    this.tasks.push(exect);
  }
  this.mutex = false;
  // end critical section
};