const express = require('express');
const prisma = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/activities
// @desc    Get recent team activities
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      include: {
        user: { select: { id: true, name: true, role: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20 // Limit to recent 20 activities
    });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
