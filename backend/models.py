from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone: Optional[str] = None
    #age: Optional[int] = None

class User(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    #age: Optional[int] = None

class UserOut(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    email: EmailStr
    phone: Optional[str] = None
    #age: Optional[int] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[str] = None

class RefreshToken(BaseModel):
    refresh_token: str

class InsurancePlan(BaseModel):
    _id: str
    provider_name: str
    plan_name: str
    plan_type: str  # e.g., "PPO", "HMO", "EPO", "POS"
    coverage_details: dict  # Detailed coverage information
    cost_sharing: dict  # Deductible, copay, coinsurance
    network_type: str  # "In-network", "Out-of-network", "Both"
    annual_premium: float
    deductible: float
    copay: dict  # Different copays for different services
    coinsurance: float  # Percentage
    out_of_pocket_max: float
    prescription_coverage: bool
    mental_health_coverage: bool
    dental_coverage: bool
    vision_coverage: bool
    created_at: datetime
    updated_at: datetime

class InsurancePlanCreate(BaseModel):
    provider_name: str
    plan_name: str
    plan_type: str
    coverage_details: dict
    cost_sharing: dict
    network_type: str
    annual_premium: float
    deductible: float
    copay: dict
    coinsurance: float
    out_of_pocket_max: float
    prescription_coverage: bool = False
    mental_health_coverage: bool = False
    dental_coverage: bool = False
    vision_coverage: bool = False

class Provider(BaseModel):
    id: str = Field(..., alias="_id")
    name: str
    specialty: str
    address: str
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    phone: str
    email: str
    rating: float
    wait_time: str
    accepted_insurances: List[str]
    experience: Optional[str] = None
    education: Optional[str] = None
    match_score: Optional[float] = None
    match_reasons: Optional[List[str]] = None

class IntakeForm(BaseModel):
    user_id: str
    primarySymptoms: str  # Keep as str to match frontend, will be converted to list in the route
    duration: str
    urgencyLevel: str
    severity: str
    detailedDescription: str
    address: str
    city: str
    state: str
    pincode: str
    insuranceProvider: str
    insurancePlan: str
    memberId: Optional[str] = None

class BookingCreate(BaseModel):
    provider_id: str
    appointment_time: datetime
    status: str = "pending"
    # Insurance details
    insurance_provider: Optional[str] = None
    insurance_plan: Optional[str] = None
    member_id: Optional[str] = None

class Booking(BaseModel):
    id: str = Field(..., alias="_id")
    user_id: str
    provider_id: str
    appointment_time: datetime
    status: str = "pending"
    # Provider details stored when booking is made
    provider_details: Optional[dict] = None
    # Insurance details
    insurance_provider: Optional[str] = None
    insurance_plan: Optional[str] = None
    member_id: Optional[str] = None
    # Cost estimation
    estimated_cost: Optional[float] = None
    insurance_coverage: Optional[float] = None
    out_of_pocket_cost: Optional[float] = None
    created_at: datetime
    updated_at: datetime 