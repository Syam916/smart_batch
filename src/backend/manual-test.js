// Direct MongoDB test
const { MongoClient } = require('mongodb');

async function testMongoDB() {
  // Connect to MongoDB
  const client = new MongoClient('mongodb+srv://syam:12345@cluster0.x0kwv.mongodb.net/');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('test');
    const collection = db.collection('batches');
    
    // Test document
    const testDoc = {
      document_id: 'test_1_cse_A',
      year: '1',
      branch: 'cse',
      section: 'A',
      batches: [
        [{ name: 'Student 1', rank: 1 }],
        [{ name: 'Student 2', rank: 2 }]
      ],
      updated_at: new Date(),
      created_at: new Date()
    };
    
    // Save to database
    const result = await collection.updateOne(
      { document_id: 'test_1_cse_A' },
      { $set: testDoc },
      { upsert: true }
    );
    
    console.log('Document saved:', result.acknowledged);
    
    // Verify it's there
    const saved = await collection.findOne({ document_id: 'test_1_cse_A' });
    console.log('Document retrieved:', saved ? 'Yes' : 'No');
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

testMongoDB().catch(console.error); 