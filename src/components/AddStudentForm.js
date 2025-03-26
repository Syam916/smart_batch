import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaList, FaUserGraduate } from 'react-icons/fa';
import './AddStudentForm.css';

const AddStudentForm = () => {
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    rollNumber: '',
    branch: '',
    year: 1,
    section: 'A',
    marks: {}
  });

  // Added students history
  const [students, setStudents] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  
  // Dynamic fields based on year
  const [semesterFields, setSemesterFields] = useState([]);

  // Load existing students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  // Update semester fields when year changes
  useEffect(() => {
    const fields = [];
    
    // Generate fields for each semester up to the current year
    for (let i = 1; i <= formData.year * 2; i++) {
      fields.push({
        label: `Semester ${i}`,
        name: `sem${i}`,
      });
    }
    
    setSemesterFields(fields);
    
    // Reset marks that are no longer relevant
    const updatedMarks = {};
    fields.forEach(field => {
      updatedMarks[field.name] = formData.marks[field.name] || '';
    });
    
    setFormData({
      ...formData,
      marks: updatedMarks
    });
  }, [formData.year]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      const response = await axios.get('http://localhost:5000/api/students', {
        withCredentials: true
      });
      setStudents(response.data);
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Error fetching students:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleMarksChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      marks: {
        ...formData.marks,
        [name]: parseInt(value) // Store as integer to match MongoDB
      }
    });
  };

  const calculateAvgMarks = (marks) => {
    const values = Object.values(marks).filter(val => !isNaN(val));
    if (values.length === 0) return 0;
    const sum = values.reduce((a, b) => a + b, 0);
    return Math.round(sum / values.length);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate form data
    if (!formData.username || !formData.rollNumber || !formData.branch) {
      toast.error('Please fill all required fields');
      setLoading(false);
      return;
    }
    
    // Check if all semester marks are filled
    const missingMarks = semesterFields.some(field => 
      formData.marks[field.name] === undefined || formData.marks[field.name] === ''
    );
    
    if (missingMarks) {
      toast.error('Please enter all semester marks');
      setLoading(false);
      return;
    }

    const avgMarks = calculateAvgMarks(formData.marks);

    try {
      // Prepare data to match MongoDB structure
      const studentData = {
        username: formData.username,
        rollNumber: formData.rollNumber,
        branch: formData.branch,
        year: parseInt(formData.year),
        section: formData.section,
        avgMarks: avgMarks,
        __v: 0 // Include this field from MongoDB
      };
      
      // Add semester marks directly to the root object
      Object.keys(formData.marks).forEach(key => {
        studentData[key] = formData.marks[key];
      });

      const response = await axios.post('http://localhost:5000/api/students', studentData, {
        withCredentials: true
      });
      
      toast.success('Student added successfully!');
      
      // Reset form
      setFormData({
        username: '',
        rollNumber: '',
        branch: '',
        year: 1,
        section: 'A',
        marks: {}
      });
      
      // Refresh student list
      fetchStudents();
    } catch (error) {
      toast.error('Failed to add student');
      console.error('Error adding student:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-student-container">
      {/* Left section - Add Student Form */}
      <div className="add-student-form-section">
        <div className="form-header">
          <h2><FaPlus className="icon" /> Add New Student</h2>
          <p>Enter student details to add to database</p>
        </div>
        
        <form className="add-student-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username (e.g., john_doe)"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Roll Number</label>
            <input
              type="text"
              name="rollNumber"
              value={formData.rollNumber}
              onChange={handleChange}
              placeholder="Enter roll number"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Branch</label>
              <select 
                name="branch" 
                value={formData.branch}
                onChange={handleChange}
                required
              >
                <option value="">Select Branch</option>
                <option value="cse">Computer Science</option>
                <option value="ece">Electronics</option>
                <option value="mech">Mechanical</option>
                <option value="civil">Civil</option>
                <option value="eee">Electrical</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Year</label>
              <select 
                name="year" 
                value={formData.year}
                onChange={handleChange}
                required
              >
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Section</label>
              <select 
                name="section" 
                value={formData.section}
                onChange={handleChange}
                required
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>
          
          <div className="semester-marks-section">
            <h3>Academic Performance</h3>
            <div className="marks-fields">
              {semesterFields.map((field) => (
                <div className="form-group" key={field.name}>
                  <label>{field.label}</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    name={field.name}
                    value={formData.marks[field.name] || ''}
                    onChange={handleMarksChange}
                    placeholder="Enter marks (0-100)"
                    required
                  />
                </div>
              ))}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Adding Student...' : 'Add Student'}
          </button>
        </form>
      </div>
      
      {/* Right section - Student History */}
      <div className="student-history-section">
        <div className="history-header">
          <h2><FaList className="icon" /> Student Records</h2>
          <p>Recently added students</p>
        </div>
        
        <div className="students-list">
          {loadingStudents ? (
            <div className="loading-message">Loading students...</div>
          ) : students.length === 0 ? (
            <div className="empty-message">
              <FaUserGraduate className="empty-icon" />
              <p>No students added yet</p>
            </div>
          ) : (
            <table className="students-table">
              <thead>
                <tr>
                  <th>Roll No.</th>
                  <th>Username</th>
                  <th>Branch</th>
                  <th>Year</th>
                  <th>Section</th>
                  <th>Avg. Marks</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.rollNumber}</td>
                    <td>{student.username}</td>
                    <td>{student.branch}</td>
                    <td>{student.year}</td>
                    <td>{student.section}</td>
                    <td>{student.avgMarks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddStudentForm; 