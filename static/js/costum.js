norm = [-0.287209  , -0.42802111, -0.5593022 , -0.58103565, -0.58222462,
       -0.62957638, -0.11111111, -0.2616    , -0.57386667, -0.22222222,
       -0.43333333, -0.21111111, -0.44222222, -0.34333333, -0.188     ,
       -0.51503111, -0.30999   , -0.43120011, -0.47623112, -0.32463422,
       -0.33356667, -0.45236778, -0.21222222, -0.33333333, -0.23844444,
       -0.31555556, -0.1592    , -0.39911111, -0.45102222, -0.46788889,
       -0.31912111, -0.47623678, -0.22208778, -0.45329679, -0.1       ,
       -0.22333333,  0.        ]
norm = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
norm = [0, 0.6, 0.5, 0.2, 0, 0, -0.4, -1, -1.4, -1.5, -1.5, -1.1, -0.1, 0.6, 0.9, 1, 1, 0.7, 0.5, 0.3, 0.3, 0.1, 0.1, -0.1, 1.2, 0.9, 0.5, 0.3, 0.3, 0.2, -0.2, -0.3, -0.5, -0.6, -0.6, -0.4, 0]
norm = [0,-0.8,-0.7,-0.4,0.1,0.5,1,1.6,2.3,2.9,3.3,3.4,3,1.9,-0.8,-1.3,-1.7,-1.3,-1.1,-0.9,-0.7,-0.4,-0.1,0.2,0,-0.5,-0.4,-0.3,-0.3,-0.2,0.3,0.4,0.4,0.5,0.7,0.7,0]
norm = [-0, 0.8, 0.7, 0.4, -0.1, -0.5, -1, -1.6, -2.3, -2.9, -3.3, -3.4, -3, -1.9, 0.8, 1.3, 1.7, 1.3, 1.1, 0.9, 0.7, 0.4, 0.1, -0.2, -0, 0.5, 0.4, 0.3, 0.3, 0.2, -0.3, -0.4, -0.4, -0.5, -0.7, -0.7, -0]
norm = [-0, 0.6, 0.6, 0.3, -0.1, -0.5, -1, -1.6, -2.3, -2.8, -3, -2.6, -1.5, 2, 2.7, 2.8, 2.4, 1.8, 1.2, 0.9, 0.7, 0.4, 0.1, -0.2, -0, 0.9, 0.6, 0.2, -0, -0.4, -0.8, -1.3, -1.9, -2, -1.8, -1.5, 0.2]
norm=[-0, 0.6, 0.6, 0.3, -0.1, -0.5, -1, -1.6, -2.3, -3.1, -3.3, -2.8, -1.4, 2.7, 4, 3.2, 2.5, 1.9, 1.3, 1, 0.8, 0.4, 0.1, -0.2, -0, 0.9, 0.6, 0.2, -0, -0.4, -0.8, -1.3, -1.8, -1.8, -1.6, -1.3, 0.3]

function get_norm(prop,step){
	i_norm = math.floor(prop * norm.length)

	//return 0
	return norm[i_norm]*step


}


var flicker_all_stim_alpha = function(){

	// if ((session["state"] != REPORT) && (session["state"] != DELAY)){
	// 	return
	// }

	// if ((session["state"] != DELAY)){
	// 	return
	// }

	if (session["state"] != REPORT){
		return
	}

	if (session["freq"] == 0){
		// stable stimuli
		return
	}
	
	if (session["freq"] < 0){
		hide_stimulus()
		return
	}

	// rad = STIM_SIZE
	// if(oscilate(session["freq"])<0){
	// 	rad = 0
	// }

	// oscilate() -> [-1,1] => abs(oscilate()/2)=> [0-1]
	rad = math.abs(STIM_SIZE*(oscilate(session["freq"]/2)))
	alpha = oscilate(session["freq"])
	console.log(session["freq"])

	var all_stims = d3.select("#all_stims").selectAll("[id^='stim']")[0]
	var n_stims = all_stims.length


	while (n_stims) {
		var stim = all_stims[n_stims-1];
		//stim.setAttribute("r",rad)
		stim.setAttribute("fill-opacity",alpha)
		stim.setAttribute("stroke-opacity",alpha)

		n_stims--
	}

	window.requestAnimationFrame(flicker_all_stim_alpha)

}


