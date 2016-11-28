/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to
// they are not used in the stroop code but may be useful to you

// All pages to be loaded
var pages = [
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	// "instructions/instruct-4.html",
	"instructions/instruct-5.html",
	"instructions/instruct-6.html",
	"instructions/instruct-ready.html",

	"repeat_task.html",
	"before_task.html",
	"stage.html",
	"thanks.html",
	"press_space.html",
	"postquestionnaire.html",
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
	"instructions/instruct-1.html",
	"instructions/instruct-2.html",
	"instructions/instruct-3.html",
	// "instructions/instruct-4.html",
	"instructions/instruct-5.html",
	"instructions/instruct-6.html",
	"instructions/instruct-ready.html"
];

var before_task = [
	"before_task.html"
];

var repeat_task = [
	"repeat_task.html"
];



var images = [
			"static/images/wheel0.png",
			"static/images/wheel90.png",
			"static/images/wheel180.png",
			"static/images/wheel270.png",
			];


psiTurk.preloadImages(images);

var session = {}

// Wheel parameters
var wheel_offset = [deg2rad(0),deg2rad(90),deg2rad(180),deg2rad(270)];
SCR_X = 600
SCR_Y = 600
WHEEL_X = 600
WHEEL_Y = 600
CENTER = [SCR_X/2,SCR_X/2]
STIM_SIZE=20
RADIUS = WHEEL_Y/3.2

// Task stage codes
FIX=0
PRES = 1
DELAY = 2
REPORT = 3
FINISH = 4

// Task durations
FIX_DUR = 500
PRES_DUR = 500
DELAY_DUR = 0//3000
FEED_DUR = 1000
FLIP_DUR = 50
TOTAL_DUR = FIX_DUR + PRES_DUR + DELAY_DUR


// Task phase codes
TEST = 1
TASK = 0

CORRECT = 0
CATCH=1

SPACE = 32
DOWN=1
UP=0
MAX_CATCH=2
CATCH_INTERVAL=500
CATCH_TIMEOUT=1000
CORRECT_THR=0.5

WHITE=0
BLACK=1
FIX_SIZE = 20


/************************
* SWAP ERROR EXPERIMENT *
*************************/

var StroopExperiment = function(trials) {

	var next = function() {
		if (session["trials"].length<session["trial_number"]+1) {
			finish();
		}
		else {
			session["trial"] = session["trials"][session["trial_number"]];
			session["correct"] = get_correct();
			session["delay"] = session["trial"][0]["delay"]*1000
			session["state"] = FIX;
			session["show"] = session["trial"][0]["show"]
			screen = start_screen();
			draw_fix(screen,"white");
			$("#fixation").mouseover(show_trial)
			psiTurk.saveData()
		}
	};
	
	var response_handler = function(e) {
		if (!session["listening"]) return;

		session["listening"] = 0;

		offset = $(this).offset()
		report_x = e.clientX
		report_y = e.clientY

		report_x = e.pageX - offset.left;
    	report_y = e.pageY - offset.top;

    	if (!report_x & !report_y){
    		report_x = report_y = 1;
    	}

		report_angle = pos2angle([report_x,report_y],CENTER);
		report_angle = circ_dist(report_angle,-wheel_offset[session["wheel_n"]])
		report_pos = angle2pos(report_angle,250,CENTER);
		report_on_screen = [report_x,report_y]

		rt = new Date().getTime() - session["wheel_on"];

		psiTurk.recordTrialData({'phase':session["phase"],
                                 'report_x':report_x,
                                 'report_y':report_y,
                                 'report_angle': report_angle,
                                 'report_pos': report_pos,
                                 'report_pos': report_on_screen,
                                 'rt':rt,
                                 'n_catch': session["n_catch"],
                                 'n_drop': session["n_drop"],
                                 'catch_rt': session["catch_rt"],
                                 'trial': JSON.stringify(session["trial"]),
                                 'trial': session["trial"],
                             	 'session': session}
                               );

		feedback(report_on_screen,report_angle)

		// reset session variables
		session_init()
		session["trial_number"]++;
		hide_wheel()
		setTimeout(function () {next()},FEED_DUR)

	};


	

	var mouse_down_handler = function(e){


		// check if catch trial:
		// if yes, compute RT and store it
		if (session["in_catch"]){
			console.log("catch!")
			flip_fixation("black")
			session["catch_rt"].push(new Date().getTime() - session["catch_t"])
			console.log(session["catch_rt"])
			session["in_catch"] = 0
			return
		}

		// show error somehow
		session["in_catch"] = 0
		console.log("wrong click")

		session["catch_false"]++;
	}




	var show_trial = function () {
		trial=session["trial"];
		state = session["state"];

		switch (state){


			// Fixation
			case FIX:
				screen = start_screen();
				draw_fix(screen,"black");
				if (session["catch_trial"]) gen_catches();
				//gen_catches();
				session["state"] = PRES;
				setTimeout(function () {show_trial()},FIX_DUR)

				break;

			// Presentation
			case PRES:
				screen = start_screen();
				draw_fix(screen,"black")
				$("#fixation").mousedown(mouse_down_handler);
				draw_stims(screen);

				session["state"] = DELAY;
				setTimeout(function () {show_trial()},PRES_DUR)
				break;

			// Delay 
			case DELAY:
				blank_stimuli()
				//drop_stimuli()
				if (!session["show"])
					hide_stimulus()
				// window.requestAnimationFrame(flicker_background)
				session["state"] = REPORT;
				setTimeout(function () {show_trial()},session["delay"])
				break;

			// Report
			case REPORT:
				session["state"] = FINISH
				session["wheel_n"] = math.randomInt(0,wheel_offset.length)
				draw_wheel(screen);
				session["wheel_on"] = new Date().getTime();
				blank_stimuli();
				bold_correct(screen);
				$("#all_stims").click(response_handler);
				session["listening"] = 1;
				window.requestAnimationFrame(flicker_correct)
				break;
		}


	};

	var finish = function() {
	switch (session["phase"]) {

		case TASK:
			psiTurk.showPage('repeat_task.html');
			$("#repeat").click(function () { gen_trials2(params,exp_callback)});
			$("#finish").click(function () { psiTurk.showPage('thanks.html'); currentview = new Questionnaire();});
			break;

		case TEST:
			psiTurk.showPage('before_task.html');
			update_stats();
			$("#repeat").click(start_test);
			$("#begin").click(function () {
				session['phase'] = TASK; 
		 		params = default_parms(TASK);
		 		gen_trials2(params,exp_callback);
		 	});
    		break;
		} 

	};

	trials = _.shuffle(trials)


	// Initialize experiment variables
	session['trials'] = trials;
	session['trial_number'] = 0;
	session['start_time'] = Date.now()
	session['freq'] = 4
	session_init();

	// Load the stage.html snippet into the body of the page
	psiTurk.showPage('stage.html');

	// Start the experiment
	next();
};

exp_callback = function(trials) { currentview = new StroopExperiment(trials) }

var start_test = function(){

	params = default_parms(TEST);
	session['phase'] = TEST
    psiTurk.doInstructions(
    	instructionPages, 
    	function () { gen_trials2(params,exp_callback)}
    );
}

// Task object to keep track of the current phase
var currentview;

/*******************
 * Run Task
 ******************/
$(window).load( function(){

	start_test();

});
