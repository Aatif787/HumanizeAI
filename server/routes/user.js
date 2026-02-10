const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Humanization = require('../models/Humanization');
const logger = require('../config/logger');

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role || 'user',
        subscription: user.subscription || { plan: 'free', isActive: true },
        preferences: user.preferences || {
          defaultStyle: 'casual',
          darkMode: false,
          language: 'en',
          notifications: { email: true, browser: true }
        },
        usage: user.usage || {
          dailyCount: 0,
          monthlyCount: 0,
          totalCount: 0,
          lastReset: new Date()
        },
        lastLogin: user.lastLogin || new Date(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.patch('/profile', [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('preferences.defaultStyle')
    .optional()
    .isIn(['academic', 'casual', 'creative', 'professional', 'technical', 'persuasive', 'narrative'])
    .withMessage('Invalid default style'),
  body('preferences.darkMode')
    .optional()
    .isBoolean()
    .withMessage('Dark mode must be a boolean'),
  body('preferences.language')
    .optional()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be between 2 and 5 characters'),
  body('preferences.notifications.email')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('preferences.notifications.browser')
    .optional()
    .isBoolean()
    .withMessage('Browser notifications must be a boolean')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { username, preferences } = req.body;
    const updates = {};

    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      updates.username = username;
    }

    if (preferences) {
      updates.preferences = {
        ...user.preferences,
        ...preferences
      };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updatedUser = await User.updateUser(user._id, updates);

    logger.info(`User profile updated: ${user.username} (${user._id})`);

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role || 'user',
        subscription: updatedUser.subscription || { plan: 'free', isActive: true },
        preferences: updatedUser.preferences,
        usage: updatedUser.usage,
        lastLogin: updatedUser.lastLogin,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get user statistics
router.get('/stats', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [userStats] = await Humanization.getUserStats(user._id);

    res.json({
      stats: userStats
    });
  } catch (error) {
    next(error);
  }
});

// Get user usage limits
router.get('/limits', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const usageCheck = user.canMakeRequest();

    res.json({
      limits: usageCheck.limits,
      current: {
        daily: user.usage.dailyCount,
        monthly: user.usage.monthlyCount,
        total: user.usage.totalCount
      },
      remaining: {
        daily: usageCheck.dailyRemaining,
        monthly: usageCheck.monthlyRemaining
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