function stretch(angle){
	angle=circ_dist(angle,-get_norm(angle2pi(angle)/(2*math.pi),(Math.PI * 2) / N_SEGS))
	return angle
}

function unstretch(angle){
	angle=circ_dist(angle,get_norm(angle2pi(angle)/(2*math.pi),(Math.PI * 2) / N_SEGS))
	return angle
}

function stretch_stims(trials){

	for (t=0;t<trials.length;t++){
		trial = trials[t]
		for (s=0;s<trial.length;s++)
			stim = trial[s]
			stim.color = stretch(stim.color)
	}

	return trials
}
function compute_factor(){

	params = session["params"]
	n_stims = params["stims"]

	factor = 1/math.sum(n_stims)

	if (factor > 1)
		psiTurk.showPage('error.html');

	return factor/session["total_trials"]*n_stims.length

}


var nanobar = function(){

	if (session["bar"] == undefined){

		var options1 = {
		  classname: 'my-class',
		  id: 'nanobar_total',
		  target: document.getElementById('bar1'),
		  size: 100
		};

		var options2 = {
		  classname: 'my-class',
		  id: 'nanobar_correct',
		  target: document.getElementById('bar2')
		};
	
		session["bar"] = []
		nanobar_total = new Nanobar(options1);
		nanobar_correct = new Nanobar(options2);
		session["bar"].push(nanobar_total)
		session["bar"].push(nanobar_correct)
	}

	total = (session["trial_number"])/session["total_trials"]*100
	correct = session["acc_rwd"]*100

	session["bar"][0].go(total)
	session["bar"][1].go(correct)

	return session["bar"]
}

function compute_rwd(dist){
	rwd = 1/math.exp(dist)
	return rwd
}
var default_params = function (type){

	params={}
	params["max_reward"] = 3
	params["total_reward"] = 0

	if (type) { 
	    params["n_trials"] = 1
	    params["stims"] = [2]
	    params["delays"] = [3]
    }
    else {
	    params["n_trials"] = 20
		params["stims"] = [2,3,4,5,6]
		params["delays"] = [3]
	}

	params["total_trials"] = 2*params["n_trials"]*params["stims"].length*(params["delays"].length) 
	return params
}


var default_params_freq = function (type){

	params={}
	params["max_reward"] = 4
	params["total_reward"] = 0

	if (type) { 
	    params["n_trials"] = 1
	    params["stims"] = [5]
	    params["delays"] = [3]
	    params["freqs"] = [1,8]

    }
    else {
	    params["n_trials"] = 10
	    params["stims"] = [2,5]
	    params["delays"] = [3]
	    params["freqs"] = [-1,0,4,5,6,7,8,9,10,11,12]
	}

	params["total_trials"] = params["n_trials"]*params["stims"].length*(params["delays"].length)*(params["freqs"].length)  
	return params
}


var gen_trials2 = function(params,callback){

	keys = Object.keys(params)
	url = "/get_stims?"+keys[0]+"="+params[keys[0]]
	for (i=1;i<keys.length;i++) {
		k=keys[i]
		url+="&"+k+"="+params[k]
	}

			$.ajax({
			dataType: "json",
			url: url,
			success: function(data) {
				callback(data.results,params)
			}
		})
}


var oscilate = function(freq){
	y = math.sin(2*math.pi*freq*(Date.now()-session['start_time'])/1000);
	return y
}

var flicker_all_stim = function(){



	if (session["state"] != REPORT){
		return
	}
	
	// rad = STIM_SIZE
	// if(oscilate(session["freq"])<0){
	// 	rad = 0
	// }

	// oscilate() -> [-1,1] => abs(oscilate()/2)=> [0-1]
	rad = math.abs(STIM_SIZE*(oscilate(session["freq"]/2)))

	var all_stims = d3.select("#all_stims").selectAll("[id^='stim']")[0]
	var n_stims = all_stims.length


	while (n_stims) {
		var stim = all_stims[n_stims-1];
		stim.setAttribute("r",rad)
		n_stims--
	}

	window.requestAnimationFrame(flicker_all_stim)

}

var flicker_stim = function(){
	if (session["state"] != DELAY){
		return
	}
	stim = d3.select("#all_stims").select("#stim"+session["correct"])[0][0]
	if (!stim){
		return
	}

	//rad = STIM_SIZE*(oscilate(100)+1)/2;
	rad = STIM_SIZE
	if(oscilate(session["freq"])<0){
		rad = 0
	}

	stim.setAttribute("r",rad)
	window.requestAnimationFrame(flicker_stim)

}

