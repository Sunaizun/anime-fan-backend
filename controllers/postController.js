const Post = require('../models/Post');

exports.createPost = async (req, res, next) => {
  try {
    const { animeName, title, content } = req.body;

    if (!animeName || !title || !content) {
      return res.status(400).json({ message: "animeName, title and content are required" });
    }

    const userId = req.user?.id || req.user?._id || req.userId || req.user;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized (no user id)" });
    }

    const post = await Post.create({
      animeName,
      title,
      content,
      user: userId,
    });

    return res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

exports.getPosts = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.userId || req.user;
    if (!userId) return res.status(401).json({ message: "Unauthorized (no user id)" });

    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });
    return res.json(posts);
  } catch (err) {
    next(err);
  }
};


exports.getPostById = async (req, res, next) => {
  try {
    const post = await Post.findOne({ _id: req.params.id, user: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const { animeName, title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Title and content are required' });

    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { animeName, title, content },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json(post);
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!post) return res.status(404).json({ message: 'Post not found' });
    return res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};
