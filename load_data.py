from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd
from matplotlib.mlab import find
from numpy import *

db_url = "sqlite:///participants.db"
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
				trial["T_angle"] = s["pos_angle"]
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
	data=json.loads(r['datastring'])
	workerID = data["workerId"]
	trials_data = get_trials_data(data)
	all_trials[workerID] = filter_data(trials_data)

