const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const convVie = require('../utils/convVie.js');

const ActivityGroupMemberSchema = new mongoose.Schema({ 
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  },
  role: {
    type: String,
    enum: ['manager', 'member', 'collaborator', 'participant'],
    default: 'member',
  }
});

const activityGroupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A ActivityGroup must have a name'],
      trim: true,
    },
    textSearch: {
      type: String,
      select: false,
    },
    description: {
      type: String,
      required: [true, 'A ActivityGroup must have content'],
    },
    photo: {
      type: String,
      default() {
        return `https://via.placeholder.com/150?text=${this.name.charAt(0)}`;
      },
    },
    member: {
      type: [ActivityGroupMemberSchema],
      select: false,
    },
    category: {
      type: String,
      enum: ['Học thuật','Tình nguyện', 'Phong trào', 'Văn nghệ', 'Default'],
      default: 'Default',
    },
    isMain: {
      type: Boolean,
      default: false,
    },
    activity: {
      type: mongoose.Schema.ObjectId,
      ref: 'Activity',
      required: [true, 'ActivityGroup must belong to an Activity'],
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

activityGroupSchema.index({textSearch: 'text'});

// Virtual populate for show up child referencing
// activityGroupSchema.virtual('ActivityGroupGroups', {
//   ref: 'ActivityGroupGroup',
//   foreignField: 'ActivityGroup',
//   localField: '_id',
// });

activityGroupSchema.plugin(idValidator);

activityGroupSchema.pre('save',async function (next) {
  this.textSearch = convVie(this.name).toLowerCase();
  next();
});

activityGroupSchema.post('save', async function() {
  await this.model('Notification').create({
    content: `Your ActivityGroup is created`,
    link: this._id,
    user: this.member[0].user
  })
});

// QUERY MIDDLEWARE - auto pupulate user in answer
activityGroupSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'member',
  //   select: '_id name photo', // just show name + photo and hide everything else for security
  // })
  // .populate({
  //   path: 'answers',
  //   select: '_id showcase'
  // });
  next();
});

activityGroupSchema.pre(
  /findOneAndUpdate|updateOne|update/ ,
  function(next) {
    const docUpdate = this.getUpdate();
    if (!docUpdate || !docUpdate.name) return next();
    this.findOneAndUpdate({}, { textSearch: convVie(docUpdate.name).toLowerCase() });
    return next();
});

activityGroupSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    // await this.model('ActivityGroupGroup').deleteMany({ ActivityGroup: this._id });
  },
);

const ActivityGroup = mongoose.model('ActivityGroup', activityGroupSchema);
module.exports = ActivityGroup;
