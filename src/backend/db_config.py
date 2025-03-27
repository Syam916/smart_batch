from pymongo import MongoClient
import os
import sys

# Try to connect to MongoDB Atlas using environment variable (more secure)
connection_string = os.environ.get("MONGODB_URI", "mongodb+srv://syam:12345@cluster0.x0kwv.mongodb.net/")

print(f"Attempting to connect to MongoDB Atlas with connection string: {connection_string}")

try:
    client = MongoClient(connection_string, serverSelectionTimeoutMS=5000)
    
    # Force a connection to verify it works
    client.admin.command('ping')
    
    # Get the database list
    db_list = client.list_database_names()
    print("Connected to MongoDB Atlas successfully!")
    print("Available databases:", db_list)

    # Use the test database
    db = client['test']
    print("Using MongoDB Atlas 'test' database")

    # List current collections
    collections = db.list_collection_names()
    print(f"Current collections in 'test' database: {collections}")
    
    # Ensure batches collection exists
    if 'batches' not in collections:
        print("Creating 'batches' collection...")
        # Create the collection
        db.create_collection('batches')
        print("Created 'batches' collection")
    else:
        print("'batches' collection already exists")
        
        # Count documents in batches collection
        count = db['batches'].count_documents({})
        print(f"Number of documents in 'batches' collection: {count}")
    
    # Create or update indexes
    print("Creating/updating indexes for 'batches' collection...")
    db['batches'].create_index("document_id", unique=True)
    print("Created index on document_id")

    # Test inserting a document
    test_doc = {
        "document_id": "test_document",
        "year": "test",
        "branch": "test",
        "section": "test",
        "batches": [],
        "created_at": None,
        "updated_at": None
    }
    
    try:
        # Use update with upsert to avoid duplicates
        result = db['batches'].update_one(
            {"document_id": "test_document"}, 
            {"$set": test_doc}, 
            upsert=True
        )
        print(f"Test document inserted/updated: {result.upserted_id or 'updated existing'}")
        
        # Remove test document
        db['batches'].delete_one({"document_id": "test_document"})
        print("Test document removed")
    except Exception as e:
        print(f"Error testing document insertion: {str(e)}")

    print("Database configuration completed successfully.")

except Exception as e:
    print(f"Error in database setup: {str(e)}")
    sys.exit(1)  # Exit on database connection error 