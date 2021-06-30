const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const convVie = require('../utils/convVie.js');

//check member can add to activitygroup or not?
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
    category: {
      type: String,
      enum: ['Học thuật','Tình nguyện', 'Phong trào', 'Văn nghệ', 'Main', 'Default'],
      default: 'Default',
    },
    memberQuantity: {
      type: Number,
      default: 0,
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
    createBy: {
      ref: 'User',
      type: mongoose.Schema.ObjectId,
      required: [true, 'Know who create this'],
      select: false,
    },
    createAt: {
      type: Date,
      default: Date.now(), // Mongoose will auto convert to today's date
    },
  },
  {
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);


// mongo’s full-text search,
// we need to create indexes for the fields we need to search.
activityGroupSchema.index({textSearch: 'text'});

// Virtual populate for show up child referencing
// activityGroupSchema.virtual('activityGroupGroups', {
//   ref: 'ActivityGroupGroup',
//   foreignField: 'activityGroup',
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
    user: this.createBy
  })
  // add to member activitygroup
   await this.model('ActivityGroupMember').create({
     activityGroup: this._id,
     user: this.createBy,
     role: 'manager'
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

// all middleware are trigger
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
    // await this.model('ActivityGroupGroup').deleteMany({ activityGroup: this._id });
  },
);

const ActivityGroup = mongoose.model('ActivityGroup', activityGroupSchema);
module.exports = ActivityGroup;
