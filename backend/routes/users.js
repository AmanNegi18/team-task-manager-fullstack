const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users (for assigning tasks and managing team)
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/users
// @desc    Add a new member manually
// @access  Private (Admin only)
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all required fields' });
    }

    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user
// @access  Private (Admin only)
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete associated tasks and projects first (or let Prisma cascade if configured, but we do it manually to be safe)
    await prisma.task.deleteMany({ where: { assigneeId: req.params.id } });
    await prisma.project.deleteMany({ where: { ownerId: req.params.id } });
    
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