var flicker_all_stim = function(){

	// if ((session["state"] != REPORT) && (session["state"] != DELAY)){
	// 	return
	// }

	// if ((session["state"] != DELAY)){
	// 	return
	// }

	if (session["state"] != REPORT){
		return
	}
	
	// rad = STIM_SIZE
	// if(oscilate(session["freq"])<0){
	// 	rad = 0
	// }

	// oscilate() -> [-1,1] => abs(oscilate()/2)=> [0-1]
	rad = math.abs(STIM_SIZE*(oscilate(session["freq"]/2)))

	var all_stims = d3.select("#all_stims").selectAll("[id^='stim']")[0]
	var n_stims = all_stims.length


	while (n_stims) {
		var stim = all_stims[n_stims-1];
		stim.setAttribute("r",rad)
		n_stims--
	}

	window.requestAnimationFrame(flicker_all_stim)

}

var flicker_correct = function(){
	// if (session["state"] != FINISH){
	// 	return
	// }
	stim = d3.select("#all_stims").select("#stim"+session["correct"])[0][0]
	if (!stim){
		return
	}

	rad = (STIM_SIZE*.25)*(oscilate(0.5)+1)/2 + STIM_SIZE;

	stim.setAttribute("r",rad)
	window.requestAnimationFrame(flicker_correct)

}

var flicker_background=function(){

	background=d3.select("#all_stims")[0][0]
	body=d3.select("body")[0][0]
	cont=d3.select("#container-exp")[0][0]


	if (session["state"] != REPORT){
		background.setAttribute("style","background-color: white")
		body.setAttribute("style","background-color: white")
		cont.setAttribute("style","background-color: white")


		session["background"]=WHITE
		return
	}


	background.setAttribute("style","background-color: white")
	body.setAttribute("style","background-color: white")
	cont.setAttribute("style","background-color: white")


	session["background"]=WHITE

	if(oscilate(session["freq"])<0){
		background.setAttribute("style","background-color: lightgray")
		body.setAttribute("style","background-color: lightgray")
		cont.setAttribute("style","background-color: lightgray")

		session["background"] = BLACK
	}

	window.requestAnimationFrame(flicker_background)

}

// var fade_fix = function(tau){
// 	var init_time = new Date().getTime()/1000;
// 	for (delta = 0; math.exp(delta*tau)>0.1; delta = (init_time - new Date().getTime()/1000))
// }

var gen_catches = function(){

	// flip coin to determine if catch trial?

	n_catch = 0;
	t=0;
	max_dur = PRES_DUR+session["delay"];

	while(n_catch<MAX_CATCH && t<max_dur){
		t+=math.random(max_dur)
		if (t+CATCH_TIMEOUT<max_dur){
			setTimeout(function () {run_catch(session['trial_number'])},t)
			setTimeout(function () {catch_timeout()},t+CATCH_TIMEOUT)
			n_catch++
			t+=CATCH_INTERVAL+CATCH_TIMEOUT
		}
	}
	console.log(n_catch+" catch trial run")
}

var run_catch = function(trial_number){
		session['catch_t'] = new Date().getTime()
		session['in_catch']=1
		flip_fixation("red");
}

var catch_timeout = function(){
	if (session['in_catch']){
		session['in_catch'] = 0;
		flip_fixation("black");
		console.log("catch timed out.")
		session['catch_false']++
	}
}



var space_detector_down = function(e){
	if (e.keyCode == SPACE){
		session["space"] = DOWN;
	}
}

var flip_fixation_old=function(s){
	if (!session['in_catch'])
		return 
	// if a catch moment, set fix to gray and callback to recover after FLIP_DUR
	if (s){
		session['n_catch']++
		$("#fixation")[0].setAttribute("style","fill: red");
		setTimeout(function () {flip_fixation(0)},FLIP_DUR)

	}
	// back to normal
	else {
		$("#fixation")[0].setAttribute("style","fill: black")
	}
}


var flip_fixation=function(color){
	$("#fixation")[0].setAttribute("style","fill: "+color);
}


