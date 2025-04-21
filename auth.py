from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.db.models.user import UserCreate, User, Token
from app.db.mongodb import db
from app.services.email_service import send_verification_email
from bson.objectid import ObjectId

router = APIRouter()

@router.post("/register", response_model=User)
async def register_user(user_in: UserCreate):
    # Check if user exists
    user_collection = db.client.weather_app.users
    existing_user = await user_collection.find_one({"email": user_in.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_in.password)
    db_user = {
        "email": user_in.email,
        "username": user_in.username,
        "hashed_password": hashed_password,
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "favorite_locations": [],
        "search_history": []
    }
    
    result = await user_collection.insert_one(db_user)
    db_user["_id"] = result.inserted_id
    
    # Send verification email
    await send_verification_email(user_in.email, str(result.inserted_id))
    
    return db_user

@router.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user_collection = db.client.weather_app.users
    user = await user_collection.find_one({"email": form_data.username})
    
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        subject=str(user["_id"]), expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/verify/{user_id}")
async def verify_user(user_id: str):
    user_collection = db.client.weather_app.users
    
    try:
        object_id = ObjectId(user_id)
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID"
        )
    
    result = await user_collection.update_one(
        {"_id": object_id},
        {"$set": {"is_verified": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return {"message": "Account verified successfully"}