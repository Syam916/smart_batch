import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Navbar from './components/Navbar';
import LoginPage from './components/LoginPage';
import HODDashboard from './components/HODDashboard';
import StudentDashboard from './components/StudentDashboard';
import AddStudentForm from './components/AddStudentForm';
import ViewClusters from './components/ViewClusters';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

// Configure axios to include credentials
axios.defaults.withCredentials = true;

function App() {
  const [auth, setAuth] = useState({
    isAuthenticated: false,
    userId: null,
    role: null
  });

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    if (userId && role) {
      setAuth({
        isAuthenticated: true,
        userId,
        role
      });
    }
  }, []);

  const login = (userId, role) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('role', role);
    setAuth({
      isAuthenticated: true,
      userId,
      role
    });
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    localStorage.removeItem('userId');
    localStorage.removeItem('role');
    setAuth({
      isAuthenticated: false,
      userId: null,
      role: null
    });
  };

  return (
    <div className="app">
      <ToastContainer />
      <Navbar auth={auth} logout={logout} />
      <div className="container">
        <Routes>
          <Route exact path="/" element={
            auth.isAuthenticated ? (
              auth.role === 'hod' ? (
                <Navigate to="/hod-dashboard" replace />
              ) : (
                <Navigate to="/student-dashboard" replace />
              )
            ) : (
              <LoginPage login={login} />
            )
          } />
          
          <Route path="/login" element={
            auth.isAuthenticated ? <Navigate to="/" replace /> : <LoginPage login={login} />
          } />
          
          <Route path="/hod-dashboard" element={
            auth.isAuthenticated && auth.role === 'hod' ? (
              <HODDashboard token={auth.userId} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          <Route path="/student-dashboard" element={
            auth.isAuthenticated && auth.role === 'student' ? (
              <StudentDashboard token={auth.userId} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          <Route path="/add-student" element={
            auth.isAuthenticated && auth.role === 'hod' ? (
              <AddStudentForm token={auth.userId} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          <Route path="/edit-student/:id" element={
            auth.isAuthenticated && auth.role === 'hod' ? (
              <AddStudentForm token={auth.userId} isEdit={true} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          
          <Route path="/view-clusters" element={
            auth.isAuthenticated && auth.role === 'hod' ? (
              <ViewClusters token={auth.userId} />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
        </Routes>
      </div>
    </div>
  );
}

export default App; 