// This should be implemented on your backend
const express = require('express');
const router = express.Router();
const { MongoClient, ObjectId } = require('mongodb');

// MongoDB connection URI
const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let db;

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");
    db = client.db("your_database_name"); // Replace with your DB name
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongo();

// Get student data by username - no JWT required
router.get('/api/student/data/:username', async (req, res) => {
  console.log('Received request for student data');
  console.log('Params:', req.params);
  
  try {
    const { username } = req.params;
    console.log('Extracted username:', username);
    
    if (!username) {
      console.log('No username provided in request');
      return res.status(400).json({ message: 'Username is required' });
    }
    
    console.log('Querying collection user_data for username:', username);
    
    // Query user_data collection for the student
    const student = await db.collection('user_data').findOne({ username });
    console.log('Query result:', student);
    
    if (!student) {
      console.log('No student found with username:', username);
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // If the student has a branch, get the branch information
    let branchInfo = null;
    if (student.branch) {
      console.log('Getting branch info for branch:', student.branch);
      branchInfo = await db.collection('branches').findOne({ name: student.branch });
    }
    
    const response = {
      ...student,
      branchInfo
    };
    
    console.log('Student data found, returning response');
    return res.status(200).json(response);
  } catch (error) {
    console.error('Error in /api/student/data endpoint:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router; 