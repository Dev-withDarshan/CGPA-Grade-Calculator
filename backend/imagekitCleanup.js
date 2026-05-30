import dotenv from 'dotenv';
import mongoose from 'mongoose';
import ImageKit from 'imagekit';
import User from './models/User.js';

dotenv.config({ path: './backend/.env' });

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function runCleanup() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    console.log('⏳ Fetching files from ImageKit under /gravital/profiles/...');
    const files = await imagekit.listFiles({
      path: '/gravital/profiles/',
      limit: 1000 // list up to 1000 profile pictures at a time
    });

    console.log(`ℹ️ Found ${files.length} profile pictures in ImageKit.`);

    let deletedCount = 0;
    for (const file of files) {
      // Parse user ID from filename: profile_507f1f77bcf86cd799439011.jpg
      const match = file.name.match(/^profile_([a-f\d]{24})\.jpg$/i);
      if (!match) {
        console.log(`⚠️ Skipping file with unrecognized pattern: ${file.name}`);
        continue;
      }

      const userId = match[1];

      // Check if the user still exists in the database
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        console.log(`🗑️ User ${userId} no longer exists. Deleting image "${file.name}" (ID: ${file.fileId}) from ImageKit...`);
        await imagekit.deleteFile(file.fileId);
        deletedCount++;
      }
    }

    console.log(`🎉 Cleanup complete! Deleted ${deletedCount} orphaned profile photos.`);
  } catch (err) {
    console.error('❌ Cleanup failed with error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Mongoose connection closed.');
    process.exit(0);
  }
}

runCleanup();
