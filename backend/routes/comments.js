const express = require('express');
const prisma = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/comments/:taskId
// @desc    Get comments for a task
// @access  Private
router.get('/:taskId', protect, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { taskId: req.params.taskId },
      include: {
        user: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/comments
// @desc    Add a comment to a task
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { text, taskId } = req.body;
    if (!text || !taskId) {
      return res.status(400).json({ message: 'Please provide text and taskId' });
    }

    const comment = await prisma.comment.create({
      data: {
        text,
        taskId,
        userId: req.user.id
      },
      include: {
        user: { select: { id: true, name: true, role: true } }
      }
    });

    // We can also create an activity here automatically
    await prisma.activity.create({
      data: {
        description: `${req.user.name} commented on a task.`,
        userId: req.user.id
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Delete a comment
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    
    // Only author or admin can delete
    if (comment.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
