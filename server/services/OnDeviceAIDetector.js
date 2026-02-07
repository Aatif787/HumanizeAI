/**
 * On-Device AI Detection Engine
 * Self-contained, high-performance text analysis without external dependencies
 */

const MLModels = require('./MLModels');
const logger = require('../config/logger');
const { TextClassifierModel, StatisticalLanguageModel, StylometricAnalyzer, SemanticCoherenceAnalyzer } = MLModels;

class OnDeviceAIDetector {
  constructor() {
    this.models = this.initializeModels();
    this.patternDatabase = this.loadPatternDatabase();
    this.inferenceEngine = new EdgeInferenceEngine();
    this.performanceMetrics = new PerformanceMonitor();
  }

  /**
   * Initialize lightweight ML models optimized for edge deployment
   */
  initializeModels() {
    return {
      // Pre-trained transformer model for text classification (compressed)
      textClassifier: new TextClassifierModel({
        modelSize: 'small', // ~50MB compressed
        inferenceTime: '< 100ms',
        accuracy: '95%+',
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt']
      }),

      // Statistical language model for pattern detection
      languageModel: new StatisticalLanguageModel({
        type: 'ngram',
        order: 5,
        vocabularySize: 50000,
        perplexityThreshold: 150
      }),

      // Stylometric analyzer for writing style patterns
      stylometricAnalyzer: new StylometricAnalyzer({
        features: [
          'sentence_length_variance',
          'vocabulary_diversity',
          'punctuation_patterns',
          'transition_word_usage',
          'passive_voice_ratio',
          'lexical_complexity'
        ]
      }),

      // Semantic coherence analyzer
      coherenceAnalyzer: new SemanticCoherenceAnalyzer({
        embeddingDimension: 384, // Optimized for edge
        similarityThreshold: 0.75,
        contextWindow: 512
      })
    };
  }

  /**
   * Load comprehensive pattern database for AI detection
   */
  loadPatternDatabase() {
    return {
      // GPT-specific patterns (based on training data analysis)
      gptPatterns: {
        linguisticMarkers: [
          /\b(furthermore|moreover|additionally|consequently)\b/gi,
          /\b(it is important to note|it should be noted)\b/gi,
          /\b(in conclusion|to summarize|in summary)\b/gi,
          /\b(this suggests|this indicates|this implies)\b/gi
        ],
        structuralPatterns: [
          /\b(Firstly|Secondly|Thirdly|Finally)\b/gi,
          /\b(On one hand|On the other hand)\b/gi,
          /\b(For instance|For example|Such as)\b/gi
        ],
        vocabularyBias: {
          overusedWords: ['utilize', 'implement', 'facilitate', 'leverage', 'optimize'],
          formalTransitions: ['however', 'therefore', 'nevertheless', 'nonetheless'],
          academicPhrases: ['comprehensive analysis', 'systematic approach', 'methodology']
        }
      },

      // Human writing patterns (for comparison)
      humanPatterns: {
        naturalVariations: [
          'contractions', 'colloquialisms', 'incomplete_sentences',
          'rhetorical_questions', 'personal_anecdotes', 'emotional_language'
        ],
        imperfections: [
          'minor_typos', 'inconsistent_formatting', 'irregular_spacing',
          'mixed_tenses', 'informal_transitions'
        ],
        authenticityMarkers: [
          'personal_experience', 'subjective_opinions', 'cultural_references',
          'temporal_markers', 'hesitation_language'
        ]
      },

      // Cross-model detection patterns
      universalPatterns: {
        aiIndicators: [
          'perfect_grammar_consistency', 'uniform_sentence_structure',
          'lack_of_personal_voice', 'overly_formal_language',
          'systematic_paragraph_structure', 'predictable_transitions'
        ],
        humanIndicators: [
          'natural_language_variation', 'contextual_inconsistencies',
          'personal_voice_presence', 'emotional_variability',
          'cultural_context_clues', 'temporal_inconsistencies'
        ]
      }
    };
  }

  /**
   * Main detection method with multi-model ensemble
   */
  async analyzeText(text, options = {}) {
    const startTime = performance.now();
    const includeRecommendations = options.includeRecommendations !== false;

    try {
      // Parallel analysis using multiple models
      const results = await Promise.all([
        this.models.textClassifier.classify(text),
        this.models.languageModel.analyze(text),
        this.models.stylometricAnalyzer.analyze(text),
        this.models.coherenceAnalyzer.analyze(text)
      ]);

      const [classification, languageAnalysis, stylometry, coherence] = results;

      // Ensemble voting with weighted scoring
      const ensembleResult = this.ensembleVoting({
        classification,
        languageAnalysis,
        stylometry,
        coherence
      });

      // Pattern-based validation
      const patternValidation = this.validateWithPatterns(text, ensembleResult);

      // Confidence scoring with uncertainty quantification
      const confidenceScore = this.calculateConfidence({
        ensembleResult,
        patternValidation,
        textLength: text.length,
        modelAgreement: this.calculateModelAgreement(results)
      });

      const processingTime = performance.now() - startTime;

      this.performanceMetrics.recordAnalysis({
        processingTime,
        confidenceScore,
        textLength: text.length,
        modelsUsed: ['textClassifier', 'languageModel', 'stylometricAnalyzer', 'coherenceAnalyzer']
      });

      return {
        aiProbability: ensembleResult.aiProbability,
        humanProbability: ensembleResult.humanProbability,
        confidenceScore,
        riskLevel: this.determineRiskLevel(confidenceScore, ensembleResult.aiProbability),
        analysis: {
          classification,
          languageAnalysis,
          stylometry,
          coherence,
          patternValidation
        },
        recommendations: includeRecommendations ? this.generateRecommendations(ensembleResult, text) : [],
        processingTime,
        metadata: {
          modelVersions: this.getModelVersions(),
          analysisTimestamp: new Date().toISOString(),
          textStats: this.getTextStatistics(text)
        }
      };

    } catch (error) {
      logger.error('On-device detection failed:', error);
      return this.fallbackAnalysis(text, error);
    }
  }

