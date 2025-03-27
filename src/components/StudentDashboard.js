import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Table, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    // Check for token immediately when component mounts
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No authentication token found. Please login again.');
      setLoading(false);
      return;
    }

    const fetchStudentData = async () => {
      try {
        // Make sure to include the Bearer prefix if your API expects it
        const response = await axios.get('/api/student/details', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.data) {
          setStudentData(response.data);
          setLoading(false);
        } else {
          throw new Error('No data received from server');
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        
        // If error is unauthorized (401), redirect to login
        if (err.response && err.response.status === 401) {
          localStorage.removeItem('token'); // Clear invalid token
          navigate('/login');
          return;
        }
        
        setError(err.response?.data?.message || 'Failed to load student data');
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="student-dashboard">
        <Navbar auth={{ isAuthenticated: true, role: 'student' }} logout={handleLogout} />
        <Container className="mt-5 text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <Navbar auth={{ isAuthenticated: true, role: 'student' }} logout={handleLogout} />
        <Container className="mt-5">
          <Alert variant="danger">{error}</Alert>
          <div className="text-center mt-3">
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/login')}
            >
              Go to Login
            </button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <Navbar auth={{ isAuthenticated: true, role: 'student' }} logout={handleLogout} />
      <Container className="mt-4">
        <h1 className="dashboard-title">Student Dashboard</h1>
        
        <Row className="mt-4">
          <Col md={6}>
            <Card className="student-info-card">
              <Card.Header as="h5">Student Information</Card.Header>
              <Card.Body>
                <Row>
                  <Col sm={4}>Name:</Col>
                  <Col sm={8}><strong>{studentData.name}</strong></Col>
                </Row>
                <Row className="mt-2">
                  <Col sm={4}>Roll Number:</Col>
                  <Col sm={8}><strong>{studentData.roll_number}</strong></Col>
                </Row>
                <Row className="mt-2">
                  <Col sm={4}>Branch:</Col>
                  <Col sm={8}><strong>{studentData.branch}</strong></Col>
                </Row>
                <Row className="mt-2">
                  <Col sm={4}>Year:</Col>
                  <Col sm={8}><strong>{studentData.year}</strong></Col>
                </Row>
                <Row className="mt-2">
                  <Col sm={4}>Section:</Col>
                  <Col sm={8}><strong>{studentData.section}</strong></Col>
                </Row>
                <Row className="mt-2">
                  <Col sm={4}>Cluster:</Col>
                  <Col sm={8}><strong>{studentData.cluster || 'Not assigned'}</strong></Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          
          <Col md={6}>
            <Card className="performance-card">
              <Card.Header as="h5">Performance Overview</Card.Header>
              <Card.Body>
                {/* You could add summary charts here */}
                <div className="text-center">
                  {/* Placeholder for a chart */}
                  <p>Performance summary chart will appear here</p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <Row className="mt-4">
          <Col>
            <Card className="marks-card">
              <Card.Header as="h5">Academic Performance</Card.Header>
              <Card.Body>
                {studentData.marks && studentData.marks.length > 0 ? (
                  <Table striped bordered hover responsive>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Exam Type</th>
                        <th>Marks</th>
                        <th>Maximum</th>
                        <th>Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentData.marks.map((mark, index) => (
                        <tr key={index}>
                          <td>{mark.subject_name}</td>
                          <td>{mark.exam_type}</td>
                          <td>{mark.marks}</td>
                          <td>{mark.max_marks}</td>
                          <td>
                            {((mark.marks / mark.max_marks) * 100).toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="info">No marks data available yet.</Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default StudentDashboard; 