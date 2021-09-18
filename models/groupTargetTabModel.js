const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');

const groupTargetTabSchema = new mongoose.Schema(
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

groupTargetTabSchema.plugin(idValidator);

groupTargetTabSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some thing relative
  },
);

const GroupTargerTab = mongoose.model('GroupChatTab', groupTargetTabSchema);
module.exports = GroupTargerTab;
