import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaUserPlus, FaUserEdit } from 'react-icons/fa';
import './AddStudentForm.css';

const AddStudentForm = ({ token, isEdit }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  return (
    <div className="add-student-form-container">
      <div className="form-header">
        <h2>
          {isEdit ? (
            <><FaUserEdit /> Edit Student</>
          ) : (
            <><FaUserPlus /> Add New Student</>
          )}
        </h2>
      </div>
      
      <div className="form-content">
        <p>This is a placeholder for the {isEdit ? 'edit' : 'add'} student form.</p>
        {isEdit && <p>Student ID: {id}</p>}
        <p>Your token: {token}</p>
        <button onClick={() => navigate('/hod-dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );
};

export default AddStudentForm; 