import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaGraduationCap, FaChartLine, FaBook } from 'react-icons/fa';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Navbar from './Navbar';
import './StudentDashboard.css';

// Register Chart.js components
ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.clear();
    console.log("Logging out from StudentDashboard");
    window.location.href = '/login';
  };

  // Define chart data
  const semesterProgressData = {
    labels: ['Semester 1', 'Semester 2'],
    datasets: [
      {
        label: 'Semester Progress',
        data: studentData ? [studentData.sem1, studentData.sem2] : [0, 0],
        fill: false,
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      },
    ],
  };

  const performanceData = {
    labels: ['Performance', 'Remaining'],
    datasets: [
      {
        data: studentData ? [studentData.avgMarks, 100 - studentData.avgMarks] : [0, 100],
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(211, 211, 211, 0.3)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(211, 211, 211, 0)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        console.log('Starting fetchStudentData function');
        
        const username = localStorage.getItem('username');
        console.log('Username from localStorage:', username);
        
        if (!username) {
          setError('No username found. Please log in again.');
          setLoading(false);
          return;
        }
        
        console.log(`Making API call to: /api/student/data/${username}`);
        
        const response = await axios.get(`/api/student/data/${username}`);
        
        console.log('API response received:', response);
        
        if (response.data) {
          console.log('Student data retrieved successfully:', response.data);
          setStudentData(response.data);
          setLoading(false);
        } else {
          console.log('Response indicated failure:', response.data);
          setError('Failed to load student data');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error in fetchStudentData:', err);
        
        let errorMessage = 'Failed to load student data';
        
        if (err.response && err.response.status === 404) {
          errorMessage = `Student with username "${localStorage.getItem('username')}" not found. Please ensure this student exists in the database.`;
        } else if (err.response) {
          errorMessage = `Server error: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`;
        } else if (err.request) {
          errorMessage = 'No response from server. Please check if the backend is running.';
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="student-dashboard">
        <Navbar auth={{ isAuthenticated: true, role: 'student' }} logout={handleLogout} />
        <Container className="loading-container">
          <div className="loader"></div>
          <h3>Loading your data...</h3>
          <p>Please wait while we fetch your academic information</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <Navbar auth={{ isAuthenticated: true, role: 'student' }} logout={handleLogout} />
        <Container className="mt-5">
          <motion.div 
            className="error-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaUser size={40} className="error-icon" />
            <h3>Error Loading Data</h3>
            <p>{error}</p>
            <button 
              className="retry-button"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </motion.div>
        </Container>
      </div>
    );
  }

  // Function to determine performance status
  const getPerformanceStatus = (marks) => {
    if (marks >= 85) return { status: 'Excellent', class: 'excellent-performance' };
    if (marks >= 70) return { status: 'Good', class: 'good-performance' };
    if (marks >= 50) return { status: 'Average', class: 'average-performance' };
    return { status: 'Needs Improvement', class: 'poor-performance' };
  };

  const performance = getPerformanceStatus(studentData.avgMarks);

  return (
    <div className="student-dashboard">
      <Navbar auth={{ isAuthenticated: true, role: 'student' }} logout={handleLogout} />
      
      <Container fluid className="dashboard-container">
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeInVariants}
          className="dashboard-header"
        >
          <h1 className="dashboard-title">Student Academic Dashboard</h1>
          <p className="dashboard-subtitle">Track your academic progress and performance</p>
        </motion.div>
        
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Student Profile Section */}
          <motion.div variants={fadeInVariants} className="profile-section">
            <Row>
              <Col lg={12}>
                <Card className="student-profile-card">
                  <Card.Body>
                    <Row>
                      <Col md={3} className="profile-avatar-container">
                        <div className="profile-avatar">
                          <FaUser className="avatar-icon" />
                        </div>
                      </Col>
                      <Col md={9}>
                        <h2 className="student-name">{studentData.username}</h2>
                        <div className="student-meta">
                          <div className="meta-item">
                            <span className="meta-icon"><FaGraduationCap /></span>
                            <span className="meta-label">Roll Number:</span>
                            <span className="meta-value">{studentData.rollNumber}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-icon"><FaBook /></span>
                            <span className="meta-label">Branch:</span>
                            <span className="meta-value">{studentData.branch}</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-icon"><FaChartLine /></span>
                            <span className="meta-label">Performance:</span>
                            <span className={`meta-value ${performance.class}`}>
                              {performance.status}
                            </span>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </motion.div>

          {/* Academic Details Section */}
          <motion.div variants={fadeInVariants} className="dashboard-content">
            <Row>
              <Col lg={6} md={12}>
                <Card className="stats-card">
                  <Card.Header>
                    <h3><FaGraduationCap /> Academic Information</h3>
                  </Card.Header>
                  <Card.Body>
                    <table className="info-table">
                      <tbody>
                        <tr>
                          <td>Year</td>
                          <td>{studentData.year}</td>
                        </tr>
                        <tr>
                          <td>Section</td>
                          <td>{studentData.section}</td>
                        </tr>
                        <tr>
                          <td>Branch</td>
                          <td>{studentData.branch}</td>
                        </tr>
                        <tr>
                          <td>Semester 1</td>
                          <td className={getPerformanceStatus(studentData.sem1).class}>
                            {studentData.sem1}%
                          </td>
                        </tr>
                        <tr>
                          <td>Semester 2</td>
                          <td className={getPerformanceStatus(studentData.sem2).class}>
                            {studentData.sem2}%
                          </td>
                        </tr>
                        <tr className="highlight-row">
                          <td>Average Marks</td>
                          <td className={performance.class}>{studentData.avgMarks}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </Card.Body>
                </Card>
              </Col>

              {/* Charts Section */}
              <Col lg={6} md={12}>
                <Row>
                  <Col md={12}>
                    <Card className="stats-card chart-card">
                      <Card.Header>
                        <h3><FaChartLine /> Performance Overview</h3>
                      </Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6} className="chart-container">
                            <h4 className="chart-title">Semester Progress</h4>
                            <div className="chart-wrapper">
                              <Line 
                                data={semesterProgressData} 
                                options={{
                                  responsive: true,
                                  plugins: {
                                    legend: {
                                      display: false
                                    }
                                  },
                                  scales: {
                                    y: {
                                      beginAtZero: true,
                                      max: 100
                                    }
                                  }
                                }}
                              />
                            </div>
                          </Col>
                          <Col md={6} className="chart-container">
                            <h4 className="chart-title">Overall Performance</h4>
                            <div className="chart-wrapper">
                              <Doughnut 
                                data={performanceData}
                                options={{
                                  responsive: true,
                                  plugins: {
                                    legend: {
                                      display: false
                                    },
                                    tooltip: {
                                      callbacks: {
                                        label: function(context) {
                                          return context.dataIndex === 0 ? 
                                            `Performance: ${context.raw}%` : '';
                                        }
                                      }
                                    }
                                  },
                                  cutout: '70%'
                                }}
                              />
                              <div className="doughnut-center">
                                <div className={`center-value ${performance.class}`}>
                                  {studentData.avgMarks}%
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>
            </Row>
          </motion.div>

          {/* Performance Insights Section */}
          <motion.div variants={fadeInVariants} className="insights-section">
            <Card className="insights-card">
              <Card.Header>
                <h3><FaChartLine /> Performance Insights</h3>
              </Card.Header>
              <Card.Body>
                <div className="insight-container">
                  <h4>Your Academic Standing</h4>
                  <p>Based on your current average of <strong>{studentData.avgMarks}%</strong>, your performance is <strong className={performance.class}>{performance.status}</strong>.</p>
                  
                  {studentData.avgMarks >= 85 ? (
                    <p>Excellent work! You're among the top performers. Keep up the great work!</p>
                  ) : studentData.avgMarks >= 70 ? (
                    <p>You're doing well! With some focused effort, you could reach the excellent category.</p>
                  ) : studentData.avgMarks >= 50 ? (
                    <p>You're on the right track, but there's room for improvement. Consider seeking additional support in your courses.</p>
                  ) : (
                    <p>Your current performance needs attention. We recommend meeting with academic advisors to develop an improvement plan.</p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
};

export default StudentDashboard; 