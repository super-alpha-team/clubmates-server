const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator'); // plugin for unique field
const { isEmail } = require('validator');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: [true, 'Please provide a userId'],
    unique: [true, 'UserID is unique'],
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [20, 'A name must have less than 21 characters'],
    minlength: [5, 'A name must have more than 4 characters'],
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: [true, 'Email is ready taken'],
    lowercase: true,
    validate: [isEmail, 'Please provide a valid email'],
    uniqueCaseInsensitive: true, // dont care lower or upper case
  },
  photo: {
    type: String,
    default() {
      return `https://via.placeholder.com/150?text=${this.name}`;
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  studentId: {
    type: String,
  },
  phone: {
    type: String,
  },
});

// add plugin and handle message for duplication err E11000
userSchema.plugin(uniqueValidator, {
  message: 'Error, {VALUE} is already taken',
});

userSchema.methods.toAuthJSON = function () {
  return {
    name: this.name,
    email: this.email,
    photo: this.photo,
    studentId: this.studentId,
    phone: this.phone,
  };
};

// Create User collection
const User = mongoose.model('User', userSchema);
module.exports = User;
