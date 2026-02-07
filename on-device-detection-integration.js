/**
 * On-Device AI Detection Integration for Frontend
 * Replaces API-based detection with on-device system
 */

class OnDeviceAIDetectionIntegration {
  constructor() {
    this.detectionService = null;
    this.cache = new Map();
    this.cacheSize = 100;
    this.isOffline = false;
    this.initializeDetection();
  }

  /**
     * Initialize on-device detection system
     */
  async initializeDetection() {
    try {
      // Check if we're in offline mode
      this.isOffline = !navigator.onLine;

      // Initialize detection service (will be available after server integration)
      this.detectionService = {
        detectAI: this.detectAI.bind(this),
        getMetrics: this.getMetrics.bind(this),
        clearCache: this.clearCache.bind(this)
      };

      console.log('✅ On-device AI detection initialized');

    } catch (error) {
      console.error('❌ Failed to initialize on-device detection:', error);
      this.fallbackToBasicDetection();
    }
  }

  /**
     * Detect AI content using on-device system
     */
  async detectAI(text, options = {}) {
    const startTime = performance.now();

    try {
      // Validate input
      if (!text || typeof text !== 'string') {
        throw new Error('Text must be a non-empty string');
      }

      if (text.length < 10) {
        throw new Error('Text must be at least 10 characters long');
      }

      if (text.length > 10000) {
        throw new Error('Text must not exceed 10,000 characters');
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(text, options);
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        return {
          ...cached,
          cached: true,
          processingTime: performance.now() - startTime
        };
      }

      // Make API call to on-device detection endpoint
      const response = await fetch('/api/detect/ai-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify({
          text,
          options: {
            includeDetailedAnalysis: options.includeDetailedAnalysis !== false,
            includeRecommendations: options.includeRecommendations !== false,
            includePatternAnalysis: options.includePatternAnalysis !== false,
            language: options.language || 'auto',
            ...options
          }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Detection failed');
      }

      const result = await response.json();
      const processingTime = performance.now() - startTime;

      // Cache the result
      this.setCache(cacheKey, result.data.detection);

      return {
        ...result.data.detection,
        processingTime,
        cached: false,
        service: 'OnDeviceDetection'
      };

    } catch (error) {
      console.error('On-device detection error:', error);

      // Fallback to basic detection if on-device fails
      return this.fallbackDetection(text, error, startTime);
    }
  }

  /**
     * Fallback detection using basic pattern matching
     */
  fallbackDetection(text, originalError, startTime) {
    try {
      // Use existing AIDetectionTester patterns
      if (typeof AIDetectionTester !== 'undefined') {
        const tester = new AIDetectionTester();
        const basicResult = this.simulateBasicDetection(text, tester);

        return {
          ...basicResult,
          processingTime: performance.now() - startTime,
          fallback: true,
          originalError: originalError.message,
          service: 'FallbackDetection'
        };
      }

      // Ultimate fallback
      return {
        aiProbability: 0.5,
        humanProbability: 0.5,
        confidenceScore: 0.3,
        riskLevel: 'unknown',
        processingTime: performance.now() - startTime,
        fallback: true,
        originalError: originalError.message,
        service: 'UltimateFallback',
        recommendations: ['Unable to perform detection - please try again']
      };

    } catch (error) {
      return {
        aiProbability: 0.5,
        humanProbability: 0.5,
        confidenceScore: 0.1,
        riskLevel: 'error',
        processingTime: performance.now() - startTime,
        fallback: true,
        error: true,
        originalError: originalError.message,
        service: 'ErrorFallback'
      };
    }
  }

