require('dotenv').config();
const mongoose = require('mongoose');

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("❌ MONGO_URI environment variable is missing.");
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(async () => {
    const db = mongoose.connection.db;
    const res = await db.collection('users').deleteMany({
      $or: [
        { password: { $exists: false } },
        { password: null }
      ]
    });
    console.log('Deleted invalid users:', res.deletedCount);
    process.exit(0);
  })
  .catch(console.error);
