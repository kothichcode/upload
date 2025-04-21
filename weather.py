from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.services.weather_service import get_current_weather, get_forecast, get_global_weather
from app.db.mongodb import db
from app.core.security import verify_password
from jose import jwt, JWTError
from app.core.config import settings
from bson.objectid import ObjectId
from typing import List, Optional

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_collection = db.client.weather_app.users
    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.get("/current/{city}")
async def current_weather(
    city: str,
    user: dict = Depends(get_current_user)
):
    # Add to search history
    user_collection = db.client.weather_app.users
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$push": {"search_history": city}}
    )
    
    return await get_current_weather(city)

@router.get("/forecast/{city}")
async def weather_forecast(
    city: str,
    user: dict = Depends(get_current_user)
):
    return await get_forecast(city)

@router.get("/global")
async def global_weather(
    user: dict = Depends(get_current_user)
):
    return await get_global_weather()

@router.post("/favorites/{city_id}/{city_name}")
async def add_favorite(
    city_id: str,
    city_name: str,
    user: dict = Depends(get_current_user)
):
    from datetime import datetime
    
    user_collection = db.client.weather_app.users
    favorite = {
        "city_id": city_id,
        "city_name": city_name,
        "added_at": datetime.utcnow()
    }
    
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$push": {"favorite_locations": favorite}}
    )
    
    return {"message": f"Added {city_name} to favorites"}

@router.get("/favorites")
async def get_favorites(
    user: dict = Depends(get_current_user)
):
    return user.get("favorite_locations", [])

@router.delete("/favorites/{city_id}")
async def remove_favorite(
    city_id: str,
    user: dict = Depends(get_current_user)
):
    user_collection = db.client.weather_app.users
    
    await user_collection.update_one(
        {"_id": user["_id"]},
        {"$pull": {"favorite_locations": {"city_id": city_id}}}
    )
    
    return {"message": "Removed from favorites"}