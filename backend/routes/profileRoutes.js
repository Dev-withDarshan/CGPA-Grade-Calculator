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

    // Clean up old profile photo from ImageKit if it exists
    if (user.profilePhotoFileId) {
      try {
        await getImageKit().deleteFile(user.profilePhotoFileId);
        console.log(`✅ Deleted old profile photo (File ID: ${user.profilePhotoFileId}) from ImageKit`);
      } catch (imgErr) {
        console.error('ImageKit File ID Deletion Error (non-fatal):', imgErr);
      }
    } else if (user.profilePhoto) {
      // Fallback for legacy users who don't have a profilePhotoFileId stored yet
      try {
        const imageKit = getImageKit();
        const files = await imageKit.listFiles({
          searchQuery: `name : "profile_${user._id}"`
        });
        
        if (files && files.length > 0) {
          for (const f of files) {
            await imageKit.deleteFile(f.fileId);
            console.log(`✅ Deleted legacy profile photo ${f.name} from ImageKit`);
          }
        }
      } catch (imgErr) {
        console.error('ImageKit Legacy Deletion Error (non-fatal):', imgErr);
      }
    }

    const uploadResponse = await getImageKit().upload({
      file,
      fileName: `profile_${user._id}.jpg`,
      useUniqueFileName: true,
      folder: '/gravital/profiles/'
    });

    user.profilePhoto = uploadResponse.url;
    user.profilePhotoFileId = uploadResponse.fileId;
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
      { profilePhoto: 1, email: 1, username: 1, createdAt: 1, profile: 1 }
    );
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({
      success: true,
      profile: {
        profilePhoto: user.profilePhoto || '',
        email: user.email || '',
        username: user.username,
        memberSince: user.createdAt,
        name: user.profile?.name || '',
        branch: user.profile?.branch || '',
        year: user.profile?.year || '',
        targetCGPA: user.profile?.targetCGPA || '',
        gradingSystem: user.profile?.gradingSystem || 'VIT Grading',
        emailNotifications: user.profile?.emailNotifications !== undefined ? user.profile.emailNotifications : true,
        twoFactorEnabled: user.profile?.twoFactorEnabled !== undefined ? user.profile.twoFactorEnabled : true
      }
    });
  } catch (err) {
    console.error('Load Profile Error:', err);
    res.status(500).json({ error: 'Failed to load profile.' });
  }
});

// POST /api/profile/update — Protected, updates user profile details
router.post('/update', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    if (!user.profile) {
      user.profile = {};
    }

    const { name, branch, year, targetCGPA, gradingSystem, emailNotifications, twoFactorEnabled } = req.body;

    if (name !== undefined) user.profile.name = name;
    if (branch !== undefined) user.profile.branch = branch;
    if (year !== undefined) user.profile.year = year;
    if (targetCGPA !== undefined) user.profile.targetCGPA = targetCGPA;
    if (gradingSystem !== undefined) user.profile.gradingSystem = gradingSystem;
    if (emailNotifications !== undefined) user.profile.emailNotifications = emailNotifications;
    if (twoFactorEnabled !== undefined) user.profile.twoFactorEnabled = twoFactorEnabled;

    await user.save();
    res.json({
      success: true,
      message: 'Profile updated successfully.',
      profile: user.profile
    });
  } catch (err) {
    console.error('Update Profile Details Error:', err);
    res.status(500).json({ error: 'Failed to update profile details.' });
  }
});

// DELETE /api/profile/delete-account — Protected, deletes user account and related data
router.delete('/delete-account', authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required"
      });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }

    // Attempt to delete profile photo from ImageKit if it exists
    if (user.profilePhotoFileId) {
      try {
        await getImageKit().deleteFile(user.profilePhotoFileId);
        console.log(`✅ Deleted profile photo (File ID: ${user.profilePhotoFileId}) from ImageKit for user ${req.userId}`);
      } catch (imgErr) {
        console.error('ImageKit File ID Deletion Error (non-fatal):', imgErr);
      }
    } else if (user.profilePhoto) {
      // Fallback for legacy users
      try {
        const imageKit = getImageKit();
        // Look up files containing the user ID
        const files = await imageKit.listFiles({
          searchQuery: `name : "profile_${user._id}"`
        });
        
        if (files && files.length > 0) {
          for (const f of files) {
            await imageKit.deleteFile(f.fileId);
            console.log(`✅ Deleted legacy profile photo ${f.name} from ImageKit for user ${req.userId}`);
          }
        }
      } catch (imgErr) {
        console.error('ImageKit Deletion Error (non-fatal):', imgErr);
      }
    }

    // Delete the user document from MongoDB (this also removes embedded gpaData and scoreFlow data)
    await User.findByIdAndDelete(req.userId);

    // Placeholder for future external related records (e.g. if Stats/Activity models are created)
    // await FutureExternalModel.deleteMany({ userId: req.userId });

    console.log(`🗑️ Account deleted successfully for user ${req.userId}`);
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Delete Account Error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account.' });
  }
});

export default router;
