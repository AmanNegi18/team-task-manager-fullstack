import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Activity } from 'lucide-react';
import { SocketContext } from '../context/SocketContext';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    fetchActivities();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('activity_added', fetchActivities);
      return () => socket.off('activity_added');
    }
  }, [socket]);

  const fetchActivities = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActivities(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--border-radius-lg)' }}>
      <h3 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Activity size={18} color="var(--accent-primary)" /> Activity Feed
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
        {activities.map((act) => (
          <div key={act.id} style={{ 
            fontSize: '13px', 
            padding: '12px', 
            background: 'var(--bg-secondary)', 
            borderRadius: '8px',
            borderLeft: '3px solid var(--accent-primary)'
          }}>
            <p style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>
              {act.description}
            </p>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              {new Date(act.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
        {activities.length === 0 && (
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>No recent activity.</p>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
