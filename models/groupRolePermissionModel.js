const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');

const rolePermissionSchema = new mongoose.Schema(
  {
    PermissionName: {
      type: String,
      required: [true, 'A Permission must have a name'],
    },
    Role: {
      type: mongoose.Schema.ObjectId,
      ref: 'GroupPermission',
      required: [true, 'Please provide the class ID'],
    },

    Tab: {
      type: String, // TODO - add tab ID
    },
  },
  {
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);

// unique 2 paramse
rolePermissionSchema.index({ PermissionName: 1, Role: 1, Tab: 1 }, { unique: true });

rolePermissionSchema.plugin(idValidator);

rolePermissionSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some thing relative role permission
  },
);

const rolePermission = mongoose.model('RolePermission', rolePermissionSchema);
module.exports = rolePermission;
