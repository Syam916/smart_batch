import React from 'react';
import { FaUser } from 'react-icons/fa';
import './StudentDashboard.css';

const StudentDashboard = ({ token }) => {
  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h2><FaUser /> Student Dashboard</h2>
      </div>
      <div className="dashboard-content">
        <p>Welcome to the Student Dashboard. This is a placeholder component.</p>
        <p>Your token: {token}</p>
      </div>
    </div>
  );
};

export default StudentDashboard; 