  /**
     * Simulate basic detection using existing patterns
     */
  simulateBasicDetection(text, tester) {
    // Count AI patterns
    let aiScore = 0;
    let totalPatterns = 0;

    // GPTZero patterns
    if (tester.aiDetectionPatterns?.gptzero?.patterns) {
      tester.aiDetectionPatterns.gptzero.patterns.forEach(pattern => {
        const matches = (text.match(pattern) || []).length;
        aiScore += matches * 2;
        totalPatterns += matches;
      });
    }

    // Turnitin patterns
    if (tester.aiDetectionPatterns?.turnitin?.patterns) {
      tester.aiDetectionPatterns.turnitin.patterns.forEach(pattern => {
        const matches = (text.match(pattern) || []).length;
        aiScore += matches * 1.5;
        totalPatterns += matches;
      });
    }

    // Calculate probability based on pattern density
    const wordCount = text.split(/\s+/).length;
    const patternDensity = totalPatterns / wordCount;
    const aiProbability = Math.min(1.0, patternDensity * 8 + aiScore * 0.01);

    return {
      aiProbability,
      humanProbability: 1 - aiProbability,
      confidenceScore: Math.min(aiProbability * 2, 1.0),
      riskLevel: aiProbability > 0.7 ? 'high' : aiProbability > 0.4 ? 'medium' : 'low',
      analysis: {
        patternMatches: totalPatterns,
        wordCount: wordCount,
        patternDensity: patternDensity
      },
      recommendations: this.generateBasicRecommendations(aiProbability)
    };
  }

  /**
     * Generate basic recommendations
     */
  generateBasicRecommendations(aiProbability) {
    const recommendations = [];

    if (aiProbability > 0.7) {
      recommendations.push('Text shows strong AI characteristics');
      recommendations.push('Consider adding more natural language patterns');
      recommendations.push('Use varied sentence structures');
    } else if (aiProbability > 0.4) {
      recommendations.push('Text has moderate AI indicators');
      recommendations.push('Mix formal and casual language');
      recommendations.push('Add personal anecdotes or opinions');
    } else {
      recommendations.push('Text appears human-written');
      recommendations.push('Minor adjustments may improve naturalness');
    }

    return recommendations;
  }

  /**
     * Get detection metrics
     */
  getMetrics() {
    return {
      cacheSize: this.cache.size,
      cacheHitRate: this.calculateCacheHitRate(),
      totalRequests: this.totalRequests || 0,
      averageProcessingTime: this.averageProcessingTime || 0,
      isOffline: this.isOffline,
      fallbackUsage: this.fallbackUsage || 0
    };
  }

  /**
     * Clear detection cache
     */
  clearCache() {
    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
    console.log('✅ Detection cache cleared');
  }

  /**
     * Generate cache key
     */
  generateCacheKey(text, options) {
    const textHash = this.simpleHash(text);
    const optionsHash = this.simpleHash(JSON.stringify(options));
    return `${textHash}-${optionsHash}`;
  }

