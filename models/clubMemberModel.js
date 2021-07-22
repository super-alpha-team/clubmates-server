const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const uniqueValidator = require('mongoose-unique-validator'); // plugin for unique field

const clubMemberSchema = new mongoose.Schema({
  club: {
    type: mongoose.Schema.ObjectId,
    ref: 'Club',
    require: [true, 'Member must into one Club'],
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

clubMemberSchema.index({ club: 1, user: 1 }, { unique: true });

clubMemberSchema.plugin(idValidator);

clubMemberSchema.plugin(uniqueValidator, {
  message: 'Error, {VALUE} is already taken',
});

clubMemberSchema.statics.countClubs = async function (clubId) {
  const stats = await this.aggregate([
    {
      $match: {
        club: clubId,
      },
    },
    {
      $group: {
        _id: '$club',
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await this.model('Club').findByIdAndUpdate(clubId, {
      memberQuantity: stats[0].count,
    });
  } else {
    await this.model('Club').findByIdAndUpdate(clubId, {
      memberQuantity: 0,
    });
  }
};

clubMemberSchema.post('save', async function () {
  await this.constructor.countClubs(this.club);
  // `this` points to current member
  // `this.consctructor = this.model('ClubMember')

  // send notification for user
});

// findByIdAndUpdate & findByIdAndDelete all using findOneAnd
clubMemberSchema.pre(/^findOneAnd/, async function (next) {
  this.getUpdatedMember = await this.findOne();
  next();
});

clubMemberSchema.post(
  /findOneAndUpdate|updateOne|update/,
  async function () {
    await this.getUpdatedMember.constructor.countClubs(
      this.getUpdatedMember.club,
    );
  },
);

clubMemberSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    await this.getUpdatedMember.constructor.countClubs(this.club);
    // await this.model('ClubGroup').deleteMany({ club: this._id });
  },
);

const ClubMember = mongoose.model('ClubMember', clubMemberSchema);
module.exports = ClubMember;
