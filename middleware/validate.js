exports.validateReview = (req, res, next) => {
  const { content, rating, postId } = req.body;

  if (!postId || !content) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (rating === undefined || rating === null || rating === "") {
    return res.status(400).json({ message: "Rating is required" });
  }

  const r = Number(rating);
  if (Number.isNaN(r) || r < 1 || r > 10) {
    return res.status(400).json({ message: "Rating must be 1-10" });
  }

  next();
};
