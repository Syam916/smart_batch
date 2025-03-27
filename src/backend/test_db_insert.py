from pymongo import MongoClient
import datetime

# Connect to MongoDB
connection_string = "mongodb+srv://syam:12345@cluster0.x0kwv.mongodb.net/"

print("Connecting to MongoDB...")
client = MongoClient(connection_string)
db = client['test']

# Test data
test_batch = {
    "document_id": "1_cse_A",
    "year": "1",
    "branch": "cse",
    "section": "A",
    "batches": [
        [
            {
                "_id": "abc123",
                "username": "test_student",
                "roll_no": "CSE1001",
                "rank": 1,
                "average_marks": 90,
                "branch": "cse",
                "year": "1",
                "section": "A"
            }
        ]
    ],
    "created_at": datetime.datetime.now(),
    "updated_at": datetime.datetime.now()
}

try:
    # Insert the test batch
    result = db['batches'].update_one(
        {"document_id": "1_cse_A"},
        {"$set": test_batch},
        upsert=True
    )
    
    if result.upserted_id:
        print(f"Test batch inserted with ID: {result.upserted_id}")
    else:
        print("Test batch updated existing document")
    
    # Verify it's there
    saved_batch = db['batches'].find_one({"document_id": "1_cse_A"})
    if saved_batch:
        print(f"Retrieved saved batch: {saved_batch['document_id']}")
    else:
        print("Could not find saved batch")
        
except Exception as e:
    print(f"Error: {str(e)}")

print("Test completed") 