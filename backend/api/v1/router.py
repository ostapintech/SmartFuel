from fastapi import APIRouter
from backend.api.v1.endpoints import auth, profile, meals

api_router = APIRouter()
api_router.include_router(auth.router, tags=["auth"])
api_router.include_router(profile.router, tags=["profile"])
api_router.include_router(meals.router, tags=["meals"], prefix="/meals") # Додали сюди