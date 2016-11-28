# this file imports custom routes into the experiment server

from flask import Blueprint, render_template, request, jsonify, Response, abort, current_app
from jinja2 import TemplateNotFound
from functools import wraps
from sqlalchemy import or_

from psiturk.psiturk_config import PsiturkConfig
from psiturk.experiment_errors import ExperimentError
from psiturk.user_utils import PsiTurkAuthorization, nocache

# # Database setup
from psiturk.db import db_session, init_db
from psiturk.models import Participant
from json import dumps, loads
from numpy import loadtxt
import random
from pickle import load

# load the configuration options
config = PsiturkConfig()
config.load_config()
myauth = PsiTurkAuthorization(config)  # if you want to add a password protect route use this

# explore the Blueprint
custom_code = Blueprint('custom_code', __name__, template_folder='templates', static_folder='static')

with open("all_trials.pickle") as f:
    all_trials = load(f)



###########################################################
#  serving warm, fresh, & sweet custom, user-provided routes
#  add them here
###########################################################

#----------------------------------------------
# example custom route
#----------------------------------------------
@custom_code.route('/my_custom_view')
def my_custom_view():
	current_app.logger.info("Reached /my_custom_view")  # Print message to server.log for debugging 
	try:
		return render_template('custom.html')
	except TemplateNotFound:
		abort(404)

#----------------------------------------------
# example using HTTP authentication
#----------------------------------------------
@custom_code.route('/my_password_protected_route')
@myauth.requires_auth
def my_password_protected_route():
	try:
		return render_template('custom.html')
	except TemplateNotFound:
		abort(404)

#----------------------------------------------
# example accessing data
#----------------------------------------------
@custom_code.route('/view_data')
@myauth.requires_auth
def list_my_data():
        users = Participant.query.all()
	try:
		return render_template('list.html', participants=users)
	except TemplateNotFound:
		abort(404)

#----------------------------------------------
# example computing bonus
#----------------------------------------------

@custom_code.route('/compute_bonus', methods=['GET'])
def compute_bonus():
    # check that user provided the correct keys
    # errors will not be that gracefull here if being
    # accessed by the Javascrip client
    if not request.args.has_key('uniqueId'):
        raise ExperimentError('improper_inputs')  # i don't like returning HTML to JSON requests...  maybe should change this
    uniqueId = request.args['uniqueId']

    try:
        # lookup user in database
        user = Participant.query.\
               filter(Participant.uniqueid == uniqueId).\
               one()
        user_data = loads(user.datastring) # load datastring from JSON
        bonus = 0

        for record in user_data['data']: # for line in data file
            trial = record['trialdata']
            if trial['phase']=='TEST':
                if trial['hit']==True:
                    bonus += 0.02
        user.bonus = bonus
        db_session.add(user)
        db_session.commit()
        resp = {"bonusComputed": "success"}
        return jsonify(**resp)
    except:
        abort(404)  # again, bad to display HTML, but...


#----------------------------------------------
# get a session of stimuli
#----------------------------------------------

@custom_code.route('/stuff', methods=['GET'])
def stuff():
    return jsonify(results=list(all_trials[0]))

@custom_code.route('/get_stims', methods=['GET'])
def get_stims():

    # trialset = load_from_db(params)
    # return trialset
    if not request.args.has_key('n_trials'):
        abort(400)

    params = {}
    params["n_trials"]  = int(request.args['n_trials'])
    params["stims"]  = request.args['stims']
    params["delays"]  = request.args['delays']

    params["stims"]  = map(int,params["stims"].split(","))
    params["delays"] = map(int,params["delays"].split(","))

    try:
        trialset = load_from_db(params)
        return jsonify(results=trialset)
    except:
        abort(404)

def gen_trial_idx(max_t,n):
    assert max_t > n
    trial_idx = []
    i=random.randint(0,max_t-1)

    for _ in range(n):
        while i in trial_idx:
            i=random.randint(0,max_t-1)
        trial_idx.append(i)

    return trial_idx

def load_from_db(params):
    trialset = []
    assert params["n_trials"]< len(all_trials)+1

    for show in [0,1]:
        for delay in params["delays"]:
            for stim in params["stims"]:
                trials = all_trials[stim-1]
                trial_idx = gen_trial_idx(len(trials),params["n_trials"])
                # need to add delay here
                trialset += add_cond(trials[trial_idx].tolist(),["delay","show"],[delay,show])

    return trialset

def add_cond(trial_list,conds_s,cond):
    for t in trial_list:
        for s in range(len(t)):
            for i,cond_s in enumerate(conds_s):
                t[s][cond_s] = cond[i]

    return trial_list

params = {}
params["delays"]=[0,3]
params["n_trials"]  = 4
params["stims"] = [1,3]
