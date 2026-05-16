import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Users, Mail, Clock, Plus, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MembersBoard = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'MEMBER' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, newMember, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMember({ name: '', email: '', password: '', role: 'MEMBER' });
      setShowForm(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to add member', error);
      alert(error.response?.data?.message || 'Failed to add member');
    }
  };

  const handleDeleteMember = async (id) => {
    if (!window.confirm('Are you sure you want to delete this member? All their tasks and projects will be deleted.')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete member', error);
    }
  };

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--border-radius-lg)', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={20} color="var(--accent-primary)" /> Team Members
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {users.length} Total Members
          </span>
          {user?.role === 'ADMIN' && (
            <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
              <Plus size={16} /> Add Member
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleAddMember} style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              required
            />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              required
            />
            <input 
              type="password" 
              placeholder="Temporary Password" 
              value={newMember.password}
              onChange={(e) => setNewMember({...newMember, password: e.target.value})}
              required
            />
            <select 
              value={newMember.role} 
              onChange={(e) => setNewMember({...newMember, role: e.target.value})}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Save Member</button>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {users.map(member => (
          <div key={member.id} style={{ 
            background: 'var(--bg-secondary)', 
            padding: '20px', 
            borderRadius: '12px',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            position: 'relative'
          }}>
            <div style={{ 
              width: '48px', height: '48px', 
              borderRadius: '50%', 
              background: 'var(--accent-gradient)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '18px', color: 'white'
            }}>
              {member.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {member.name} {user?.id === member.id && '(You)'}
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Mail size={12} /> {member.email}
              </p>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '2px 8px', 
                  background: member.role === 'ADMIN' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(99, 102, 241, 0.1)', 
                  color: member.role === 'ADMIN' ? 'var(--danger)' : 'var(--accent-primary)',
                  borderRadius: '12px',
                  fontWeight: 600
                }}>
                  {member.role}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={10} /> Joined {new Date(member.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            {user?.role === 'ADMIN' && user?.id !== member.id && (
              <button 
                onClick={() => handleDeleteMember(member.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  opacity: 0.7,
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                onMouseOut={(e) => e.currentTarget.style.opacity = 0.7}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
        {users.length === 0 && (
          <p style={{ color: 'var(--text-secondary)' }}>Loading team members...</p>
        )}
      </div>
    </div>
  );
};

export default MembersBoard;
