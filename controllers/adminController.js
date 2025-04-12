const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.getAllUsers = async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ message: 'No token' });

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });

    const users = await User.find();
    res.status(200).json(users);
  } catch (err) {
    res.status(401).json({ message: 'Unauthorized' });
  }
};
