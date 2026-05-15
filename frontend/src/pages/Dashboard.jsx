import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, LayoutDashboard, FolderKanban, CheckSquare, Clock, Sun, Moon } from 'lucide-react';
import axios from 'axios';
import ProjectsBoard from '../components/ProjectsBoard';
import TasksBoard from '../components/TasksBoard';
import MembersBoard from '../components/MembersBoard';
import ActivityFeed from '../components/ActivityFeed';
import { SocketContext } from '../context/SocketContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [metrics, setMetrics] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/dashboard/metrics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMetrics(res.data);
    } catch (err) {
      console.error('Failed to fetch metrics');
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    fetchMetrics();
  }, [theme]);

  useEffect(() => {
    if (socket) {
      socket.on('task_updated', fetchMetrics);
      socket.on('project_updated', fetchMetrics);
      return () => {
        socket.off('task_updated');
        socket.off('project_updated');
      };
    }
  }, [socket]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const MetricCard = ({ title, value, icon: Icon, color }) => (
    <div className="glass animate-fade-in" style={{ 
      padding: '24px', 
      borderRadius: 'var(--border-radius)',
      display: 'flex',
      alignItems: 'center',
      gap: '20px'
    }}>
      <div style={{ 
        background: `rgba(${color}, 0.1)`, 
        color: `rgb(${color})`,
        padding: '16px', 
        borderRadius: '12px' 
      }}>
        <Icon size={28} />
      </div>
      <div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '4px' }}>{title}</p>
        <h3 style={{ fontSize: '28px', color: 'var(--text-primary)' }}>{value !== undefined ? value : '-'}</h3>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      
      {/* Sidebar */}
      <div className="glass" style={{ 
        width: 'var(--sidebar-width)', 
        borderRight: '1px solid var(--border)',
        borderLeft: 'none', borderTop: 'none', borderBottom: 'none',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 10
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
            <LayoutDashboard /> The Workshop
          </h2>
        </div>
        
        <div style={{ padding: '24px', flex: 1 }}>
          <div style={{ marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
            Menu
          </div>
          <div style={{ 
            padding: '12px 16px', 
            background: 'var(--bg-hover)', 
            borderRadius: '8px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px',
            color: 'var(--text-primary)',
            cursor: 'pointer'
          }}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          {/* Add more sidebar links here later */}
        </div>

        <div style={{ padding: '24px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', 
                borderRadius: '50%', 
                background: 'var(--accent-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 'bold'
              }}>
                {user?.name?.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: 500, fontSize: '14px' }}>{user?.name}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{user?.role}</p>
              </div>
            </div>
            <button 
              onClick={toggleTheme}
              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          <button className="btn-secondary" onClick={logout} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, marginLeft: 'var(--sidebar-width)' }}>
        
        {/* Top Header */}
        <header className="glass" style={{ 
          height: 'var(--header-height)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 32px',
          borderTop: 'none', borderRight: 'none', borderLeft: 'none',
          position: 'sticky', top: 0, zIndex: 5
        }}>
          <div>
            <h1 style={{ fontSize: '20px' }}>Overview</h1>
          </div>
        </header>

        {/* Dashboard Content */}
        <div style={{ padding: '32px' }}>
          
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Welcome back, {user?.name?.split(' ')[0]}! 👋</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Here's what's happening with your projects today.</p>
          </div>

          {/* Metrics Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
            gap: '24px',
            marginBottom: '40px'
          }}>
            <MetricCard 
              title="Total Projects" 
              value={metrics?.projects} 
              icon={FolderKanban} 
              color="99, 102, 241" 
            />
            <MetricCard 
              title="Tasks Assigned" 
              value={metrics?.tasks?.total} 
              icon={CheckSquare} 
              color="16, 185, 129" 
            />
            <MetricCard 
              title="Overdue Tasks" 
              value={metrics?.tasks?.overdue} 
              icon={Clock} 
              color="239, 68, 68" 
            />
            <MetricCard 
              title="Completed Tasks" 
              value={metrics?.tasks?.done} 
              icon={CheckSquare} 
              color="59, 130, 246" 
            />
          </div>
          {/* Main Layout Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <ProjectsBoard />
              <TasksBoard />
              <MembersBoard />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '0' }}>
              <ActivityFeed />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default Dashboard;
