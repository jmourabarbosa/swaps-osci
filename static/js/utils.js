CORRECT = 0
CATCH=1

function zeros(len,d){
	a=[]
  while(len>0){a.push(d);len--}
  return a;
};


function AssertException(message) { this.message = message; }
AssertException.prototype.toString = function () {
	return 'AssertException: ' + this.message;
};

function assert(exp, message) {
	if (!exp) {
		throw new AssertException(message);
	}
}

// Mean of booleans (true==1; false==0)
function boolpercent(arr) {
	var count = 0;
	for (var i=0; i<arr.length; i++) {
		if (arr[i]) { count++; } 
	}
	return 100* count / arr.length;
}

function range(start, stop, step){
  var a=[start], b=start;
  while(b<stop){b+=step;a.push(b)}
  return a;
};

function zeros(len,d){
	a=[]
  while(len>0){a.push(d);len--}
  return a;
};


var angle2pos = function (angle,R,center){

	x=R*Math.cos(angle)+center[0]
	y=R*Math.sin(angle)+center[1]
	return [x,y];

}

var pos2angle = function (pos,center){

	var x = pos[0]-center[0]
	var y = pos[1]-center[1]

	angle=Math.atan2(y,x)
	
	return angle;
}


var rad2deg = function(angle){
	return angle/(2*math.pi)*360
}

var angle2pi = function(angle){
	if (angle > 0){
		return angle
	}
	
	return angle + math.pi*2
}

var deg2rad = function(angle){
	return angle/360*2*math.pi
}

var circ_dist = function(angle1,angle2){
	// must be in radians
	a1 = math.exp(math.complex(0,angle1))
	a2 = math.exp(math.complex(0,angle2))
	return math.divide(a1,a2).toPolar().phi;
}


var angle2rgb = function(angle){
	// make sure it within [0,2pi]
	angle = angle2pi(angle)
	hue = angle/(2*Math.PI)*360
	var rgb = colorSystem.hsv.invert([hue,1,1])
	if (rgb == undefined){
		rgb = [0,0,0];
	}

	return 	[Math.round(rgb[0]),Math.round(rgb[1]),Math.round(rgb[2])];
}

var encapsulate_rgb = function(rgb){
	return 	"rgb("+rgb[0]+","+rgb[1]+","+rgb[2]+")";
}

var rgb2angle = function(rgb){
	// convert rgb to HUE, than to radians
	angle = colorSystem.hsv(rgb)[0]/360*2*math.pi
	if (angle == undefined){
		rgb = 0;
	}
	return angle
}


