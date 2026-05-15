import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'radial-gradient(circle at top left, rgba(99, 102, 241, 0.15), transparent 400px), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.15), transparent 400px)'
    }}>
      <div className="glass animate-fade-in" style={{ 
        width: '100%', 
        maxWidth: '420px', 
        padding: '40px',
        borderRadius: 'var(--border-radius-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Decorative glow */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          left: '-50px',
          width: '100px',
          height: '100px',
          background: 'var(--accent-primary)',
          filter: 'blur(60px)',
          opacity: 0.5,
          borderRadius: '50%'
        }}></div>

        <div style={{ textAlign: 'center', marginBottom: '32px', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            {isLogin ? 'Welcome back to The Workshop' : 'Join us and start building together'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: 'rgba(239, 68, 68, 0.1)', 
            color: 'var(--danger)', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '20px',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ position: 'relative', zIndex: 1 }}>
          {!isLogin && (
            <div style={{ marginBottom: '16px', position: 'relative' }}>
              <User style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} size={20} />
              <input 
                type="text" 
                placeholder="Full Name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ paddingLeft: '48px' }}
                required={!isLogin}
              />
            </div>
          )}
          
          <div style={{ marginBottom: '16px', position: 'relative' }}>
            <Mail style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} size={20} />
            <input 
              type="email" 
              placeholder="Email Address" 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ paddingLeft: '48px' }}
              required
            />
          </div>

          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <Lock style={{ position: 'absolute', top: '14px', left: '16px', color: 'var(--text-secondary)' }} size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ paddingLeft: '48px' }}
              required
            />
          </div>

          <button className="btn-primary" type="submit" style={{ 
            width: '100%', 
            padding: '14px',
            fontSize: '16px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}>
            {isLogin ? 'Sign In' : 'Sign Up'} <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center', 
          color: 'var(--text-secondary)',
          position: 'relative', 
          zIndex: 1 
        }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span 
            onClick={() => setIsLogin(!isLogin)}
            style={{ 
              color: 'var(--accent-primary)', 
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
