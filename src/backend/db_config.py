from pymongo import MongoClient
import os
import sys

# Try to connect to MongoDB Atlas using environment variable (more secure)
connection_string = os.environ.get("MONGODB_URI", "mongodb+srv://syam:12345@cluster0.x0kwv.mongodb.net/")

print("Attempting to connect to MongoDB Atlas...")
client = MongoClient(connection_string)

# Get the database list - this will verify the connection works
db_list = client.list_database_names()
print("Connected to MongoDB Atlas successfully!")
print("Available databases:", db_list)

# Use the test database
db = client['test']
print("Using MongoDB Atlas 'test' database")

print("Database configuration completed.") 