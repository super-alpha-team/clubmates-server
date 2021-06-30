const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const uniqueValidator = require('mongoose-unique-validator'); // plugin for unique field

const activityGroupMemberSchema = new mongoose.Schema({ 
    activityGroup: {
      type: mongoose.Schema.ObjectId,
      ref: 'ActivityGroup',
      require: [true, 'Member must into ActivityGroup']
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
  
activityGroupMemberSchema.index({ activityGroup: 1, user: 1 }, { unique: true });

activityGroupMemberSchema.plugin(idValidator);

activityGroupMemberSchema.plugin(uniqueValidator, {
    message: 'Error, {VALUE} is already taken',
  });

activityGroupMemberSchema.statics.countActivityGroups = async function (activityGroupId) {
    const stats = await this.aggregate([
      {
        $match: { 
            activityGroup: activityGroupId,
        },
      },
      {
        $group: {
          _id: '$activityGroup',
          count: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) { 
      await this.model('ActivityGroup').findByIdAndUpdate(activityGroupId, {
        memberQuantity: stats[0].count,
      });
    } else {
      await this.model('ActivityGroup').findByIdAndUpdate(activityGroupId, {
        memberQuantity: 0,
      });
    }
  };

activityGroupMemberSchema.post('save', async function () {
await this.constructor.countActivityGroups(this.activityGroup);
// `this` points to current member
// `this.consctructor = this.model('ActivityMember')

// send notification for user

});

// findByIdAndUpdate & findByIdAndDelete all using findOneAnd
activityGroupMemberSchema.pre(/^findOneAnd/, async function (next) {
    this.getUpdatedMember = await this.findOne();
    next();
  });

  activityGroupMemberSchema.post(
    /findOneAndUpdate|updateOne|update/ ,
    async function() {
        await this.getUpdatedMember.constructor.countActivityGroups(
            this.getUpdatedMember.activityGroup
        );
  });

activityGroupMemberSchema.post(
    /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    await this.getUpdatedMember.constructor.countActivityGroups(this.activityGroup);
    // await this.model('ActivityGroup').deleteMany({ club: this._id });
  },
)




const ActivityGroupMember = mongoose.model('ActivityGroupMember', activityGroupMemberSchema);
module.exports = ActivityGroupMember;