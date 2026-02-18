class AIHumanizerTester {
  constructor() {
    this.testCases = {
      academic: 'The implementation of machine learning algorithms in contemporary research methodologies has demonstrated significant efficacy in data analysis processes. Furthermore, the utilization of neural networks has revolutionized pattern recognition capabilities across multiple domains of scientific inquiry.',
      marketing: 'Discover the revolutionary new solution that will transform your business operations! Our cutting-edge platform leverages advanced AI technology to deliver unprecedented results and maximize your ROI. Don\'t miss out on this game-changing opportunity!',
      technical: 'The system architecture utilizes a microservices-based approach with containerized deployments. Database optimization is achieved through indexed queries and caching mechanisms. API endpoints are secured using OAuth 2.0 authentication protocols.',
      creative: 'In the ethereal moonlight, the ancient castle stood as a testament to forgotten dreams. Whispers of bygone eras danced through the corridors, where shadows played their eternal game of hide and seek with the flickering candlelight.'
    };

    this.aiPatterns = [
      /\bin today's\s+\w+\s+landscape\b/gi,
      /\butilization of\b/gi,
      /\brevolutionized?\b/gi,
      /\bsignificant implications?\b/gi,
      /\bincluding\s+(?:\w+,\s*)*\w+\s+and\s+\w+\b/gi,
      /\bfurthermore\b/gi,
      /\bmoreover\b/gi,
      /\bin conclusion\b/gi,
      /\bit is important to note\b/gi,
      /\bshould be noted\b/gi,
      /\bplays? a crucial role\b/gi,
      /\bkey (?:component|factor|aspect)\b/gi,
      /\bin order to\b/gi,
      /\bthe fact that\b/gi,
      /\bneedless to say\b/gi
    ];

    this.humanIndicators = [
      /\b(I|we|my|our|you|your)\b/gi, // Personal pronouns
      /\b(don't|can't|won't|isn't|aren't|wasn't|weren't)\b/gi, // Contractions
      /[.!?]\s*\w+\s*,\s*\w+/g, // Sentence structure variation
      /\b(like|kind of|sort of|maybe|probably|actually)\b/gi, // Casual expressions
      /\b(ha|haha|lol|omg|wow)\b/gi, // Informal expressions
      /\b(I think|I believe|in my opinion)\b/gi, // Personal voice
      /\b(remember|imagine|consider|picture this)\b/gi, // Direct address
      /[.!?]\s+But\s+/g, // Sentence starters
      /\banyway\b/gi, // Conversational transitions
      /\b(you know|I mean|well)\b/gi // Fillers
    ];

    this.init();
  }

  init() {
    this.setupEventListeners();
    console.log('AI Humanizer Tester initialized');
  }

  setupEventListeners() {
    document.getElementById('runTest').addEventListener('click', () => this.runTest());

    document.querySelectorAll('.test-case').forEach(button => {
      button.addEventListener('click', (e) => {
        const caseType = e.currentTarget.dataset.case;
        this.loadTestCase(caseType);
      });
    });
  }

  loadTestCase(caseType) {
    if (this.testCases[caseType]) {
      document.getElementById('testInput').value = this.testCases[caseType];
    }
  }

  async runTest() {
    const inputText = document.getElementById('testInput').value;
    const style = document.getElementById('testStyle').value;

    if (!inputText.trim()) {
      alert('Please enter some text to test');
      return;
    }

    try {
      // Run humanization
      const humanizedText = await window.textHumanizer.humanizeText(inputText, { style });

      // Display results
      this.displayResults(inputText, humanizedText);

      // Run analysis
      this.analyzeText(humanizedText, inputText);

    } catch (error) {
      console.error('Test failed:', error);
      alert('Test failed: ' + error.message);
    }
  }

  displayResults(original, humanized) {
    document.getElementById('originalText').textContent = original;
    document.getElementById('humanizedText').textContent = humanized;
  }

  analyzeText(humanized, original) {
    const analysis = {
      aiPatterns: this.detectAIPatterns(humanized),
      humanIndicators: this.detectHumanIndicators(humanized),
      sentenceStructure: this.analyzeSentenceStructure(humanized, original),
      vocabularyDiversity: this.analyzeVocabularyDiversity(humanized, original),
      confidenceScore: this.calculateConfidenceScore(humanized, original)
    };

    this.displayAnalysis(analysis);
    return analysis;
  }

  detectAIPatterns(text) {
    const foundPatterns = [];
    this.aiPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundPatterns.push(...matches);
      }
    });
    return foundPatterns;
  }

  detectHumanIndicators(text) {
    const foundIndicators = [];
    this.humanIndicators.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        foundIndicators.push(...matches);
      }
    });
    return foundIndicators;
  }

  analyzeSentenceStructure(humanized, original) {
    const originalSentences = this.splitIntoSentences(original);
    const humanizedSentences = this.splitIntoSentences(humanized);

    const originalLengths = originalSentences.map(s => s.split(' ').length);
    const humanizedLengths = humanizedSentences.map(s => s.split(' ').length);

    const originalVariance = this.calculateVariance(originalLengths);
    const humanizedVariance = this.calculateVariance(humanizedLengths);

    return {
      sentenceCount: {
        original: originalSentences.length,
        humanized: humanizedSentences.length
      },
      lengthVariance: {
        original: originalVariance,
        humanized: humanizedVariance,
        improvement: humanizedVariance > originalVariance ? 'Better' : 'Similar'
      },
      avgLength: {
        original: originalLengths.reduce((a, b) => a + b, 0) / originalLengths.length,
        humanized: humanizedLengths.reduce((a, b) => a + b, 0) / humanizedLengths.length
      }
    };
  }

  analyzeVocabularyDiversity(humanized, original) {
    const originalWords = this.extractWords(original);
    const humanizedWords = this.extractWords(humanized);

    const originalUnique = new Set(originalWords).size;
    const humanizedUnique = new Set(humanizedWords).size;

    const originalDiversity = originalUnique / originalWords.length;
    const humanizedDiversity = humanizedUnique / humanizedWords.length;

    return {
      totalWords: {
        original: originalWords.length,
        humanized: humanizedWords.length
      },
      uniqueWords: {
        original: originalUnique,
        humanized: humanizedUnique
      },
      diversityScore: {
        original: (originalDiversity * 100).toFixed(2),
        humanized: (humanizedDiversity * 100).toFixed(2),
        improvement: humanizedDiversity > originalDiversity ? 'Improved' : 'Similar'
      }
    };
  }

  calculateConfidenceScore(humanized, original) {
    const aiPatterns = this.detectAIPatterns(humanized).length;
    const humanIndicators = this.detectHumanIndicators(humanized).length;
    const sentenceAnalysis = this.analyzeSentenceStructure(humanized, original);
    const vocabularyAnalysis = this.analyzeVocabularyDiversity(humanized, original);

    let score = 50; // Base score

    // Reduce score for AI patterns
    score -= aiPatterns * 5;

    // Increase score for human indicators
    score += humanIndicators * 3;

    // Bonus for sentence variety
    if (sentenceAnalysis.lengthVariance.improvement === 'Better') {
      score += 10;
    }

    // Bonus for vocabulary diversity
    if (vocabularyAnalysis.diversityScore.improvement === 'Improved') {
      score += 10;
    }

    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));

    return {
      score: Math.round(score),
      riskLevel: this.getRiskLevel(score)
    };
  }

  getRiskLevel(score) {
    if (score >= 80) return 'Low Risk - Likely Human';
    if (score >= 60) return 'Medium Risk - Mixed Signals';
    if (score >= 40) return 'High Risk - Likely AI';
    return 'Very High Risk - Definitely AI';
  }

  displayAnalysis(analysis) {
    // Display confidence score
    const confidenceData = analysis.confidenceScore;
    document.getElementById('confidenceScore').textContent = confidenceData.score + '%';
    document.getElementById('riskLevel').textContent = confidenceData.riskLevel;

    // Display pattern counts
    document.getElementById('aiPatterns').textContent = analysis.aiPatterns.length;
    document.getElementById('humanIndicators').textContent = analysis.humanIndicators.length;

    // Display sentence analysis
    const sentenceDiv = document.getElementById('sentenceAnalysis');
    sentenceDiv.innerHTML = `
            <div>Sentences: ${analysis.sentenceStructure.sentenceCount.humanized}</div>
            <div>Avg Length: ${analysis.sentenceStructure.avgLength.humanized.toFixed(1)} words</div>
            <div>Variety: ${analysis.sentenceStructure.lengthVariance.improvement}</div>
        `;

    // Display vocabulary analysis
    const vocabDiv = document.getElementById('vocabularyAnalysis');
    vocabDiv.innerHTML = `
            <div>Total Words: ${analysis.vocabularyDiversity.totalWords.humanized}</div>
            <div>Unique Words: ${analysis.vocabularyDiversity.uniqueWords.humanized}</div>
            <div>Diversity: ${analysis.vocabularyDiversity.diversityScore.humanized}%</div>
        `;

    // Display pattern analysis
    const patternDiv = document.getElementById('patternAnalysis');
    patternDiv.innerHTML = `
            <div>AI Patterns: ${analysis.aiPatterns.length}</div>
            <div>Human Signals: ${analysis.humanIndicators.length}</div>
            <div>Overall Score: ${analysis.confidenceScore.score}%</div>
        `;
  }

  // Helper methods
  splitIntoSentences(text) {
    return text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  }

  extractWords(text) {
    return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 2);
  }

  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(n => Math.pow(n - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.aiTester = new AIHumanizerTester();
  console.log('AI Humanizer Test Suite loaded');
});
