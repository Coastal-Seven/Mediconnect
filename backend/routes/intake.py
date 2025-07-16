from fastapi import APIRouter, HTTPException
from database import db
from models import IntakeForm

router = APIRouter()

@router.post("/", response_model=IntakeForm)
async def submit_intake(form: IntakeForm):
    form_dict = form.dict()
    
    # Convert primarySymptoms from string to list if it's a comma-separated string
    if isinstance(form_dict.get("primarySymptoms"), str):
        symptoms_str = form_dict["primarySymptoms"]
        if "," in symptoms_str:
            # Split by comma and clean up each symptom
            symptoms_list = [symptom.strip() for symptom in symptoms_str.split(",") if symptom.strip()]
            form_dict["primarySymptoms"] = symptoms_list
        else:
            # Single symptom, convert to list
            form_dict["primarySymptoms"] = [symptoms_str.strip()] if symptoms_str.strip() else []
    
    existing = await db.intake.find_one({"user_id": form.user_id})
    if existing:
        await db.intake.update_one({"user_id": form.user_id}, {"$set": form_dict})
        return form
    result = await db.intake.insert_one(form_dict)
    form_dict["_id"] = str(result.inserted_id)
    return form

@router.get("/{user_id}", response_model=IntakeForm)
async def get_intake(user_id: str):
    form = await db.intake.find_one({"user_id": user_id})
    if not form:
        raise HTTPException(status_code=404, detail="Intake form not found")
    return IntakeForm(**form) 