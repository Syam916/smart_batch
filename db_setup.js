const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect("mongodb+srv://syam:12345@cluster0.x0kwv.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

// User Schema (for user_data cluster)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'hod'], required: true },
  branch: { type: String, enum: ['cse', 'ece', 'mech', 'civil', 'eee'] }
});

// Create schemas for each branch
const createBranchSchema = (branchName) => {
  return new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    year: { type: Number, required: true, min: 1, max: 4 },
    section: { type: String, required: true },
    branch: { type: String, default: branchName, required: true },
    sem1: { type: Number, min: 0, max: 100 },
    sem2: { type: Number, min: 0, max: 100 },
    sem3: { type: Number, min: 0, max: 100 },
    sem4: { type: Number, min: 0, max: 100 },
    sem5: { type: Number, min: 0, max: 100 },
    sem6: { type: Number, min: 0, max: 100 },
    sem7: { type: Number, min: 0, max: 100 },
    sem8: { type: Number, min: 0, max: 100 },
    avgMarks: { type: Number }
  });
};

// Create models
const UserModel = mongoose.model('User', userSchema, 'user_data');
const CSEModel = mongoose.model('CSE', createBranchSchema('cse'), 'cse');
const ECEModel = mongoose.model('ECE', createBranchSchema('ece'), 'ece');
const MECHModel = mongoose.model('MECH', createBranchSchema('mech'), 'mech');
const CIVILModel = mongoose.model('CIVIL', createBranchSchema('civil'), 'civil');
const EEEModel = mongoose.model('EEE', createBranchSchema('eee'), 'eee');

module.exports = {
  UserModel,
  CSEModel,
  ECEModel,
  MECHModel,
  CIVILModel,
  EEEModel
}; 