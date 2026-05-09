# -*- coding: utf-8 -*-
from fastapi import FastAPI
from app.core.database import connect_to_mongo, close_mongo_connection
from app.api.v1.router import api_router

app = FastAPI(
    title="Smartfuel API",
    version="1.0.0"
)

# Події життєвого циклу
app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Ласкаво просимо до API SmartFuel!"}