var session_init=function(){

	session['catch_trial'] = 0;
	session['wheel_on'] = 0;
	session['listening'] = 0;
	session['catch_false'] = 0;

	// not clear what to do here
	session['space'] = DOWN;
	session['in_catch'] = 0
	session['is_catch'] = 0
	session['catch_rt'] = []
	session['n_catch'] = 0
	session['catch_t'] = math.Infinity
	session["background"] = WHITE
}


var feedback = function(report_pos,report_angle){

	report_angle = stretch(report_angle)
	//hide_stimulus()

	max_rwd = session["factor"]*session["n_stims"]*session["max_reward"]

	report_color = angle2rgb(report_angle);
	correct = session["trial"][session['correct']];
	correct_color = correct["color"]
	correct_pos = angle2pos(correct_color,WHEEL_Y/2-21,CENTER)
	dist = math.abs(circ_dist(report_angle, correct_color))

	center = [CENTER[0]-40,CENTER[1]-40]

	if (dist > math.pi/5){

		feed_text = "0¢"
		fill = "#FA5858"
		animation="fadeOutDown"


	}
	else{
		rwd_amount = math.max(compute_rwd(dist)*max_rwd,0.005)
		rwd_amount =  math.round(rwd_amount*100,1)/100

		feed_text = rwd_amount*100+"¢"
		session["acc_rwd"] += compute_rwd(dist)*session["factor"]*session["n_stims"]

		if (session["phase"] == TEST){
			center = [CENTER[0]-80,CENTER[1]-40]
			feed_text = "correct"
		}

		else{
			session["trial_rwd"] =rwd_amount
			session["total_reward"] += rwd_amount
		}


		fill ="#58FA58"
		r =  250-math.round(compute_rwd(dist)*250)
		fill = encapsulate_rgb([r,250,0])
		session["n_correct"]++
		animation="fadeOutUp"
	}


	// rotate correct color for this wheel rotation
	// report angle was rotated on main routine, so also rotating it back
	correct_angle = circ_dist(correct_color,session["wheel_offset"])
	report_angle =  circ_dist(report_angle,session["wheel_offset"])

	screen.insert("text")
		.attr("x",center[0])
		.attr("y", center[1])
		.attr("id","feedback")
		.attr("font-size",50)
		.attr("font-family","Verdana")
	
	feed = $("#feedback")[0]

	feed.innerHTML=feed_text
	feed.setAttribute("fill", fill)

	$('#feedback').addClass('animated '+animation);

	screen.insert("circle")
		.attr("cx", report_pos[0])
		.attr("cy", report_pos[1])
		.attr("r", STIM_SIZE/2)
		.style("fill", encapsulate_rgb(report_color))
		.style("stroke", "black")
		.style("stroke-width","3px")
		.attr("fill-opacity","1");

	correct_pos = angle2pos(correct_angle,WHEEL_Y/2-21,CENTER)
	screen.insert("circle")
		.attr("cx", correct_pos[0])
		.attr("cy", correct_pos[1])
		.attr("r", STIM_SIZE)
		.style("fill", encapsulate_rgb(angle2rgb(correct_color)))
		.style("stroke", "black")
		.style("stroke-width","3px")
		.attr("fill-opacity","1");


	correct_pos_r = angle2pos(circ_dist(correct_angle,0.5),WHEEL_Y/2-21,CENTER)
	correct_pos_l = angle2pos(circ_dist(correct_angle,-0.5),WHEEL_Y/2-21,CENTER)

	// screen.insert("line")
	// 	.attr("x1", CENTER[0])
	// 	.attr("y1", CENTER[1])
	// 	.attr("x2", correct_pos_r[0])
	// 	.attr("y2", correct_pos_r[1])
	// 	.style("stroke", "black")
	// 	.style("stroke-width","4px")
	// 	.style("stroke-dasharray","5,5")
	// 	.attr("fill-opacity","1");


	// screen.insert("line")
	// 	.attr("x1", CENTER[0])
	// 	.attr("y1", CENTER[1])
	// 	.attr("x2", correct_pos_l[0])
	// 	.attr("y2", correct_pos_l[1])
	// 	.style("stroke", "black")
	// 	.style("stroke-width","4px")
	// 	.style("stroke-dasharray","5,5")
	// 	.attr("fill-opacity","1");


	// color correct stim color
	// stim = d3.select("#all_stims").select("#stim"+session["correct"])[0][0]
	// stim.setAttribute("style","fill: "+encapsulate_rgb(angle2rgb(correct_color)))
	// stim.setAttribute("stroke-width","8px")



}

