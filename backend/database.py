import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from typing import Dict, List, Any
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI")

#MONGODB_URI = os.getenv("MONGODB_URI", "mongodb+srv://chakri:chakri513@cluster0.o6vyu7f.mongodb.net/smartcare?retryWrites=true&w=majority&appName=Cluster0")

DB_NAME = os.getenv("MONGODB_DB", "smartcare")

logger.info(f"Connecting to MongoDB: {MONGODB_URI}")
logger.info(f"Database name: {DB_NAME}")

# In-memory storage for development
class InMemoryDB:
    def __init__(self):
        self.collections = {}
    
    def __getitem__(self, collection_name):
        if collection_name not in self.collections:
            self.collections[collection_name] = InMemoryCollection()
        return self.collections[collection_name]
    
    def __getattr__(self, collection_name):
        # Allow attribute access for collections (e.g., db.users)
        return self.__getitem__(collection_name)

class InMemoryCollection:
    def __init__(self):
        self.documents = {}
    
    async def insert_one(self, document):
        doc_id = str(uuid.uuid4())
        document["_id"] = doc_id
        self.documents[doc_id] = document.copy()
        return type('InsertResult', (), {'inserted_id': doc_id})()
    
    async def insert_many(self, documents):
        inserted_ids = []
        for document in documents:
            doc_id = str(uuid.uuid4())
            document["_id"] = doc_id
            self.documents[doc_id] = document.copy()
            inserted_ids.append(doc_id)
        return type('InsertManyResult', (), {'inserted_ids': inserted_ids})()
    
    async def find_one(self, filter_dict):
        for doc_id, doc in self.documents.items():
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                return doc.copy()
        return None
    
    async def find(self, filter_dict=None):
        if filter_dict is None:
            return list(self.documents.values())
        results = []
        for doc in self.documents.values():
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                results.append(doc.copy())
        return results
    
    async def count_documents(self, filter_dict=None):
        if filter_dict is None:
            return len(self.documents)
        count = 0
        for doc in self.documents.values():
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                count += 1
        return count
    
    async def update_one(self, filter_dict, update_dict):
        for doc_id, doc in self.documents.items():
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                # Handle $set operations
                if "$set" in update_dict:
                    for key, value in update_dict["$set"].items():
                        doc[key] = value
                else:
                    # Direct update
                    doc.update(update_dict)
                self.documents[doc_id] = doc
                return type('UpdateResult', (), {'modified_count': 1})()
        return type('UpdateResult', (), {'modified_count': 0})()
    
    async def delete_one(self, filter_dict):
        for doc_id, doc in self.documents.items():
            if all(doc.get(k) == v for k, v in filter_dict.items()):
                del self.documents[doc_id]
                return type('DeleteResult', (), {'deleted_count': 1})()
        return type('DeleteResult', (), {'deleted_count': 0})()

try:
    client = AsyncIOMotorClient(MONGODB_URI)
    # Test the connection
    client.admin.command('ping')
    logger.info("Successfully connected to MongoDB")
    db = client[DB_NAME]
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    logger.info("Using in-memory storage for development")
    # For development, we'll use a simple in-memory storage
    client = None
    db = InMemoryDB() 