const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');

const groupMemberTabSchema = new mongoose.Schema(
  {
    TabName: {
      type: String,
      required: [true, 'A tab must have a name'],
    },
    Group: {
      unique: true,
      type: mongoose.Schema.ObjectId,
      ref: 'Group',
      required: [true, 'Please provide the Group ID'],
    },
  },
  {
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);

groupMemberTabSchema.plugin(idValidator);

groupMemberTabSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some thing relative
  },
);

const GroupMemberTab = mongoose.model('GroupMemberTab', groupMemberTabSchema);
module.exports = GroupMemberTab;
