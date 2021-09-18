const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');

const groupChatTabSchema = new mongoose.Schema(
  {
    TabName: {
      type: String,
      required: [true, 'A tab must have a name'],
    },
    Group: {
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

groupChatTabSchema.plugin(idValidator);

groupChatTabSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some thing relative
  },
);

const GroupChatTab = mongoose.model('GroupChatTab', groupChatTabSchema);
module.exports = GroupChatTab;
