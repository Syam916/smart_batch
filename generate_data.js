const { 
  UserModel, 
  CSEModel, 
  ECEModel, 
  MECHModel, 
  CIVILModel, 
  EEEModel 
} = require('./db_setup');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcrypt');

// Helper function to calculate average marks
const calculateAvg = (student) => {
  let total = 0;
  let count = 0;
  
  // Calculate based on student's year
  const semCount = student.year * 2;
  
  for (let i = 1; i <= semCount; i++) {
    if (student[`sem${i}`]) {
      total += student[`sem${i}`];
      count++;
    }
  }
  
  return count > 0 ? Math.round(total / count) : 0;
};

// Generate HOD data for each branch
async function generateHODs() {
  const branches = ['cse', 'ece', 'mech', 'civil', 'eee'];
  const hods = [];
  
  for (const branch of branches) {
    const hodData = {
      username: `hod_${branch}`,
      email: `hod.${branch}@smartbatch.edu`,
      password: await bcrypt.hash('password123', 10),
      role: 'hod',
      branch: branch
    };
    
    hods.push(hodData);
  }
  
  return UserModel.insertMany(hods);
}

// Generate students data for both user_data and branch-specific collections
async function generateStudents() {
  const branches = ['cse', 'ece', 'mech', 'civil', 'eee'];
  const branchModels = {
    'cse': CSEModel,
    'ece': ECEModel,
    'mech': MECHModel,
    'civil': CIVILModel,
    'eee': EEEModel
  };
  
  const sections = ['A', 'B', 'C'];
  const years = [1, 2, 3, 4];
  
  // Create user accounts for students
  for (const branch of branches) {
    for (const year of years) {
      for (const section of sections) {
        // Generate 40 students per section
        for (let i = 1; i <= 40; i++) {
          // Create basic user info
          const rollNumber = `${branch}${year}${section}${i.toString().padStart(2, '0')}`;
          const firstName = faker.name.firstName();
          const lastName = faker.name.lastName();
          const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}`;
          
          // Create user record for user_data collection
          const userRecord = new UserModel({
            username: username,
            email: `${username}@smartbatch.edu`,
            password: await bcrypt.hash('student123', 10),
            role: 'student',
            branch: branch
          });
          
          await userRecord.save();
          
          // Create branch-specific student record
          const studentData = {
            username: username,
            year: year,
            section: section,
            branch: branch
          };
          
          // Add semester marks based on student's year
          for (let sem = 1; sem <= year * 2; sem++) {
            studentData[`sem${sem}`] = Math.floor(Math.random() * 41) + 60; // Random marks between 60-100
          }
          
          // Calculate average
          studentData.avgMarks = calculateAvg(studentData);
          
          // Save to branch-specific collection
          const BranchModel = branchModels[branch];
          const branchRecord = new BranchModel(studentData);
          await branchRecord.save();
          
          console.log(`Created student: ${username} in ${branch} branch, Year ${year}, Section ${section}`);
        }
      }
    }
  }
}

// Main function to generate all data
async function generateAllData() {
  try {
    // Clear existing data
    await UserModel.deleteMany({});
    await CSEModel.deleteMany({});
    await ECEModel.deleteMany({});
    await MECHModel.deleteMany({});
    await CIVILModel.deleteMany({});
    await EEEModel.deleteMany({});
    
    console.log('Generating HODs...');
    await generateHODs();
    
    console.log('Generating Students...');
    await generateStudents();
    
    console.log('Data generation completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error generating data:', error);
    process.exit(1);
  }
}

generateAllData(); 