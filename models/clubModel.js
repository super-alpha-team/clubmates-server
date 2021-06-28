const mongoose = require('mongoose');
const idValidator = require('mongoose-id-validator');
const convVie = require('../utils/convVie.js');

// const ClubMemberSchema = new mongoose.Schema({ 
//   user: {
//     type: mongoose.Schema.ObjectId,
//     ref: 'User',
//     unique: [true, 'User only has a role'],
//   },
//   role: {
//     type: String,
//     enum: ['collaborator','manager', 'member', 'requested'],
//     default: 'member',
//   }
// });

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
    photo: {
      type: String,
      default() {
        return `https://via.placeholder.com/150?text=${this.name.charAt(0)}`;
      },
    },
    member: {
      type: [{
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          // unique: [true, 'User only has a role'],
        },
        role: {
          type: String,
          enum: ['collaborator','manager', 'member', 'requested'],
          default: 'member',
        }}
      ],
      select: false,
    },
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

clubSchema.post('save', async function() {
  await this.model('Notification').create({
    content: `Your Club is created`,
    link: this._id,
    user: this.member[0].user
  })
  await this.model("ClubGroup").create({
    name: this.name,
    description: `${this.name} - description`,
    member: [{
      user: this.member[0].user,
      role: "manager",
    }],
    isMain: true,
    club: this._id
  })
});

// QUERY MIDDLEWARE - auto pupulate user in answer
clubSchema.pre(/^find/, function (next) {
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
