const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

async function sendEmailOTP(user) {
   try{

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await prisma.User.update({
    where: { email: user.email },
    data: { otp, otpExpiresAt: expiresAt }
  });

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: user.email,
    subject: 'Your verification code for HiTouch CX',
    text: `Your OTP is ${otp}. It expires in 15 minutes.`
  });
   }
   catch(error){
    console.log("Error Occured while sending OTP",error)
   }
}

module.exports = { sendEmailOTP };