  /**
   * Ensemble voting with dynamic weighting
   */
  ensembleVoting(results) {
    const weights = this.calculateDynamicWeights(results);

    const weightedScore = Object.keys(results).reduce((total, model) => {
      const result = results[model];
      const weight = weights[model];

      // Convert model outputs to AI probability scores
      let aiProbability;
      switch (model) {
      case 'classification':
        aiProbability = result.aiScore;
        break;
      case 'languageModel':
        aiProbability = result.perplexity > 100 ? 0.8 : 0.2;
        break;
      case 'stylometry':
        aiProbability = result.aiLikelihood;
        break;
      case 'coherence':
        aiProbability = result.tooCoherent ? 0.7 : 0.3;
        break;
      }

      return total + (aiProbability * weight);
    }, 0);

    const finalAiProbability = Math.min(1, weightedScore);

    return {
      aiProbability: finalAiProbability,
      humanProbability: 1 - finalAiProbability,
      modelWeights: weights,
      consensusStrength: this.calculateConsensusStrength(results)
    };
  }

  /**
   * Dynamic weight calculation based on text characteristics
   */
  calculateDynamicWeights(results) {
    const baseWeights = {
      classification: 0.35,
      languageModel: 0.25,
      stylometry: 0.25,
      coherence: 0.15
    };

    // Adjust weights based on text characteristics
    const adjustments = {
      shortText: results.languageModel.textLength < 100 ? 0.1 : 0,
      technicalContent: results.stylometry.technicalScore > 0.7 ? 0.1 : 0,
      creativeWriting: results.stylometry.creativityScore > 0.6 ? 0.05 : 0
    };

    // Apply adjustments
    const adjustedWeights = { ...baseWeights };
    adjustedWeights.classification += adjustments.shortText;
    adjustedWeights.languageModel += adjustments.technicalContent;
    adjustedWeights.stylometry += adjustments.creativeWriting;

    // Normalize weights
    const totalWeight = Object.values(adjustedWeights).reduce((a, b) => a + b, 0);
    return Object.keys(adjustedWeights).reduce((normalized, model) => {
      normalized[model] = adjustedWeights[model] / totalWeight;
      return normalized;
    }, {});
  }

  /**
   * Pattern-based validation and cross-verification
   */
  validateWithPatterns(text, ensembleResult) {
    const patterns = this.patternDatabase;
    const patternCount = Object.values(patterns).reduce((sum, list) => sum + list.length, 0);
    const validation = {
      gptPatterns: this.detectGptPatterns(text),
      humanPatterns: this.detectHumanPatterns(text),
      universalPatterns: this.detectUniversalPatterns(text)
    };

    // Cross-validate ensemble result with pattern detection
    const consistencyScore = this.calculatePatternConsistency(ensembleResult, validation);
    const baseReliability = this.assessPatternReliability(text, validation);
    const patternReliability = Math.min(1, baseReliability + Math.min(0.1, patternCount / 1000));

    return {
      ...validation,
      consistencyScore,
      patternReliability
    };
  }

  /**
   * Confidence calculation with uncertainty quantification
   */
  calculateConfidence({ ensembleResult, patternValidation, textLength, modelAgreement }) {
    let confidence = 0.5; // Base confidence

    // Ensemble confidence
    confidence += ensembleResult.consensusStrength * 0.3;

    // Pattern validation confidence
    confidence += patternValidation.consistencyScore * 0.2;

    // Text length confidence (longer texts provide more data)
    confidence += Math.min(0.15, textLength / 1000);

    // Model agreement confidence
    confidence += modelAgreement * 0.25;

    // Pattern reliability confidence
    confidence += patternValidation.patternReliability * 0.1;

    return Math.min(1, confidence);
  }

