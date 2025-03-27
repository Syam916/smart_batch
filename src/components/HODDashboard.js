import React, { useState, useEffect } from 'react';
import { FaUser, FaFilter, FaChartPie } from 'react-icons/fa';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import './HODDashboard.css';

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const HODDashboard = ({ token }) => {
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    section: '',
    semester: '',
  });
  const [branches, setBranches] = useState([]);
  const [years, setYears] = useState([]);
  const [sections, setSections] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    performanceBreakdown: {
      Topper: 0,
      Average: 0,
      Duller: 0
    }
  });
  const [loading, setLoading] = useState(true);

  // Chart data setup
  const chartData = {
    labels: ['Topper', 'Average', 'Duller'],
    datasets: [
      {
        data: [
          stats.performanceBreakdown.Topper,
          stats.performanceBreakdown.Average,
          stats.performanceBreakdown.Duller
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const fetchFilters = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/hod/filters', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;
      setBranches(data.branches || []);
      setYears(data.years || []);
      setSections(data.sections || []);
      setSemesters(data.semesters || []);
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      // Build query params
      const params = new URLSearchParams();
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.year) params.append('year', filters.year);
      if (filters.section) params.append('section', filters.section);
      if (filters.semester) params.append('semester', filters.semester);
      
      const response = await axios.get(`http://localhost:5000/api/hod/students?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;
      setStudents(data);
      
      // Calculate statistics
      const performanceBreakdown = {
        Topper: 0,
        Average: 0,
        Duller: 0
      };
      
      data.forEach(student => {
        if (student.performance_type) {
          performanceBreakdown[student.performance_type]++;
        }
      });
      
      setStats({
        totalStudents: data.length,
        performanceBreakdown
      });
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFilters();
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [filters, token]);

  return (
    <div className="hod-dashboard">
      <div className="dashboard-header">
        <h2><FaUser /> HOD Dashboard</h2>
      </div>
      
      <div className="filters-section">
        <h3><FaFilter /> Filter Students</h3>
        <div className="filters-container">
          <div className="filter-item">
            <label>Branch:</label>
            <select name="branch" value={filters.branch} onChange={handleFilterChange}>
              <option value="">All Branches</option>
              {branches.map((branch, index) => (
                <option key={index} value={branch}>{branch.toUpperCase()}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Year:</label>
            <select name="year" value={filters.year} onChange={handleFilterChange}>
              <option value="">All Years</option>
              {years.map((year, index) => (
                <option key={index} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Section:</label>
            <select name="section" value={filters.section} onChange={handleFilterChange}>
              <option value="">All Sections</option>
              {sections.map((section, index) => (
                <option key={index} value={section}>{section}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-item">
            <label>Semester:</label>
            <select name="semester" value={filters.semester} onChange={handleFilterChange}>
              <option value="">All Semesters</option>
              {semesters.map((semester, index) => (
                <option key={index} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading student data...</div>
      ) : (
        <div className="dashboard-content">
          <div className="stats-container">
            <div className="stats-card total-students">
              <h3>Total Students</h3>
              <div className="stats-value">{stats.totalStudents}</div>
            </div>
            
            <div className="stats-card performance-breakdown">
              <h3>Performance Distribution</h3>
              <div className="stats-chart">
                <Pie data={chartData} options={{ responsive: true }} />
              </div>
              <div className="stats-legend">
                <div className="legend-item">
                  <span className="legend-color topper"></span>
                  <span>Toppers: {stats.performanceBreakdown.Topper}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color average"></span>
                  <span>Average: {stats.performanceBreakdown.Average}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color duller"></span>
                  <span>Duller: {stats.performanceBreakdown.Duller}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="students-table-container">
            <h3>Students List</h3>
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Roll No</th>
                  <th>Branch</th>
                  <th>Section</th>
                  <th>Semester</th>
                  <th>Average Marks</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id} className={`performance-${student.performance_type?.toLowerCase()}`}>
                    <td>{student.name || student.username || 'N/A'}</td>
                    <td>{student.roll_no || 'N/A'}</td>
                    <td>{student.branch || 'N/A'}</td>
                    <td>{student.section || 'N/A'}</td>
                    <td>{student.current_semester || 'N/A'}</td>
                    <td>{student.average_marks ? student.average_marks.toFixed(2) : 'N/A'}</td>
                    <td>{student.performance_type || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODDashboard; 