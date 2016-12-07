from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd
from matplotlib.mlab import find
from numpy import *
from matplotlib.mlab import *
from circ_stats import *
from scipy.io import savemat



db_url = "sqlite:///participants.db"
db_url = "sqlite:///genis.db"
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
rs = []
ds = []


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
		trial["show"] = d["show"]
		trial["report_color"] = d["report_color"]
		trial["rt"] = d["rt"]

		stims = json.loads(d["trial"])
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
for r in rows:
	rs.append(r)
	if r["datastring"]:
		data=json.loads(r['datastring'])
		workerID = data["workerId"]
		trials_data = get_trials_data(data)
		all_trials[workerID] = filter_data(trials_data)

good_workers = [all_trials.keys()[1]]

X=[]
T_c=[]
T_p = []
NT_c = []
NT_p = []
D=[]
C=[]
for wid in good_workers:

	x=[]
	t_c=[]
	t_p=[]
	nt_c=[]
	nt_p=[]	
	d=[]
	c=[]
	for trial in all_trials[wid]:
		load = (len(trial)-7)/2
		x.append(trial["report_color"])
		t_c.append(trial["T_color"])
		t_p.append(trial["T_pos"])
		d.append(trial["delay"])
		c.append(trial["show"])
		nt_c1=[]
		nt_p1=[]
		for nt in range(load):
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


x=array(x)
t_c = array(t_c)
t_p = array(t_p)
nt_c = array(nt_c)
nt_p = array(nt_p)
c=array(c)
d=array(d)



X_show =[]
T_show =[]
NT_show =[]

X_hide =[]
T_hide =[]
NT_hide =[]

nt_idx = amap(len,nt_c)>0

for i,nt in enumerate(nt_c[nt_idx & c ]):
	for nt1 in nt:
		X_show.append(x[i])
		T_show.append(t_c[i])
		NT_show.append(nt1)

for i,nt in enumerate(nt_c[nt_idx & (~c)]):
	for nt1 in nt:
		X_hide.append(x[i])
		T_hide.append(t_c[i])
		NT_hide.append(nt1)
def to_pi(angles):
	idx = angles>pi
	angles[idx] = angles[idx]-2*pi
	return angles

X_hide=array(X_hide)
T_hide = to_pi(array(T_hide))
NT_hide = to_pi(array(NT_hide))
hide_d = {"X": X_hide, "T": T_hide, "NT": NT_hide}

X_show = array(X_show)
T_show = to_pi(array(T_show))
NT_show = to_pi(array(NT_show))
show_d = {"X": X_show, "T": T_show, "NT": NT_show}

savemat("show_d.mat",show_d)
savemat("hide_d.mat",hide_d)


