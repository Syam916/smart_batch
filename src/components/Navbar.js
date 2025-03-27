import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaGraduationCap, FaSignOutAlt, FaUser, FaUserPlus, FaUsers } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ auth = {}, logout }) => {
  const { isAuthenticated, role } = auth;
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // IMPORTANT: First clear all localStorage items
    localStorage.clear();
    
    // Check if custom logout function was provided and use it
    if (typeof logout === 'function') {
      logout();
    } else {
      // Otherwise use the default redirect
      console.log("Redirecting to login page...");
      window.location.href = '/login'; // Force page reload for clean logout
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <FaGraduationCap className="logo-icon" />
        <span>Gradify</span>
      </div>
      <div className="navbar-links">
        {isAuthenticated ? (
          <>
            {role === 'hod' ? (
              <>
                <Link to="/hod-dashboard">
                  <FaUser /> Dashboard
                </Link>
                <Link to="/add-student">
                  <FaUserPlus /> Add Student
                </Link>
                <Link to="/view-clusters">
                  <FaUsers /> View Teams
                </Link>
              </>
            ) : (
              <Link to="/student-dashboard">
                <FaUser /> Dashboard
              </Link>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 