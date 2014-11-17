function GlobalTime() {

}

GlobalTime.initialize = function() {
    this.time = 0;
    this.currentTime = (new Date()).getTime();
    this.lastTime = 0;
    this.lastTime = 0;
    this.dt = 0;
    this.relativeTime = 0;
    this.minuteCount = 0;
    
    this.tick = function() {
        this.time = new Date();
        this.currentTime = this.time.getTime();
        this.dt = (this.currentTime - this.lastTime)/1000;
        this.relativeTime += (this.currentTime - this.lastTime);
        this.lastTime = this.currentTime;
        if (this.dt < 1){
        	this.minuteCount += this.dt;
        	if (this.minuteCount>=60){
        		Progress.tick();
        		this.minuteCount = 0;
        	}
        	
        }
    };

    this.setZero = function() {
        this.relativeTime = 0;
    };
};