const User = require('../models/User');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
require('dotenv').config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendOTP = async (req, res) => {
  const { mobile } = req.body;

  try {
    await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verifications.create({ to: `+91${mobile}`, channel: 'sms' });

    res.status(200).json({ message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

exports.verifyOTP = async (req, res) => {
  const { name, rollNumber, mobile, email, branch, otp } = req.body;

  try {
    const verification_check = await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID)
      .verificationChecks.create({ to: `+91${mobile}`, code: otp });

    if (verification_check.status === 'approved') {
      const existingUser = await User.findOne({ mobile });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });

      const newUser = new User({ name, rollNumber, mobile, email, branch, isVerified: true });
      await newUser.save();
      res.status(201).json({ message: 'User verified and saved' });
    } else {
      res.status(400).json({ message: 'Invalid OTP' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Verification failed' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Admin Login
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });
    return res.status(200).json({ message: 'Admin logged in', role: 'admin', token });
  }

  // User Login
  const user = await User.findOne({ email });
  if (!user || !user.isVerified) return res.status(400).json({ message: 'User not found or not verified' });

  const token = jwt.sign({ role: 'user', userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.status(200).json({ message: 'User logged in', role: 'user', token });
};
