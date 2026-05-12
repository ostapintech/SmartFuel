# -*- coding: utf-8 -*-
from fastapi import FastAPI
from backend.core.database import connect_to_mongo, close_mongo_connection
from backend.api.v1.router import api_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Smartfuel API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"
                   "http://172.20.10.3:3000"
                   "http://192.168.1.114:3000"
                   ], # Адреса фронта твого друга
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Події життєвого циклу
app.add_event_handler("startup", connect_to_mongo)
app.add_event_handler("shutdown", close_mongo_connection)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Ласкаво просимо до API SmartFuel!"}