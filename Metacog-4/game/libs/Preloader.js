function Preloader() {
}
Preloader.callback = null;
Preloader.init = function(stage, preloadContainer) {
    console.log("initializing preloader");
    Preloader.loader = new createjs.LoadQueue();
    Preloader.loader.installPlugin(createjs.Sound);
    Preloader.stage = stage;
    Preloader.preloadContainer = preloadContainer;
    Preloader.loader.on("complete", completed, this);
    Preloader.loader.on("progress", update, this);
    
    Preloader.icon = new createjs.Shape(new createjs.Graphics());
    Preloader.colourStart = hexToRgb("#ECF0F1");
    Preloader.colourEnd = hexToRgb("#5fb6e8");
    Preloader.stepColour = {r:(Preloader.colourStart.r - Preloader.colourEnd.r)/10, 
                 g:(Preloader.colourStart.g - Preloader.colourEnd.g)/10,
                 b:(Preloader.colourStart.b - Preloader.colourEnd.b)/10};
    prepareGraphics(Preloader.icon.graphics,2, "#ECF0F1",null);
    Preloader.text = new createjs.Text("0%", "bold 36px Arial", "#5fb6e8");
    Preloader.text.textAlign = "center";
    
    Preloader.preloadContainer.addChild(Preloader.text);
    Preloader.preloadContainer.addChild(Preloader.icon);
    stage.update();

    
    function completed(){
        Preloader.completed();
    }
    
    function update(evt) {
        Preloader.update(evt);
    }
    
    if (Preloader.manifest === null || Preloader.manifest === undefined){
        Preloader.manifest = new Array();
    }
};

Preloader.update = function(evt) {
    var progPercentage = Math.round(evt.progress*100);
    var center = {x:stageWidth*0.5, y:stageHeight*0.5};
    Preloader.text.text = progPercentage+"%";
    Preloader.text.x = center.x;
    Preloader.text.y = center.y-18;
    if (progPercentage!==100){
    	Preloader.updateIcon(progPercentage,center);
    }
    Preloader.stage.update();
};

Preloader.updateIcon = function(progPercentage,center){
    //calculate colour
    var innerPer = progPercentage % 10;
    var colour = {r:Preloader.colourStart.r-innerPer*Preloader.stepColour.r,
                  g:Preloader.colourStart.g-innerPer*Preloader.stepColour.g,
                  b:Preloader.colourStart.b-innerPer*Preloader.stepColour.b};
    var hexColour = rgbToHex(Math.round(colour.r), Math.round(colour.g), Math.round(colour.b));
    Preloader.icon.graphics.beginFill(hexColour);
    //calculate angles    
    var innerRad = 65;
    var outerRad = 65+25;
    var initialAngle = 3*Math.PI/2;
    var part = Math.PI/5;
    var circlePer = Math.floor(progPercentage/10);
    var startAngle = initialAngle+part*circlePer;
    //draw semicircle
    drawSemicircleXY(Preloader.icon.graphics, center.x,center.y, innerRad,outerRad, startAngle-part,startAngle);
};

Preloader.start = function(callback) {
    Preloader.callback = callback;
    Preloader.loader.loadManifest(Preloader.manifest);
};

Preloader.completed = function(){
    console.log("Preload Complete");
    Preloader.callback();
};

// if the added image has locale support, it should be like this
// {default:"img/img.png", "en":"img/en/img.png" }
Preloader.add = function(_id,_path){
    console.log("Preloading: "+_id);
    if ( typeof _path === "string") {
        Preloader.manifest.push({id: _id, src: _path});
    }
    if ( typeof _path === "object") {
        var _localePath = "";
        if ( _path[MateMarote.currentLang] !== undefined && _path[MateMarote.currentLang] !== null) {
            _localePath = _path[MateMarote.currentLang];
        } else if ( _path["default"] !== undefined && _path["default"] !== null) {
            _localePath = _path["default"];
        } else {
            console.error("[Preloader] The asset "+_id+" has no default dir or its not supported for this language "+JSON.parse(_path));
        }
        
        Preloader.manifest.push({id:_id, src: _localePath});
    }
    
};

Preloader.get = function (id) {
    return Preloader.loader.getResult(id);
};

