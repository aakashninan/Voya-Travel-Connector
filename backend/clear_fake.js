const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Match = require('./models/Match');
const Group = require('./models/Group');

dotenv.config();

const clearFakeAccounts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/wandersync');
    console.log('MongoDB Connected for clearing mock data.');

    // Find all users ending with @wandersync.com
    const fakeUsers = await User.find({ email: /@wandersync\.com$/i });
    const fakeUserIds = fakeUsers.map(u => u._id);

    console.log(`Found ${fakeUserIds.length} fake users to remove.`);

    if (fakeUserIds.length > 0) {
      // Cascade delete matches
      await Match.deleteMany({
        $or: [
          { sender: { $in: fakeUserIds } },
          { receiver: { $in: fakeUserIds } }
        ]
      });
      console.log('Deleted related matches.');

      // Pull from group members
      await Group.updateMany(
        { members: { $in: fakeUserIds } },
        { $pull: { members: { $in: fakeUserIds } } }
      );
      
      // Pull invites
      await Group.updateMany(
        { 'invites.user': { $in: fakeUserIds } },
        { $pull: { invites: { user: { $in: fakeUserIds } } } }
      );
      console.log('Cleaned groups of fake members/invites.');

      // Delete groups created by fake users
      await Group.deleteMany({ creator: { $in: fakeUserIds } });
      console.log('Deleted fake user groups.');

      // Delete fake users
      const result = await User.deleteMany({ _id: { $in: fakeUserIds } });
      console.log(`Successfully deleted ${result.deletedCount} fake users.`);
    }

    console.log('Database clear complete!');
    process.exit(0);
  } catch (error) {
    console.error('Clear Error:', error);
    process.exit(1);
  }
};

clearFakeAccounts();