var get_correct = function(){
	trial = session["trial"]
	for(i=0;i<trial.length;i++)
		if (trial[i]["correct"])
			break

	return i
}

var bold_correct= function(screen){
	stim = d3.select("#all_stims").select("#stim"+session["correct"])[0][0]
	stim.setAttribute("style","fill: black")
	// c=session["trial"][session["correct"]]["color"]
	// stim.setAttribute("style","fill: "+encapsulate_rgb(angle2rgb(c)))


}

var draw_stims=function(screen){

	for(i=0;i<session["trial"].length;i++){
		stim = session["trial"][i]
		screen.insert("circle")
			.attr("id","stim"+i)
			.attr("cx", stim['pos_x']-STIM_SIZE)
			.attr("cy", stim['pos_y']-STIM_SIZE)
			.attr("r", STIM_SIZE)
			.style("fill", encapsulate_rgb(angle2rgb(stretch(stim['color']))))
			.style("stroke", "black")
			.style("stroke-width","0px")
			.attr("fill-opacity","1")

	}
}


var flip_background=function(){
	background=d3.select("#all_stims")[0][0]	

	if (session["background"] == WHITE){
		background.setAttribute("style","background-color: lightgray")
		session["background"] = BLACK
	}
	else{
		background.setAttribute("style","background-color: white")
		session["background"]=WHITE
	}
}

var hide_stimulus = function(){
	var all_stims = d3.select("#all_stims").selectAll("[id^='stim']")[0]
	var n_stims = all_stims.length

	while (n_stims) {
		var stim = all_stims[n_stims-1];
		stim.setAttribute("style","fill: lightgray");
		stim.setAttribute("fill-opacity","0")
		n_stims--
	}

}

var blank_stimuli = function(){
	var all_stims = d3.select("#all_stims").selectAll("[id^='stim']")[0]
	// var n_stims = all_stims.length
	n_stims = session["n_stims"]


	while (n_stims) {
		var stim = all_stims[n_stims-1];
		stim.setAttribute("style","fill: gray");
		stim.setAttribute("fill-opacity","1")
		stim.setAttribute("r",STIM_SIZE)
		n_stims--
	}
}

var drop_stimuli = function(){
	var all_stims = d3.select("#all_stims").selectAll("[id^='stim']")[0]
	var n_stims = all_stims.length

	// flip coin to know how many stim will be droped/turned invisible
	var n_drop = math.randomInt(0,all_stims.length)
	session["n_drop"] = n_drop

	// flip #n_drop coins to know which stims will be dropped, drop them and log it
	session["dropped"] = []

	while (n_drop) {
		not_done = true
		while (not_done){
			stim = math.randomInt(0,all_stims.length)
			not_done = stim in session["dropped"]
		}
		session["dropped"].push(stim)
		all_stims[stim].setAttribute("style","fill: white");
		n_drop--
	}
}

var draw_wheel2 = function(screen){
	screen
		.insert("svg:image")
		.attr("id","wheel")
		.attr('x',CENTER[0]-WHEEL_X/2)
		.attr('y',CENTER[1]-WHEEL_Y/2)
		.attr('width', WHEEL_X)
		.attr('height', WHEEL_Y)
		.attr("xlink:href",images[session["wheel_n"]])
}

function draw_wheel (screen) {
    var width = width = parseInt(d3.select("#all_stims").style("width"), 10);

    var mySvg = d3.select("#all_stims")
        
    var myGroup = mySvg.append("g")
    	.attr("id","wheel")
        .attr("transform", "translate(" + (width / 2)  + "," + (width / 2) + ")" );

    var myArc = d3.svg.arc()
                  .innerRadius(width/2*0.75)
                  .outerRadius(width/2);

    var numberOfSegments = N_SEGS

    var radians;
    var degrees;

    radians = (Math.PI * 2) / numberOfSegments;
    degrees = 360 / numberOfSegments;

    var transform = zeros(numberOfSegments,0)
  
    myArc.startAngle(function (d,i) { return radians * i } );
    myArc.endAngle(function (d,i) { return radians * (i + 1) });
  
    var segments = myGroup.selectAll("path").data(d3.range(numberOfSegments));
  
    segments.enter().append("path");
  
    segments.attr('d', myArc)
        .attr('fill', function(d,i) {
          rotation = -deg2rad(90)+session["wheel_offset"]
      	  angle = deg2rad((i) * degrees)
      	  angle=circ_dist(angle,-rotation)
      	  angle=stretch(angle)
          return "hsl(" + (rad2deg(angle)) + ",100%,50%)";
        });
  
    segments.exit().remove();
  
}

