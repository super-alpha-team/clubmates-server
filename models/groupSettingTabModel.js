const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');

const groupSettingTabSchema = new mongoose.Schema(
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

groupSettingTabSchema.plugin(idValidator);

groupSettingTabSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some thing relative
  },
);

const GroupSettingTab = mongoose.model('GroupSettingTab', groupSettingTabSchema);
module.exports = GroupSettingTab;
