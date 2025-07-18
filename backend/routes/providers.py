from fastapi import APIRouter, HTTPException, Query
from database import db
from models import Provider
from typing import List, Optional
import re
import logging
from collections.abc import AsyncIterable
import asyncio

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/", response_model=List[Provider])
async def list_providers():
    """Get all available providers"""
    try:
        providers = []
        find_result = db.providers.find()
        # If Motor, find_result is async iterable; if in-memory, it's a coroutine returning a list
        if isinstance(find_result, AsyncIterable):
            async for p in find_result:
                p["_id"] = str(p["_id"])
                providers.append(Provider(**p).dict(by_alias=True))
        else:
            # Await coroutine and iterate as list
            for p in await find_result:
                p["_id"] = str(p["_id"])
                providers.append(Provider(**p).dict(by_alias=True))
        return providers
    except Exception as e:
        logger.error(f"Error fetching providers: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/match/", response_model=List[Provider])
async def match_providers(
    symptoms: Optional[str] = Query(None, description="Comma-separated symptoms"),
    insurance: Optional[str] = Query(None, description="Insurance provider"),
    location: Optional[str] = Query(None, description="City or location"),
    urgency: Optional[str] = Query(None, description="Urgency level"),
    limit: int = Query(3, description="Number of providers to return")
):
    """
    Match providers based on symptoms, insurance, and location.
    Returns top providers that best match the criteria, with scores normalized to 100%.
    This endpoint only returns provider information without storing it.
    """
    try:
        all_providers = []
        find_result = db.providers.find()
        if isinstance(find_result, AsyncIterable):
            async for p in find_result:
                p["_id"] = str(p["_id"])
                all_providers.append(p)
        else:
            for p in await find_result:
                p["_id"] = str(p["_id"])
                all_providers.append(p)
        if not all_providers:
            return []

        scored_providers = []
        for provider in all_providers:
            reasons = []
            insurance_score = 0
            location_score = 0
            symptom_score = 0
            bonus_score = 0
            # Insurance matching (up to 35 points)
            if insurance and provider.get("accepted_insurances"):
                insurance_lower = insurance.lower()
                provider_insurances = [ins.lower() for ins in provider["accepted_insurances"]]
                if insurance_lower in provider_insurances:
                    insurance_score = 35
                    reasons.append(f"Accepts {insurance}")
                elif any(insurance_lower in ins or ins in insurance_lower for ins in provider_insurances):
                    insurance_score = 30
                    reasons.append(f"Accepts similar insurance")
            # Location matching (up to 20 points)
            if location and provider.get("city"):
                location_lower = location.lower()
                provider_city = provider["city"].lower()
                if location_lower == provider_city:
                    location_score = 20
                    reasons.append(f"Located in {provider['city']}")
                elif location_lower in provider_city or provider_city in location_lower:
                    location_score = 10
                    reasons.append(f"Near {provider['city']}")
            # Symptom-specialty matching (up to 35 points for mapped, 30 for generalist)
            if symptoms and provider.get("specialty"):
                if isinstance(symptoms, str):
                    symptoms_list = [s.strip().lower() for s in symptoms.split(",")]
                else:
                    symptoms_list = [s.strip().lower() for s in symptoms]
                specialty_lower = provider["specialty"].lower()
                generalist_terms = ["general physician", "internal medicine", "family medicine"]
                symptom_specialty_map = {
                    "rash": ["dermatology", "general physician", "internal medicine"],
                    "diarrhea": ["gastroenterology", "internal medicine", "general physician", "family medicine"],
                    "fever": ["internal medicine", "general physician", "family medicine", "pediatrics"],
                    "cough": ["pulmonologist", "internal medicine", "general physician", "family medicine"],
                    "headache": ["neurology", "internal medicine", "general physician"],
                    "chest pain": ["cardiology", "internal medicine", "general physician"],
                    "back pain": ["orthopedics", "general physician", "internal medicine"],
                    "joint pain": ["orthopedics", "rheumatology", "general physician"],
                    "fatigue": ["internal medicine", "general physician", "family medicine"],
                    "shortness of breath": ["pulmonologist", "cardiology", "internal medicine"],
                    "abdominal pain": ["gastroenterology", "internal medicine", "general physician"],
                    "dizziness": ["neurology", "internal medicine", "general physician"],
                    "sore throat": ["ent", "internal medicine", "general physician"],
                    "vomiting": ["gastroenterology", "internal medicine", "general physician"],
                    "nausea": ["gastroenterology", "internal medicine", "general physician"]
                }
                for symptom in symptoms_list:
                    if symptom in symptom_specialty_map:
                        if specialty_lower in symptom_specialty_map[symptom]:
                            symptom_score = max(symptom_score, 35)
                            reasons.append(f"Specializes in {symptom} treatment")
                        elif any(term in specialty_lower for term in generalist_terms):
                            symptom_score = max(symptom_score, 30)
                            reasons.append(f"Can treat {symptom}")
            # Calculate base score (insurance + location + symptom)
            base_score = insurance_score + location_score + symptom_score
            # Bonus: rating, wait time, experience (up to 10 points, but capped so total is 100)
            bonus_points = 0
            if provider.get("rating"):
                try:
                    bonus_points += min(float(provider["rating"]) * 2, 6)  # up to 6 points
                    reasons.append(f"High rating: {provider['rating']}")
                except Exception:
                    pass
            if provider.get("wait_time"):
                wait_time_str = str(provider["wait_time"])
                wait_minutes = re.findall(r'\d+', wait_time_str)
                if wait_minutes:
                    try:
                        wait_time = int(wait_minutes[0])
                        if wait_time <= 10:
                            bonus_points += 2
                            reasons.append("Quick wait time")
                    except Exception:
                        pass
            if provider.get("experience"):
                exp_str = str(provider["experience"])
                exp_years = re.findall(r'\d+', exp_str)
                if exp_years:
                    try:
                        years = int(exp_years[0])
                        if years >= 15:
                            bonus_points += 2
                            reasons.append("Highly experienced")
                    except Exception:
                        pass
            # Cap bonus so total does not exceed 100
            max_bonus = max(0, 100 - base_score)
            bonus_score = min(bonus_points, max_bonus)
            total_score = base_score + bonus_score
            percent_score = round(total_score, 2)
            if percent_score > 0:
                scored_providers.append({
                    **provider,
                    "match_score": percent_score,
                    "match_reasons": reasons
                })
        # Sort by normalized score (highest first) and return top providers
        scored_providers.sort(key=lambda x: x["match_score"], reverse=True)
        top_providers = scored_providers[:limit]

        # If no providers matched, return top N by rating as fallback
        if not top_providers:
            fallback = sorted(all_providers, key=lambda x: x.get("rating", 0), reverse=True)[:limit]
            for p in fallback:
                p["_id"] = str(p["_id"])
                if "match_score" not in p:
                    p["match_score"] = 0
                if "match_reasons" not in p:
                    p["match_reasons"] = ["Selected based on high rating"]
            return fallback

        return top_providers
    except Exception as e:
        logger.error(f"Error in provider matching: {e}")
        # Fallback: return all providers if matching fails
        providers = []
        find_result = db.providers.find()
        if isinstance(find_result, AsyncIterable):
            async for p in find_result:
                p["_id"] = str(p["_id"])
                if "match_score" not in p:
                    p["match_score"] = 0
                if "match_reasons" not in p:
                    p["match_reasons"] = ["Selected as fallback"]
                providers.append(Provider(**p).dict(by_alias=True))
        else:
            for p in await find_result:
                p["_id"] = str(p["_id"])
                if "match_score" not in p:
                    p["match_score"] = 0
                if "match_reasons" not in p:
                    p["match_reasons"] = ["Selected as fallback"]
                providers.append(Provider(**p).dict(by_alias=True))
        return providers[:limit]

@router.get("/{provider_id}", response_model=Provider)
async def get_provider(provider_id: str):
    """Get a specific provider by ID"""
    try:
        from bson import ObjectId
        
        # Try to convert to ObjectId if it's a valid MongoDB ObjectId
        try:
            object_id = ObjectId(provider_id)
            provider = await db.providers.find_one({"_id": object_id})
        except:
            # If not a valid ObjectId, try as string
            provider = await db.providers.find_one({"_id": provider_id})
        
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        
        provider["_id"] = str(provider["_id"])
        return Provider(**provider).dict(by_alias=True)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching provider: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") 