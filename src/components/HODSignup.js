import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserPlus, FaUniversity, FaEnvelope, FaLock, FaCode } from 'react-icons/fa';
import './HODSignup.css';

const HODSignup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    branch: 'cse',
    role: 'hod'
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.post('http://localhost:5000/api/hod/signup', formData);
      toast.success('Signup successful! Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Signup failed');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hod-signup-container">
      <div className="signup-form-container">
        <div className="signup-header">
          <h2>
            <FaUserPlus className="icon" /> HOD Signup
          </h2>
          <p>Create your HOD account</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>
              <FaUniversity className="icon" /> Username
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
              <FaEnvelope className="icon" /> Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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
            <label>
              <FaCode className="icon" /> Branch
            </label>
            <select
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              required
            >
              <option value="cse">CSE</option>
              <option value="ece">ECE</option>
              <option value="mech">MECH</option>
              <option value="civil">CIVIL</option>
              <option value="eee">EEE</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>
      </div>

      <div className="info-section">
        <h2>Smart Student Team Clustering</h2>
        <p className="welcome-text">
          Welcome to the Smart Student Team Clustering System. This platform helps HODs create balanced student teams based on academic performance for effective collaborative learning.
        </p>

        <div className="features-section">
          <h3>HOD Features</h3>
          <ul>
            <li>Manage student data</li>
            <li>Create balanced teams</li>
            <li>View student performance</li>
            <li>Export team data</li>
          </ul>
        </div>

        <div className="features-section">
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

export default HODSignup; 