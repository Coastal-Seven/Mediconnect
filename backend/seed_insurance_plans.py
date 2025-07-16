import logging
from datetime import datetime
from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB", "smartcare")

# Sample insurance plans data
insurance_plans = [
    {
        "provider_name": "Blue Cross Blue Shield",
        "plan_name": "Blue Choice PPO",
        "plan_type": "PPO",
        "coverage_details": {
            "preventive_care": "100% covered",
            "primary_care": "Covered after deductible",
            "specialist_visits": "Covered after deductible",
            "emergency_room": "Covered after deductible",
            "urgent_care": "Covered after deductible",
            "laboratory_tests": "Covered after deductible",
            "imaging": "Covered after deductible",
            "prescription_drugs": "Covered with copay"
        },
        "cost_sharing": {
            "deductible": "Individual: $1,500, Family: $3,000",
            "copay": "Primary care: $25, Specialist: $40, Urgent care: $50",
            "coinsurance": "20% after deductible"
        },
        "network_type": "In-network",
        "annual_premium": 4800.0,
        "deductible": 1500.0,
        "copay": {
            "primary_care": 25.0,
            "specialist": 40.0,
            "urgent_care": 50.0,
            "emergency_room": 200.0,
            "prescription_generic": 10.0,
            "prescription_brand": 40.0
        },
        "coinsurance": 20.0,
        "out_of_pocket_max": 6000.0,
        "prescription_coverage": True,
        "mental_health_coverage": True,
        "dental_coverage": False,
        "vision_coverage": False
    },
    {
        "provider_name": "Aetna",
        "plan_name": "Aetna Select HMO",
        "plan_type": "HMO",
        "coverage_details": {
            "preventive_care": "100% covered",
            "primary_care": "Covered with copay",
            "specialist_visits": "Covered with referral",
            "emergency_room": "Covered after deductible",
            "urgent_care": "Covered with copay",
            "laboratory_tests": "Covered with copay",
            "imaging": "Covered with copay",
            "prescription_drugs": "Covered with copay"
        },
        "cost_sharing": {
            "deductible": "Individual: $1,000, Family: $2,000",
            "copay": "Primary care: $20, Specialist: $35, Urgent care: $40",
            "coinsurance": "15% after deductible"
        },
        "network_type": "In-network",
        "annual_premium": 4200.0,
        "deductible": 1000.0,
        "copay": {
            "primary_care": 20.0,
            "specialist": 35.0,
            "urgent_care": 40.0,
            "emergency_room": 150.0,
            "prescription_generic": 8.0,
            "prescription_brand": 35.0
        },
        "coinsurance": 15.0,
        "out_of_pocket_max": 5000.0,
        "prescription_coverage": True,
        "mental_health_coverage": True,
        "dental_coverage": False,
        "vision_coverage": False
    },
    {
        "provider_name": "UnitedHealthcare",
        "plan_name": "UnitedHealthOne EPO",
        "plan_type": "EPO",
        "coverage_details": {
            "preventive_care": "100% covered",
            "primary_care": "Covered after deductible",
            "specialist_visits": "Covered after deductible",
            "emergency_room": "Covered after deductible",
            "urgent_care": "Covered after deductible",
            "laboratory_tests": "Covered after deductible",
            "imaging": "Covered after deductible",
            "prescription_drugs": "Covered with copay"
        },
        "cost_sharing": {
            "deductible": "Individual: $2,000, Family: $4,000",
            "copay": "No copays, coinsurance only",
            "coinsurance": "25% after deductible"
        },
        "network_type": "In-network",
        "annual_premium": 3600.0,
        "deductible": 2000.0,
        "copay": {
            "primary_care": 0.0,
            "specialist": 0.0,
            "urgent_care": 0.0,
            "emergency_room": 0.0,
            "prescription_generic": 15.0,
            "prescription_brand": 50.0
        },
        "coinsurance": 25.0,
        "out_of_pocket_max": 7000.0,
        "prescription_coverage": True,
        "mental_health_coverage": True,
        "dental_coverage": False,
        "vision_coverage": False
    },
    {
        "provider_name": "Cigna",
        "plan_name": "Cigna Open Access Plus",
        "plan_type": "POS",
        "coverage_details": {
            "preventive_care": "100% covered",
            "primary_care": "Covered with copay",
            "specialist_visits": "Covered with copay",
            "emergency_room": "Covered after deductible",
            "urgent_care": "Covered with copay",
            "laboratory_tests": "Covered with copay",
            "imaging": "Covered with copay",
            "prescription_drugs": "Covered with copay"
        },
        "cost_sharing": {
            "deductible": "Individual: $1,200, Family: $2,400",
            "copay": "Primary care: $30, Specialist: $45, Urgent care: $60",
            "coinsurance": "20% after deductible"
        },
        "network_type": "Both",
        "annual_premium": 5400.0,
        "deductible": 1200.0,
        "copay": {
            "primary_care": 30.0,
            "specialist": 45.0,
            "urgent_care": 60.0,
            "emergency_room": 250.0,
            "prescription_generic": 12.0,
            "prescription_brand": 45.0
        },
        "coinsurance": 20.0,
        "out_of_pocket_max": 5500.0,
        "prescription_coverage": True,
        "mental_health_coverage": True,
        "dental_coverage": True,
        "vision_coverage": True
    },
    {
        "provider_name": "Kaiser Permanente",
        "plan_name": "Kaiser HMO Silver",
        "plan_type": "HMO",
        "coverage_details": {
            "preventive_care": "100% covered",
            "primary_care": "Covered with copay",
            "specialist_visits": "Covered with referral",
            "emergency_room": "Covered after deductible",
            "urgent_care": "Covered with copay",
            "laboratory_tests": "Covered with copay",
            "imaging": "Covered with copay",
            "prescription_drugs": "Covered with copay"
        },
        "cost_sharing": {
            "deductible": "Individual: $800, Family: $1,600",
            "copay": "Primary care: $15, Specialist: $30, Urgent care: $35",
            "coinsurance": "10% after deductible"
        },
        "network_type": "In-network",
        "annual_premium": 4800.0,
        "deductible": 800.0,
        "copay": {
            "primary_care": 15.0,
            "specialist": 30.0,
            "urgent_care": 35.0,
            "emergency_room": 100.0,
            "prescription_generic": 5.0,
            "prescription_brand": 30.0
        },
        "coinsurance": 10.0,
        "out_of_pocket_max": 4500.0,
        "prescription_coverage": True,
        "mental_health_coverage": True,
        "dental_coverage": True,
        "vision_coverage": True
    }
]

