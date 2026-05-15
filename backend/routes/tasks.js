const express = require('express');
const prisma = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/tasks
// @desc    Get all tasks for the user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        OR: [
          { assigneeId: req.user.id },
          { project: { ownerId: req.user.id } }
        ]
      },
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/tasks
// @desc    Create a new task
// @access  Private (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { title, description, projectId, assigneeId, dueDate, priority } = req.body;
    
    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and Project ID are required' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        assigneeId,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null
      }
    });

    await prisma.activity.create({
      data: {
        description: `${req.user.name} created a new task: ${title}`,
        userId: req.user.id,
        projectId: projectId
      }
    });

    req.io.emit('task_updated'); // Trigger a refresh
    req.io.emit('activity_added');

    res.status(201).json(task);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update a task (status, assignment)
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const { status, assigneeId, title, description, dueDate, priority } = req.body;
    
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Role-based update logic
    let updateData = {};
    
    if (req.user.role === 'ADMIN') {
      // Admins can update everything
      updateData = {
        status: status || task.status,
        assigneeId: assigneeId !== undefined ? assigneeId : task.assigneeId,
        title: title || task.title,
        description: description !== undefined ? description : task.description,
        priority: priority || task.priority,
        dueDate: dueDate ? new Date(dueDate) : task.dueDate
      };
    } else {
      // Members can ONLY update the status
      if (!status) {
        return res.status(403).json({ message: 'Members can only update task status' });
      }
      updateData = { status };
    }

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id },
      data: updateData
    });

    if (status && status !== task.status) {
      await prisma.activity.create({
        data: {
          description: `${req.user.name} moved task "${updatedTask.title}" to ${status}`,
          userId: req.user.id,
          projectId: updatedTask.projectId
        }
      });
      req.io.emit('activity_added');
    }

    req.io.emit('task_updated'); // Trigger a refresh

    res.json(updatedTask);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
// @access  Private (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
