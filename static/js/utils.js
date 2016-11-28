CORRECT = 0
CATCH=1


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

var gen_stim = function (n_stims,center,R,STIM_SIZE){

	stims = [];
	while (!validate_stims(stims,center,STIM_SIZE)){
		stims = []
		for (i=1; i<=n_stims; i++) {
			angle  = Math.random()*2*Math.PI;
			color = Math.random()*2*Math.PI;
			pos = angle2pos(angle,R,center);
			stims.push({"pos_x": pos[0]+STIM_SIZE, "pos_y": pos[1]+STIM_SIZE, "color": angle2rgb(color)})//, 0: 0, 1: 0})
		}
		console.log("went one round of gen_stims")
	}

	// randomly select the correct trial and flag it as correct
	c=math.randomInt(0,n_stims);
	stims[c][CORRECT] = 1
	return stims;
}

var default_parms = function (type){
	params={}

	if (type) { 
	    params["n_trials"] = 1
	    params["stims"] = [1,2]
	    params["delays"] = [0,1]
    	return params
    }

    params["n_trials"] = 2
	params["stims"] = [3,5,7]
	params["delays"] = [0,3]

	return params
}

var gen_trials2 = function(params,callback){

			$.ajax({
			dataType: "json",
			url: "/get_stims?n_trials="+params['n_trials']+"&delays="+params['delays']+"&stims="+params["stims"],
			success: function(data) {
				callback(data.results)
			}
		})
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

var validate_stims = function(stims,center,STIM_SIZE){
	MIN_DIST = CORRECT_THR;// deg2rad(STIM_SIZE);
	if (!stims.length) return false;


	for (i=0;i<stims.length;i++){
		pos1 = [stims[i]["pos_x"],stims[i]["pos_y"]];
		color1 = rgb2angle(stims[i]["color"]);
		for (j=i+1;j<stims.length;j++){
			pos2 = [stims[j]["pos_x"],stims[j]["pos_y"]];
			color2 = rgb2angle(stims[j]["color"]);

			dist = circ_dist(pos2angle(pos1,center),pos2angle(pos2,center));
			dist_c = circ_dist(color1,color2);

			if  (math.abs(dist) < MIN_DIST || math.abs(dist_c) < MIN_DIST){
				return false
			}
		}
		

	}

	return true
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