var hide_wheel = function(screen){
	d3.select("#wheel").remove()
}

var clean_trial = function() {
	d3.select("#stims").selectAll("center").remove()
};

var start_screen = function(){
	clean_trial();
	var screen = d3.select("#stims")
			  .insert("center")
			  .insert("svg")
			  .attr("id", "all_stims")
			  .attr("width", SCR_X)
			  .attr("height", SCR_Y)
	return screen
}

var draw_fix = function(screen,color){
	screen.insert("rect")
		.attr("id","fixation")
		.attr("x",SCR_X/2-FIX_SIZE/2)
		.attr("y", SCR_Y/2-FIX_SIZE/2)
		.attr("width",FIX_SIZE)
		.attr("height",FIX_SIZE)
		.style("fill", color)
		.style("stroke", "black")
		.style("stroke-width","4px")
		.attr("fill-opacity","1")

}

var update_stats = function(){

	// In every entry of reward, change it to the actual performance.
	rws=d3.selectAll("#reward")[0]
	for (i=0;i<rws.length;i++)
		rws[i].innerHTML = math.round(session["acc_rwd"]*100,2)

	$("#total_trials")[0].innerHTML = params["total_trials"]
	$("#total_duration")[0].innerHTML = math.floor(params["total_trials"]/80*10)+1
	$("#max_reward")[0].innerHTML = params["max_reward"]
	
	tr=d3.selectAll("#total_reward")[0]
	for (i=0;i<tr.length;i++)
		tr[i].innerHTML = math.round(session["total_reward"],2)


}

var color_blind_test = function(next_step){
	figures =[ "Plate12.gif","Plate15.gif","Plate26.gif",
				"Plate3.gif","Plate45.gif",
				"Plate8.gif","Plate16.gif",
				"Plate29.gif","Plate42.gif","Plate5.gif",
				"Plate6.gif"];
	//figures =[ "Plate12.gif"]

	figure_codes = [12,15,26,3,45,8,16,29,42,5,6];

	
	img = document.createElement("IMG");
	img.setAttribute("id","fig")
    img.src = "/static/images/color_blind/"+figures[0]
    question = $("#question").remove()
    question[0].appendChild(img);
    input = $("#input")
    question.append(input)

	root_q = $("#color_test")

	for (i=0;i<figures.length;i++){
		figure = figures[i]
		id = "question"+i
		question =  question.clone()
		question[0].id = id
		question[0].childNodes[1].src="/static/images/color_blind/"+figures[i]
		question[0].childNodes[2].id="input"+i
		root_q.append(question)
	}

	$("#next").click(function() {
		inputs = d3.selectAll("input")[0]
		pass = true
		for (i=0;i<inputs.length;i++)
			pass &= inputs[i].value==figure_codes[i]

		if (pass){
			next_step()
		}
		else{

    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() {
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
            }, 
            });
		}
	});
}

var Questionnaire = function() {

	var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your HIT. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

	record_responses = function() {

		psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'submit'});

		$('textarea').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);
		});
		$('select').each( function(i, val) {
			psiTurk.recordUnstructuredData(this.id, this.value);		
		});

	};

	prompt_resubmit = function() {
		document.body.innerHTML = error_message;
		$("#resubmit").click(resubmit);
	};

	resubmit = function() {
		document.body.innerHTML = "<h1>Trying to resubmit...</h1>";
		reprompt = setTimeout(prompt_resubmit, 10000);
		
		psiTurk.saveData({
			success: function() {
			    clearInterval(reprompt); 
                psiTurk.computeBonus('compute_bonus', function(){finish()}); 
			}, 
			error: prompt_resubmit
		});
	};

	// Load the questionnaire snippet 
	psiTurk.showPage('postquestionnaire.html');
	psiTurk.recordTrialData({'phase':'postquestionnaire', 'status':'begin'});
	
	$("#next").click(function () {
	    record_responses();
	    psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() {
                	psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                }); 
            }, 
            error: prompt_resubmit});
	});
    
	
};
