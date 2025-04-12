const mongoose = require('mongoose');

// Define the schema for Bucket List Items
const bucketListItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  checked: {
    type: Boolean,
    default: false,
  },
  image_url: {
    type: String, // URL of the image
  },
  story: {
    type: String,
    default: null,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create the model from the schema
const BucketListItem = mongoose.model('BucketListItem', bucketListItemSchema);

module.exports = BucketListItem;
