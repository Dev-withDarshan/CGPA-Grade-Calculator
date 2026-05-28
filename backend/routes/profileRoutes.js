import express from 'express';
import ImageKit from 'imagekit';
import User from '../models/User.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// Initialize ImageKit SDK lazily
let imagekit = null;
const getImageKit = () => {
  if (!imagekit) {
    imagekit = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
    });
  }
  return imagekit;
};

// POST /api/profile/upload-photo — Protected
router.post('/upload-photo', authMiddleware, async (req, res) => {
  try {
    const { file } = req.body;

    if (!file) return res.status(400).json({ error: 'File is required.' });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const uploadResponse = await getImageKit().upload({
      file,
      fileName: `profile_${user._id}.jpg`,
      useUniqueFileName: false,
      folder: '/gravital/profiles/'
    });

    user.profilePhoto = uploadResponse.url;
    await user.save();

    console.log(`✅ Profile photo uploaded for user ${req.userId}`);
    res.json({ success: true, url: uploadResponse.url });
  } catch (err) {
    console.error('Upload Photo Error:', err);
    res.status(500).json({ error: 'Failed to upload profile photo.' });
  }
});

// GET /api/profile/me — Protected, returns profile for the token owner
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(
      req.userId,
      { profilePhoto: 1, email: 1, username: 1, createdAt: 1 }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      success: true,
      profile: {
        profilePhoto: user.profilePhoto || '',
        email: user.email || '',
        username: user.username,
        memberSince: user.createdAt
      }
    });
  } catch (err) {
    console.error('Load Profile Error:', err);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

export default router;
