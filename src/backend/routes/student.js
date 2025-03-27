const express = require('express');
const router = express.Router();
const { db } = require('../config/db_connection'); // Adjust this import based on your actual db configuration

// Route to get student data by username
router.get('/data/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Get student data from the database
    const student = await db.collection('students').findOne({ username });
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 