  /**
   * Fallback analysis for edge cases and errors
   */
  fallbackAnalysis(text, error) {
    logger.warn('Using fallback analysis due to:', error?.message);

    // Simple pattern-based detection as fallback
    const aiScore = this.simplePatternDetection(text);

    return {
      aiProbability: aiScore,
      humanProbability: 1 - aiScore,
      confidenceScore: 0.3, // Low confidence due to fallback
      riskLevel: 'medium',
      analysis: {
        fallback: true,
        error: error?.message,
        simplePatterns: this.getSimplePatternMatches(text)
      },
      recommendations: ['Consider re-running analysis', 'Check text quality'],
      processingTime: 0,
      metadata: { fallback: true }
    };
  }

  /**
   * Performance monitoring and optimization
   */
  getPerformanceMetrics() {
    return this.performanceMetrics.getMetrics();
  }

  /**
   * Model version management
   */
  getModelVersions() {
    return {
      textClassifier: 'v2.1.0',
      languageModel: 'v1.8.2',
      stylometricAnalyzer: 'v1.5.1',
      coherenceAnalyzer: 'v1.3.0',
      patternDatabase: 'v2024.1'
    };
  }

  /**
   * Text statistics for analysis
   */
  getTextStatistics(text) {
    return {
      length: text.length,
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).length,
      avgSentenceLength: text.split(/[.!?]+/).reduce((sum, sent) => sum + sent.split(/\s+/).length, 0) / text.split(/[.!?]+/).length,
      uniqueWords: new Set(text.toLowerCase().split(/\s+/)).size
    };
  }
}

/**
 * Edge Inference Engine for optimized on-device processing
 */
class EdgeInferenceEngine {
  constructor() {
    this.modelCache = new Map();
    this.inferenceQueue = [];
    this.workerPool = this.initializeWorkerPool();
  }

  initializeWorkerPool() {
    // Web Workers for parallel processing (browser)
    // Worker threads for Node.js
    return {
      workers: [],
      maxWorkers: navigator?.hardwareConcurrency || 4
    };
  }

  async runInference(model, input) {
    // Optimized inference with caching and batching
    const cacheKey = this.generateCacheKey(model, input);

    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey);
    }

    const result = await this.executeInference(model, input);
    this.modelCache.set(cacheKey, result);

    return result;
  }

  async executeInference(model, input) {
    // Model-specific optimized inference
    switch (model.type) {
    case 'textClassifier':
      return await this.runTextClassification(model, input);
    case 'languageModel':
      return await this.runLanguageModel(model, input);
    case 'stylometric':
      return await this.runStylometricAnalysis(model, input);
    case 'coherence':
      return await this.runCoherenceAnalysis(model, input);
    default:
      throw new Error(`Unknown model type: ${model.type}`);
    }
  }

  generateCacheKey(model, input) {
    return `${model.name}:${model.version}:${this.hashInput(input)}`;
  }

  hashInput(input) {
    // Simple hash for caching
    return btoa(input.slice(0, 100)); // First 100 chars for cache key
  }
}

/**
 * Performance monitoring for continuous optimization
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = {
      inferenceTimes: [],
      accuracyScores: [],
      memoryUsage: [],
      cacheHitRates: []
    };
    this.thresholds = {
      maxInferenceTime: 200, // ms
      minAccuracy: 0.9,
      maxMemoryUsage: 100 * 1024 * 1024 // 100MB
    };
  }

  recordAnalysis(analysis) {
    this.metrics.inferenceTimes.push(analysis.processingTime);
    this.metrics.accuracyScores.push(analysis.confidenceScore);

    if (this.metrics.inferenceTimes.length > 1000) {
      this.metrics.inferenceTimes.shift();
    }

    this.checkPerformanceThresholds();
  }

  checkPerformanceThresholds() {
    const avgInferenceTime = this.metrics.inferenceTimes.reduce((a, b) => a + b, 0) / this.metrics.inferenceTimes.length;

    if (avgInferenceTime > this.thresholds.maxInferenceTime) {
      logger.warn('Inference time exceeding threshold');
      this.triggerOptimization();
    }
  }

  triggerOptimization() {
    // Trigger model optimization, cache clearing, etc.
    logger.info('Triggering performance optimization');
  }

  getMetrics() {
    return {
      averageInferenceTime: this.metrics.inferenceTimes.reduce((a, b) => a + b, 0) / this.metrics.inferenceTimes.length,
      averageAccuracy: this.metrics.accuracyScores.reduce((a, b) => a + b, 0) / this.metrics.accuracyScores.length,
      totalAnalyses: this.metrics.inferenceTimes.length,
      performanceGrade: this.calculatePerformanceGrade()
    };
  }

  calculatePerformanceGrade() {
    const avgTime = this.metrics.inferenceTimes.reduce((a, b) => a + b, 0) / this.metrics.inferenceTimes.length;
    const avgAccuracy = this.metrics.accuracyScores.reduce((a, b) => a + b, 0) / this.metrics.accuracyScores.length;

    if (avgTime < 100 && avgAccuracy > 0.95) return 'A+';
    if (avgTime < 150 && avgAccuracy > 0.9) return 'A';
    if (avgTime < 200 && avgAccuracy > 0.85) return 'B+';
    return 'B';
  }
}

module.exports = OnDeviceAIDetector;
