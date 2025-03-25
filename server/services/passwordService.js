const bcrypt = require("bcrypt");
const User = require("../schema/userSchema");
const nodemailer = require("nodemailer");

let verificationCodes = {}; // Store verification codes temporarily

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
    service: "gmail",
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

// Verify user code and optionally update the password
const verifyUserCode = async (email, code, newPassword) => {
  console.log("Stored Codes:", verificationCodes);
  console.log("Checking Email:", email, "Code Entered:", code);

  // Convert both values to string before comparing
  const storedCode = String(verificationCodes[email] || "").trim();
  const enteredCode = String(code || "").trim();

  console.log(`Comparing Stored Code: "${storedCode}" with Entered Code: "${enteredCode}"`);

  if (storedCode !== enteredCode) {
    console.log("Code mismatch! Expected:", storedCode, "Received:", enteredCode);
    throw new Error("Invalid verification code");
  }

  // If a new password is provided, update it
  if (newPassword) {
    return await updatePassword(email, newPassword);
  }

  return { success: true, message: "Code verified successfully" };
};

// Update the user's password
const updatePassword = async (email, newPassword) => {
  console.log("Updating password for:", email);

  if (!newPassword || newPassword.trim() === "") {
    throw new Error("New password cannot be empty");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await User.updateOne({ email }, { $set: { password: hashedPassword } });

  delete verificationCodes[email]; // Remove the used code

  return { success: true, message: "Password updated successfully" };
};

module.exports = { sendVerificationCode, verifyUserCode, updatePassword };
