const logger = require('../config/logger');
const path = require('path');
const { AdvancedTextHumanizer, AdvancedAIDetector } = require(path.join(__dirname, '../../advanced-humanizer.js'));

class HumanizerService {
  constructor() {
    this.humanizer = new AdvancedTextHumanizer();
    this.detector = new AdvancedAIDetector();
  }

  async humanizeAdvanced(text, options = {}) {
    try {
      logger.info(`Starting advanced humanization with options: ${JSON.stringify(options)}`);

      const startTime = Date.now();

      // Use the root advanced-humanizer logic
      const humanizedText = this.humanizer.humanizeText(text, {
        style: options.style || 'casual',
        intensity: options.complexity === 'high' ? 1.0 : (options.complexity === 'medium' ? 0.7 : 0.4),
        formality: options.formality || 'medium',
        errorLevel: options.errorLevel || 'moderate'
      });

      const processingTime = Date.now() - startTime;

      // Get detection analysis using the root detector
      const detectionAnalysis = this.detector.analyzeText(humanizedText);

      logger.info(`Advanced humanization completed in ${processingTime}ms`);

      return {
        text: humanizedText,
        detectionAnalysis: {
          overallScore: detectionAnalysis.overallScore,
          riskLevel: detectionAnalysis.riskLevel,
          patterns: detectionAnalysis.patterns
        },
        transformations: [
          'semantic_disassembly',
          'human_style_synthesis',
          'stylistic_reengineering',
          'plagiarism_elimination',
          'pattern_obfuscation',
          'human_verification'
        ],
        processingTime
      };
    } catch (error) {
      logger.error(`Advanced humanization failed: ${error.message}`);
      throw new Error(`Humanization failed: ${error.message}`);
    }
  }

  async humanizeBasic(text, options = {}) {
    try {
      logger.info(`Starting basic humanization with options: ${JSON.stringify(options)}`);

      const startTime = Date.now();

      // Basic humanization using root humanizer with low intensity
      const humanizedText = this.humanizer.humanizeText(text, {
        style: options.style || 'casual',
        intensity: 0.3,
        formality: 'low'
      });

      const processingTime = Date.now() - startTime;

      return {
        text: humanizedText,
        detectionAnalysis: {
          overallScore: 70,
          riskLevel: 'medium',
          patterns: []
        },
        processingTime
      };
    } catch (error) {
      logger.error(`Basic humanization failed: ${error.message}`);
      throw new Error(`Humanization failed: ${error.message}`);
    }
  }

  async analyzeDetectionRisk(text) {
    try {
      const analysis = this.detector.analyzeText(text);
      return {
        overallScore: analysis.overallScore,
        riskLevel: analysis.riskLevel,
        patterns: analysis.patterns
      };
    } catch (error) {
      logger.error(`Detection analysis failed: ${error.message}`);
      return {
        overallScore: 50,
        riskLevel: 'unknown',
        patterns: []
      };
    }
  }
}

module.exports = HumanizerService;
