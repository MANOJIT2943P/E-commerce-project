/**
 * Admin User Controller
 * Handles admin-only user management operations
 */

import { validationResult } from 'express-validator';
import { AUTH_MESSAGES } from '../../constants/messages.js';
import { ROLES } from '../../constants/roles.js';
import User from '../../models/User.js';

export const createAdmin = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { name, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: AUTH_MESSAGES.USER_EXISTS
      });
    }

    const adminUser = new User({
      name,
      email,
      passwordHash: password,
      role: ROLES.ADMIN,
      isActive: true
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user'
    });
  }
};
