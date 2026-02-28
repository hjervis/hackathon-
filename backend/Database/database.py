from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os


#Creates the URL for the engine to connect to
DATABASE_URL = "mysql+pymysql://root:Holfester123?@localhost/publicsafety_db"


#Raw connection to yorr DB file 
engine = create_engine(DATABASE_URL)

#Allows us to create sessions 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#Base for each model inside the "Models" folder 
Base = declarative_base()

#Automatically allows a creation of a session and closes it in case of errors
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()