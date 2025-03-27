// Direct test script for MongoDB operations
const { MongoClient } = require('mongodb');

// Connection URL
const url = 'mongodb+srv://syam:12345@cluster0.x0kwv.mongodb.net/';
const dbName = 'test';

async function main() {
  console.log('Connecting to MongoDB...');
  
  const client = new MongoClient(url);
  
  try {
    // Connect to the MongoDB server
    await client.connect();
    console.log('Connected to MongoDB');
    
    // Get reference to the database
    const db = client.db(dbName);
    
    // Create test document
    const testBatch = {
      document_id: 'test_direct_insert',
      year: 'test',
      branch: 'test',
      section: 'test',
      batches: [[{ name: 'Test Student', rank: 1 }]],
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Insert document
    console.log('Inserting test document...');
    const result = await db.collection('batches').updateOne(
      { document_id: 'test_direct_insert' },
      { $set: testBatch },
      { upsert: true }
    );
    
    console.log('Document inserted/updated:', result.acknowledged);
    console.log('Upserted ID:', result.upsertedId || 'Updated existing');
    
    // Verify the document was inserted
    console.log('Retrieving document...');
    const doc = await db.collection('batches').findOne({ document_id: 'test_direct_insert' });
    console.log('Retrieved document:', doc ? 'Success' : 'Failed');
    
    // Delete test document
    console.log('Deleting test document...');
    const deleteResult = await db.collection('batches').deleteOne({ document_id: 'test_direct_insert' });
    console.log('Document deleted:', deleteResult.deletedCount);
    
    console.log('Test completed successfully');
  } catch (err) {
    console.error('Error during test:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main().catch(console.error); 