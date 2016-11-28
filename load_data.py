from sqlalchemy import create_engine, MetaData, Table
import json
import pandas as pd

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

