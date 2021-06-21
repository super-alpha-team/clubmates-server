const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const convVie = require('../utils/convVie.js');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A Club must have a name'],
      trim: true,
    },
    textSearch: {
      type: String,
      select: false,
    },
    description: {
      type: String,
      required: [true, 'A Club must have content'],
    },
    member: [{
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
      },
      role: {
        type: String,
        enum: ['collaborator','manager', 'member'],
        default: 'member',
      }
    }],
    category: {
      type: String,
      enum: ['Học thuật','Tình nguyện', 'Phong trào', 'Văn nghệ'],
      default: 'Phong trào',
    },
    createAt: {
      type: Date,
      default: Date.now(), // Mongoose will auto convert to today's date
    },
  },
  {
    toJSON: { virtuals: true }, // pass the virtuals properties to JSON
    toObject: { virtuals: true }, // --                        -- Object
  },
);


// mongo’s full-text search,
// we need to create indexes for the fields we need to search.
clubSchema.index({textSearch: 'text'});

// Virtual populate for show up child referencing
clubSchema.virtual('clubGroups', {
  ref: 'ClubGroup',
  foreignField: 'club',
  localField: '_id',
});

clubSchema.plugin(idValidator);

clubSchema.pre('save',async function (next) {
  this.textSearch = convVie(this.name).toLowerCase();
  next();
});

clubSchema.post('save', function() {
  await this.model('Notification').create({
    content: `Your Club is created`,
    link: this._id,
    user: this.member.user
  })
});

// QUERY MIDDLEWARE - auto pupulate user in answer
clubSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'member',
  //   select: '_id name photo', // just show name + photo and hide everything else for security
  // })
  // .populate({
  //   path: 'answers',
  //   select: '_id showcase'
  // });
  next();
});

// all middleware are trigger
clubSchema.pre(
  /findOneAndUpdate|updateOne|update/ ,
  function(next) {
    const docUpdate = this.getUpdate();
    if (!docUpdate || !docUpdate.name) return next();
    this.findOneAndUpdate({}, { textSearch: convVie(docUpdate.name).toLowerCase() });
    return next();
});

clubSchema.post(
  /findOneAndDelete|findOneAndRemove|deleteOne|remove/,
  { document: true },
  async function () {
    await this.model('ClubGroup').deleteMany({ club: this._id });
  },
);

const Club = mongoose.model('Club', clubSchema);
module.exports = Club;
