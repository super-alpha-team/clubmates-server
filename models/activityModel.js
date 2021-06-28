const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const convVie = require('../utils/convVie.js');

const ActivityMemberSchema = new mongoose.Schema({ 
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    unique: [true, "user has only one role"],
  },
  role: {
    type: String,
    enum: ['collaborator','manager', 'member', 'requested'],
    default: 'member',
  }
});

const activitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "An activity must have a name"],
      trim: true,
    },
    textSearch: {
      type: String,
      select: false,
    },
    description: {
      type: String,
      required: [true, "An activity must have content"],
    },
    photo: {
      type: String,
      default() {
        return `https://via.placeholder.com/150?text=${this.name.charAt(0)}`;
      },
    },
    category: {
      type: String,
      enum: ['Học thuật', 'Văn nghệ','Tình nguyện', 'Phong trào'],
      default: 'Học thuật',
    },
    member: {
      type: [ActivityMemberSchema],
      select: false,
    },
    clubGroup: {
      type: mongoose.Schema.ObjectId,
      ref: 'ClubGroup',
      required: [true, "The Activity must belong to a ClubGroup"],
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

activitySchema.index({textSearch: 'text'});

activitySchema.virtual('activityGroups', {
  ref: 'ActivityGroup',
  foreignField: 'activity',
  localField: '_id',
});

activitySchema.plugin(idValidator);

activitySchema.pre('save',async function (next) {
  this.textSearch = convVie(this.name).toLowerCase();
  next();
});

activitySchema.post('save', async function() {
  await this.model('Notification').create({
    content: `Your club group's activity is created`,
    link: this._id,
    user: this.member[0].user
  })
  await this.model("ActivityGroup").create({
    name: `${this.name} - group`,
    description: `${this.name} - description`,
    member: [{
      user: this.member[0].user,
      role: "manager",
    }],
    isMain: true,
    activity: this._id
  })
});

activitySchema.pre(/^find/, function (next) {
  next();
});

activitySchema.pre(
  /findOneAndUpdate|updateOne|update/ ,
  function(next) {
    const docUpdate = this.getUpdate();
    if (!docUpdate || !docUpdate.name) return next();
    this.findOneAndUpdate({}, { textSearch: convVie(docUpdate.name).toLowerCase() });
    return next();
});

activitySchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    await this.model('ActivityClub').deleteMany({ activity: this._id });
  },
);

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;
