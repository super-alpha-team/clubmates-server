const mongoose = require('mongoose');
const slugify = require('slugify');
const idValidator = require('mongoose-id-validator');
const { isEmail } = require('validator');
const convVie = require('../utils/convVie');

const clubSchema = new mongoose.Schema(
  {
    ClubTitle: {
      type: String,
      required: [true, 'A Club must have a name'],
      trim: true,
    },
    ClubSlug: {
      type: String,
      unique: true,
    },
    ClubTitleTextSearch: {
      type: String,
      select: false,
    },
    ClubDes: {
      type: String,
      required: [true, 'A Club must have content'],
    },
    ClubDesTextSearch: {
      type: String,
      select: false,
    },
    ClubLogoUrl: {
      type: String,
      required: [true, 'A Club must have logo'],
    },
    ClubPhotosUrl: {
      type: [String],
      validate: [(value) => value.length > 0, 'Please provide image'],
    },
    ClubCate: {
      ref: 'Category',
      type: mongoose.Schema.ObjectId,
      required: [true, 'Know category this club'],
    },
    ClubWebsite: {
      type: String,
      required: [true, 'A Club must have website link'],
    },
    ClubLocation: {
      type: String,
      required: [true, 'A Club must have location'],
    },
    ClubColor: {
      type: String,
      required: [true, 'A Club must have main color'],
    },
    ClubNumberPhone: {
      type: String,
      required: [true, 'A Club must have number phone to contact'],
    },
    ClubEmail: {
      type: String,
      required: [true, 'A Club must have Email'],
      validate: [isEmail, 'Please provide a valid email'],
      uniqueCaseInsensitive: true, // dont care lower or upper case
    },

    activityQuantity: {
      type: Number,
      default: 0,
    },

    createBy: {
      ref: 'User',
      type: mongoose.Schema.ObjectId,
      required: [true, 'Know who create this'],
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);

// mongo’s full-text search,
// we need to create indexes for the fields we need to search.
clubSchema.index({ ClubTitleTextSearch: 'text', ClubDesTextSearch: 'text' });
clubSchema.index({ ClubSlug: 1 });

// group this is main group
// Virtual populate for show up child referencing
clubSchema.virtual('Group', {
  ref: 'Group',
  foreignField: 'Club',
  localField: '_id',
});

clubSchema.plugin(idValidator);

clubSchema.methods.isJoined = function (userId) {
  this.isJoined = userId === 'joined';
  // populate clubmember
  // check user
};

clubSchema.pre('save', async function (next) {
  this.ClubTitleTextSearch = convVie(this.ClubTitle).toLowerCase();
  this.ClubSlug = slugify(convVie(this.ClubTitle), { lower: true });
  this.ClubDesTextSearch = convVie(this.ClubDes).toLowerCase();
  this.memberQuantity = 1;
  next();
});

clubSchema.post('save', async () => {
  this.model('Notification').create({
    content: 'Your Club is created',
    link: this._id,
    user: this.createBy,
  });

  // TODO - add group main auto
  this.model('Group').create({
    GroupName: this.name,
    GroupIntro: `${this.name} - introduction`,

    isMain: true,
    Club: this._id,

    memberQuantityL: 1,
    createBy: this.createBy,
  });
});

// QUERY MIDDLEWARE - auto pupulate category
clubSchema.pre(/^find/, (next) => {
  this.populate({
    path: 'ClubCate',
    select: '_id CateName',
  });
  next();
});

// all middleware are trigger auto
clubSchema.pre(
  /findOneAndUpdate|updateOne|update/,
  function (next) {
    const docUpdate = this.getUpdate();
    if (!docUpdate) return next();
    const updateDocs = {};
    if (docUpdate.ClubTitle) {
      updateDocs.ClubTitleTextSearch = convVie(docUpdate.ClubTitle).toLowerCase();
      updateDocs.ClubSlug = slugify(convVie(docUpdate.ClubTitle), { lower: true });
    }
    if (docUpdate.ClubDes) {
      updateDocs.ClubDes = convVie(docUpdate.ClubDesTextSearch).toLowerCase();
    }
    // update
    this.findOneAndUpdate({}, updateDocs, { runValidators: true, context: 'query' });
    return next();
  },
);

clubSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async () => {
    // TODO - delete some thing relative club
    // await this.model('ClubGroup').deleteMany({ club: this._id });
  },
);

const Club = mongoose.model('Club', clubSchema);
module.exports = Club;
