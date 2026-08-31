const User = require('../models/User');
const Recipe = require('../models/Recipe');

exports.getUserHistory = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'history.recipeId',
      select: 'title image createdAt'
    });
    res.json(user.history);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load history' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};
