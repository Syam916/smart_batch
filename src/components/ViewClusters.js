import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUsers, FaFilter, FaFileExport, FaUserFriends, FaExchangeAlt } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ViewClusters.css';

const ViewClusters = ({ token }) => {
  const [clusters, setClusters] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchConfig, setBatchConfig] = useState({
    numberOfBatches: 2,
    studentsPerBatch: 3
  });
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [targetBatch, setTargetBatch] = useState(null);
  const [showSwapInterface, setShowSwapInterface] = useState(false);
  
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    section: ''
  });
  const [formData, setFormData] = useState({
    branch: 'CSE',
    year: '1st',
    section: 'A',
    semester: '1'
  });
  const [loading, setLoading] = useState(false);
  const [createTeamLoading, setCreateTeamLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedBatchData, setSavedBatchData] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const navigate = useNavigate();

  const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
  const years = ['1st', '2nd', '3rd', '4th'];
  const sections = ['A', 'B', 'C', 'D'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    fetchClusters();
  }, [filters]);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.branch) queryParams.append('branch', filters.branch);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.section) queryParams.append('section', filters.section);
      
      const response = await axios.get(`http://localhost:5000/api/hod/clusters?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setClusters(response.data);
    } catch (error) {
      toast.error('Error fetching clusters');
      console.error('Error fetching clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.branch) queryParams.append('branch', filters.branch);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.section) queryParams.append('section', filters.section);
      
      console.log("Query params:", queryParams.toString());
      
      // First check if we have saved batches for these filters
      if (filters.branch && filters.year && filters.section) {
        try {
          const savedBatchesResponse = await axios.get(
            `http://localhost:5000/api/hod/saved-batches?branch=${filters.branch}&year=${filters.year}&section=${filters.section}`,
            {
              headers: {
                Authorization: `Bearer ${token}`
              }
            }
          );
          
          if (savedBatchesResponse.data && savedBatchesResponse.data.batches) {
            setSavedBatchData(savedBatchesResponse.data);
            console.log("Loaded saved batches:", savedBatchesResponse.data);
          }
        } catch (error) {
          console.log("No saved batches found for these filters");
        }
      }
      
      // Get students matching the filter
      const response = await axios.get(`http://localhost:5000/api/hod/students?${queryParams}`, {
        withCredentials: true
      });
      
      console.log("Response data:", response.data);
      
      // Create a copy of the response data to avoid mutation issues
      const students = [...response.data];
      
      // Sort students by average marks in descending order
      const sortedStudents = students.sort((a, b) => {
        const aMarks = a.avgMarks !== undefined ? a.avgMarks : a.average_marks;
        const bMarks = b.avgMarks !== undefined ? b.avgMarks : b.average_marks;
        return bMarks - aMarks;
      });

      // Add explicit rank property to each student
      const rankedStudents = sortedStudents.map((student, index) => {
        return {
          ...student,
          rank: index + 1
        };
      });
      
      setFilteredStudents(rankedStudents);
      
      // If we have saved batches, check if students match
      if (savedBatchData) {
        // Extract all student IDs from saved batches
        const savedStudentIds = savedBatchData.batches.flat().map(student => student._id);
        
        // Check if current students match saved students
        const currentStudentIds = rankedStudents.map(student => student._id);
        
        // Check for new students
        const hasNewStudents = currentStudentIds.some(id => !savedStudentIds.includes(id));
        
        // Check for missing students
        const hasMissingStudents = savedStudentIds.some(id => !currentStudentIds.includes(id));
        
        if (hasNewStudents || hasMissingStudents) {
          toast.warning('Student data has changed since batches were last saved. Please create new batches.');
          setHasChanges(true);
          setBatches([]);
        } else {
          // Load the saved batches
          setBatches(savedBatchData.batches);
          toast.success('Loaded saved batches for these filters');
        }
      } else {
        setBatches([]);
      }
      
      if (rankedStudents.length === 0) {
        toast.info('No students match the selected filters');
      } else {
        toast.success(`Found ${rankedStudents.length} students`);
      }
    } catch (error) {
      toast.error('Failed to fetch students');
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const toggleBatchForm = () => {
    setShowBatchForm(!showBatchForm);
  };

  const handleBatchConfigChange = (e) => {
    const { name, value } = e.target;
    setBatchConfig({
      ...batchConfig,
      [name]: parseInt(value)
    });
  };

  const handleCreateBatches = () => {
    const { numberOfBatches, studentsPerBatch } = batchConfig;
    
    if (filteredStudents.length === 0) {
      toast.error('No students to create batches from. Please apply filters first.');
      return;
    }
    
    // Sort students by avgMarks (handling both property names)
    // Make sure we keep all properties including rank
    const sortedStudents = [...filteredStudents].sort((a, b) => {
      const aMarks = a.avgMarks !== undefined ? a.avgMarks : a.average_marks;
      const bMarks = b.avgMarks !== undefined ? b.avgMarks : b.average_marks;
      return bMarks - aMarks;
    });
    
    // Calculate if we need an extra batch for remaining students
    const totalStudents = sortedStudents.length;
    const totalRequiredSlots = numberOfBatches * studentsPerBatch;
    
    if (totalStudents < studentsPerBatch) {
      toast.error(`Not enough students. Need at least ${studentsPerBatch} students for one batch.`);
      return;
    }
    
    // Create balanced batches and handle remaining students
    const createdBatches = createBalancedBatchesWithRemainder(
      sortedStudents, 
      numberOfBatches, 
      studentsPerBatch
    );
    
    setBatches(createdBatches);
    setHasChanges(true);
    
    const extraBatch = totalStudents > totalRequiredSlots;
    const batchCount = extraBatch ? numberOfBatches + 1 : numberOfBatches;
    
    toast.success(`Created ${batchCount} balanced batches`);
  };

  const createBalancedBatchesWithRemainder = (sortedStudents, numberOfBatches, studentsPerBatch) => {
    // Initialize the batch arrays
    const batches = Array.from({ length: numberOfBatches }, () => []);
    
    // Calculate how many students can fit in the requested number of batches
    const totalFitStudents = Math.min(sortedStudents.length, numberOfBatches * studentsPerBatch);
    
    // Determine if we need an extra batch for remaining students
    const hasRemainingStudents = sortedStudents.length > totalFitStudents;
    
    // Main batch distribution (for students that fit in the requested batches)
    const studentsToDistribute = sortedStudents.slice(0, totalFitStudents);
    
    // Divide students into performance categories
    const topCount = Math.ceil(studentsToDistribute.length * 0.25);
    const bottomCount = Math.ceil(studentsToDistribute.length * 0.25);
    const middleCount = studentsToDistribute.length - topCount - bottomCount;
    
    const topPerformers = studentsToDistribute.slice(0, topCount);
    const middlePerformers = studentsToDistribute.slice(topCount, topCount + middleCount);
    const bottomPerformers = studentsToDistribute.slice(topCount + middleCount);
    
    // Function to distribute a group of students across batches
    const distributeStudentsAcrossBatches = (students, batches) => {
      students.forEach((student, index) => {
        // Find the batch with the fewest students
        const targetBatchIndex = batches
          .map((batch, idx) => ({ count: batch.length, idx }))
          .sort((a, b) => a.count - b.count)[0].idx;
        
        // Add student to that batch
        batches[targetBatchIndex].push(student);
      });
    };
    
    // Distribute each performance category to ensure balance
    distributeStudentsAcrossBatches(topPerformers, batches);
    distributeStudentsAcrossBatches(middlePerformers, batches);
    distributeStudentsAcrossBatches(bottomPerformers, batches);
    
    // Handle remaining students (if any) by creating an extra batch
    if (hasRemainingStudents) {
      const remainingStudents = sortedStudents.slice(totalFitStudents);
      
      // Create an additional batch for the remaining students
      const extraBatch = remainingStudents;
      batches.push(extraBatch);
    }
    
    return batches;
  };

  const handleCreateTeams = async (e) => {
    e.preventDefault();
    setCreateTeamLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/hod/create-teams', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Teams created successfully');
      fetchClusters();
    } catch (error) {
      toast.error('Error creating teams');
      console.error('Error creating teams:', error);
    } finally {
      setCreateTeamLoading(false);
    }
  };

  const fetchTeamMembers = async (clusterId, teamId) => {
    try {
      const teamKey = `${clusterId}_${teamId}`;
      
      if (teamMembers[teamKey]) {
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/hod/team-members?cluster_id=${clusterId}&team_id=${teamId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTeamMembers({
        ...teamMembers,
        [teamKey]: response.data
      });
    } catch (error) {
      toast.error('Error fetching team members');
      console.error('Error fetching team members:', error);
    }
  };

  const toggleTeamExpand = (clusterId, teamId) => {
    const teamKey = `${clusterId}_${teamId}`;
    
    setExpandedTeams({
      ...expandedTeams,
      [teamKey]: !expandedTeams[teamKey]
    });
    
    if (!expandedTeams[teamKey]) {
      fetchTeamMembers(clusterId, teamId);
    }
  };

  const exportTeamsToCSV = (cluster) => {
    const headers = ['Team ID', 'Member Name', 'Roll No', 'Performance Type', 'Average Marks'];
    const rows = [];
    
    cluster.teams.forEach((team, teamIndex) => {
      const teamKey = `${cluster._id}_${teamIndex}`;
      const members = teamMembers[teamKey] || [];
      
      members.forEach(member => {
        rows.push([
          `Team ${teamIndex + 1}`,
          member.name,
          member.rollNumber,
          member.performance_type,
          member.average_marks.toFixed(2)
        ]);
      });
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `teams_${cluster.branch}_${cluster.year}_${cluster.section}_sem${cluster.semester}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleStudentSelect = (batchIndex, student) => {
    // If we already selected this student, deselect it
    if (selectedStudent && selectedStudent.student._id === student._id) {
      setSelectedStudent(null);
      return;
    }
    
    // Otherwise, set this as the selected student
    setSelectedStudent({ batchIndex, student });
    setTargetBatch(null); // Clear any previously selected target batch
  };

  const handleBatchSelect = (batchIndex) => {
    // Don't allow selecting the same batch as the selected student
    if (selectedStudent && selectedStudent.batchIndex === batchIndex) {
      toast.error("Can't move student to the same batch");
      return;
    }
    
    setTargetBatch(batchIndex);
  };

  const moveStudent = () => {
    if (!selectedStudent || targetBatch === null) {
      toast.error('Please select a student and a target batch');
      return;
    }

    const newBatches = [...batches];
    
    // Remove student from current batch
    newBatches[selectedStudent.batchIndex] = newBatches[selectedStudent.batchIndex]
      .filter(s => s._id !== selectedStudent.student._id);
    
    // Add student to target batch
    newBatches[targetBatch].push(selectedStudent.student);
    
    // Update state
    setBatches(newBatches);
    setHasChanges(true);
    
    // Calculate new averages
    const sourceBatchAvg = calculateBatchAverage(newBatches[selectedStudent.batchIndex]);
    const targetBatchAvg = calculateBatchAverage(newBatches[targetBatch]);
    
    toast.success(`Moved student to Batch ${targetBatch + 1}. New averages - Source Batch: ${sourceBatchAvg.toFixed(1)}, Target Batch: ${targetBatchAvg.toFixed(1)}`);
    
    // Reset selections
    setSelectedStudent(null);
    setTargetBatch(null);
  };

  const cancelSwap = () => {
    setSelectedStudent(null);
    setTargetBatch(null);
    setShowSwapInterface(false);
  };

  const toggleSwapInterface = () => {
    setShowSwapInterface(!showSwapInterface);
    if (!showSwapInterface) {
      setSelectedStudent(null);
    }
  };

  const calculateBatchAverage = (batch) => {
    if (batch.length === 0) return 0;
    
    return batch.reduce((sum, student) => {
      const marks = student.avgMarks !== undefined ? 
        student.avgMarks : student.average_marks;
      return sum + marks;
    }, 0) / batch.length;
  };

  const swapInterfaceJSX = (
    <div className="swap-interface">
      <div className="swap-instructions">
        <h3>Move Students Between Batches</h3>
        <p>First, select a student, then select a batch to move them to.</p>
        <div className="selected-students">
          {selectedStudent ? (
            <div className="selection-info">
              <div className="selected-student-info">
                <span className="label">Selected Student:</span> 
                <span className="value">{selectedStudent.student.username}</span>
                <span className="label">From Batch:</span>
                <span className="value">{selectedStudent.batchIndex + 1}</span>
              </div>
              
              {targetBatch !== null ? (
                <div className="target-batch-info">
                  <span className="label">Target Batch:</span>
                  <span className="value">{targetBatch + 1}</span>
                  <button 
                    className="confirm-move-button"
                    onClick={moveStudent}
                  >
                    <FaExchangeAlt className="icon" /> Confirm Move
                  </button>
                </div>
              ) : (
                <div className="select-target-prompt">
                  Now select a target batch
                </div>
              )}
            </div>
          ) : (
            <div className="selection-prompt">
              Select a student to move
            </div>
          )}
          
          <button 
            className="cancel-swap-button"
            onClick={cancelSwap}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const batchesDisplayJSX = (
    <div className="batches-grid">
      {batches.map((batch, batchIndex) => (
        <div 
          className={`batch-card ${showSwapInterface ? 'swap-mode' : ''} ${
            targetBatch === batchIndex ? 'target-batch' : ''
          }`} 
          key={batchIndex}
          onClick={() => showSwapInterface && selectedStudent && handleBatchSelect(batchIndex)}
        >
          <div className="batch-header">
            <h4>Batch {batchIndex + 1}</h4>
            <span className="batch-avg">
              Avg: {calculateBatchAverage(batch).toFixed(1)}
            </span>
          </div>
          <div className="batch-members">
            {batch.map(student => (
              <div 
                className={`student-item ${showSwapInterface ? 'selectable' : ''} ${
                  selectedStudent && selectedStudent.student._id === student._id ? 'selected' : ''
                }`} 
                key={student._id}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering batch click
                  showSwapInterface && handleStudentSelect(batchIndex, student);
                }}
              >
                <div className="student-info">
                  <div className="student-name">{student.username}</div>
                  <div className="student-details">
                    <span className="student-roll">{student.rollNumber || 'N/A'}</span>
                    <span className="student-rank">Rank: {student.rank || '-'}</span>
                  </div>
                </div>
                <div className="student-marks">
                  {student.avgMarks !== undefined ? student.avgMarks : student.average_marks}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const saveBatches = async () => {
    if (!batches.length) {
      toast.error('No batches to save');
      return;
    }
    
    if (!filters.branch || !filters.year || !filters.section) {
      toast.error('Please select branch, year, and section before saving');
      return;
    }
    
    setSaveLoading(true);
    
    try {
      // Simple data format with minimal processing
      const batchesToSave = batches.map(batch => 
        batch.map(student => ({
          _id: student._id,
          username: student.username,
          roll_no: student.roll_no || student.rollNumber,
          rank: student.rank || 0,
          average_marks: student.avgMarks !== undefined ? student.avgMarks : student.average_marks,
          branch: student.branch || filters.branch,
          year: student.year || filters.year,
          section: student.section || filters.section
        }))
      );
      
      // Create a document ID
      const documentId = `${filters.year}_${filters.branch.toLowerCase()}_${filters.section}`;
      
      console.log(`Attempting to save batches with ID: ${documentId}`);
      console.log(`Number of batches: ${batchesToSave.length}`);
      
      // Simple axios call with no withCredentials
      const response = await axios.post(
        'http://localhost:5000/api/hod/save-batches', 
        {
          branch: filters.branch,
          year: filters.year,
          section: filters.section,
          batches: batchesToSave
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || 'dummy-token'}`
          }
        }
      );
      
      toast.success('Batches saved successfully!');
      setHasChanges(false);
      setSavedBatchData({
        document_id: documentId,
        branch: filters.branch,
        year: filters.year,
        section: filters.section,
        batches: batchesToSave
      });
      
    } catch (error) {
      console.error('Error saving batches:', error);
      toast.error(`Failed to save batches: Network error`);
    } finally {
      setSaveLoading(false);
    }
  };

  // Render the save button component
  const SaveBatchButton = () => {
    if (!batches.length) return null;
    
    return (
      <div className="save-batch-container">
        <button 
          className={`save-batch-button ${hasChanges ? 'has-changes' : ''}`}
          onClick={saveBatches}
          disabled={saveLoading}
        >
          {saveLoading ? 'Saving...' : hasChanges ? 'Save Changes' : 'Save Batches'}
        </button>
        {hasChanges && savedBatchData && (
          <div className="changes-warning">
            <p>You have unsaved changes to these batches.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="view-clusters-container">
      <div className="filters-section">
        <div className="section-header">
          <h2><FaFilter className="icon" /> Filter Students</h2>
          <p>Select criteria to filter students</p>
        </div>
        
        <form className="filter-form" onSubmit={handleFilterSubmit}>
          <div className="filter-row">
            <div className="filter-group">
              <label>Year</label>
              <select 
                name="year" 
                value={filters.year}
                onChange={handleFilterChange}
              >
                <option value="">All Years</option>
                <option value="1">First Year</option>
                <option value="2">Second Year</option>
                <option value="3">Third Year</option>
                <option value="4">Fourth Year</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Branch</label>
              <select 
                name="branch" 
                value={filters.branch}
                onChange={handleFilterChange}
              >
                <option value="">All Branches</option>
                <option value="cse">Computer Science</option>
                <option value="ece">Electronics</option>
                <option value="mech">Mechanical</option>
                <option value="civil">Civil</option>
                <option value="eee">Electrical</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Section</label>
              <select 
                name="section" 
                value={filters.section}
                onChange={handleFilterChange}
              >
                <option value="">All Sections</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
            
            <button type="submit" className="filter-button">
              Apply Filters
            </button>
          </div>
        </form>
      </div>
      
      <div className="results-section">
        <div className="section-header results-header">
          <h2><FaUsers className="icon" /> Student Results</h2>
          <div className="header-actions">
            {filteredStudents.length > 0 && !batches.length && (
              <button className="create-batch-button" onClick={toggleBatchForm}>
                Create Batches
              </button>
            )}
            {batches.length > 0 && (
              <button 
                className={`swap-button ${showSwapInterface ? 'active' : ''}`} 
                onClick={toggleSwapInterface}
              >
                <FaExchangeAlt className="icon" /> {showSwapInterface ? 'Cancel Swapping' : 'Swap Students'}
              </button>
            )}
          </div>
        </div>
        
        {showBatchForm && (
          <div className="batch-form">
            <h3>Batch Configuration</h3>
            <div className="batch-config-row">
              <div className="form-group">
                <label>Number of Batches</label>
                <input
                  type="number"
                  name="numberOfBatches"
                  min="2"
                  max="10"
                  value={batchConfig.numberOfBatches}
                  onChange={handleBatchConfigChange}
                />
              </div>
              <div className="form-group">
                <label>Students Per Batch</label>
                <input
                  type="number"
                  name="studentsPerBatch"
                  min="2"
                  max="10"
                  value={batchConfig.studentsPerBatch}
                  onChange={handleBatchConfigChange}
                />
              </div>
              <button 
                className="create-button"
                onClick={handleCreateBatches}
              >
                Generate Balanced Batches
              </button>
            </div>
          </div>
        )}
        
        {showSwapInterface && batches.length > 0 && swapInterfaceJSX}
        
        {loading ? (
          <div className="loading-message">Loading students...</div>
        ) : batches.length > 0 ? (
          <div className="batches-display">
            <h3>Generated Balanced Batches</h3>
            {batchesDisplayJSX}
            <SaveBatchButton />
          </div>
        ) : filteredStudents.length > 0 ? (
          <table className="students-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Username</th>
                <th>Roll Number</th>
                <th>Branch</th>
                <th>Year</th>
                <th>Section</th>
                <th>Average Marks</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student._id}>
                  <td>{student.rank}</td>
                  <td>{student.username}</td>
                  <td>{student.rollNumber}</td>
                  <td>{student.branch}</td>
                  <td>{student.year}</td>
                  <td>{student.section}</td>
                  <td>{student.avgMarks || student.average_marks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-message">
            <FaUserFriends className="empty-icon" />
            <p>No students found. Apply filters to see results.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewClusters; 