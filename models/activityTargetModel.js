const mongoose = require('mongoose');
// const convVie = require('../utils/convVie');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  dueDate: {
    type: Date,
    default: Date.now(),
  },
});

const activityTargetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, 'A target must have a name'],
    },
    textSearch: {
      type: String,
      select: false,
    },
    description: {
      type: String,
      require: [true, 'A target must have content'],
    },
    activity: {
      type: mongoose.Schema.ObjectId,
      ref: 'Activity',
      require: [true, 'The target must belong to an activity'],
    },
    task: {
      type: [taskSchema],
      select: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const ActivityTarget = mongoose.model('ActivityTarget', activityTargetSchema);
module.exports = ActivityTarget;
