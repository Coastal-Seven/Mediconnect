#!/usr/bin/env python3
"""
Script to seed the database with sample healthcare providers
"""
import os
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = "smartcare"

# Only these insurances are allowed
ALLOWED_INSURANCES = [
    "Apollo Munich",
    "Bajaj Allianz",
    "ICICI Lombard",
    "Star Health",
    "HDFC ERGO",
    "SBI Health",
    "National Insurance"
]

providers = [
    {
        "_id": "prov_001",
        "name": "Dr. Jayanth Kotte",
        "specialty": "Cardiologist",
        "accepted_insurances": ["Apollo Munich", "Bajaj Allianz", "ICICI Lombard"],
        "location_lat": 16.3067,
        "location_lng": 80.4365,
        "address": "Apollo Hospital, MG Road, Guntur, Andhra Pradesh",
        "rating": 4.8,
        "wait_time": "20 mins",
        "phone": "+91 863 234 5678",
        "email": "dr.rajesh@apollohospital.com",
        "experience": "15 years",
        "education": "AIIMS Delhi",
        "hospital": "Apollo Hospital, Guntur",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522001"
    },
    {
        "_id": "prov_002",
        "name": "Dr. Priya Reddy",
        "specialty": "Dermatologist",
        "accepted_insurances": ["Star Health", "HDFC ERGO", "Max Bupa"],
        "location_lat": 16.5062,
        "location_lng": 80.6480,
        "address": "Care Hospital, Benz Circle, Vijayawada, Andhra Pradesh",
        "rating": 4.9,
        "wait_time": "15 mins",
        "phone": "+91 866 345 6789",
        "email": "dr.priya@carehospital.com",
        "experience": "12 years",
        "education": "CMC Vellore",
        "hospital": "Care Hospital, Vijayawada",
        "city": "Vijayawada",
        "state": "AP",
        "pincode": "520010"
    },
    {
        "_id": "prov_003",
        "name": "Dr. Harish Annem",
        "specialty": "Orthopedic Surgeon",
        "accepted_insurances": ["Apollo Munich", "Religare", "Cigna TTK"],
        "location_lat": 16.4300,
        "location_lng": 80.5500,
        "address": "KIMS Hospital, Mangalagiri, Andhra Pradesh",
        "rating": 4.7,
        "wait_time": "30 mins",
        "phone": "+91 864 456 7890",
        "email": "dr.suresh@kimshospital.com",
        "experience": "18 years",
        "education": "Osmania Medical College",
        "hospital": "KIMS Hospital, Mangalagiri",
        "city": "Mangalagiri",
        "state": "AP",
        "pincode": "522503"
    },
    {
        "_id": "prov_004",
        "name": "Dr. Lakshmi Devi",
        "specialty": "Gynecologist",
        "accepted_insurances": ["Bajaj Allianz", "Star Health", "HDFC ERGO"],
        "location_lat": 16.4800,
        "location_lng": 80.6000,
        "address": "Fernandez Hospital, Tadepalli, Andhra Pradesh",
        "rating": 4.6,
        "wait_time": "25 mins",
        "phone": "+91 865 567 8901",
        "email": "dr.lakshmi@fernandezhospital.com",
        "experience": "14 years",
        "education": "Gandhi Medical College",
        "hospital": "Fernandez Hospital, Tadepalli",
        "city": "Tadepalli",
        "state": "AP",
        "pincode": "522501"
    },
    {
        "_id": "prov_005",
        "name": "Dr. Visesh Gurram",
        "specialty": "Neurologist",
        "accepted_insurances": ["ICICI Lombard", "Max Bupa", "Religare"],
        "location_lat": 16.3067,
        "location_lng": 80.4365,
        "address": "NIMS Hospital, Brodipet, Guntur, Andhra Pradesh",
        "rating": 4.9,
        "wait_time": "40 mins",
        "phone": "+91 863 678 9012",
        "email": "dr.venkatesh@nimshospital.com",
        "experience": "22 years",
        "education": "NIMS Hyderabad",
        "hospital": "NIMS Hospital, Guntur",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522002"
    },
    {
        "_id": "prov_006",
        "name": "Dr. Anjali Bollapalli",
        "specialty": "Pediatrician",
        "accepted_insurances": ["Apollo Munich", "Star Health", "Cigna TTK"],
        "location_lat": 16.5062,
        "location_lng": 80.6480,
        "address": "Rainbow Children's Hospital, Vijayawada, Andhra Pradesh",
        "rating": 4.8,
        "wait_time": "20 mins",
        "phone": "+91 866 789 0123",
        "email": "dr.anjali@rainbowhospital.com",
        "experience": "16 years",
        "education": "KEM Hospital Mumbai",
        "hospital": "Rainbow Children's Hospital, Vijayawada",
        "city": "Vijayawada",
        "state": "AP",
        "pincode": "520008"
    },
    {
        "_id": "prov_007",
        "name": "Dr. Arjun Reddy",
        "specialty": "General Surgeon",
        "accepted_insurances": ["Bajaj Allianz", "HDFC ERGO", "Max Bupa"],
        "location_lat": 16.4300,
        "location_lng": 80.5500,
        "address": "Sri Sai Hospital, Mangalagiri, Andhra Pradesh",
        "rating": 5.0,
        "wait_time": "15 mins",
        "phone": "+91 864 890 1234",
        "email": "dr.mohan@srisaihospital.com",
        "experience": "20 years",
        "education": "AIIMS Delhi",
        "hospital": "AIIMS ,Mangalagiri",
        "city": "Mangalagiri",
        "state": "AP",
        "pincode": "522504"
    },
    {
        "_id": "prov_008",
        "name": "Dr. Geetha Kumari",
        "specialty": "Ophthalmologist",
        "accepted_insurances": ["Apollo Munich", "ICICI Lombard", "Religare"],
        "location_lat": 16.4800,
        "location_lng": 80.6000,
        "address": "Lakshmi Eye Hospital, Tadepalli, Andhra Pradesh",
        "rating": 4.7,
        "wait_time": "30 mins",
        "phone": "+91 865 901 2345",
        "email": "dr.geetha@lakshmieyehospital.com",
        "experience": "13 years",
        "education": "Sankara Nethralaya",
        "hospital": "Lakshmi Eye Hospital, Tadepalli",
        "city": "Tadepalli",
        "state": "AP",
        "pincode": "522502"
    },
    {
        "_id": "prov_009",
        "name": "Dr. Omkar",
        "specialty": "ENT Specialist",
        "accepted_insurances": ["Star Health", "Bajaj Allianz", "Cigna TTK"],
        "location_lat": 16.3067,
        "location_lng": 80.4365,
        "address": "ENT Care Center, Guntur, Andhra Pradesh",
        "rating": 4.6,
        "wait_time": "25 mins",
        "phone": "+91 863 012 3456",
        "email": "dr.ramesh@entcarecenter.com",
        "experience": "17 years",
        "education": "MAMC Delhi",
        "hospital": "ENT Care Center, Guntur",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522003"
    },
    {
        "_id": "prov_010",
        "name": "Dr. Sunita Reddy",
        "specialty": "Psychiatrist",
        "accepted_insurances": ["HDFC ERGO", "Max Bupa", "Religare"],
        "location_lat": 16.5062,
        "location_lng": 80.6480,
        "address": "Mind Wellness Clinic, Vijayawada, Andhra Pradesh",
        "rating": 4.8,
        "wait_time": "45 mins",
        "phone": "+91 866 123 4567",
        "email": "dr.sunita@mindwellnessclinic.com",
        "experience": "19 years",
        "education": "NIMHANS Bangalore",
        "hospital": "Mind Wellness Clinic, Vijayawada",
        "city": "Vijayawada",
        "state": "AP",
        "pincode": "520012"
    },
    # Top 3 relevant providers for Rash, Cough, HDFC ERGO - My Health, Guntur
    {
        "_id": "prov_011",
        "name": "Dr. Priya Sharma",
        "specialty": "Dermatology",
        "address": "Skin Wellness Clinic, Guntur, Andhra Pradesh - 522001",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8631234567",
        "email": "dr.priya@skinwellness.com",
        "rating": 4.9,
        "wait_time": "10 min",
        "accepted_insurances": ["HDFC ERGO", "My Health", "Star Health"],
        "experience": "15 years",
        "education": "AIIMS Delhi"
    },
    {
        "_id": "prov_012",
        "name": "Dr. Ravi Kumar",
        "specialty": "General Physician",
        "address": "City Health Center, Guntur, Andhra Pradesh - 522007",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8632345678",
        "email": "dr.ravi@cityhealth.com",
        "rating": 4.8,
        "wait_time": "12 min",
        "accepted_insurances": ["HDFC ERGO", "My Health", "Apollo Munich"],
        "experience": "12 years",
        "education": "Osmania Medical College"
    },
    {
        "_id": "prov_013",
        "name": "Dr. Sneha Reddy",
        "specialty": "Pulmonologist",
        "address": "Lung Care Clinic, Guntur, Andhra Pradesh - 522001",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8633456789",
        "email": "dr.sneha@lungcare.com",
        "rating": 4.7,
        "wait_time": "15 min",
        "accepted_insurances": ["HDFC ERGO", "My Health", "Max Bupa"],
        "experience": "10 years",
        "education": "CMC Vellore"
    },
    # Providers for Care Health insurance and Rash/Diarrhea symptoms in Guntur
    {
        "_id": "prov_014",
        "name": "Dr. Meera Patel",
        "specialty": "Dermatology",
        "address": "Lotus Skin Clinic, 2nd Floor, Main Road, Arundelpet, Guntur, Andhra Pradesh - 522002",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8634567890",
        "email": "dr.meera@skincare.com",
        "rating": 4.8,
        "wait_time": "8 min",
        "accepted_insurances": ["Care Health", "Care Plus", "Care Freedom", "Star Health"],
        "experience": "13 years",
        "education": "AIIMS Delhi"
    },
    {
        "_id": "prov_015",
        "name": "Dr. Arjun Reddy",
        "specialty": "General Physician",
        "address": "Guntur Medical Center, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8635678901",
        "email": "dr.arjun@gunturmedical.com",
        "rating": 4.6,
        "wait_time": "10 min",
        "accepted_insurances": ["Care Health", "Care Plus", "Care Freedom", "Apollo Munich"],
        "experience": "11 years",
        "education": "Osmania Medical College"
    },
    {
        "_id": "prov_016",
        "name": "Dr. Kavya Sharma",
        "specialty": "Gastroenterology",
        "address": "Digestive Health Clinic, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8636789012",
        "email": "dr.kavya@digestive.com",
        "rating": 4.9,
        "wait_time": "12 min",
        "accepted_insurances": ["Care Health", "Care Plus", "Care Freedom", "Max Bupa"],
        "experience": "14 years",
        "education": "CMC Vellore"
    },
    {
        "_id": "prov_017",
        "name": "Dr. Suresh Kumar",
        "specialty": "Internal Medicine",
        "address": "City Internal Medicine, Guntur, Andhra Pradesh - 522001",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8637890123",
        "email": "dr.suresh@cityinternal.com",
        "rating": 4.7,
        "wait_time": "15 min",
        "accepted_insurances": ["Care Health", "Care Plus", "Care Freedom", "ICICI Lombard"],
        "experience": "16 years",
        "education": "JIPMER Puducherry"
    },
    {
        "_id": "prov_018",
        "name": "Dr. Ananya Das",
        "specialty": "Family Medicine",
        "address": "Family Care Clinic, Guntur, Andhra Pradesh",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8638901234",
        "email": "dr.ananya@familycare.com",
        "rating": 4.5,
        "wait_time": "20 min",
        "accepted_insurances": ["Care Health", "Care Plus", "Care Freedom", "Bajaj Allianz"],
        "experience": "9 years",
        "education": "KGMU Lucknow"
    },
    # Providers for Religare insurance
    {
        "_id": "prov_019",
        "name": "Dr. Vikram Singh",
        "specialty": "Cardiology",
        "address": "Heart Care Institute, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639012345",
        "email": "dr.vikram@heartcare.com",
        "rating": 4.9,
        "wait_time": "15 min",
        "accepted_insurances": ["Religare", "Care", "Care Freedom", "Care Plus", "Star Health"],
        "experience": "18 years",
        "education": "AIIMS Delhi"
    },
    {
        "_id": "prov_020",
        "name": "Dr. Priya Verma",
        "specialty": "Dermatology",
        "address": "Skin Solutions, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639123456",
        "email": "dr.priya.verma@skinsolutions.com",
        "rating": 4.7,
        "wait_time": "10 min",
        "accepted_insurances": ["Religare", "Care", "Care Freedom", "Care Plus", "Max Bupa"],
        "experience": "12 years",
        "education": "CMC Vellore"
    },
    # Providers for Cigna TTK insurance
    {
        "_id": "prov_021",
        "name": "Dr. Rajesh Malhotra",
        "specialty": "Internal Medicine",
        "address": "Internal Medicine Associates, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639234567",
        "email": "dr.rajesh@internalmedicine.com",
        "rating": 4.6,
        "wait_time": "12 min",
        "accepted_insurances": ["Cigna TTK", "ProHealth", "HealthFirst", "Family First", "Apollo Munich"],
        "experience": "15 years",
        "education": "JIPMER Puducherry"
    },
    {
        "_id": "prov_022",
        "name": "Dr. Sneha Iyer",
        "specialty": "Pediatrics",
        "address": "Children's Health Center, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639345678",
        "email": "dr.sneha.iyer@childrenshealth.com",
        "rating": 4.8,
        "wait_time": "8 min",
        "accepted_insurances": ["Cigna TTK", "ProHealth", "HealthFirst", "Family First", "HDFC ERGO"],
        "experience": "11 years",
        "education": "KGMU Lucknow"
    },
    # Providers for ManipalCigna insurance
    {
        "_id": "prov_023",
        "name": "Dr. Arun Kumar",
        "specialty": "Orthopedics",
        "address": "Bone & Joint Clinic, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639456789",
        "email": "dr.arun@bonejoint.com",
        "rating": 4.7,
        "wait_time": "20 min",
        "accepted_insurances": ["ManipalCigna", "ProHealth Plus", "HealthFirst", "Family First", "Star Health"],
        "experience": "16 years",
        "education": "AIIMS Delhi"
    },
    {
        "_id": "prov_024",
        "name": "Dr. Lakshmi Priya",
        "specialty": "Gynecology",
        "address": "Women's Health Clinic, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639567890",
        "email": "dr.lakshmi@womenshealth.com",
        "rating": 4.9,
        "wait_time": "25 min",
        "accepted_insurances": ["ManipalCigna", "ProHealth Plus", "HealthFirst", "Family First", "Apollo Munich"],
        "experience": "14 years",
        "education": "Osmania Medical College"
    },
    # Providers for Aditya Birla insurance
    {
        "_id": "prov_025",
        "name": "Dr. Sanjay Gupta",
        "specialty": "Neurology",
        "address": "Neuro Care Center, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639678901",
        "email": "dr.sanjay@neurocare.com",
        "rating": 4.8,
        "wait_time": "30 min",
        "accepted_insurances": ["Aditya Birla", "Activ Health", "Activ Care", "Activ Shield", "Max Bupa"],
        "experience": "17 years",
        "education": "NIMHANS Bangalore"
    },
    {
        "_id": "prov_026",
        "name": "Dr. Rekha Sharma",
        "specialty": "General Surgery",
        "address": "Surgical Excellence, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639789012",
        "email": "dr.rekha@surgicalexcellence.com",
        "rating": 4.6,
        "wait_time": "45 min",
        "accepted_insurances": ["Aditya Birla", "Activ Health", "Activ Care", "Activ Shield", "ICICI Lombard"],
        "experience": "13 years",
        "education": "MAMC Delhi"
    },
    # Providers for SBI Health insurance
    {
        "_id": "prov_027",
        "name": "Dr. Venkat Rao",
        "specialty": "Cardiology",
        "address": "SBI Heart Institute, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639890123",
        "email": "dr.venkat@sbiheart.com",
        "rating": 4.9,
        "wait_time": "18 min",
        "accepted_insurances": ["SBI Health", "Arogya Plus", "Arogya Top Up", "Arogya Premier", "Star Health"],
        "experience": "20 years",
        "education": "AIIMS Delhi"
    },
    {
        "_id": "prov_028",
        "name": "Dr. Anjali Reddy",
        "specialty": "Dermatology",
        "address": "SBI Skin Clinic, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639901234",
        "email": "dr.anjali@sbihealth.com",
        "rating": 4.7,
        "wait_time": "12 min",
        "accepted_insurances": ["SBI Health", "Arogya Plus", "Arogya Top Up", "Arogya Premier", "Max Bupa"],
        "experience": "10 years",
        "education": "CMC Vellore"
    },
    # Providers for Future Generali insurance
    {
        "_id": "prov_029",
        "name": "Dr. Mohan Das",
        "specialty": "Internal Medicine",
        "address": "Future Health Center, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639012345",
        "email": "dr.mohan@futurehealth.com",
        "rating": 4.5,
        "wait_time": "15 min",
        "accepted_insurances": ["Future Generali", "Health Total", "Health Plus", "Health Secure", "Apollo Munich"],
        "experience": "12 years",
        "education": "Osmania Medical College"
    },
    {
        "_id": "prov_030",
        "name": "Dr. Geeta Patel",
        "specialty": "Family Medicine",
        "address": "Generali Family Care, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639123456",
        "email": "dr.geeta@generalifamily.com",
        "rating": 4.6,
        "wait_time": "20 min",
        "accepted_insurances": ["Future Generali", "Health Total", "Health Plus", "Health Secure", "HDFC ERGO"],
        "experience": "9 years",
        "education": "KGMU Lucknow"
    },
    # Providers for Universal Sompo insurance
    {
        "_id": "prov_031",
        "name": "Dr. Ramesh Kumar",
        "specialty": "Orthopedics",
        "address": "Sompo Bone Clinic, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639234567",
        "email": "dr.ramesh@sompobone.com",
        "rating": 4.7,
        "wait_time": "25 min",
        "accepted_insurances": ["Universal Sompo", "Health Shield", "Health Guard", "Health Plus", "Star Health"],
        "experience": "15 years",
        "education": "AIIMS Delhi"
    },
    {
        "_id": "prov_032",
        "name": "Dr. Sunita Verma",
        "specialty": "Gynecology",
        "address": "Sompo Women's Health, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639345678",
        "email": "dr.sunita@sompowomen.com",
        "rating": 4.8,
        "wait_time": "30 min",
        "accepted_insurances": ["Universal Sompo", "Health Shield", "Health Guard", "Health Plus", "Apollo Munich"],
        "experience": "13 years",
        "education": "Osmania Medical College"
    },
    # Providers for National Insurance
    {
        "_id": "prov_033",
        "name": "Dr. Prakash Reddy",
        "specialty": "General Physician",
        "address": "National Health Center, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639456789",
        "email": "dr.prakash@nationalhealth.com",
        "rating": 4.4,
        "wait_time": "10 min",
        "accepted_insurances": ["National Insurance", "Mediclaim", "Family Floater", "Senior Citizen", "Star Health"],
        "experience": "11 years",
        "education": "JIPMER Puducherry"
    },
    {
        "_id": "prov_034",
        "name": "Dr. Madhavi Sharma",
        "specialty": "Pediatrics",
        "address": "National Children's Clinic, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639567890",
        "email": "dr.madhavi@nationalchildren.com",
        "rating": 4.6,
        "wait_time": "15 min",
        "accepted_insurances": ["National Insurance", "Mediclaim", "Family Floater", "Senior Citizen", "Max Bupa"],
        "experience": "8 years",
        "education": "KGMU Lucknow"
    },
    # Providers for New India Assurance
    {
        "_id": "prov_035",
        "name": "Dr. Srinivas Rao",
        "specialty": "Cardiology",
        "address": "New India Heart Center, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639678901",
        "email": "dr.srinivas@newindiaheart.com",
        "rating": 4.8,
        "wait_time": "20 min",
        "accepted_insurances": ["New India Assurance", "Mediclaim Plus", "Family Floater", "Senior Citizen", "Star Health"],
        "experience": "19 years",
        "education": "AIIMS Delhi"
    },
    {
        "_id": "prov_036",
        "name": "Dr. Kalpana Devi",
        "specialty": "Dermatology",
        "address": "New India Skin Clinic, Guntur, Andhra Pradesh - 522034",
        "city": "Guntur",
        "state": "AP",
        "pincode": "522034",
        "phone": "8639789012",
        "email": "dr.kalpana@newindiaskin.com",
        "rating": 4.7,
        "wait_time": "12 min",
        "accepted_insurances": ["New India Assurance", "Mediclaim Plus", "Family Floater", "Senior Citizen", "Max Bupa"],
        "experience": "12 years",
        "education": "CMC Vellore"
    }
]

