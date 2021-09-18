const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const { isEmail } = require('validator');

const groupActivityTabSchema = new mongoose.Schema(
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

    ActivityTitle: {
      type: String,
      required: [true, 'A Activity must have a name'],
      trim: true,
    },
    ActivitySlug: {
      type: String,
      unique: true,
    },
    ActivityTitleTextSearch: {
      type: String,
      select: false,
    },
    ActivityDes: {
      type: String,
      required: [true, 'A Activity must have content'],
    },
    ActivityDesTextSearch: {
      type: String,
      select: false,
    },
    ActivityLogoUrl: {
      type: String,
      required: [true, 'A Activity must have logo'],
    },
    ActivityPhotosUrl: {
      type: [String],
      validate: [(value) => value.length > 0, 'Please provide image'],
    },
    ActivityCate: {
      ref: 'Category',
      type: mongoose.Schema.ObjectId,
      required: [true, 'Know category this Activity'],
    },
    ActivityWebsite: {
      type: String,
      required: [true, 'A Activity must have website link'],
    },
    ActivityLocation: {
      type: String,
      required: [true, 'A Activity must have location'],
    },
    ActivityColor: {
      type: String,
      required: [true, 'A Activity must have main color'],
    },
    ActivityNumberPhone: {
      type: String,
      required: [true, 'A Activity must have number phone to contact'],
    },
    ActivityEmail: {
      type: String,
      required: [true, 'A Activity must have Email'],
      validate: [isEmail, 'Please provide a valid email'],
      uniqueCaseInsensitive: true, // dont care lower or upper case
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);
groupActivityTabSchema.index({ ActivityTitleTextSearch: 'text', ActivityDesTextSearch: 'text' });
groupActivityTabSchema.index({ ActivitySlug: 1 });

groupActivityTabSchema.plugin(idValidator);

groupActivityTabSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some thing relative
  },
);

const GroupActivityTab = mongoose.model('GroupActivityTab', groupActivityTabSchema);
module.exports = GroupActivityTab;
