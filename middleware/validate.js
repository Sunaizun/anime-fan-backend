exports.validateReview = (req, res, next) => {
  const { title, content, animeName, rating } = req.body;

  if (!title || !content || !animeName) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (rating < 1 || rating > 10) {
    return res.status(400).json({ message: 'Rating must be 1–10' });
  }

  next();
};
