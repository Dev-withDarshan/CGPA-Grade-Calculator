import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/scoreflow/save — Protected
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { scoreFlowData } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!scoreFlowData) {
      user.scoreFlow = undefined;
      await user.save();
      return res.json({ success: true, message: 'ScoreFlow data cleared.' });
    }

    user.scoreFlow = {
      gradeTable: scoreFlowData.subjects || [],
      cgpa: scoreFlowData.cgpa,
      originalCgpa: scoreFlowData.originalCgpa,
      totalCredits: scoreFlowData.totalCredits,
      gradedCredits: scoreFlowData.gradedCredits,
      ngcrCredits: scoreFlowData.ngcrCredits,
      excludedCredits: scoreFlowData.excludedCredits,
      updatedAt: new Date()
    };

    await user.save();
    res.json({ success: true, message: 'ScoreFlow data saved.' });
  } catch (err) {
    console.error('Save ScoreFlow Error:', err);
    res.status(500).json({ error: 'Server error saving ScoreFlow data.' });
  }
});

// GET /api/scoreflow/ — Protected, returns scoreFlow for the token owner
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId, { scoreFlow: 1 });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.scoreFlow || !user.scoreFlow.gradeTable || user.scoreFlow.gradeTable.length === 0) {
      return res.json({ success: true, scoreFlowData: null });
    }

    const data = {
      name: 'All Sems',
      cgpa: user.scoreFlow.cgpa,
      originalCgpa: user.scoreFlow.originalCgpa,
      totalCredits: user.scoreFlow.totalCredits,
      gradedCredits: user.scoreFlow.gradedCredits,
      ngcrCredits: user.scoreFlow.ngcrCredits,
      excludedCredits: user.scoreFlow.excludedCredits,
      subjects: user.scoreFlow.gradeTable
    };

    res.json({ success: true, scoreFlowData: data });
  } catch (err) {
    console.error('Load ScoreFlow Error:', err);
    res.status(500).json({ error: 'Failed to load ScoreFlow data.' });
  }
});

export default router;