# Filter and update accepted_insurances for each provider
def filter_provider_insurances(providers):
    filtered = []
    for p in providers:
        if "accepted_insurances" in p:
            p["accepted_insurances"] = [i for i in p["accepted_insurances"] if i in ALLOWED_INSURANCES]
            # Only keep providers with at least one allowed insurance
            if p["accepted_insurances"]:
                filtered.append(p)
        else:
            filtered.append(p)  # If no insurances listed, keep as is (optional: could remove instead)
    return filtered

providers = filter_provider_insurances(providers)

async def seed():
    try:
        print("Connecting to MongoDB...")
        client = AsyncIOMotorClient(MONGODB_URI)
        db = client[DB_NAME]
        
        # Test connection
        await client.admin.command('ping')
        print("✓ Connected to MongoDB successfully!")
        
        # Clear existing providers
        print("Clearing existing providers...")
        result = await db.providers.delete_many({})
        print(f"✓ Deleted {result.deleted_count} existing providers")
        
        # Insert new providers
        print("Inserting new providers...")
        result = await db.providers.insert_many(providers)
        print(f"✓ Successfully inserted {len(result.inserted_ids)} providers")
        
        # Verify insertion
        count = await db.providers.count_documents({})
        print(f"✓ Total providers in database: {count}")
        
        print("\n🎉 Providers seeded successfully!")
        print("You can now use the frontend to search for providers.")
        
        client.close()
        
    except Exception as e:
        print(f"❌ Error seeding providers: {e}")
        print("Make sure MongoDB is running and accessible.")

if __name__ == "__main__":
    asyncio.run(seed()) 