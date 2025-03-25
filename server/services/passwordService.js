const User = require("../schema/userSchema");
const nodemailer = require("nodemailer");

let verificationCodes = {}; 

// Generate and send verification code
const sendVerificationCode = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("User not found");
  }

  const code = Math.floor(100000 + Math.random() * 900000); 
  verificationCodes[email] = code;

  // Configure email transporter
  var transporter = nodemailer.createTransport({
    service : "gmail",
    auth: {
      user: "kollideepika4@gmail.com",
      pass: "kmtg eqrd ybng pgte",
     },
  });

  await transporter.sendMail({
    from: "kollideepika4@gmail.com",
    to: email,
    subject: "Password Reset Code",
    text: `Your verification code is: ${code}`,
  });

  return { message: "Verification code sent to your email." };
};

// Verify the received code
const verifyUserCode = async (email, code) => {
  if (verificationCodes[email] && verificationCodes[email] == code) {
    delete verificationCodes[email]; // Remove code after verification
    return { success: true, message: "Code verified successfully" };
  } else {
    throw new Error("Invalid verification code");
  }
};

module.exports = { sendVerificationCode, verifyUserCode };
