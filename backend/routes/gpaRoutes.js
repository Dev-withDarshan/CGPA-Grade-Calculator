import express from 'express';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// POST /api/gpa/save-gpa — Protected
router.post('/save-gpa', authMiddleware, async (req, res) => {
  try {
    const { gpaData } = req.body;

    const result = await User.findByIdAndUpdate(
      req.userId,
      { $set: { gpaData } },
      { new: true }
    );

    if (!result) return res.status(404).json({ error: 'User not found.' });

    res.json({ success: true });
  } catch (err) {
    console.error('Save GPA Error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// GET /api/gpa/ — Protected, returns gpaData for the token owner
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId, { gpaData: 1, email: 1 });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      success: true,
      gpaData: user.gpaData,
      data: user.gpaData,
      email: user.email || ''
    });
  } catch (err) {
    console.error('Load GPA Error:', err);
    res.status(500).json({ error: 'Failed to load data.' });
  }
});

export default router;
