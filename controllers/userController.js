const User = require('../models/User');

exports.getProfile = async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json(user);
};

exports.updateProfile = async (req, res) => {
  const { username, email } = req.body;

  const user = await User.findByIdAndUpdate(
    req.userId,
    { username, email },
    { new: true, runValidators: true }
  ).select('-password');

  res.json(user);
};
