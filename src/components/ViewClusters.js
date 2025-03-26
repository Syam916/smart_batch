import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FaUsers, FaFilter, FaFileExport, FaUserFriends } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ViewClusters.css';

const ViewClusters = ({ token }) => {
  const [clusters, setClusters] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});
  const [expandedTeams, setExpandedTeams] = useState({});
  const [filters, setFilters] = useState({
    branch: '',
    year: '',
    section: '',
    semester: ''
  });
  const [formData, setFormData] = useState({
    branch: 'CSE',
    year: '1st',
    section: 'A',
    semester: '1'
  });
  const [loading, setLoading] = useState(true);
  const [createTeamLoading, setCreateTeamLoading] = useState(false);
  const navigate = useNavigate();

  const branches = ['CSE', 'IT', 'ECE', 'EEE', 'MECH'];
  const years = ['1st', '2nd', '3rd', '4th'];
  const sections = ['A', 'B', 'C', 'D'];
  const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

  useEffect(() => {
    fetchClusters();
  }, [filters]);

  const fetchClusters = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.branch) queryParams.append('branch', filters.branch);
      if (filters.year) queryParams.append('year', filters.year);
      if (filters.section) queryParams.append('section', filters.section);
      if (filters.semester) queryParams.append('semester', filters.semester);
      
      const response = await axios.get(`http://localhost:5000/api/hod/clusters?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setClusters(response.data);
    } catch (error) {
      toast.error('Error fetching clusters');
      console.error('Error fetching clusters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCreateTeams = async (e) => {
    e.preventDefault();
    setCreateTeamLoading(true);
    
    try {
      await axios.post('http://localhost:5000/api/hod/create-teams', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      toast.success('Teams created successfully');
      fetchClusters();
    } catch (error) {
      toast.error('Error creating teams');
      console.error('Error creating teams:', error);
    } finally {
      setCreateTeamLoading(false);
    }
  };

  const fetchTeamMembers = async (clusterId, teamId) => {
    try {
      const teamKey = `${clusterId}_${teamId}`;
      
      // Check if we already have this team's data
      if (teamMembers[teamKey]) {
        return;
      }
      
      const response = await axios.get(`http://localhost:5000/api/hod/team-members?cluster_id=${clusterId}&team_id=${teamId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setTeamMembers({
        ...teamMembers,
        [teamKey]: response.data
      });
    } catch (error) {
      toast.error('Error fetching team members');
      console.error('Error fetching team members:', error);
    }
  };

  const toggleTeamExpand = (clusterId, teamId) => {
    const teamKey = `${clusterId}_${teamId}`;
    
    setExpandedTeams({
      ...expandedTeams,
      [teamKey]: !expandedTeams[teamKey]
    });
    
    if (!expandedTeams[teamKey]) {
      fetchTeamMembers(clusterId, teamId);
    }
  };

  const exportTeamsToCSV = (cluster) => {
    // Convert teams to CSV format
    const headers = ['Team ID', 'Member Name', 'Roll No', 'Performance Type', 'Average Marks'];
    const rows = [];
    
    cluster.teams.forEach((team, teamIndex) => {
      const teamKey = `${cluster._id}_${teamIndex}`;
      const members = teamMembers[teamKey] || [];
      
      members.forEach(member => {
        rows.push([
          `Team ${teamIndex + 1}`,
          member.name,
          member.roll_no,
          member.performance_type,
          member.average_marks.toFixed(2)
        ]);
      });
    });
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download CSV file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `teams_${cluster.branch}_${cluster.year}_${cluster.section}_sem${cluster.semester}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="view-clusters">
      <div className="clusters-header">
        <h2><FaUsers /> Student Teams</h2>
      </div>
      
      <div className="clusters-content">
        <p>This is a placeholder for the view clusters component.</p>
        <p>Your token: {token}</p>
        <button onClick={() => navigate('/hod-dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default ViewClusters; 