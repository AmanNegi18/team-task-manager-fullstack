const express = require('express');
const prisma = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        ownerId: req.user.id
      }
    });

    await prisma.activity.create({
      data: {
        description: `${req.user.name} created a new project: ${name}`,
        userId: req.user.id,
        projectId: project.id
      }
    });

    res.status(201).json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects
// @desc    Get all projects
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, name: true, email: true } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true } },
        tasks: {
          include: { assignee: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/projects/:id
// @desc    Delete a project
// @access  Private (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const project = await prisma.project.findUnique({ where: { id: req.params.id } });
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Delete associated tasks first due to foreign key constraints
    await prisma.task.deleteMany({ where: { projectId: req.params.id } });
    await prisma.project.delete({ where: { id: req.params.id } });

    res.json({ message: 'Project removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
