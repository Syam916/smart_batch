import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaSignInAlt } from 'react-icons/fa';
import axios from 'axios';
import './LoginPage.css';

const LoginPage = ({ login }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'hod' // Default to HOD
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username: formData.username,
        password: formData.password
      }, {
        withCredentials: true // Important for cookies/sessions
      });
      
      const { user_id, username, role } = response.data;
      
      // Store username in localStorage for student dashboard to use
      localStorage.setItem('username', username);
      
      login(user_id, role);
      toast.success('Login successful!');
    } catch (error) {
      toast.error('Invalid credentials. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form-container">
        <div className="login-header">
          <h2>
            <FaSignInAlt className="icon" /> Login
          </h2>
          <p>Access Smart Student Team Clustering System</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>
              <FaUser className="icon" /> Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Enter your username"
            />
          </div>

          <div className="input-group">
            <label>
              <FaLock className="icon" /> Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <div className="input-group">
            <label>Login As</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="role"
                  value="hod"
                  checked={formData.role === 'hod'}
                  onChange={handleChange}
                />
                HOD
              </label>
              <label>
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                />
                Student
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      <div className="login-info">
        <h2>Smart Student Team Clustering</h2>
        <p>
          Welcome to the Smart Student Team Clustering System. This platform helps HODs create
          balanced student teams based on academic performance for effective collaborative learning.
        </p>
        <div className="info-card">
          <h3>HOD Features</h3>
          <ul>
            <li>Manage student data</li>
            <li>Create balanced teams</li>
            <li>View student performance</li>
            <li>Export team data</li>
          </ul>
        </div>
        <div className="info-card">
          <h3>Student Features</h3>
          <ul>
            <li>View personal profile</li>
            <li>Check assigned team</li>
            <li>Track academic performance</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 