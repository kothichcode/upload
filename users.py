from fastapi import APIRouter, Depends, HTTPException, status
from app.api.v1.endpoints.weather import get_current_user
from app.db.models.user import UserUpdate, User
from app.core.security import get_password_hash
from app.db.mongodb import db
from bson.objectid import ObjectId

router = APIRouter()

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return current_user

@router.put("/me", response_model=User)
async def update_user(
    user_update: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    user_collection = db.client.weather_app.users
    
    update_data = user_update.dict(exclude_unset=True)
    
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    if update_data:
        await user_collection.update_one(
            {"_id": current_user["_id"]},
            {"$set": update_data}
        )
    
    updated_user = await user_collection.find_one({"_id": current_user["_id"]})
    return updated_user

@router.get("/search-history")
async def get_search_history(current_user: dict = Depends(get_current_user)):
    return current_user.get("search_history", [])

@router.delete("/search-history")
async def clear_search_history(current_user: dict = Depends(get_current_user)):
    user_collection = db.client.weather_app.users
    
    await user_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"search_history": []}}
    )
    
    return {"message": "Search history cleared"}