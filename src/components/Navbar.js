import React from 'react';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaSignOutAlt, FaUser, FaUserPlus, FaUsers } from 'react-icons/fa';
import './Navbar.css';

const Navbar = ({ auth, logout }) => {
  const { isAuthenticated, role } = auth;

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <FaGraduationCap className="logo-icon" />
        <span>Smart Batch</span>
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
            <button className="logout-btn" onClick={logout}>
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