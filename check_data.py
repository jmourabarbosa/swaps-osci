from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd
from matplotlib.mlab import find
from numpy import *
from matplotlib.mlab import *
from circ_stats import *
from scipy.io import savemat
import sys


maxi = "debug0mip6"
genis = "debugniQER"
david = "debugr7vsw"
heike = ["debug1V9C5","debug3qTe3","debug5flKX"]


db_url = "sqlite:///max.db"
db_url = "sqlite:///heike.db"
db_url = "sqlite:///1st_amt.db"
db_url = "sqlite:///"+sys.argv[1]

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

def to_pi(angles):
	angles = array(angles)
	idx = angles>pi
	angles[idx] = angles[idx]-2*pi
	return angles

# filter subjects with no real experiment
def get_trials_data(data):
	idx = find([not d['trialdata']['phase'] for d in data["data"]])
	trialdata = [data["data"][i]["trialdata"] for i in idx]
	trialdata = [d["trialdata"] for d in data["data"]]

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
		all_trials[workerID]=trials_data



