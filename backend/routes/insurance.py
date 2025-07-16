from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from database import db
from models import InsurancePlan, InsurancePlanCreate
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[InsurancePlan])
async def list_insurance_plans(
    provider_name: Optional[str] = None,
    plan_type: Optional[str] = None
):
    """Get all insurance plans with optional filtering"""
    try:
        filter_query = {}
        if provider_name:
            filter_query["provider_name"] = {"$regex": provider_name, "$options": "i"}
        if plan_type:
            filter_query["plan_type"] = {"$regex": plan_type, "$options": "i"}
        
        plans = []
        async for plan in db.insurance_plans.find(filter_query):
            plan["_id"] = str(plan["_id"])
            plans.append(InsurancePlan(**plan))
        
        return plans
    except Exception as e:
        logger.error(f"Error fetching insurance plans: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/{plan_id}", response_model=InsurancePlan)
async def get_insurance_plan(plan_id: str):
    """Get a specific insurance plan by ID"""
    try:
        plan = await db.insurance_plans.find_one({"_id": plan_id})
        if not plan:
            raise HTTPException(status_code=404, detail="Insurance plan not found")
        
        plan["_id"] = str(plan["_id"])
        return InsurancePlan(**plan)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching insurance plan: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/", response_model=InsurancePlan)
async def create_insurance_plan(
    plan: InsurancePlanCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new insurance plan (admin only)"""
    try:
        # Check if user is admin (you can implement admin role checking here)
        # For now, we'll allow any authenticated user to create plans
        
        plan_dict = plan.dict()
        plan_dict["created_at"] = datetime.utcnow()
        plan_dict["updated_at"] = datetime.utcnow()
        
        result = await db.insurance_plans.insert_one(plan_dict)
        plan_dict["_id"] = str(result.inserted_id)
        
        logger.info(f"Insurance plan created: {plan.provider_name} - {plan.plan_name}")
        return InsurancePlan(**plan_dict)
    except Exception as e:
        logger.error(f"Error creating insurance plan: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/{plan_id}", response_model=InsurancePlan)
async def update_insurance_plan(
    plan_id: str,
    plan_update: InsurancePlanCreate,
    current_user: dict = Depends(get_current_user)
):
    """Update an existing insurance plan"""
    try:
        # Check if plan exists
        existing_plan = await db.insurance_plans.find_one({"_id": plan_id})
        if not existing_plan:
            raise HTTPException(status_code=404, detail="Insurance plan not found")
        
        update_dict = plan_update.dict()
        update_dict["updated_at"] = datetime.utcnow()
        
        await db.insurance_plans.update_one(
            {"_id": plan_id},
            {"$set": update_dict}
        )
        
        # Return updated plan
        updated_plan = await db.insurance_plans.find_one({"_id": plan_id})
        updated_plan["_id"] = str(updated_plan["_id"])
        
        logger.info(f"Insurance plan updated: {plan_id}")
        return InsurancePlan(**updated_plan)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating insurance plan: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/{plan_id}")
async def delete_insurance_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an insurance plan"""
    try:
        # Check if plan exists
        existing_plan = await db.insurance_plans.find_one({"_id": plan_id})
        if not existing_plan:
            raise HTTPException(status_code=404, detail="Insurance plan not found")
        
        await db.insurance_plans.delete_one({"_id": plan_id})
        
        logger.info(f"Insurance plan deleted: {plan_id}")
        return {"message": "Insurance plan deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting insurance plan: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/providers/{provider_name}", response_model=List[InsurancePlan])
async def get_plans_by_provider(provider_name: str):
    """Get all insurance plans for a specific provider"""
    try:
        plans = []
        async for plan in db.insurance_plans.find({"provider_name": {"$regex": provider_name, "$options": "i"}}):
            plan["_id"] = str(plan["_id"])
            plans.append(InsurancePlan(**plan))
        
        return plans
    except Exception as e:
        logger.error(f"Error fetching plans by provider: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") 