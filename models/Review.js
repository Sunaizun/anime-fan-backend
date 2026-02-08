const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },

    anime: {
      malId: { type: Number, required: true },     
      name: { type: String, required: true },
      image: { type: String },
      score: { type: Number }
    },

    rating: { type: Number, min: 1, max: 10, required: true },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);

