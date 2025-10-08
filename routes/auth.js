const express = require('express');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const { generateToken } = require('../utils/token');
const { sendEmailOTP } = require('../services/otpService');

const prisma = new PrismaClient();
const router = express.Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    let user = await prisma.user.findUnique({ where: { email } });
    if (user && user.status === 'ACTIVE')
      return res.status(400).json({ message: 'User already registered' });

    if (!user)
      user = await prisma.user.create({ data: { email, name, password } });

    await sendEmailOTP(user);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const valid =
    user.otp === otp && user.otpExpiresAt && user.otpExpiresAt > new Date();

  if (!valid)
    return res.status(400).json({ message: 'Invalid or expired OTP' });

  await prisma.user.update({
    where: { email },
    data: { otp: null, otpExpiresAt: null, status: 'ACTIVE' }
  });

  res.json({ message: 'Email verified successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = generateToken(user.id);
    res.json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Send OTP



module.exports = router;
