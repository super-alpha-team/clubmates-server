const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const uniqueValidator = require('mongoose-unique-validator'); // plugin for unique field

const groupRoleMemberSchema = new mongoose.Schema({
  User: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    require: [true, 'Member must just one User'],
  },
  GroupRole: {
    type: mongoose.Schema.ObjectId,
    ref: 'GroupRole',
    require: [true, 'Member must just one Role'],
  },
},
{
  timestamps: true,
  toJSON: { virtuals: true }, // pass the virtuals properties to JSON
  toObject: { virtuals: true }, // --                        -- Object
});

groupRoleMemberSchema.index({ GroupRole: 1, User: 1 }, { unique: true });

groupRoleMemberSchema.plugin(idValidator);

groupRoleMemberSchema.plugin(uniqueValidator, {
  message: 'Error, {VALUE} is already taken',
});

groupRoleMemberSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - update member count
  },
);

const GroupRoleMember = mongoose.model('GroupRoleMember', groupRoleMemberSchema);
module.exports = GroupRoleMember;
