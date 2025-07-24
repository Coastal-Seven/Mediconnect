from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import EmailStr
from datetime import datetime
from database import db
from models import UserCreate, UserLogin, UserOut, Token, RefreshToken
from auth import get_password_hash, verify_password, create_access_token, create_refresh_token, verify_refresh_token, get_current_user, ACCESS_TOKEN_EXPIRE_HOURS
from email_service import send_welcome_email
from email_templates import EmailTemplate
import logging

# Configure logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def get_current_user_info(current_user: UserOut = Depends(get_current_user)):
    return current_user.dict(by_alias=True)

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate):
    try:
        logger.info(f"Attempting to register user: {user.email}")
        
        # Check if user already exists
        existing = await db.users.find_one({"email": user.email})
        if existing:
            logger.warning(f"Registration failed: Email already exists - {user.email}")
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Prepare user data
        user_dict = user.dict()
        user_dict["password"] = get_password_hash(user.password)
        user_dict["created_at"] = datetime.utcnow()
        
        # Insert user into database
        result = await db.users.insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)
        
        # Send welcome email
        try:
            email_data = {
                "user_name": user.name,
                "login_url": "/login"
            }
            email_sent = await send_welcome_email([user.email], email_data)
            if email_sent:
                logger.info(f"Welcome email sent to {user.email}")
            else:
                logger.warning(f"Welcome email may not have been sent to {user.email}")
        except Exception as e:
            logger.error(f"Failed to send welcome email: {str(e)}")
            # Continue with registration even if email fails
        
        logger.info(f"User registered successfully: {user.email}")
        return UserOut(**user_dict).dict(by_alias=True)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during registration")

@router.post("/login", response_model=Token)
async def login(user: UserLogin):
    try:
        logger.info(f"Login attempt for user: {user.email}")
        
        # Find user in database
        db_user = await db.users.find_one({"email": user.email})
        if not db_user:
            logger.warning(f"Login failed: User not found - {user.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify password
        if not verify_password(user.password, db_user["password"]):
            logger.warning(f"Login failed: Invalid password - {user.email}")
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Create access and refresh tokens with extended expiration
        access_token = create_access_token({"sub": str(db_user["_id"])})
        refresh_token = create_refresh_token({"sub": str(db_user["_id"])})
        
        logger.info(f"User logged in successfully: {user.email}")
        logger.info(f"Access token expires in {ACCESS_TOKEN_EXPIRE_HOURS} hours")
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_HOURS * 3600  # seconds
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during login")

@router.post("/refresh", response_model=Token)
async def refresh_token(refresh_token_data: RefreshToken):
    try:
        logger.info("Token refresh attempt")
        
        # Verify refresh token
        token_data = verify_refresh_token(refresh_token_data.refresh_token)
        
        # Check if user still exists
        user = await db.users.find_one({"_id": token_data.user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Create new access and refresh tokens
        access_token = create_access_token({"sub": token_data.user_id})
        new_refresh_token = create_refresh_token({"sub": token_data.user_id})
        
        logger.info(f"Token refreshed successfully for user: {user.get('email')}")
        
        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error during token refresh")

@router.get("/token-status")
async def check_token_status(current_user: UserOut = Depends(get_current_user)):
    """Check if the current token is valid"""
    return {
        "valid": True,
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        },
        "message": "Token is valid"
    }

@router.get("/test-auth")
async def test_auth(current_user: UserOut = Depends(get_current_user)):
    """Test endpoint to verify authentication is working"""
    return {
        "message": "Authentication successful!",
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email
        }
    }

@router.get("/{user_id}", response_model=UserOut)
async def get_user(user_id: str):
    try:
        user = await db.users.find_one({"_id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        user["_id"] = str(user["_id"])
        return UserOut(**user).dict(by_alias=True)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Get user error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal server error")