def seed_insurance_plans():
    """Seed the insurance_plans collection with sample data"""
    try:
        logger.info("Starting insurance plans seeding...")
        
        # Connect to MongoDB
        client = MongoClient(MONGODB_URI)
        db = client[DB_NAME]
        
        # Check if plans already exist
        existing_count = db.insurance_plans.count_documents({})
        if existing_count > 0:
            logger.info(f"Insurance plans collection already has {existing_count} documents. Skipping seeding.")
            return
        
        # Add timestamps to each plan
        for plan in insurance_plans:
            plan["created_at"] = datetime.utcnow()
            plan["updated_at"] = datetime.utcnow()
        
        # Insert all plans
        result = db.insurance_plans.insert_many(insurance_plans)
        
        logger.info(f"Successfully seeded {len(result.inserted_ids)} insurance plans")
        
        # Log the created plans
        for i, plan_id in enumerate(result.inserted_ids):
            logger.info(f"Created plan {i+1}: {insurance_plans[i]['provider_name']} - {insurance_plans[i]['plan_name']}")
            
        client.close()
            
    except Exception as e:
        logger.error(f"Error seeding insurance plans: {e}")
        raise

def main():
    """Main function to run the seeding"""
    try:
        seed_insurance_plans()
        logger.info("Insurance plans seeding completed successfully!")
        
    except Exception as e:
        logger.error(f"Insurance plans seeding failed: {e}")
        raise

if __name__ == "__main__":
    main() 