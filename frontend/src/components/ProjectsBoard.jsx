import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, Folder, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProjectsBoard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects`, newProject, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewProject({ name: '', description: '' });
      setShowForm(false);
      fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProjects();
    } catch (error) {
      console.error(error);
      alert('Failed to delete project');
    }
  };

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--border-radius-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Folder size={20} color="var(--accent-primary)" /> Projects
        </h3>
        {user?.role === 'ADMIN' && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreateProject} style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <div style={{ marginBottom: '12px' }}>
            <input 
              type="text" 
              placeholder="Project Name" 
              value={newProject.name}
              onChange={(e) => setNewProject({...newProject, name: e.target.value})}
              required
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <input 
              type="text" 
              placeholder="Description" 
              value={newProject.description}
              onChange={(e) => setNewProject({...newProject, description: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary">Save Project</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {projects.map(project => (
          <div key={project.id} style={{ 
            background: 'var(--bg-secondary)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid var(--border)',
            position: 'relative'
          }}>
            {user?.role === 'ADMIN' && (
              <button 
                onClick={() => handleDeleteProject(project.id)}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            )}
            <h4 style={{ fontSize: '18px', marginBottom: '8px' }}>{project.name}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>{project.description || 'No description'}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <span>Tasks: {project._count?.tasks || 0}</span>
              <span>Owner: {project.owner?.name}</span>
            </div>
          </div>
        ))}
        {projects.length === 0 && !showForm && (
          <p style={{ color: 'var(--text-secondary)' }}>No projects found. Create one to get started!</p>
        )}
      </div>
    </div>
  );
};

export default ProjectsBoard;
