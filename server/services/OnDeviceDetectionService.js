/**
 * On-Device Detection Service
 * Integration layer for the new on-device AI detection system
 */

const OnDeviceAIDetector = require('./OnDeviceAIDetector');
const { TextClassifierModel, StatisticalLanguageModel, StylometricAnalyzer, SemanticCoherenceAnalyzer } = require('./MLModels');

class OnDeviceDetectionService {
  constructor() {
    this.detector = new OnDeviceAIDetector();
    this.models = {
      textClassifier: new TextClassifierModel({
        modelSize: 'small',
        inferenceTime: '< 100ms',
        accuracy: '95%+',
        languages: ['en', 'es', 'fr', 'de', 'it', 'pt']
      }),
      languageModel: new StatisticalLanguageModel({
        type: 'ngram',
        order: 5,
        vocabularySize: 50000,
        smoothing: 'kneser-ney'
      }),
      stylometricAnalyzer: new StylometricAnalyzer({
        features: ['sentence_length', 'vocabulary_diversity', 'passive_voice', 'transition_words'],
        comparisonBaseline: 'human_corpus'
      }),
      semanticAnalyzer: new SemanticCoherenceAnalyzer({
        embeddingModel: 'word2vec',
        coherenceThreshold: 0.7,
        topicModeling: true
      })
    };
    this.patternDatabase = this.loadPatternDatabase();
    this.performanceMonitor = new PerformanceMonitor();
  }

