from fastapi import APIRouter, Depends, HTTPException, Query
from models import Booking, BookingCreate, User
from auth import get_current_user
from database import db
from typing import List
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/", response_model=Booking)
async def create_booking(booking: BookingCreate, current_user: User = Depends(get_current_user)):
    """Create a new booking using the authenticated user's ID"""
    logger.info(f"=== BOOKING REQUEST RECEIVED ===")
    logger.info(f"Current user: {current_user.email} (ID: {current_user.id})")
    logger.info(f"Booking data: {booking.dict()}")
    
    try:
        # Log the received appointment_time value and type
        logger.info(f"Received appointment_time: {booking.appointment_time} (type: {type(booking.appointment_time)})")
        # Use current_user.id as the user_id
        booking_dict = booking.dict()
        booking_dict["user_id"] = current_user.id
        booking_dict["created_at"] = datetime.utcnow()
        booking_dict["updated_at"] = datetime.utcnow()

        logger.info(f"Prepared booking dict: {booking_dict}")

        # Get provider details to store with the booking
        from bson import ObjectId
        try:
            # Try to convert to ObjectId if it's a valid MongoDB ObjectId
            if len(booking.provider_id) == 24:  # MongoDB ObjectId is 24 characters
                provider_id = ObjectId(booking.provider_id)
            else:
                provider_id = booking.provider_id
        except Exception:
            # If conversion fails, use as string
            provider_id = booking.provider_id
            
        logger.info(f"Looking up provider with ID: {provider_id}")
        provider = await db.providers.find_one({"_id": provider_id})
        if not provider:
            logger.error(f"Provider not found with ID: {provider_id}")
            raise HTTPException(status_code=404, detail="Provider not found")
        
        logger.info(f"Found provider: {provider.get('name', 'Unknown')}")
        
        # Store provider details with the booking
        booking_dict["provider_details"] = {
            "name": provider["name"],
            "specialty": provider["specialty"],
            "address": provider["address"],
            "city": provider.get("city"),
            "state": provider.get("state"),
            "pincode": provider.get("pincode"),
            "phone": provider["phone"],
            "email": provider["email"],
            "rating": provider["rating"],
            "wait_time": provider["wait_time"],
            "accepted_insurances": provider["accepted_insurances"],
            "experience": provider.get("experience"),
            "education": provider.get("education")
        }

        # Insert booking into the database
        logger.info(f"Inserting booking into database...")
        result = await db.bookings.insert_one(booking_dict)
        booking_dict["_id"] = str(result.inserted_id)
        
        logger.info(f"Booking created successfully with ID: {booking_dict['_id']}")
        logger.info(f"Booking created for user {current_user.id} with provider {provider['name']}")
        return Booking(**booking_dict)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating booking: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/confirm")
