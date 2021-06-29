const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const uniqueValidator = require('mongoose-unique-validator'); // plugin for unique field

const clubGroupMemberSchema = new mongoose.Schema({ 
    clubGroup: {
      type: mongoose.Schema.ObjectId,
      ref: 'ClubGroup',
      require: [true, 'Member must into ClubGroup']
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      require: [true, 'Member is just one User']
    },
    role: {
        type: String,
        enum: ['collaborator','manager', 'member', 'requested'],
        default: 'member',
    },
    // activityGroup: {
    //     type: mongoose.Schema.ObjectId,
    //     ref: 'ActivityGroup'
    // }
  },
  {
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);
  
clubGroupMemberSchema.index({ clubGroup: 1, user: 1 }, { unique: true });

clubGroupMemberSchema.plugin(idValidator);

clubGroupMemberSchema.plugin(uniqueValidator, {
    message: 'Error, {VALUE} is already taken',
  });

clubGroupMemberSchema.statics.countClubGroups = async function (clubGroupId) {
    const stats = await this.aggregate([
      {
        $match: { 
            clubGroup: clubGroupId,
        },
      },
      {
        $group: {
          _id: '$clubGroup',
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) { 
      await this.model('ClubGroup').findByIdAndUpdate(clubGroupId, {
        memberQuantity: stats[0].count,
      });
    } else {
      await this.model('ClubGroup').findByIdAndUpdate(clubGroupId, {
        memberQuantity: 0,
      });
    }
  };

clubGroupMemberSchema.post('save', async function () {
await this.constructor.countClubGroups(this.clubGroup);
// `this` points to current member
// `this.consctructor = this.model('ClubMember')

// send notification for user

});

// findByIdAndUpdate & findByIdAndDelete all using findOneAnd
clubGroupMemberSchema.pre(/^findOneAnd/, async function (next) {
    this.getUpdatedMember = await this.findOne();
    next();
  });

  clubGroupMemberSchema.post(
    /findOneAndUpdate|updateOne|update/ ,
    async function() {
        await this.getUpdatedMember.constructor.countClubGroups(
            this.getUpdatedMember.clubGroup
        );
  });

clubGroupMemberSchema.post(
    /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    await this.getUpdatedMember.constructor.countClubGroups(this.clubGroup);
    // await this.model('ClubGroup').deleteMany({ club: this._id });
  },
)




const ClubGroupMember = mongoose.model('ClubGroupMember', clubGroupMemberSchema);
module.exports = ClubGroupMember;