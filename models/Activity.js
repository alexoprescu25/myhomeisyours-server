import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
});

activitySchema.methods.generateDescription = function () {
  switch (this.action) {
    case 'login':
      this.description = `User logged in`;
      break;
    case 'logout':
      this.description = `User logged out`;
      break;
    case 'view':
      this.description = `Viewed ${this.target}`;
      break;
    case 'create':
      this.description = `Created ${this.target}`;
      break;
    case 'update':
      this.description = `Updated ${this.target}`;
      break;
    case 'delete':
      this.description = `Deleted ${this.target}`;
      break;
    case 'addAccount':
      this.description = `Added a new account: ${this.target}`;
      break;
    default:
      this.description = `Performed ${this.action} on ${this.target}`;
  }
};

const Activity = mongoose.model('Activity', activitySchema);

export default Activity;