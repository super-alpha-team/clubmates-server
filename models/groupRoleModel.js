const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');

const groupRoleSchema = new mongoose.Schema(
  {
    RoleName: {
      type: String,
      required: [true, 'A Role must have a name'],
    },
    Group: {
      type: mongoose.Schema.ObjectId,
      ref: 'Group',
      required: [true, 'Please provide the Group ID'],
    },

    isMain: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);

// unique 2 paramse
groupRoleSchema.index({ RoleName: 1, Group: 1 }, { unique: true });

// TODO - get list Role Permission
// Virtual populate for show up child referencing
// clubSchema.virtual('Permission', {
//   ref: 'GroupPermission',
//   foreignField: 'club',
//   localField: '_id',
// });

groupRoleSchema.plugin(idValidator);

groupRoleSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some thing relative group role
  },
);

const groupRole = mongoose.model('GroupRole', groupRoleSchema);
module.exports = groupRole;
