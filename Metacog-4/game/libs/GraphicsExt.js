function getCoordsFromRad(rad,angle,offset){
    var x1 = offset.x+(rad)*Math.cos(angle);
    var y1 = offset.y+(rad)*Math.sin(angle);
    return {x:x1,y:y1};                
}

function drawArrowHead(graphics,angle,end,arrowLength,narrow){
    var partAngle = 35;
    if (narrow){
        partAngle = 20;
    }
    var leftAngle = partAngle * Math.PI / 180;
    var leftPoint = getCoordsFromRad(-arrowLength,angle+leftAngle,end);

    var rightAngle = -partAngle * Math.PI / 180;
    var rightPoint = getCoordsFromRad(-arrowLength,angle+rightAngle,end);
    drawPoly(graphics,[end,leftPoint,rightPoint]);
}

function drawPoly(graphics,points){
    graphics.moveTo(points[0].x,points[0].y);
    for (var i=1;i<points.length;i++){
        graphics.lineTo(points[i].x,points[i].y);
    }
    graphics.lineTo(points[0].x,points[0].y);
}

function prepareGraphics(graphics,stroke, strokeColour,fillColour){
    graphics.clear();
    if (stroke!==null){
        graphics.setStrokeStyle(stroke);
    }
    if (strokeColour!==null){
        graphics.beginStroke(strokeColour);
    }
    if (fillColour!==null){
        graphics.beginFill(fillColour);
    }
    return graphics;
}

function drawSemicircle(graphics, center, innerRad,outerRad, startAngle,endAngle){
    graphics.arc(center,center,innerRad,startAngle,endAngle);
    var coord1 = getCoordsFromRad(outerRad,endAngle,{x:center,y:center});
    graphics.lineTo(coord1.x,coord1.y);
    graphics.arc(center,center,outerRad,endAngle,startAngle,true);
    var coord2 = getCoordsFromRad(innerRad,startAngle,{x:center,y:center});
    graphics.lineTo(coord2.x,coord2.y);
}

function drawSemicircleXY(graphics, x,y, innerRad,outerRad, startAngle,endAngle){
    graphics.arc(x,y,innerRad,startAngle,endAngle);
    var coord1 = getCoordsFromRad(outerRad,endAngle,{x:x,y:y});
    graphics.lineTo(coord1.x,coord1.y);
    graphics.arc(x,y,outerRad,endAngle,startAngle,true);
    var coord2 = getCoordsFromRad(innerRad,startAngle,{x:x,y:y});
    graphics.lineTo(coord2.x,coord2.y);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}