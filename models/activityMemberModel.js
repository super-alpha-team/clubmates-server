const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const uniqueValidator = require('mongoose-unique-validator'); // plugin for unique field

const activityMemberSchema = new mongoose.Schema({
  activity: {
    type: mongoose.Schema.ObjectId,
    ref: 'Activity',
    require: [true, 'Member must into one Activity'],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'Member must just one User'],
  },
  role: {
    type: String,
    enum: ['collaborator', 'manager', 'member', 'requested'],
    default: 'member',
  },
  answer: {
    type: String,
    select: false,
  },
  dateAdded: {
    type: Date,
    default: Date.now,
  },
},
{
  toJSON: { virtuals: true }, // pass the virtuals properties to JSON
  toObject: { virtuals: true }, // --                        -- Object
});

activityMemberSchema.index({ activity: 1, user: 1 }, { unique: true });

activityMemberSchema.plugin(idValidator);

activityMemberSchema.plugin(uniqueValidator, {
  message: 'Error, {VALUE} is already taken',
});

activityMemberSchema.statics.countActivities = async function (activityId) {
  const stats = await this.aggregate([
    {
      $match: {
        activity: activityId,
      },
    },
    {
      $group: {
        _id: '$activity',
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.model('Activity').findByIdAndUpdate(activityId, {
      memberQuantity: stats[0].count,
    });
  } else {
    await this.model('Activity').findByIdAndUpdate(activityId, {
      memberQuantity: 0,
    });
  }
};

activityMemberSchema.post('save', async function () {
  await this.constructor.countActivities(this.activity);
  // `this` points to current member
  // `this.consctructor = this.model('ActivityMember')

  // send notification for user
});

// findByIdAndUpdate & findByIdAndDelete all using findOneAnd
activityMemberSchema.pre(/^findOneAnd/, async function (next) {
  this.getUpdatedMember = await this.findOne();
  next();
});

activityMemberSchema.post(
  /findOneAndUpdate|updateOne|update/,
  async function () {
    await this.getUpdatedMember.constructor.countActivities(
      this.getUpdatedMember.activity,
    );
  },
);

activityMemberSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    await this.getUpdatedMember.constructor.countActivities(this.activity);
    // await this.model('ActivityGroup').deleteMany({ activity: this._id });
  },
);

const ActivityMember = mongoose.model('ActivityMember', activityMemberSchema);
module.exports = ActivityMember;
