

function Random(){};


Random.range = function(min, max ) {
    return Math.floor(Math.random() * (max - min) + min);
};

Random.shuffle = function(o) { 
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};

Random.randomBoolean = function(num){
    return (Random.range(0,100) >= num);
};