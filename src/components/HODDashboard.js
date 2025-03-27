import React, { useState, useEffect } from 'react';
import { FaUser, FaFilter, FaChartPie } from 'react-icons/fa';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import axios from 'axios';
import './HODDashboard.css';

// Register the required Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

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
    },
    averageMarks: 0,
    highestMarks: 0,
    lowestMarks: 0,
    passRate: 0,
    marksDistribution: {
      below40: 0,
      '40to50': 0,
      '50to60': 0,
      '60to70': 0,
      '70to85': 0,
      above85: 0
    }
  });
  const [loading, setLoading] = useState(true);

  // Updated chart data setup
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

  // New detailed marks distribution chart
  const marksDistributionData = {
    labels: ['<40%', '40-50%', '50-60%', '60-70%', '70-85%', '>85%'],
    datasets: [
      {
        label: 'Number of Students',
        data: [
          stats.marksDistribution.below40,
          stats.marksDistribution['40to50'],
          stats.marksDistribution['50to60'],
          stats.marksDistribution['60to70'],
          stats.marksDistribution['70to85'],
          stats.marksDistribution.above85,
        ],
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
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
      
      try {
        // Apply performance classification based on marks
        const processedStudents = data.map(student => {
          // Ensure we have a proper number
          const avgMarks = parseFloat(student.avgMarks || 0);
          console.log('Processing student:', student.username, 'with average marks:', avgMarks);
          let performanceType = '';
          
          if (avgMarks >= 85) {
            performanceType = 'Topper';
          } else if (avgMarks >= 71 && avgMarks < 85) {
            performanceType = 'Average';
          } else {
            performanceType = 'Duller';
          }
          
          return {
            ...student,
            performance_type: performanceType,
            average_marks: avgMarks // Ensure we store as number
          };
        });
        
        setStudents(processedStudents);
        
        // Calculate detailed statistics
        const performanceBreakdown = {
          Topper: 0, 
          Average: 0,
          Duller: 0
        };
        
        let totalMarks = 0;
        let highestMark = 0;
        let lowestMark = 100;
        let passCount = 0;
        const marksDistribution = {
          below40: 0,
          '40to50': 0,
          '50to60': 0,
          '60to70': 0,
          '70to85': 0,
          above85: 0
        };
        
        processedStudents.forEach(student => {
          const marks = student.average_marks; // Already parsed to a number
          
          // Performance breakdown
          performanceBreakdown[student.performance_type]++;
          
          // Calculate total marks for average
          totalMarks += marks;
          
          // Find highest and lowest marks
          if (marks > highestMark) highestMark = marks;
          if (marks < lowestMark && marks > 0) lowestMark = marks;
          
          // Pass rate (assuming passing mark is 40%)
          if (marks >= 40) passCount++;
          
          // Marks distribution
          if (marks < 40) {
            marksDistribution.below40++;
          } else if (marks >= 40 && marks < 50) {
            marksDistribution['40to50']++;
          } else if (marks >= 50 && marks < 60) {
            marksDistribution['50to60']++;
          } else if (marks >= 60 && marks < 70) {
            marksDistribution['60to70']++;
          } else if (marks >= 70 && marks < 85) {
            marksDistribution['70to85']++;
          } else if (marks >= 85) {
            marksDistribution.above85++;
          }
        });
        
        // If no students have marks, set lowest to 0
        if (lowestMark === 100 && processedStudents.length > 0) {
          lowestMark = 0;
        }
        
        setStats({
          totalStudents: processedStudents.length,
          performanceBreakdown: performanceBreakdown,
          averageMarks: processedStudents.length > 0 ? +(totalMarks / processedStudents.length).toFixed(2) : 0,
          highestMarks: highestMark,
          lowestMarks: lowestMark,
          passRate: processedStudents.length > 0 ? +((passCount / processedStudents.length) * 100).toFixed(2) : 0,
          marksDistribution: marksDistribution
        });
      } catch (parseError) {
        console.error('Error processing students data:', parseError);
      }
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
          {/* Performance Summary Cards */}
          <div className="stats-overview">
            <div className="stats-card total-students">
              <h3>Total Students</h3>
              <div className="stats-value">{stats.totalStudents}</div>
            </div>
            
            <div className="stats-card average-marks">
              <h3>Average Marks</h3>
              <div className="stats-value">{stats.averageMarks}%</div>
            </div>
            
            <div className="stats-card highest-marks">
              <h3>Highest Marks</h3>
              <div className="stats-value">{stats.highestMarks}%</div>
            </div>
            
            <div className="stats-card lowest-marks">
              <h3>Lowest Marks</h3>
              <div className="stats-value">{stats.lowestMarks}%</div>
            </div>
            
            <div className="stats-card pass-rate">
              <h3>Pass Rate</h3>
              <div className="stats-value">{stats.passRate}%</div>
            </div>
          </div>
          
          {/* Performance Distribution Chart */}
          <div className="charts-container">
            <div className="stats-card performance-breakdown">
              <h3>Performance Distribution</h3>
              <div className="stats-chart">
                <Pie data={chartData} options={{ responsive: true }} />
              </div>
              <div className="stats-legend">
                <div className="legend-item">
                  <span className="legend-color topper"></span>
                  <span>Toppers ({'>'}85%): {stats.performanceBreakdown.Topper}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color average"></span>
                  <span>Average (71-85%): {stats.performanceBreakdown.Average}</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color duller"></span>
                  <span>Duller ({'<'}71%): {stats.performanceBreakdown.Duller}</span>
                </div>
              </div>
            </div>
            
            {/* Detailed Marks Distribution */}
            <div className="stats-card marks-distribution">
              <h3>Detailed Marks Distribution</h3>
              <div className="stats-chart">
                <Bar 
                  data={marksDistributionData} 
                  options={{ 
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false
                      },
                      title: {
                        display: true,
                        text: 'Student Marks Distribution',
                        font: {
                          size: 16,
                          weight: 'bold'
                        },
                        padding: {
                          top: 10,
                          bottom: 20
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                          precision: 0
                        }
                      },
                      x: {
                        grid: {
                          display: false
                        }
                      }
                    },
                    animation: {
                      duration: 2000
                    }
                  }} 
                />
              </div>
              <div className="distribution-summary">
                <div className="summary-item">
                  <span className="mark-range below40">Below 40%:</span>
                  <span className="count">{stats.marksDistribution.below40} students</span>
                </div>
                <div className="summary-item">
                  <span className="mark-range range40-50">40-50%:</span>
                  <span className="count">{stats.marksDistribution['40to50']} students</span>
                </div>
                <div className="summary-item">
                  <span className="mark-range range50-60">50-60%:</span>
                  <span className="count">{stats.marksDistribution['50to60']} students</span>
                </div>
                <div className="summary-item">
                  <span className="mark-range range60-70">60-70%:</span>
                  <span className="count">{stats.marksDistribution['60to70']} students</span>
                </div>
                <div className="summary-item">
                  <span className="mark-range range70-85">70-85%:</span>
                  <span className="count">{stats.marksDistribution['70to85']} students</span>
                </div>
                <div className="summary-item">
                  <span className="mark-range above85">Above 85%:</span>
                  <span className="count">{stats.marksDistribution.above85} students</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Students List Table - uncomment if needed */}
          {/* <div className="students-table-container">
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
                    <td>{student.rollNumber || 'N/A'}</td>
                    <td>{student.branch || 'N/A'}</td>
                    <td>{student.section || 'N/A'}</td>
                    <td>{student.current_semester || 'N/A'}</td>
                    <td>{student.average_marks ? student.average_marks.toFixed(2) + '%' : 'N/A'}</td>
                    <td>{student.performance_type || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}
        </div>
      )}
    </div>
  );
};

export default HODDashboard; 