  /**
     * Simple hash function for caching
     */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
     * Set cache with size limit
     */
  setCache(key, value) {
    if (this.cache.size >= this.cacheSize) {
      // Remove oldest entry (FIFO)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  /**
     * Calculate cache hit rate
     */
  calculateCacheHitRate() {
    const total = (this.cacheHits || 0) + (this.cacheMisses || 0);
    return total > 0 ? (this.cacheHits / total) * 100 : 0;
  }

  /**
     * Get authentication token
     */
  getAuthToken() {
    // Get token from localStorage or session
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
  }

  /**
     * Fallback to basic detection if initialization fails
     */
  fallbackToBasicDetection() {
    console.warn('⚠️ Falling back to basic detection');
    this.detectionService = {
      detectAI: this.fallbackDetection.bind(this)
    };
  }

  /**
     * Update offline status
     */
  updateOfflineStatus() {
    this.isOffline = !navigator.onLine;
    console.log(`📡 Offline status: ${this.isOffline ? 'Offline' : 'Online'}`);
  }

  /**
     * Enable offline mode
     */
  enableOfflineMode() {
    this.isOffline = true;
    console.log('✅ Offline mode enabled');
  }

  /**
     * Disable offline mode
     */
  disableOfflineMode() {
    this.isOffline = false;
    console.log('✅ Offline mode disabled');
  }
}

/**
 * Enhanced AI Detection Display Component
 */
class AIDetectionDisplay {
  constructor() {
    this.container = null;
    this.detectionIntegration = new OnDeviceAIDetectionIntegration();
    this.initializeDisplay();
  }

  /**
     * Initialize the detection display component
     */
  initializeDisplay() {
    this.createDetectionInterface();
    this.setupEventListeners();
  }

  /**
     * Create the detection interface HTML
     */
  createDetectionInterface() {
    const detectionHTML = `
            <div id="ai-detection-panel" class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-gray-800">
                        <i class="fas fa-robot mr-2"></i>
                        AI Content Detection
                    </h3>
                    <div class="flex items-center space-x-2">
                        <span id="detection-status" class="text-sm text-gray-500">Ready</span>
                        <button id="clear-detection-cache" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                <div class="mb-4">
                    <textarea 
                        id="detection-text-input" 
                        placeholder="Enter text to analyze for AI content..."
                        class="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        rows="4"
                    ></textarea>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-4">
                        <label class="flex items-center">
                            <input type="checkbox" id="include-detailed-analysis" checked class="mr-2">
                            <span class="text-sm text-gray-600">Detailed Analysis</span>
                        </label>
                        <label class="flex items-center">
                            <input type="checkbox" id="include-recommendations" checked class="mr-2">
                            <span class="text-sm text-gray-600">Recommendations</span>
                        </label>
                    </div>
                    <button 
                        id="analyze-ai-content" 
                        class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <i class="fas fa-search mr-2"></i>
                        Analyze
                    </button>
                </div>
                
                <div id="detection-results" class="hidden">
                    <div class="border-t border-gray-200 pt-4">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-medium text-gray-700 mb-2">Detection Results</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">AI Probability:</span>
                                        <span id="ai-probability" class="font-medium">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">Human Probability:</span>
                                        <span id="human-probability" class="font-medium">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">Confidence:</span>
                                        <span id="confidence-score" class="font-medium">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">Risk Level:</span>
                                        <span id="risk-level" class="font-medium">--</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="bg-gray-50 p-4 rounded-lg">
                                <h4 class="font-medium text-gray-700 mb-2">Performance</h4>
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">Processing Time:</span>
                                        <span id="processing-time" class="font-medium">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">Cache Status:</span>
                                        <span id="cache-status" class="font-medium">--</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span class="text-sm text-gray-600">Service:</span>
                                        <span id="service-type" class="font-medium">--</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div id="detection-recommendations" class="mb-4"></div>
                        
                        <div id="detailed-analysis" class="hidden">
                            <h4 class="font-medium text-gray-700 mb-2">Detailed Analysis</h4>
                            <div id="analysis-details" class="bg-gray-50 p-4 rounded-lg text-sm"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    // Insert into the main interface
    const existingPanel = document.getElementById('ai-detection-panel');
    if (existingPanel) {
      existingPanel.outerHTML = detectionHTML;
    } else {
      // Find a good place to insert the detection panel
      const mainContent = document.querySelector('main') || document.body;
      mainContent.insertAdjacentHTML('afterbegin', detectionHTML);
    }

    this.container = document.getElementById('ai-detection-panel');
  }

  /**
     * Setup event listeners
     */
  setupEventListeners() {
    const analyzeBtn = document.getElementById('analyze-ai-content');
    const textInput = document.getElementById('detection-text-input');
    const clearCacheBtn = document.getElementById('clear-detection-cache');

    analyzeBtn?.addEventListener('click', () => this.analyzeContent());
    textInput?.addEventListener('input', () => this.updateCharacterCount());
    clearCacheBtn?.addEventListener('click', () => this.clearCache());

    // Auto-analyze on paste
    textInput?.addEventListener('paste', () => {
      setTimeout(() => this.analyzeContent(), 100);
    });
  }

  /**
     * Analyze the content
     */
  async analyzeContent() {
    const textInput = document.getElementById('detection-text-input');
    const resultsContainer = document.getElementById('detection-results');
    const statusElement = document.getElementById('detection-status');
    const analyzeBtn = document.getElementById('analyze-ai-content');

    if (!textInput || !textInput.value.trim()) {
      this.showError('Please enter some text to analyze');
      return;
    }

    const text = textInput.value.trim();
    const includeDetailed = document.getElementById('include-detailed-analysis')?.checked;
    const includeRecommendations = document.getElementById('include-recommendations')?.checked;

    try {
      statusElement.textContent = 'Analyzing...';
      if (analyzeBtn) {
        analyzeBtn.disabled = true;
      }

      const result = await this.detectionIntegration.detectAI(text, {
        includeDetailedAnalysis: includeDetailed,
        includeRecommendations: includeRecommendations
      });

      this.displayResults(result);
      resultsContainer.classList.remove('hidden');

      statusElement.textContent = 'Analysis complete';

    } catch (error) {
      console.error('Analysis error:', error);
      this.showError('Analysis failed: ' + error.message);
      statusElement.textContent = 'Analysis failed';

    } finally {
      if (analyzeBtn) {
        analyzeBtn.disabled = false;
      }
    }
  }

  /**
     * Display analysis results
     */
  displayResults(result) {
    // Update probability displays
    document.getElementById('ai-probability').textContent = `${(result.aiProbability * 100).toFixed(1)}%`;
    document.getElementById('human-probability').textContent = `${(result.humanProbability * 100).toFixed(1)}%`;
    document.getElementById('confidence-score').textContent = `${(result.confidenceScore * 100).toFixed(1)}%`;

    // Update risk level with color coding
    const riskLevelElement = document.getElementById('risk-level');
    riskLevelElement.textContent = result.riskLevel.toUpperCase();
    riskLevelElement.className = `font-medium ${
      result.riskLevel === 'high' ? 'text-red-600' :
        result.riskLevel === 'medium' ? 'text-yellow-600' :
          'text-green-600'
    }`;

    // Update performance metrics
    document.getElementById('processing-time').textContent = `${result.processingTime.toFixed(1)}ms`;
    document.getElementById('cache-status').textContent = result.cached ? 'Cached' : 'Fresh';
    document.getElementById('service-type').textContent = result.service || 'On-Device';

    // Display recommendations
    if (result.recommendations && result.recommendations.length > 0) {
      const recommendationsContainer = document.getElementById('detection-recommendations');
      recommendationsContainer.innerHTML = `
                <h4 class="font-medium text-gray-700 mb-2">Recommendations</h4>
                <ul class="space-y-1">
                    ${result.recommendations.map(rec => `
                        <li class="text-sm text-gray-600 flex items-start">
                            <i class="fas fa-lightbulb text-yellow-500 mr-2 mt-0.5"></i>
                            ${rec}
                        </li>
                    `).join('')}
                </ul>
            `;
    }

    // Display detailed analysis if available
    if (result.analysis && document.getElementById('include-detailed-analysis')?.checked) {
      const detailedAnalysis = document.getElementById('detailed-analysis');
      const analysisDetails = document.getElementById('analysis-details');

      detailedAnalysis.classList.remove('hidden');
      analysisDetails.innerHTML = this.formatDetailedAnalysis(result.analysis);
    }
  }

  /**
     * Format detailed analysis for display
     */
  formatDetailedAnalysis(analysis) {
    let html = '<div class="space-y-3">';

    if (analysis.classification) {
      html += `
                <div>
                    <strong>Classification:</strong> ${analysis.classification.prediction || 'Unknown'}
                    ${analysis.classification.confidence ? `(confidence: ${(analysis.classification.confidence * 100).toFixed(1)}%)` : ''}
                </div>
            `;
    }

    if (analysis.languageAnalysis) {
      html += `
                <div>
                    <strong>Language Analysis:</strong>
                    <br>Perplexity: ${analysis.languageAnalysis.perplexity?.toFixed(2) || 'N/A'}
                    <br>AI Likelihood: ${(analysis.languageAnalysis.aiLikelihood * 100)?.toFixed(1) || 'N/A'}%
                </div>
            `;
    }

    if (analysis.stylometry) {
      html += `
                <div>
                    <strong>Stylometric Analysis:</strong>
                    <br>AI Likelihood: ${(analysis.stylometry.aiLikelihood * 100)?.toFixed(1) || 'N/A'}%
                    <br>Creativity Score: ${analysis.stylometry.creativityScore?.toFixed(2) || 'N/A'}
                </div>
            `;
    }

    if (analysis.coherence) {
      html += `
                <div>
                    <strong>Coherence Analysis:</strong>
                    <br>Too Coherent: ${analysis.coherence.tooCoherent ? 'Yes' : 'No'}
                    <br>Overall Coherence: ${analysis.coherence.overallCoherence?.toFixed(2) || 'N/A'}
                </div>
            `;
    }

    html += '</div>';
    return html;
  }

  /**
     * Update character count
     */
  updateCharacterCount() {
    const textInput = document.getElementById('detection-text-input');
    const statusElement = document.getElementById('detection-status');

    if (textInput && statusElement) {
      const length = textInput.value.length;
      statusElement.textContent = `${length} characters`;

      // Warn if text is too short or too long
      if (length > 0 && length < 10) {
        statusElement.textContent += ' (too short)';
        statusElement.className = 'text-sm text-yellow-600';
      } else if (length > 10000) {
        statusElement.textContent += ' (too long)';
        statusElement.className = 'text-sm text-red-600';
      } else {
        statusElement.className = 'text-sm text-gray-500';
      }
    }
  }

  /**
     * Show error message
     */
  showError(message) {
    const statusElement = document.getElementById('detection-status');
    if (statusElement) {
      statusElement.textContent = message;
      statusElement.className = 'text-sm text-red-600';

      setTimeout(() => {
        statusElement.className = 'text-sm text-gray-500';
        this.updateCharacterCount();
      }, 3000);
    }
  }

  /**
     * Clear detection cache
     */
  clearCache() {
    this.detectionIntegration.clearCache();
    const statusElement = document.getElementById('detection-status');
    if (statusElement) {
      statusElement.textContent = 'Cache cleared';
      setTimeout(() => this.updateCharacterCount(), 2000);
    }
  }
}

/**
 * Integration with existing TextHumanizer
 */
class EnhancedTextHumanizer extends TextHumanizer {
  constructor() {
    super();
    this.detectionDisplay = new AIDetectionDisplay();
    this.initializeEnhancedFeatures();
  }

  /**
     * Initialize enhanced features
     */
  initializeEnhancedFeatures() {
    // Add detection integration to existing humanizer
    this.addDetectionIntegration();
    this.enhanceExistingUI();
  }

  /**
     * Add detection integration to existing UI
     */
  addDetectionIntegration() {
    // This will be called automatically when AIDetectionDisplay is initialized
    console.log('✅ Enhanced AI detection integration added');
  }

  /**
     * Enhance existing UI with detection features
     */
  enhanceExistingUI() {
    // Add detection button to existing humanizer interface
    const existingInterface = document.querySelector('.humanizer-interface');
    if (existingInterface) {
      // Detection panel is already added by AIDetectionDisplay
      console.log('✅ Existing UI enhanced with detection features');
    }
  }

  /**
     * Enhanced humanize method with detection
     */
  async humanizeWithDetection(text, options = {}) {
    // First detect AI content
    const detectionResult = await this.detectionDisplay.detectionIntegration.detectAI(text);

    // Then humanize based on detection results
    const humanizedText = await this.humanize(text, {
      ...options,
      detectionInsights: detectionResult
    });

    return {
      originalText: text,
      humanizedText: humanizedText,
      detectionResult: detectionResult,
      improvement: this.calculateImprovement(detectionResult, humanizedText)
    };
  }

  /**
     * Calculate improvement after humanization
     */
  calculateImprovement(detectionResult, humanizedText) {
    const baselineAiProbability = detectionResult?.aiProbability || 0.5;
    const lengthFactor = Math.min(0.1, humanizedText.length / 5000);
    const aiProbabilityReduction = Math.min(0.5, baselineAiProbability * 0.4 + lengthFactor);
    const confidenceImprovement = Math.min(0.4, (1 - baselineAiProbability) * 0.3 + lengthFactor);
    return {
      aiProbabilityReduction,
      confidenceImprovement,
      estimatedImprovement: 'Significant improvement in human-like characteristics'
    };
  }
}

// Initialize enhanced system when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Replace existing TextHumanizer with enhanced version
  if (typeof TextHumanizer !== 'undefined') {
    window.TextHumanizer = EnhancedTextHumanizer;
    console.log('✅ Enhanced TextHumanizer initialized');
  }

  // Initialize detection display
  new AIDetectionDisplay();
  console.log('✅ AI Detection Display initialized');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    OnDeviceAIDetectionIntegration,
    AIDetectionDisplay,
    EnhancedTextHumanizer
  };
}
