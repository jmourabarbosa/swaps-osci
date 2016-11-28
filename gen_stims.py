from random import *
from numpy import *
from math import atan2
from circ_stats import *
from pickle import dump
from joblib import Parallel, delayed  
import multiprocessing
import time


SCR_X = 600
SCR_Y = 600
WHEEL_X = 600
WHEEL_Y = 600
CENTER = [SCR_X/2,SCR_X/2]
STIM_SIZE=20
RADIUS = WHEEL_Y/3.2
CORRECT_THR=0.5
CORRECT=0



def gen_trials(total_trials,n_stims):

	trials = []

	while total_trials>0: 
		stims = gen_stim(n_stims,CENTER,RADIUS,STIM_SIZE)
		trials.append(stims)
		total_trials-=1

	shuffle(trials);
	return array(trials);

def gen_stim(n_stims,center,R,STIM_SIZE):

	stims = []
	while not validate_stims(stims,center,STIM_SIZE):
		stims = []
		for i in range(n_stims):
			angle  = random()*2*pi
			color = random()*2*pi
			pos = angle2pos(angle,R,center);
			stims+=[{'correct': 0,"pos_x": pos[0]+STIM_SIZE, "pos_y": pos[1]+STIM_SIZE, "color": color}]

	c=randint(0,n_stims);
	stims[c]['correct'] = 1
	return stims


def angle2pos(angle,R,center):
	x=R*cos(angle)+center[0]
	y=R*sin(angle)+center[1]
	return [x,y]


def pos2angle(pos,center):
	x = pos[0]-center[0]
	y = pos[1]-center[1]
	angle=atan2(y,x)	
	return angle;



def validate_stims(stims,center,STIM_SIZE):

	MIN_DIST = CORRECT_THR*0.75

	if len(stims) < 1:
		return False

	for i,stim in enumerate(stims): 
		pos1 = [stim["pos_x"],stim["pos_y"]]
		color1 = stim["color"]
		for j in range(i+1,len(stims)): 
			pos2 = [stims[j]["pos_x"],stims[j]["pos_y"]]
			color2 = stims[j]["color"]

			dist = circdist(pos2angle(pos1,center),pos2angle(pos2,center))
			dist_c = circdist(color1,color2);

			if  (abs(dist) < MIN_DIST) or (abs(dist_c) < MIN_DIST):
				return False

	return True

#specific seed, replicable
seed(96)

# more random
# seed(int(time.time()))

num_cores = multiprocessing.cpu_count()
all_trials = Parallel(n_jobs=num_cores)(delayed(gen_trials)(1000,n) for n in range(1,9))

f = open("all_trials.pickle","w")
dump(all_trials,f)
