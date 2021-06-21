const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, 'Please type your content'],
      minlength: [10, 'A Notification must have more than 10 character'],
    },
    read: {
        type: Boolean,
        default: false,
    },
    createAt: {
      type: Date,
      default: Date.now(), // Mongoose will auto convert to today's date
    },
    link: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Notification must belong to an User'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
