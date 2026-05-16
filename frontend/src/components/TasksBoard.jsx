import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus, CheckCircle, Clock, MessageSquare, X, Send, Trash2, AlertCircle } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { createPortal } from 'react-dom';
import { SocketContext } from '../context/SocketContext';
import { AuthContext } from '../context/AuthContext';

const priorityColors = {
  HIGH: 'var(--danger)',
  MEDIUM: 'var(--warning)',
  LOW: 'var(--success)'
};

const TasksBoard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', projectId: '', assigneeId: '', status: 'TODO', description: '', dueDate: '', priority: 'MEDIUM' });
  const [showForm, setShowForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('task_updated', fetchTasks);
      socket.on('comment_added', (data) => {
        if (selectedTask && data.taskId === selectedTask.id) {
          fetchComments(selectedTask.id);
        }
      });
      return () => {
        socket.off('task_updated');
        socket.off('comment_added');
      };
    }
  }, [socket, selectedTask]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (error) {
      console.error(error);
    }
  };

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

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/comments/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComments(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks`, newTask, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewTask({ title: '', projectId: '', assigneeId: '', status: 'TODO', description: '', dueDate: '', priority: 'MEDIUM' });
      setShowForm(false);
      fetchTasks();
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/comments`, {
        text: newComment,
        taskId: selectedTask.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewComment('');
      fetchComments(selectedTask.id);
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedTask(null);
      fetchTasks();
    } catch (error) {
      console.error(error);
      alert('Failed to delete task');
    }
  };

  const updateTaskStatus = async (id, status) => {
    // Optimistic Update
    const originalTasks = [...tasks];
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));

    try {
      const token = localStorage.getItem('token');
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/tasks/${id}`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Data is already updated optimistically, but fetchTasks will confirm it
      fetchTasks();
    } catch (error) {
      console.error(error);
      // Revert on error
      setTasks(originalTasks);
      alert('Failed to update task status');
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const { source, destination, draggableId } = result;
    if (source.droppableId !== destination.droppableId) {
      updateTaskStatus(draggableId, destination.droppableId);
    }
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    fetchComments(task.id);
  };

  const columns = {
    'TODO': { name: 'To Do', items: tasks.filter(t => t.status === 'TODO') },
    'IN_PROGRESS': { name: 'In Progress', items: tasks.filter(t => t.status === 'IN_PROGRESS') },
    'DONE': { name: 'Done', items: tasks.filter(t => t.status === 'DONE') }
  };

  return (
    <div className="glass" style={{ padding: '24px', borderRadius: 'var(--border-radius-lg)', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={20} color="var(--success)" /> Task Board
        </h3>
        {user?.role === 'ADMIN' && (
          <button className="btn-primary" onClick={() => setShowForm(!showForm)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}>
            <Plus size={16} /> New Task
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleCreateTask} style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
          <div style={{ marginBottom: '12px' }}>
            <input 
              type="text" 
              placeholder="Task Title" 
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              required
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <textarea 
              placeholder="Task Description (Optional)" 
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
              rows="2"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <select 
              value={newTask.projectId} 
              onChange={(e) => setNewTask({...newTask, projectId: e.target.value})}
              required
            >
              <option value="" disabled>Select Project</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select 
              value={newTask.assigneeId} 
              onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
            >
              <option value="">Unassigned (Select Member)</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <select 
              value={newTask.priority} 
              onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
            >
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
            <input 
              type="date" 
              value={newTask.dueDate}
              onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
            />
          </div>
          <button type="submit" className="btn-primary">Save Task</button>
        </form>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          {Object.entries(columns).map(([columnId, column]) => (
            <div key={columnId} style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', flex: 1, minWidth: 0 }}>
              <h4 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                {column.name}
                <span style={{ background: 'var(--bg-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px' }}>
                  {column.items.length}
                </span>
              </h4>
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    style={{ 
                      minHeight: '400px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '12px',
                      background: snapshot.isDraggingOver ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                      borderRadius: '8px',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {column.items.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => {
                          const child = (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => !snapshot.isDragging && openTaskDetails(task)}
                              style={{
                                background: 'var(--bg-primary)',
                                padding: '16px',
                                borderRadius: '8px',
                                border: '1px solid var(--border)',
                                boxShadow: snapshot.isDragging ? 'var(--shadow-glow)' : 'none',
                                cursor: 'grab',
                                userSelect: 'none',
                                opacity: snapshot.isDragging ? 0.9 : 1,
                                transition: snapshot.isDragging ? 'none' : 'all 0.2s ease',
                                ...provided.draggableProps.style
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ fontSize: '10px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: priorityColors[task.priority] }}>
                                  {task.priority}
                                </span>
                              </div>
                              <h5 style={{ fontSize: '14px', margin: '0 0 8px 0', color: 'var(--text-primary)' }}>
                                {task.title}
                              </h5>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--accent-primary)' }}>{task.project?.name}</span>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                  <MessageSquare size={12} />
                                  {task.assignee && (
                                    <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold' }}>
                                      {task.assignee.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );

                          if (snapshot.isDragging) {
                            return createPortal(child, document.body);
                          }
                          return child;
                        }}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Task Details & Comments Modal */}
      {selectedTask && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="glass" style={{ width: '600px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', borderRadius: '20px', padding: '32px', position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '12px', fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', color: priorityColors[selectedTask.priority], display: 'inline-block' }}>
                {selectedTask.priority} Priority
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {user?.role === 'ADMIN' && (
                  <button 
                    onClick={() => handleDeleteTask(selectedTask.id)}
                    style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer', border: 'none' }}
                  >
                    <Trash2 size={14} /> Delete Task
                  </button>
                )}
                <button 
                  onClick={() => setSelectedTask(null)}
                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>{selectedTask.title}</h2>
            <p style={{ color: 'var(--accent-primary)', fontSize: '14px', marginBottom: '24px' }}>{selectedTask.project?.name}</p>
            
            <div style={{ marginBottom: '32px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} /> Description
              </h4>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {selectedTask.description || 'No description provided.'}
              </p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
              <h4 style={{ fontSize: '16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={18} /> Comments
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                {comments.map(comment => (
                  <div key={comment.id} style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-gradient)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', color: 'white' }}>
                      {comment.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ background: 'var(--bg-secondary)', padding: '12px 16px', borderRadius: '12px', flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '13px' }}>{comment.user.name}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{new Date(comment.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{comment.text}</p>
                    </div>
                  </div>
                ))}
                {comments.length === 0 && <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>No comments yet.</p>}
              </div>

              <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  placeholder="Write a comment..." 
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit" className="btn-primary" style={{ padding: '12px' }}>
                  <Send size={18} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksBoard;