  /**
   * Main detection method
   */
  async detectAI(text, options = {}) {
    try {
      console.log('Starting on-device AI detection...');

      // Input validation
      if (!text || typeof text !== 'string') {
        throw new Error('Invalid input: text must be a non-empty string');
      }

      if (text.length > 10000) {
        throw new Error('Text too long: maximum 10,000 characters');
      }

      const startTime = Date.now();

      // Run comprehensive analysis
      const results = await this.runComprehensiveAnalysis(text, options);

      // Generate final prediction
      const prediction = this.generateFinalPrediction(results);

      const processingTime = Date.now() - startTime;

      console.log(`Detection completed in ${processingTime}ms`);

      return {
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        detailedAnalysis: results.detailedAnalysis || this.generateDetailedAnalysis(results),
        processingTime: processingTime,
        modelVersions: this.getModelVersions(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      console.error('On-device detection failed:', error.message);

      // Fallback to basic detection
      return this.fallbackDetection(text, error);
    }
  }

  /**
   * Run comprehensive analysis using multiple models
   */
  async runComprehensiveAnalysis(text, options) {
    const results = {
      text: text,
      timestamp: new Date().toISOString()
    };

    try {
      // Text classification
      results.classification = await this.models.textClassifier.analyze(text);

      // Language modeling
      results.languageAnalysis = await this.models.languageModel.analyze(text);

      // Stylometric analysis
      results.stylometry = await this.models.stylometricAnalyzer.analyze(text);

      // Semantic coherence analysis
      results.semanticAnalysis = await this.models.semanticAnalyzer.analyze(text);

      // Pattern analysis
      results.patterns = this.analyzePatterns(results);

      // Ensemble result
      results.ensembleResult = this.calculateEnsembleResult(results);

      // Detailed analysis (if requested)
      if (options.detailed) {
        results.detailedAnalysis = this.generateDetailedAnalysis(results);
      }

      return results;

    } catch (error) {
      console.error('Comprehensive analysis failed:', error.message);
      throw error;
    }
  }

  /**
   * Generate detailed analysis
   */
  generateDetailedAnalysis(results) {
    const analysis = {
      textClassification: results.classification,
      languageAnalysis: results.languageAnalysis,
      stylometry: results.stylometry,
      semanticAnalysis: results.semanticAnalysis,
      ensembleResult: results.ensembleResult,
      summary: this.generateSummary(results),
      indicators: this.identifyIndicators(results),
      patterns: results.patterns,
      recommendations: this.generateRecommendations(results),
      modelContributions: this.calculateModelContributions(results),
      confidenceFactors: this.calculateConfidenceFactors(results)
    };

    return analysis;
  }

  /**
   * Generate summary
   */
  generateSummary(results) {
    const { prediction, confidence } = this.generateFinalPrediction(results);

    return {
      overallPrediction: prediction,
      confidence: confidence,
      keyFindings: this.extractKeyFindings(results),
      riskFactors: this.identifyRiskFactors(results)
    };
  }

  /**
   * Identify key indicators
   */
  identifyIndicators(results) {
    const indicators = [];

    // Classification indicators
    if (results.classification) {
      if (results.classification.prediction === 'ai_generated') {
        indicators.push({
          type: 'classification',
          indicator: 'AI-like language patterns detected',
          confidence: results.classification.confidence,
          details: 'Transformer model identified AI-specific linguistic markers'
        });
      }
    }

    // Language model indicators
    if (results.languageAnalysis) {
      if (results.languageAnalysis.perplexity > 120) {
        indicators.push({
          type: 'language_model',
          indicator: 'Unusually predictable language patterns',
          confidence: 0.8,
          details: `Perplexity of ${results.languageAnalysis.perplexity.toFixed(1)} suggests AI generation`
        });
      }

      if (results.languageAnalysis.vocabularyDiversity < 0.6) {
        indicators.push({
          type: 'language_model',
          indicator: 'Limited vocabulary variation',
          confidence: 0.7,
          details: 'Lower vocabulary diversity typical of AI models'
        });
      }
    }

    // Stylometric indicators
    if (results.stylometry) {
      if (results.stylometry.features.sentence_length_variance) {
        const variance = results.stylometry.features.sentence_length_variance.variance;
        if (variance < 5) {
          indicators.push({
            type: 'stylometry',
            indicator: 'Uniform sentence structure',
            confidence: 0.6,
            details: 'Low sentence length variance suggests AI generation'
          });
        }
      }

      if (results.stylometry.features.passive_voice_ratio?.ratio > 0.3) {
        indicators.push({
          type: 'stylometry',
          indicator: 'High passive voice usage',
          confidence: 0.5,
          details: 'Excessive passive voice typical of AI writing'
        });
      }
    }

    return indicators;
  }

  /**
   * Analyze patterns in the text
   */
  analyzePatterns(results) {
    const patterns = {
      linguisticPatterns: this.analyzeLinguisticPatterns(results),
      structuralPatterns: this.analyzeStructuralPatterns(results),
      semanticPatterns: this.analyzeSemanticPatterns(results),
      statisticalPatterns: this.analyzeStatisticalPatterns(results)
    };

    return patterns;
  }

  /**
   * Analyze linguistic patterns
   */
  analyzeLinguisticPatterns(results) {
    const patterns = {
      sentenceLengthVariance: this.calculateSentenceLengthVariance(results.text),
      vocabularyDiversity: this.calculateVocabularyDiversity(results.text),
      formalLanguageRatio: this.calculateFormalLanguageRatio(results.text),
      passiveVoiceUsage: this.calculatePassiveVoiceUsage(results.text),
      transitionWordDensity: this.calculateTransitionWordDensity(results.text)
    };

    return patterns;
  }

  /**
   * Calculate sentence length variance
   */
  calculateSentenceLengthVariance(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const lengths = sentences.map(s => s.trim().split(/\s+/).length);
    const mean = lengths.reduce((sum, len) => sum + len, 0) / lengths.length;
    const variance = lengths.reduce((sum, len) => sum + Math.pow(len - mean, 2), 0) / lengths.length;
    return Math.sqrt(variance);
  }

  /**
   * Calculate vocabulary diversity
   */
  calculateVocabularyDiversity(text) {
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length;
  }

  /**
   * Calculate formal language ratio
   */
  calculateFormalLanguageRatio(text) {
    const formalWords = ['therefore', 'furthermore', 'moreover', 'consequently', 'nevertheless', 'nonetheless', 'hence', 'thus'];
    const words = text.toLowerCase().split(/\s+/);
    const formalCount = words.filter(word => formalWords.includes(word)).length;
    return formalCount / words.length;
  }

  /**
   * Calculate passive voice usage
   */
  calculatePassiveVoiceUsage(text) {
    const passivePattern = /\b(is|are|was|were|being|been)\s+\w+ed\b/gi;
    const matches = text.match(passivePattern) || [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return matches.length / sentences.length;
  }

  /**
   * Calculate transition word density
   */
  calculateTransitionWordDensity(text) {
    const transitionWords = ['however', 'therefore', 'furthermore', 'moreover', 'consequently', 'nevertheless', 'additionally', 'similarly', 'conversely'];
    const words = text.toLowerCase().split(/\s+/);
    const transitionCount = words.filter(word => transitionWords.includes(word)).length;
    return transitionCount / words.length;
  }

  /**
   * Generate recommendations for improvement
   */
  generateRecommendations(results) {
    const recommendations = [];

    if (results.ensembleResult.aiProbability > 0.6) {
      recommendations.push({
        priority: 'high',
        recommendation: 'Add more natural language variation',
        details: 'Include contractions, colloquialisms, and personal voice'
      });

      recommendations.push({
        priority: 'high',
        recommendation: 'Vary sentence structure and length',
        details: 'Mix short and long sentences for natural flow'
      });
    }

    if (results.stylometry?.features.transition_word_usage?.density > 0.08) {
      recommendations.push({
        priority: 'medium',
        recommendation: 'Reduce formal transition words',
        details: 'Use more natural connectors and conversational flow'
      });
    }

    if (results.languageAnalysis?.vocabularyDiversity < 0.65) {
      recommendations.push({
        priority: 'medium',
        recommendation: 'Increase vocabulary diversity',
        details: 'Use synonyms and varied expressions'
      });
    }

    return recommendations;
  }

  /**
   * Calculate ensemble result
   */
  calculateEnsembleResult(results) {
    const weights = {
      classification: 0.3,
      languageModel: 0.25,
      stylometry: 0.25,
      semantic: 0.2
    };

    let aiProbability = 0;
    let totalWeight = 0;

    if (results.classification) {
      const classificationProb = results.classification.prediction === 'ai_generated' ?
        results.classification.confidence : (1 - results.classification.confidence);
      aiProbability += classificationProb * weights.classification;
      totalWeight += weights.classification;
    }

    if (results.languageAnalysis) {
      // Higher perplexity suggests AI
      const perplexityScore = Math.min(results.languageAnalysis.perplexity / 150, 1);
      aiProbability += perplexityScore * weights.languageModel;
      totalWeight += weights.languageModel;
    }

    if (results.stylometry) {
      // Lower variance suggests AI
      const varianceScore = results.stylometry.features.sentence_length_variance?.variance < 10 ? 0.8 : 0.3;
      aiProbability += varianceScore * weights.stylometry;
      totalWeight += weights.stylometry;
    }

    if (results.semanticAnalysis) {
      // Lower coherence suggests AI
      const coherenceScore = 1 - results.semanticAnalysis.coherence_score;
      aiProbability += coherenceScore * weights.semantic;
      totalWeight += weights.semantic;
    }

    const finalProbability = totalWeight > 0 ? (aiProbability / totalWeight) : 0.5;
    const safeProbability = isNaN(finalProbability) ? 0.5 : finalProbability;

    return {
      aiProbability: safeProbability,
      confidence: Math.min(Math.abs(safeProbability - 0.5) * 2, 1),
      contributingFactors: {
        classification: results.classification?.confidence || 0,
        languageModel: results.languageAnalysis?.perplexity || 0,
        stylometry: results.stylometry?.features.sentence_length_variance?.variance || 0,
        semantic: results.semanticAnalysis?.coherence_score || 0
      }
    };
  }

  /**
   * Generate final prediction
   */
  generateFinalPrediction(results) {
    const ensembleResult = results.ensembleResult;

    let prediction;
    if (ensembleResult.aiProbability > 0.6) {
      prediction = 'ai_generated';
    } else if (ensembleResult.aiProbability < 0.4) {
      prediction = 'human_written';
    } else {
      prediction = 'mixed_content';
    }

    const normalizedConfidence = Math.max(ensembleResult.confidence, 0.5);

    return {
      prediction: prediction,
      confidence: normalizedConfidence
    };
  }

  /**
   * Fallback detection method
   */
  fallbackDetection(text, error) {
    console.log('Using fallback detection...');

    // Simple heuristic-based detection
    const aiIndicators = [
      /\bin conclusion\b/gi,
      /\bfurthermore\b/gi,
      /\bmoreover\b/gi,
      /\bnevertheless\b/gi,
      /\bin summary\b/gi,
      /\badditionally\b/gi
    ];

    let indicatorCount = 0;
    for (const pattern of aiIndicators) {
      const matches = text.match(pattern);
      if (matches) indicatorCount += matches.length;
    }

    const wordCount = text.split(/\s+/).length;
    const indicatorRatio = indicatorCount / wordCount;

    let prediction;
    if (indicatorRatio > 0.02) {
      prediction = 'ai_generated';
    } else {
      prediction = 'human_written';
    }

    const confidence = Math.min(indicatorRatio * 10, 0.9);

    return {
      prediction: prediction,
      confidence,
      detailedAnalysis: {
        textClassification: { prediction, confidence },
        languageAnalysis: null,
        stylometry: null,
        semanticAnalysis: null,
        ensembleResult: { aiProbability: prediction === 'ai_generated' ? 0.7 : 0.3, confidence },
        summary: {
          overallPrediction: prediction,
          confidence,
          keyFindings: [],
          riskFactors: []
        },
        indicators: [],
        patterns: null,
        recommendations: [],
        modelContributions: null,
        confidenceFactors: null
      },
      fallback: true,
      error: error.message,
      processingTime: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Load pattern database
   */
  loadPatternDatabase() {
    return {
      aiPatterns: [
        'in conclusion',
        'furthermore',
        'moreover',
        'nevertheless',
        'additionally',
        'consequently',
        'therefore'
      ],
      humanPatterns: [
        'I think',
        'I believe',
        'in my opinion',
        'personally',
        'I feel',
        'I guess'
      ]
    };
  }

  /**
   * Get model versions
   */
  getModelVersions() {
    return {
      textClassifier: '1.0.0',
      languageModel: '1.0.0',
      stylometricAnalyzer: '1.0.0',
      semanticAnalyzer: '1.0.0'
    };
  }

  /**
   * Extract key findings
   */
  extractKeyFindings(results) {
    const findings = [];

    if (results.classification) {
      findings.push(`Classification: ${results.classification.prediction} (${results.classification.confidence}%)`);
    }

    if (results.languageAnalysis) {
      findings.push(`Language Model: Perplexity ${results.languageAnalysis.perplexity.toFixed(1)}`);
    }

    if (results.stylometry) {
      findings.push(`Stylometry: ${Object.keys(results.stylometry.features).length} features analyzed`);
    }

    return findings;
  }

  /**
   * Identify risk factors
   */
  identifyRiskFactors(results) {
    const riskFactors = [];

    if (results.ensembleResult.aiProbability > 0.7) {
      riskFactors.push('High AI probability');
    }

    if (results.languageAnalysis?.perplexity > 150) {
      riskFactors.push('Unusually high perplexity');
    }

    if (results.stylometry?.features.sentence_length_variance?.variance < 3) {
      riskFactors.push('Very low sentence length variance');
    }

    return riskFactors;
  }

  /**
   * Calculate model contributions
   */
  calculateModelContributions(results) {
    return {
      textClassifier: results.classification?.confidence || 0,
      languageModel: results.languageAnalysis ? Math.min(results.languageAnalysis.perplexity / 200, 1) : 0,
      stylometricAnalyzer: results.stylometry ? 0.8 : 0,
      semanticAnalyzer: results.semanticAnalysis ? results.semanticAnalysis.coherence_score : 0
    };
  }

  /**
   * Calculate confidence factors
   */
  calculateConfidenceFactors(results) {
    return {
      modelAgreement: results.ensembleResult.confidence,
      textLength: Math.min(results.text.length / 1000, 1),
      featureRichness: Object.keys(results.patterns?.linguisticPatterns || {}).length / 10,
      predictionConsistency: results.ensembleResult.confidence > 0.8 ? 0.9 : 0.5
    };
  }

  /**
   * Analyze structural patterns
   */
  analyzeStructuralPatterns(results) {
    return {
      paragraphStructure: this.analyzeParagraphStructure(results.text),
      sentenceFlow: this.analyzeSentenceFlow(results.text),
      formattingConsistency: this.analyzeFormattingConsistency(results.text)
    };
  }

  /**
   * Analyze semantic patterns
   */
  analyzeSemanticPatterns(results) {
    return {
      topicConsistency: results.semanticAnalysis?.coherence_score || 0,
      conceptRepetition: this.analyzeConceptRepetition(results.text),
      semanticDiversity: this.analyzeSemanticDiversity(results.text)
    };
  }

  /**
   * Analyze statistical patterns
   */
  analyzeStatisticalPatterns(results) {
    return {
      wordFrequency: this.analyzeWordFrequency(results.text),
      ngramPatterns: results.languageAnalysis?.ngram_scores || {},
      entropy: this.calculateTextEntropy(results.text)
    };
  }

  /**
   * Analyze paragraph structure
   */
  analyzeParagraphStructure(text) {
    const paragraphs = text.split(/\n\n+/);
    return {
      paragraphCount: paragraphs.length,
      averageParagraphLength: paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length,
      paragraphLengthVariance: this.calculateVariance(paragraphs.map(p => p.split(/\s+/).length))
    };
  }

  /**
   * Analyze sentence flow
   */
  analyzeSentenceFlow(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return {
      sentenceCount: sentences.length,
      averageSentenceLength: sentences.reduce((sum, s) => sum + s.trim().split(/\s+/).length, 0) / sentences.length,
      sentenceLengthVariance: this.calculateVariance(sentences.map(s => s.trim().split(/\s+/).length))
    };
  }

  /**
   * Analyze formatting consistency
   */
  analyzeFormattingConsistency(text) {
    const hasConsistentCapitalization = /^[A-Z]/.test(text.trim());
    const hasProperPunctuation = /[.!?]$/.test(text.trim());
    const paragraphConsistency = text.split(/\n\n+/).every(p => p.trim().length > 0);

    return {
      capitalization: hasConsistentCapitalization,
      punctuation: hasProperPunctuation,
      paragraphConsistency: paragraphConsistency
    };
  }

  /**
   * Analyze concept repetition
   */
  analyzeConceptRepetition(text) {
    const words = text.toLowerCase().split(/\s+/);
    const wordCounts = {};

    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });

    const repeatedWords = Object.entries(wordCounts)
      .filter(([word, count]) => count > 3 && word.length > 4)
      .map(([word, count]) => ({ word, count }));

    return {
      repeatedConcepts: repeatedWords,
      repetitionScore: repeatedWords.length / Object.keys(wordCounts).length
    };
  }

  /**
   * Analyze semantic diversity
   */
  analyzeSemanticDiversity(text) {
    const words = text.toLowerCase().split(/\s+/);
    const uniqueWords = new Set(words);

    return {
      uniqueWordRatio: uniqueWords.size / words.length,
      vocabularyRichness: this.calculateVocabularyRichness(words)
    };
  }

  /**
   * Analyze word frequency
   */
  analyzeWordFrequency(text) {
    const words = text.toLowerCase().split(/\s+/);
    const frequency = {};

    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    return frequency;
  }

  /**
   * Calculate text entropy
   */
  calculateTextEntropy(text) {
    const words = text.toLowerCase().split(/\s+/);
    const frequency = {};

    words.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const total = words.length;
    let entropy = 0;

    Object.values(frequency).forEach(count => {
      const probability = count / total;
      entropy -= probability * Math.log2(probability);
    });

    return entropy;
  }

  /**
   * Calculate variance
   */
  calculateVariance(values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    return values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  }

  /**
   * Calculate vocabulary richness
   */
  calculateVocabularyRichness(words) {
    const uniqueWords = new Set(words);
    return uniqueWords.size / words.length;
  }
}

/**
 * Performance Monitor
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = [];
  }

  recordMetric(operation, duration, success = true) {
    this.metrics.push({
      operation,
      duration,
      success,
      timestamp: new Date().toISOString()
    });
  }

  getAverageDuration(operation) {
    const relevantMetrics = this.metrics.filter(m => m.operation === operation);
    if (relevantMetrics.length === 0) return 0;

    return relevantMetrics.reduce((sum, m) => sum + m.duration, 0) / relevantMetrics.length;
  }

  getSuccessRate(operation) {
    const relevantMetrics = this.metrics.filter(m => m.operation === operation);
    if (relevantMetrics.length === 0) return 0;

    const successfulMetrics = relevantMetrics.filter(m => m.success);
    return successfulMetrics.length / relevantMetrics.length;
  }
}

module.exports = OnDeviceDetectionService;
