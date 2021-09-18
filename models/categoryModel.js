const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  CateName: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: [true, 'Category name is unique'],
  },
  CateDes: {
    type: String,
  },
});

// Create Category collection
const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
