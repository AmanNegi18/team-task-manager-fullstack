const express = require('express');
const prisma = require('../config/db');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// @route   GET /api/dashboard/metrics
// @desc    Get dashboard metrics (tasks, projects, status, overdue)
// @access  Private
router.get('/metrics', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();

    // Counts for the user's projects and tasks
    const [
      totalProjects,
      totalAssignedTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      overdueTasks
    ] = await Promise.all([
      // Total projects owned or where they have tasks (simplified: total projects for now)
      prisma.project.count(),
      
      // Total tasks assigned to user
      prisma.task.count({ where: { assigneeId: userId } }),
      
      // Tasks by status for this user
      prisma.task.count({ where: { assigneeId: userId, status: 'TODO' } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { assigneeId: userId, status: 'DONE' } }),
      
      // Overdue tasks
      prisma.task.count({
        where: {
          assigneeId: userId,
          status: { not: 'DONE' },
          dueDate: { lt: today }
        }
      })
    ]);

    res.json({
      projects: totalProjects,
      tasks: {
        total: totalAssignedTasks,
        todo: todoTasks,
        inProgress: inProgressTasks,
        done: doneTasks,
        overdue: overdueTasks
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
