const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const convVie = require('../utils/convVie');
// const ActivityMember = require('./activityMemberModel');

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'An activity must have a name'],
      trim: true,
    },
    textSearch: {
      type: String,
      select: false,
    },
    description: {
      type: String,
      required: [true, 'An activity must have content'],
    },
    photo: {
      type: String,
      default() {
        return `https://via.placeholder.com/150?text=${this.name.charAt(0)}`;
      },
    },
    category: {
      type: String,
      enum: ['Học thuật', 'Văn nghệ', 'Tình nguyện', 'Phong trào'],
      default: 'Học thuật',
    },
    memberQuantity: {
      type: Number,
      default: 0,
    },
    groupQuantity: {
      type: Number,
      default: 0,
    },
    clubGroup: {
      type: mongoose.Schema.ObjectId,
      ref: 'ClubGroup',
      required: [true, 'The Activity must belong to a ClubGroup'],
    },
    createBy: {
      ref: 'User',
      type: mongoose.Schema.ObjectId,
      required: [true, 'Know who create this'],
      select: false,
    },
    createAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

activitySchema.index({ textSearch: 'text' });

activitySchema.virtual('activityGroups', {
  ref: 'ActivityGroup',
  foreignField: 'activity',
  localField: '_id',
});

activitySchema.virtual('activityMembers', {
  ref: 'ActivityMember',
  foreignField: 'activity',
  localField: '_id',
  options: {
    filters: {
      role: {
        $in: ['requested'],
      },
    },
  },
});

activitySchema.plugin(idValidator);

activitySchema.pre('save', async function (next) {
  this.textSearch = convVie(this.name).toLowerCase();
  next();
});

activitySchema.post('save', async function () {
  await this.model('Notification').create({
    content: 'Your Activity is created',
    link: this._id,
    user: this.createBy,
  });
  await this.model('ActivityMember').create({
    activity: this._id,
    user: this.createBy,
    role: 'manager',
  });
  await this.model('ActivityGroup').create({
    name: this.name,
    description: `${this.name} - description`,
    isMain: true,
    activity: this._id,
    createBy: this.createBy,
  });
});

activitySchema.pre(/^find/, (next) => {
  next();
});

activitySchema.pre(
  /findOneAndUpdate|updateOne|update/,
  function (next) {
    const docUpdate = this.getUpdate();
    if (!docUpdate || !docUpdate.name) return next();
    this.findOneAndUpdate({}, { textSearch: convVie(docUpdate.name).toLowerCase() });
    return next();
  },
);

activitySchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    await this.model('ActivityClub').deleteMany({ activity: this._id });
  },
);

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
