const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
// const convVie = require('../utils/convVie');

const groupSchema = new mongoose.Schema(
  {
    GroupName: {
      type: String,
      required: [true, 'A Group must have a name'],
      trim: true,
    },
    GroupIntro: {
      type: String,
    },

    // check is default group of club
    isMain: {
      type: Boolean,
      default: false,
    },
    Club: {
      type: mongoose.Schema.ObjectId,
      ref: 'Club',
    },

    // parent group of this group
    Group: {
      type: mongoose.Schema.ObjectId,
      ref: 'Group',
    },

    memberQuantity: {
      type: Number,
      default: 0,
    },

    createBy: {
      ref: 'User',
      type: mongoose.Schema.ObjectId,
      required: [true, 'Know who create this'],
      select: false,
    },
  },
  {
    timestamps: true,
    // toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);

// -- virtual activity
groupSchema.virtual('Activity', {
  ref: 'GroupActivityTab',
  foreignField: 'Group',
  localField: '_id',
});
groupSchema.virtual('Setting', {
  ref: 'GroupSettingTab',
  foreignField: 'Group',
  localField: '_id',
});
groupSchema.virtual('Chat', {
  ref: 'GroupChatTab',
  foreignField: 'Group',
  localField: '_id',
});
groupSchema.virtual('Target', {
  ref: 'GroupTargetTab',
  foreignField: 'Group',
  localField: '_id',
});
groupSchema.virtual('Member', {
  ref: 'GroupMemberTab',
  foreignField: 'Group',
  localField: '_id',
});

groupSchema.plugin(idValidator);

groupSchema.post('save', async function () {
  this.model('Notification').create({
    content: 'Your Group is created',
    link: this._id,
    user: this.createBy,
  });

  if (this.isMain) {
    // auto add role
    const role = await this.model('GroupRole').create({
      RoleName: 'Main',
      Group: this._id,
      isMain: true,
    });
    // add role member
    this.model('GroupMember').create({
      User: this.createBy,
      GroupRole: role._id,
    });
  }
});

// QUERY MIDDLEWARE - auto pupulate user in answer
groupSchema.pre(/^find/, (next) => {
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
groupSchema.pre(
  /findOneAndUpdate|updateOne|update/,
  function (next) {
    const docUpdate = this.getUpdate();
    if (!docUpdate || !docUpdate.GroupName) return next();
    // this.findOneAndUpdate({}, { textSearch: convVie(docUpdate.name).toLowerCase() });
    return next();
  },
);

groupSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some relative group model
    // await this.model('ClubGroupGroup').deleteMany({ clubGroup: this._id });
  },
);

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