async def confirm_booking(
    booking: BookingCreate,
    current_user: User = Depends(get_current_user)
):
    """Confirm a booking and store provider details"""
    try:
        # First, try to find an existing booking for this user and provider
        existing_booking = await db.bookings.find_one({
            "user_id": current_user.id,
            "provider_id": booking.provider_id
        })
        
        if existing_booking:
            # Get provider details to store with the booking
            from bson import ObjectId
            try:
                # Try to convert to ObjectId if it's a valid MongoDB ObjectId
                if len(booking.provider_id) == 24:  # MongoDB ObjectId is 24 characters
                    provider_id = ObjectId(booking.provider_id)
                else:
                    provider_id = booking.provider_id
            except Exception:
                # If conversion fails, use as string
                provider_id = booking.provider_id
                
            provider = await db.providers.find_one({"_id": provider_id})
            if not provider:
                raise HTTPException(status_code=404, detail="Provider not found")
            
            # Update the existing booking status to confirmed with provider details
            result = await db.bookings.update_one(
                {"_id": existing_booking["_id"]},
                {"$set": {
                    "status": "confirmed", 
                    "confirmed_at": datetime.utcnow(),
                    "appointment_time": booking.appointment_time,
                    "provider_details": {
                        "name": provider["name"],
                        "specialty": provider["specialty"],
                        "address": provider["address"],
                        "city": provider.get("city"),
                        "state": provider.get("state"),
                        "pincode": provider.get("pincode"),
                        "phone": provider["phone"],
                        "email": provider["email"],
                        "rating": provider["rating"],
                        "wait_time": provider["wait_time"],
                        "accepted_insurances": provider["accepted_insurances"],
                        "experience": provider.get("experience"),
                        "education": provider.get("education")
                    },
                    "updated_at": datetime.utcnow()
                }}
            )
            
            if result.modified_count == 0:
                raise HTTPException(status_code=400, detail="Failed to confirm booking")
            
            logger.info(f"Booking confirmed for user {current_user.id}")
            return {"message": "Booking confirmed successfully", "booking_id": str(existing_booking["_id"])}
        else:
            # Create a new booking if none exists
            from bson import ObjectId
            try:
                # Try to convert to ObjectId if it's a valid MongoDB ObjectId
                if len(booking.provider_id) == 24:  # MongoDB ObjectId is 24 characters
                    provider_id = ObjectId(booking.provider_id)
                else:
                    provider_id = booking.provider_id
            except Exception:
                # If conversion fails, use as string
                provider_id = booking.provider_id
                
            provider = await db.providers.find_one({"_id": provider_id})
            if not provider:
                raise HTTPException(status_code=404, detail="Provider not found")
            
            booking_dict = booking.dict()
            booking_dict["user_id"] = current_user.id
            booking_dict["status"] = "confirmed"
            booking_dict["confirmed_at"] = datetime.utcnow()
            booking_dict["created_at"] = datetime.utcnow()
            booking_dict["updated_at"] = datetime.utcnow()
            booking_dict["provider_details"] = {
                "name": provider["name"],
                "specialty": provider["specialty"],
                "address": provider["address"],
                "city": provider.get("city"),
                "state": provider.get("state"),
                "pincode": provider.get("pincode"),
                "phone": provider["phone"],
                "email": provider["email"],
                "rating": provider["rating"],
                "wait_time": provider["wait_time"],
                "accepted_insurances": provider["accepted_insurances"],
                "experience": provider.get("experience"),
                "education": provider.get("education")
            }
            
            result = await db.bookings.insert_one(booking_dict)
            booking_dict["_id"] = str(result.inserted_id)
            
            logger.info(f"Booking created and confirmed for user {current_user.id}")
            return {"message": "Booking created and confirmed successfully", "booking_id": booking_dict["_id"]}
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error confirming booking: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/user/{user_id}", response_model=List[Booking])
async def get_user_bookings(
    user_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all bookings for a user (only for the current user)"""
    try:
        if user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Can only view your own bookings")
        
        bookings = []
        async for b in db.bookings.find({"user_id": user_id}):
            b["_id"] = str(b["_id"])
            bookings.append(Booking(**b))
        return bookings
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching user bookings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/provider/{provider_id}", response_model=List[Booking])
async def get_provider_bookings(provider_id: str):
    """Get all bookings for a provider"""
    try:
        bookings = []
        async for b in db.bookings.find({"provider_id": provider_id}):
            b["_id"] = str(b["_id"])
            bookings.append(Booking(**b))
        return bookings
    except Exception as e:
        logger.error(f"Error fetching provider bookings: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.delete("/cancel/{booking_id}")
async def cancel_booking(
    booking_id: str,
    current_user: User = Depends(get_current_user)
):
    """Cancel a booking (only for the booking owner)"""
    try:
        # Check if the booking belongs to the current user
        from bson import ObjectId
        try:
            # Try to convert to ObjectId if it's a valid MongoDB ObjectId
            if len(booking_id) == 24:  # MongoDB ObjectId is 24 characters
                booking_object_id = ObjectId(booking_id)
            else:
                booking_object_id = booking_id
        except Exception:
            # If conversion fails, use as string
            booking_object_id = booking_id
            
        booking = await db.bookings.find_one({"_id": booking_object_id})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Can only cancel your own bookings")
        
        result = await db.bookings.delete_one({"_id": booking_object_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Booking not found or already cancelled")
        
        logger.info(f"Booking {booking_id} cancelled by user {current_user.id}")
        return {"message": "Booking cancelled and deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling booking: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.put("/reschedule/{booking_id}")
async def reschedule_booking(
    booking_id: str, 
    new_time: str = Query(..., description="New appointment time in ISO format"),
    current_user: User = Depends(get_current_user)
):
    """Reschedule a booking (only for the booking owner)"""
    try:
        # Check if the booking belongs to the current user
        from bson import ObjectId
        try:
            # Try to convert to ObjectId if it's a valid MongoDB ObjectId
            if len(booking_id) == 24:  # MongoDB ObjectId is 24 characters
                booking_object_id = ObjectId(booking_id)
            else:
                booking_object_id = booking_id
        except Exception:
            # If conversion fails, use as string
            booking_object_id = booking_id
            
        booking = await db.bookings.find_one({"_id": booking_object_id})
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        
        if booking["user_id"] != current_user.id:
            raise HTTPException(status_code=403, detail="Can only reschedule your own bookings")
        
        try:
            new_time_dt = datetime.fromisoformat(new_time)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid date/time format. Use ISO format: YYYY-MM-DDTHH:MM:SS")
        
        result = await db.bookings.update_one(
            {"_id": booking_object_id},
            {"$set": {
                "appointment_time": new_time_dt, 
                "status": "pending", 
                "rescheduled_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }}
        )
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Booking not found or could not be rescheduled")
        
        logger.info(f"Booking {booking_id} rescheduled by user {current_user.id}")
        return {"message": "Booking rescheduled successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error rescheduling booking: {e}")
        raise HTTPException(status_code=500, detail="Internal server error") 