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
    // Clear all storage
    localStorage.clear();
    
    // Force a page reload to the login page
    console.log("Logging out from StudentDashboard");
    window.location.href = '/login';
  };

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        console.log('Starting fetchStudentData function');
        
        // Get the username from localStorage
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
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
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
        </Container>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <Navbar auth={{ isAuthenticated: true, role: 'student' }} logout={handleLogout} />
      <Container className="mt-4">
        <h1 className="dashboard-title">Student Dashboard</h1>
        
        {/* Debug information */}
        <Row className="mt-4">
          <Col>
            <Card className="debug-card">
              <Card.Header as="h5">Debug Information</Card.Header>
              <Card.Body>
                <p><strong>Username in localStorage:</strong> {localStorage.getItem('username')}</p>
                <p><strong>Student data received:</strong> {studentData ? 'Yes' : 'No'}</p>
                <pre>{studentData ? JSON.stringify(studentData, null, 2) : 'No data'}</pre>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {studentData && (
          <>
            <Row className="mt-4">
              <Col md={6}>
                <Card className="student-info-card">
                  <Card.Header as="h5">Student Information</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col sm={4}>Username:</Col>
                      <Col sm={8}><strong>{studentData.username}</strong></Col>
                    </Row>
                    <Row className="mt-2">
                      <Col sm={4}>Roll Number:</Col>
                      <Col sm={8}><strong>{studentData.rollNumber}</strong></Col>
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
                      <Col sm={4}>Branch:</Col>
                      <Col sm={8}><strong>{studentData.branch}</strong></Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={6}>
                <Card className="performance-card">
                  <Card.Header as="h5">Academic Performance</Card.Header>
                  <Card.Body>
                    <Row className="mt-2">
                      <Col sm={4}>Semester 1:</Col>
                      <Col sm={8}><strong>{studentData.sem1}</strong></Col>
                    </Row>
                    <Row className="mt-2">
                      <Col sm={4}>Semester 2:</Col>
                      <Col sm={8}><strong>{studentData.sem2}</strong></Col>
                    </Row>
                    <Row className="mt-2">
                      <Col sm={4}>Average Marks:</Col>
                      <Col sm={8}><strong>{studentData.avgMarks}</strong></Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
};

export default StudentDashboard; 