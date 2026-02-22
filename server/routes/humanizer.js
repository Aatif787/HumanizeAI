const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Humanization = require('../models/Humanization');
const AdvancedHumanizer = require('../services/AdvancedHumanizer');
const logger = require('../config/logger');

const router = express.Router();

// Initialize humanizer service
const humanizerService = new AdvancedHumanizer();

// Validation middleware
const validateHumanization = [
  body('text')
    .isLength({ min: 10, max: 50000 })
    .withMessage('Text must be between 10 and 50,000 characters'),
  body('style')
    .optional()
    .isIn(['academic', 'casual', 'creative', 'professional', 'technical', 'persuasive', 'narrative'])
    .withMessage('Invalid style'),
  body('complexity')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid complexity level'),
  body('errorLevel')
    .optional()
    .isIn(['minimal', 'moderate', 'high'])
    .withMessage('Invalid error level'),
  body('useAdvanced')
    .optional()
    .isBoolean()
    .withMessage('useAdvanced must be a boolean')
];

// Humanize text endpoint
router.post('/', async (req, res, next) => {
  try {
    // const errors = validationResult(req);
    // if (!errors.isEmpty()) {
    //   return res.status(400).json({ errors: errors.array() });
    // }

    // Mock user for public access
    const user = { _id: 'public_user', username: 'Guest', usage: { dailyCount: 0, monthlyCount: 0, totalCount: 0 }, save: async () => {} };
    
    // const user = await User.findById(req.user.userId);
    // if (!user) {
    //   return res.status(404).json({ error: 'User not found' });
    // }

    // Check usage limits
    // const usageCheck = user.canMakeRequest();
    // if (!usageCheck.canProceed) {
    //   return res.status(429).json({
    //     error: 'Daily/monthly limit exceeded',
    //     dailyRemaining: usageCheck.dailyRemaining,
    //     monthlyRemaining: usageCheck.monthlyRemaining
    //   });
    // }

    const {
      text,
      style = user.preferences?.defaultStyle || 'casual',
      complexity = 'medium',
      emotion = 'neutral',
      formality = 'medium',
      errorLevel = 'moderate',
      synonymLevel = 'medium',
      sentenceLevel = 'moderate',
      useAdvanced = true
    } = req.body;

    const startTime = Date.now();

    // Humanize the text
    let humanizedText;
    let detectionAnalysis;

    if (useAdvanced) {
      // Use advanced humanization pipeline
      const result = await humanizerService.humanizeAdvanced(text, {
        style,
        complexity,
        emotion,
        formality,
        errorLevel,
        synonymLevel,
        sentenceLevel
      });
      humanizedText = result.text;
      detectionAnalysis = result.detectionAnalysis;
    } else {
      // Use basic humanization
      humanizedText = await humanizerService.humanizeBasic(text, {
        style,
        complexity,
        emotion,
        formality
      });
      detectionAnalysis = {
        overallScore: 75,
        riskLevel: 'medium',
        patterns: []
      };
    }

    const processingTime = Date.now() - startTime;

    // Create humanization record
    const humanization = new Humanization({
      user: user._id,
      originalText: text,
      humanizedText,
      settings: {
        style,
        complexity,
        emotion,
        formality,
        errorLevel,
        synonymLevel,
        sentenceLevel,
        useAdvanced
      },
      results: {
        confidenceScore: detectionAnalysis.overallScore,
        detectionAnalysis,
        processingTime,
        characterCount: {
          original: text.length,
          humanized: humanizedText.length
        }
      },
      metadata: {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        deviceType: req.headers['user-agent']?.includes('Mobile') ? 'mobile' : 'desktop',
        browser: req.headers['user-agent']?.split(' ').pop(),
        os: req.headers['user-agent']?.match(/\(([^)]+)\)/)?.[1]
      },
      isNew: true
    });

    await humanization.save();

    // Update user usage
    user.usage.dailyCount++;
    user.usage.monthlyCount++;
    user.usage.totalCount++;
    await user.save();

    logger.info(`Text humanized for user ${user.username} (${user._id})`);

    res.json({
      message: 'Text humanized successfully',
      data: {
        id: humanization._id,
        originalText: text,
        humanizedText,
        settings: humanization.settings,
        results: humanization.results,
        usage: {
          dailyRemaining: usageCheck.dailyRemaining - 1,
          monthlyRemaining: usageCheck.monthlyRemaining - 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get humanization history
router.get('/history', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { style, startDate, endDate, isFavorite } = req.query;

    const filter = { user: req.user.userId };

    if (style) {
      filter['settings.style'] = style;
    }

    if (isFavorite !== undefined) {
      filter.isFavorite = isFavorite === 'true';
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.createdAt.$lte = new Date(endDate);
      }
    }

    const humanizations = await Humanization.find(filter, { skip, limit });
    const total = await Humanization.countDocuments(filter);

    res.json({
      data: humanizations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get single humanization
router.get('/:id', async (req, res, next) => {
  try {
    const humanization = await Humanization.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!humanization) {
      return res.status(404).json({ error: 'Humanization not found' });
    }

    res.json({
      data: humanization
    });
  } catch (error) {
    next(error);
  }
});

// Update humanization (add feedback, favorite, etc.)
router.patch('/:id', [
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite must be a boolean'),
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const humanization = await Humanization.findOne({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!humanization) {
      return res.status(404).json({ error: 'Humanization not found' });
    }

    const { isFavorite, rating, comment, tags, folder } = req.body;

    if (isFavorite !== undefined) {
      humanization.isFavorite = isFavorite;
    }

    if (rating !== undefined || comment !== undefined) {
      humanization.feedback = {
        ...humanization.feedback,
        ...(rating !== undefined && { rating }),
        ...(comment !== undefined && { comment })
      };
    }

    if (tags !== undefined) {
      humanization.tags = tags;
    }

    if (folder !== undefined) {
      humanization.folder = folder;
    }

    await humanization.save();

    res.json({
      message: 'Humanization updated successfully',
      data: humanization
    });
  } catch (error) {
    next(error);
  }
});

// Delete humanization
router.delete('/:id', async (req, res, next) => {
  try {
    const humanization = await Humanization.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!humanization) {
      return res.status(404).json({ error: 'Humanization not found' });
    }

    res.json({
      message: 'Humanization deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
