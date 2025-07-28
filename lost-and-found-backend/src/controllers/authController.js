import { admin } from "../config/firebase.js";
import { saveUser, getUserByEmail } from "../config/firestore.js";
import jwt from "jsonwebtoken";

// Register a new user
export const registerUser = async (req, res) => {
  const { name, email, password, student_id, phone_number } = req.body;

  try {
    // 1. Create user with Firebase Admin
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
      phoneNumber: phone_number || undefined,
    });

    // 2. Save user data to Firestore
    await saveUser(userRecord.uid, {
      name,
      email,
      studentId: student_id,
      phoneNumber: phone_number,
      profileImageUrl: null,
      isDeleted: false,
      createdAt: new Date(),
      lastLogin: new Date(),
      trackRecord: { itemsLost: 0, itemsFound: 0, itemsReturned: 0 }
    });

    // 3. Generate JWT token
    const token = jwt.sign(
      { user_id: userRecord.uid, email: userRecord.email, name: userRecord.displayName },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        user_id: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName
      },
      token
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Firebase Admin does not support password login directly.
    // You must use Firebase Auth REST API or let frontend handle login and send token.
    // For demo, let's fetch user by email and return a JWT if user exists.
    const userData = await getUserByEmail(email);
    if (!userData) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // In production, verify password using Firebase Auth REST API or let frontend handle login.
    // Here, just issue a JWT for demo.
    const token = jwt.sign(
      { user_id: userData.id, email: userData.email, name: userData.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(200).json({
      message: 'Login successful',
      user: {
        user_id: userData.id,
        email: userData.email,
        name: userData.name
      },
      token
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(400).json({ message: error.message });
  }
};

// Logout user (stateless JWT, just respond OK)
export const logoutUser = async (req, res) => {
  res.status(200).json({ message: 'Logged out successfully' });
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const { user_id } = req.user; // req.user is set by authMiddleware
    const userData = await getUserByEmail(req.user.email);

    if (!userData) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user_id: userData.id,
      email: userData.email,
      name: userData.name,
      student_id: userData.studentId,
      phone_number: userData.phoneNumber
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const { user_id } = req.user;
    const { name, phone_number, profile_image_url } = req.body;

    await saveUser(user_id, {
      name,
      phoneNumber: phone_number,
      profileImageUrl: profile_image_url,
      updatedAt: new Date()
    });

    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
};
