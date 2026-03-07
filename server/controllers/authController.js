
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Otp from "../models/Otp.js";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  console.error("CRITICAL: GOOGLE_CLIENT_ID is not defined in environment variables.");
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'fallback_refresh_secret';

// ... imports ...

export const verifyGoogleToken = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: "Google token is required" });
  }

  if (!GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: "Server configuration error: Missing Google Client ID" });
  }

  let googleId, email, name, picture;

  try {
    // 1. Try as ID Token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    googleId = payload.sub;
    email = payload.email;
    name = payload.name;
    picture = payload.picture;
  } catch (idTokenError) {
    console.warn(`[Google Auth] ID Token verification failed: ${idTokenError.message}. Trying as Access Token...`);

    // 2. Try as Access Token
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to verify access token');

      const payload = await response.json();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } catch (accessTokenError) {
      return res.status(401).json({ message: "Invalid Google token" });
    }
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ googleId }, { email: email.toLowerCase() }]
    });
    // ... rest of logic ...

    if (existingUser) {
      // User exists, log them in
      const accessToken = jwt.sign(
        {
          email: existingUser.email,
          userType: existingUser.userType,
          name: existingUser.name,
          userId: existingUser._id
        },
        JWT_SECRET,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { userId: existingUser._id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
      );

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.status(200).json({
        exists: true,
        message: "Login successful",
        accessToken,
        user: {
          email: existingUser.email,
          userType: existingUser.userType,
          name: existingUser.name,
          userId: existingUser._id,
          personalInfo: existingUser.personalInfo,
          profileImage: existingUser.profileImage
        }
      });
    }

    // Return verification success and user info for step 3 (Signup)
    res.status(200).json({
      exists: false,
      message: "Google token verified successfully",
      googleData: {
        email: email.toLowerCase(),
        name,
        googleId,
        picture
      }
    });

  } catch (error) {
    console.error("Error verifying Google token:", error);
    res.status(401).json({ message: "Invalid Google token", error: error.message });
  }
}

// Google Callback (Passport)
export const googleCallback = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.redirect('/login');

    // Generate Tokens
    const accessToken = jwt.sign(
      {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Set Refresh Cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Must match session config
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    // Redirect to Client Dashboard
    // Use CLIENT_URL from env or fallback
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    res.redirect(`${clientUrl}/dashboard?token=${accessToken}`);

  } catch (error) {
    console.error("Google Callback Error:", error);
    res.redirect('/login?error=auth_failed');
  }
};

// Register User
export const registerUser = async (req, res) => {
  const { email, password, userType, name, googleId } = req.body;

  if (!email || !password || !userType || !name) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        ...(googleId ? [{ googleId }] : [])
      ]
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      email: email.toLowerCase(),
      password: hashedPassword,
      userType,
      name,
      googleId
    });

    await newUser.save();

    // Generate tokens for auto-login
    const accessToken = jwt.sign(
      {
        email: newUser.email,
        userType: newUser.userType,
        name: newUser.name,
        userId: newUser._id
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { userId: newUser._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      message: "User registered successfully",
      accessToken,
      user: {
        email: newUser.email,
        userType: newUser.userType,
        name: newUser.name,
        userId: newUser._id,
        personalInfo: newUser.personalInfo,
        profileImage: newUser.profileImage
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Find user in MongoDB
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate Access Token (15 min)
    const accessToken = jwt.sign(
      {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Generate Refresh Token (7 days)
    const refreshToken = jwt.sign(
      { userId: user._id },
      REFRESH_TOKEN_SECRET,
      { expiresIn: "7d" }
    );

    // Send Refresh Token as HttpOnly Cookie
    res.cookie('jwt', refreshToken, {
      httpOnly: true, // accessible only by web server
      secure: process.env.NODE_ENV === 'production', // https only
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // cross-site cookie
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({
      message: "Login successful",
      accessToken, // Send access token to client
      user: {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id,
        personalInfo: user.personalInfo,
        profileImage: user.profileImage
      }
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Refresh Token
export const refresh = async (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

  const refreshToken = cookies.jwt;

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    // Generate new Access Token
    const accessToken = jwt.sign(
      {
        email: user.email,
        userType: user.userType,
        name: user.name,
        userId: user._id
      },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.json({ accessToken });

  } catch (err) {
    return res.status(403).json({ message: 'Forbidden' });
  }
};

// Logout User
export const logoutUser = (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
  res.json({ message: 'Cookie cleared' });
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
};

// Protected route example
export const getProfile = async (req, res) => {
  try {
    // Get fresh user data from database
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({ message: "Error getting profile", error: error.message });
  }
};

/* -------------------- OTP SYSTEM -------------------- */
import { sendEmail } from "../services/emailService.js";

// Send OTP
export const sendOtp = async (req, res) => {
  const { email, type } = req.body; // type can be 'register' or 'reset'

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (type === 'register' && user) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (type === 'reset' && !user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Save to DB
    await Otp.create({
      email: email.toLowerCase(),
      otp,
      expires: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
    });

    // Send Email
    const subject = type === 'register' ? "Mockeefy Registration OTP" : "Mockeefy Password Reset OTP";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2563eb;">${subject}</h2>
        <p>Your OTP is:</p>
        <h1 style="background: #f3f4f6; padding: 10px; display: inline-block; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
        <br>
        <p>Best regards,<br>Mockeefy Team</p>
      </div>
    `;

    await sendEmail({ to: email, subject, html });

    res.json({ success: true, message: "OTP sent successfully" });

  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP are required" });
  }

  try {
    // Check latest OTP
    const record = await Otp.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });

    if (!record) {
      return res.status(400).json({ message: "OTP expired or invalid" });
    }

    if (record.otp !== parseInt(otp)) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expires < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.json({ success: true, message: "OTP verified successfully" });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "Error verifying OTP" });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    // 1. Verify OTP again
    const record = await Otp.findOne({ email: email.toLowerCase() }).sort({ createdAt: -1 });

    if (!record || record.otp !== parseInt(otp) || record.expires < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // 2. Hash New Password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update User
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { password: hashedPassword },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 4. Cleanup OTPs
    await Otp.deleteMany({ email: email.toLowerCase() });

    res.json({ success: true, message: "Password reset successfully" });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};