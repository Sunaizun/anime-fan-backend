const Review = require('../models/Review');

exports.createReview = async (req, res, next) => {
  try {
    const { postId, content, rating } = req.body;

    if (!postId || !content || rating === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const r = Number(rating);
    if (Number.isNaN(r) || r < 1 || r > 10) {
      return res.status(400).json({ message: "Rating must be 1–10" });
    }

    const review = await Review.create({
      post: postId,
      content,
      rating: r,
      user: req.user.id
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
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
