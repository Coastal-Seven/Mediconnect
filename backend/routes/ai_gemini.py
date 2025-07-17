from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from typing import Optional
import logging
import os
import requests

router = APIRouter()
logger = logging.getLogger(__name__)

load_dotenv()

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

class CareTipsRequest(BaseModel):
    provider_name: str
    specialty: str
    reason: Optional[str] = None
    question: Optional[str] = None  # This will be the full prompt

def call_gemini_flash(prompt: str) -> str:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY environment variable not set.")
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": GEMINI_API_KEY
    }
    data = {
        "contents": [
            {"parts": [{"text": prompt}]}
        ]
    }
    try:
        response = requests.post(GEMINI_API_URL, headers=headers, json=data, timeout=30)
        if not response.ok:
            logger.error(f"Gemini API error {response.status_code}: {response.text}")
            try:
                error_detail = response.json().get('error', {}).get('message', response.text)
            except Exception:
                error_detail = response.text
            raise RuntimeError(f"Gemini API error: {error_detail}")
        result = response.json()
        return result["candidates"][0]["content"]["parts"][0]["text"]
    except Exception as e:
        logger.error(f"Exception in call_gemini_flash: {e}")
        raise

@router.post("/")
async def generate_care_tips(request: CareTipsRequest):
    try:
        prompt = request.question or (
            f"Care Navigation Tips for patient:\n"
            f"Provider: {request.provider_name}\n"
            f"Specialty: {request.specialty}\n"
            f"Reason: {request.reason or ''}\n"
            "Explain why this provider is recommended and what to expect during the visit. "
            "Give clear, friendly, and actionable tips for the patient."
        )
        tips = call_gemini_flash(prompt)
        return {"tips": tips}
    except Exception as e:
        logger.error(f"Gemini care tips error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate care tips: {e}") 