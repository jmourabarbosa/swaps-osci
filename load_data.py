from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd
from matplotlib.mlab import find
from numpy import *
from matplotlib.mlab import *
from circ_stats import *
from scipy.io import savemat
import sys
import os
import scikits.bootstrap as bootstrap




# db_url = "sqlite:///"+sys.argv[1]

# table_name = 'swaps'
# data_column_name = 'datastring'
# # boilerplace sqlalchemy setup
# engine = create_engine(db_url)
# metadata = MetaData()
# metadata.bind = engine
# table = Table(table_name, metadata, autoload=True)
# # make a query and loop through
# s = table.select()
# rows = s.execute()
# rs = []
# ds = []


dbs = amap(lambda x: x.split(".db"),os.listdir(sys.argv[1]))
dbs = dbs[amap(len,dbs)>1]

Rows = []
for db in dbs:
	db_url = "sqlite:///"+sys.argv[1]+db[0]+".db"
	table_name = 'swaps'
	data_column_name = 'datastring'
	# boilerplace sqlalchemy setup
	engine = create_engine(db_url)
	metadata = MetaData()
	metadata.bind = engine
	table = Table(table_name, metadata, autoload=True)
	# make a query and loop through
	s = table.select()
	rows = s.execute()
	Rows.append(rows)

def to_pi(angles):
	angles = array(angles)
	idx = angles>pi
	angles[idx] = angles[idx]-2*pi
	return angles

# filter subjects with no real experiment
def get_trials_data(data):
	idx = find([not d['trialdata']['phase'] for d in data["data"]])
	trialdata = [data["data"][i]["trialdata"] for i in idx]
	return trialdata

def filter_data(data):
	trials = []
	for d in data:
		trial = {}
		trial["load"] = d["load"]
		trial["delay"] = d["delay"]
		trial["freq"] = d["freq"]
		trial["report_color"] = d["report_color"]
		trial["rt"] = d["rt"]

		stims = json.loads(d["trial"])
		stims = json.loads(d["session"])["trial"]
		NT = []
		for i,s in enumerate(stims):
			if s["correct"]:
				trial["T_color"] = s["color"]
				trial["T_pos"] = s["pos_angle"]
			else:
				NT.append([s["color"],s["pos_angle"]])

		for i,[color,pos] in enumerate(NT):
			trial["NT_color"+str(i)] = color
			trial["NT_pos"+str(i)] = pos

		trials.append(trial)
	return trials


all_trials  = {}
for rows in Rows:
	for r in rows:
		if r["datastring"]:
			data=json.loads(r['datastring'])
			workerID = data["workerId"]
			trials_data = get_trials_data(data)
			if len(trials_data) > 300:
				all_trials[workerID] = filter_data(trials_data)



good_workers = all_trials.keys()


X=[]
T_c=[]
T_p = []
NT_c = []
NT_p = []
D=[]
C=[]
loads = []
RT=[]
for wid in good_workers:

	x=[]
	t_c=[]
	t_p=[]
	nt_c=[]
	nt_p=[]	
	d=[]
	c=[]
	rt=[]
	for trial in all_trials[wid]:
		load = trial["load"]
		loads.append(load)
		x.append(trial["report_color"])
		t_c.append(trial["T_color"])
		t_p.append(trial["T_pos"])
		d.append(trial["delay"])
		c.append(trial["freq"])
		rt.append(trial["rt"])

		nt_c1=[]
		nt_p1=[]
		for nt in range(load-1):
			nt_c1.append(trial["NT_color"+str(nt)])
			nt_p1.append(trial["NT_pos"+str(nt)])
		nt_c.append(nt_c1)
		nt_p.append(nt_p1)

	X.append(x)
	T_c.append(t_c)
	T_p.append(t_p)
	NT_c.append(nt_c)
	NT_p.append(nt_p)
	D.append(d)
	C.append(c)
	RT.append(rt)


x=concatenate(X)
t_c = concatenate(T_c)
t_p = concatenate(T_p)
nt_c = concatenate(NT_c)
nt_p = concatenate(NT_p)
rt = concatenate(RT)
c=concatenate(C)
d = array(loads) == 2

X=[]
T=[]
NT=[]
RT=[]

for freq in unique(c):
	idx = freq == c
	X+=[x[idx & d]]
	T+=[amap(to_pi,t_c[idx & d])]
	NT+=[amap(to_pi,nt_c[idx & d])]
	RT+=[rt[idx & d]]


X=array(X)
T =array(T)
NT =array(NT)
freqs = {"X": X, "T": T, "NT": NT}


savemat("osci_d.mat",freqs)

figure()
title("mean error")
mean_err = array([bootstrap.ci(abs(circdist(X[i],T[i])),circmean) for i in range(len(X))])
plot(unique(c),ones(len(unique(c)))*mean(mean_err[0]),"r--",label="hide")
plot(unique(c),mean(mean_err,1),"b")
plot(unique(c),mean(mean_err,1),"bo",ms=5)

fill_between(unique(c),mean_err[:,0],mean_err[:,1],alpha=0.1)

legend()

figure()
title("mean RT")
for i in range(len(RT)): RT[i]=RT[i][RT[i]<3*std(RT[i])]

mean_err = array([bootstrap.ci(RT[i],mean) for i in range(len(X))])
plot(unique(c),ones(len(unique(c)))*mean(mean_err[0]),"r--",label="hide")
plot(unique(c),mean(mean_err,1),"b")
plot(unique(c),mean(mean_err,1),"bo",ms=5)

fill_between(unique(c),mean_err[:,0],mean_err[:,1],alpha=0.1)

legend()
