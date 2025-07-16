import os
import logging
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from database import db
from models import TokenData, UserOut, User

logger = logging.getLogger(__name__)

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", "supersecret")
REFRESH_SECRET_KEY = os.getenv("REFRESH_SECRET_KEY", "refresh_supersecret")
ALGORITHM = "HS256"

# Token lifetimes
ACCESS_TOKEN_EXPIRE_HOURS = 24  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS = 7   # 7 days

# Password hashing
pwd_context = CryptContext(schemes=["sha256_crypt"], deprecated="auto")
security = HTTPBearer()

def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create an access token with 24-hour expiration"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a refresh token with 7-day expiration"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_access_token(token: str) -> TokenData:
    """Verify and decode an access token"""
    try:
        logger.info(f"Verifying access token: {token[:20]}...")
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        logger.info(f"Token payload - user_id: {user_id}, type: {token_type}")
        
        if user_id is None:
            logger.error("Token missing user_id")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if token_type != "access":
            logger.error(f"Invalid token type: {token_type}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        logger.info(f"Token verified successfully for user: {user_id}")
        return TokenData(user_id=user_id)
    except JWTError as e:
        error_msg = str(e)
        logger.error(f"JWT decode error: {error_msg}")
        
        # Provide specific error messages for different JWT errors
        if "expired" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        elif "signature" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

def verify_refresh_token(token: str) -> TokenData:
    """Verify and decode a refresh token"""
    try:
        payload = jwt.decode(token, REFRESH_SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return TokenData(user_id=user_id)
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Get the current authenticated user"""
    logger.info(f"Attempting to authenticate user with token")
    
    try:
        token_data = verify_access_token(credentials.credentials)
        logger.info(f"Token verified, user_id: {token_data.user_id}")
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise
    
    # Try to convert user_id to ObjectId if it's a valid MongoDB ObjectId
    from bson import ObjectId
    try:
        if len(token_data.user_id) == 24:  # MongoDB ObjectId is 24 characters
            user_id = ObjectId(token_data.user_id)
            logger.info(f"Converted user_id to ObjectId: {user_id}")
        else:
            user_id = token_data.user_id
            logger.info(f"Using user_id as string: {user_id}")
    except Exception as e:
        user_id = token_data.user_id
        logger.warning(f"ObjectId conversion failed, using as string: {user_id}, error: {e}")
    
    logger.info(f"Looking up user with _id: {user_id}")
    user = await db.users.find_one({"_id": user_id})
    
    if user is None:
        logger.error(f"User not found in database for user_id: {user_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"User found: {user.get('email', 'No email')}")
    
    # Convert ObjectId to string for the User model
    user["_id"] = str(user["_id"])
    
    # Create User object with the correct data structure
    try:
        user_obj = User(**user)
        logger.info(f"User object created successfully for: {user_obj.email}")
        return user_obj
    except Exception as e:
        logger.error(f"Error creating User object: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user data",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get the current user ID from token"""
    token_data = verify_access_token(credentials.credentials)
    return token_data.user_id 