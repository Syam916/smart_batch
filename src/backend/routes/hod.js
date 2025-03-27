const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');

// Simplify the authenticateToken middleware temporarily
const authenticateToken = (req, res, next) => {
  // For testing, we'll skip authentication
  next();
};

// GET saved batches
router.get('/saved-batches', authenticateToken, async (req, res) => {
  try {
    const { branch, year, section } = req.query;
    
    console.log(`GET /saved-batches with branch=${branch}, year=${year}, section=${section}`);
    
    if (!branch || !year || !section) {
      return res.status(400).json({ message: 'Branch, year, and section are required' });
    }
    
    // Create the document ID in the same format as when saving
    const documentId = `${year}_${branch.toLowerCase()}_${section}`;
    console.log(`Looking for document with ID: ${documentId}`);
    
    const db = req.db;
    const savedBatches = await db.collection('batches').findOne({ 
      document_id: documentId
    });
    
    if (!savedBatches) {
      console.log(`No saved batches found for document ID: ${documentId}`);
      return res.status(404).json({ message: 'No saved batches found for these filters' });
    }
    
    console.log(`Found saved batches with ID: ${documentId}`);
    res.json(savedBatches);
  } catch (error) {
    console.error('Error fetching saved batches:', error);
    res.status(500).json({ message: 'Error fetching saved batches' });
  }
});

// Save batches - with extreme simplicity
router.post('/save-batches', async (req, res) => {
  try {
    const { branch, year, section, batches } = req.body;
    
    if (!branch || !year || !section || !batches) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Get database from request
    const db = req.db;
    
    // Create document ID
    const documentId = `${year}_${branch.toLowerCase()}_${section}`;
    
    // Insert or update document
    try {
      await db.collection('batches').updateOne(
        { document_id: documentId },
        { 
          $set: { 
            document_id: documentId,
            year: year,
            branch: branch.toLowerCase(),
            section: section,
            batches: batches,
            updated_at: new Date() 
          },
          $setOnInsert: {
            created_at: new Date()
          }
        },
        { upsert: true }
      );
      
      return res.status(200).json({ 
        message: 'Saved successfully',
        document_id: documentId
      });
    } catch (dbErr) {
      console.error('Database error:', dbErr);
      return res.status(500).json({ message: 'Database error' });
    }
  } catch (error) {
    console.error('Error in save-batches:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

// Get students based on filters 
router.get('/students', authenticateToken, async (req, res) => {
  // Your existing students route
  res.status(200).json([]);
});

// Export the router
module.exports = router; 