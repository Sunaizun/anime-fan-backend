const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  const { title, content, rating, anime } = req.body;

  if (!title || !content || !rating || !anime?.malId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const review = await Review.create({
    title,
    content,
    rating,
    anime,
    user: req.userId
  });

  res.status(201).json(review);
};


exports.getMyReviews = async (req, res) => {
  const reviews = await Review.find({ user: req.userId }).sort({ createdAt: -1 });
  res.json(reviews);
};


exports.getReviewById = async (req, res) => {
  const review = await Review.findOne({ _id: req.params.id, user: req.userId });

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  res.json(review);
};


exports.updateReview = async (req, res) => {
  const { title, content, animeName, rating } = req.body;

  const review = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { title, content, animeName, rating },
    { new: true, runValidators: true }
  );

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  res.json(review);
};


exports.deleteReview = async (req, res) => {
  const review = await Review.findOneAndDelete({ _id: req.params.id, user: req.userId });

  if (!review) {
    return res.status(404).json({ message: 'Review not found' });
  }

  res.json({ message: 'Review deleted' });
};
