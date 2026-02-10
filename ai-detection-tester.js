// AI Detection Evasion Testing Suite
class AIDetectionTester {
  constructor() {
    this.testResults = [];
    this.initializeTestSuite();
  }

  // Simulate AI detection patterns that various tools look for
  aiDetectionPatterns = {
    // GPTZero patterns
    gptzero: {
      name: 'GPTZero',
      patterns: [
        /\bin conclusion\b/gi,
        /\bfurthermore\b/gi,
        /\bmoreover\b/gi,
        /\bhowever\b/gi,
        /\btherefore\b/gi,
        /\bit is important to note\b/gi,
        /\bit should be noted\b/gi,
        /\badditionally\b/gi,
        /\bconsequently\b/gi,
        /\bnevertheless\b/gi
      ],
      scoring: {
        perfect_structure: 10,
        formal_transitions: 8,
        consistent_tone: 7,
        complex_sentences: 6
      }
    },

    // Turnitin patterns
    turnitin: {
      name: 'Turnitin',
      patterns: [
        /\bartificial intelligence\b/gi,
        /\bmachine learning\b/gi,
        /\balgorithm\b/gi,
        /\bdata analysis\b/gi,
        /\bcomputational\b/gi,
        /\bautomated\b/gi,
        /\bsystematic approach\b/gi,
        /\bmethodology\b/gi,
        /\bimplementation\b/gi,
        /\boptimization\b/gi
      ],
      scoring: {
        technical_vocabulary: 9,
        systematic_structure: 8,
        lack_of_personal_voice: 10,
        consistent_formatting: 7
      }
    },

    // Originality.AI patterns
    originality: {
      name: 'Originality.AI',
      patterns: [
        /\butilize\b/gi,
        /\bemploy\b/gi,
        /\bdemonstrate\b/gi,
        /\bexhibit\b/gi,
        /\bpossess\b/gi,
        /\bobtain\b/gi,
        /\bacquire\b/gi,
        /\bfacilitate\b/gi,
        /\benable\b/gi,
        /\bprovide\b/gi
      ],
      scoring: {
        formal_language: 9,
        lack_of_contractions: 8,
        perfect_grammar: 10,
        consistent_style: 8
      }
    },

    // Crossplag patterns
    crossplag: {
      name: 'Crossplag',
      patterns: [
        /\bcomprehensive\b/gi,
        /\bextensive\b/gi,
        /\bsignificant\b/gi,
        /\bsubstantial\b/gi,
        /\bconsiderable\b/gi,
        /\bremarkable\b/gi,
        /\bnotable\b/gi,
        /\bexceptional\b/gi,
        /\boutstanding\b/gi,
        /\bprominent\b/gi
      ],
      scoring: {
        sophisticated_vocabulary: 9,
        lack_of_errors: 9,
        perfect_structure: 8,
        academic_tone: 10
      }
    }
  };

  // Human-like variations that evade detection
  humanizationStrategies = {
    // Break perfect patterns
    pattern_disruption: {
      methods: [
        'inject_minor_typos',
        'vary_sentence_length',
        'add_informal_elements',
        'include_personal_opinions',
        'use_contractions',
        'add_colloquialisms'
      ]
    },

    // Add human voice
    voice_injection: {
      methods: [
        'add_personal_experience',
        'include_emotional_language',
        'use_subjective_statements',
        'add_questions',
        'include_exclamations',
        'add_hesitation_markers'
      ]
    },

    // Create natural flow
    flow_enhancement: {
      methods: [
        'add_natural_transitions',
        'vary_paragraph_length',
        'include_imperfect_transitions',
        'add_repetition_for_emphasis',
        'use_informal_connectors'
      ]
    }
  };

  initializeTestSuite() {
    console.log('AI Detection Testing Suite initialized');
    this.createTestInterface();
  }

  createTestInterface() {
    // Add testing panel to the main interface
    const testPanel = document.createElement('div');
    testPanel.id = 'ai-test-panel';
    testPanel.className = 'fixed bottom-4 right-4 bg-dark-800 border border-dark-600 rounded-lg p-4 shadow-xl z-40 max-w-sm';
    testPanel.innerHTML = `
            <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-semibold text-gray-300">AI Detection Test</h4>
                <button id="close-test-panel" class="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-white hover:bg-dark-700" aria-label="Close AI Detection Test">
                    <span aria-hidden="true" class="text-lg leading-none">&times;</span>
                </button>
            </div>
            <div class="space-y-2">
                <button id="test-gptzero" class="w-full text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">
                    Test GPTZero
                </button>
                <button id="test-turnitin" class="w-full text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded">
                    Test Turnitin
                </button>
                <button id="test-originality" class="w-full text-xs bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded">
                    Test Originality.AI
                </button>
                <button id="test-crossplag" class="w-full text-xs bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded">
                    Test Crossplag
                </button>
                <button id="test-all" class="w-full text-xs bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded">
                    Test All Detectors
                </button>
            </div>
            <div id="test-results" class="mt-3 text-xs text-gray-400"></div>
        `;

    document.body.appendChild(testPanel);
    this.attachTestListeners();
  }

  attachTestListeners() {
    document.getElementById('close-test-panel').addEventListener('click', () => {
      const panel = document.getElementById('ai-test-panel');
      if (panel) panel.remove();
    });

    document.getElementById('test-gptzero').addEventListener('click', () => {
      this.testDetector('gptzero');
    });

    document.getElementById('test-turnitin').addEventListener('click', () => {
      this.testDetector('turnitin');
    });

    document.getElementById('test-originality').addEventListener('click', () => {
      this.testDetector('originality');
    });

    document.getElementById('test-crossplag').addEventListener('click', () => {
      this.testDetector('crossplag');
    });

    document.getElementById('test-all').addEventListener('click', () => {
      this.testAllDetectors();
    });
  }

  testDetector(detectorName) {
    const outputText = document.getElementById('output-text').value;
    if (!outputText) {
      this.showTestResult('No text to test!', 'error');
      return;
    }

    this.showTestResult(`Testing ${detectorName}...`, 'info');

    // Simulate testing delay
    setTimeout(() => {
      const result = this.analyzeTextForAI(outputText, detectorName);
      this.displayTestResult(detectorName, result);
    }, 1000);
  }

  testAllDetectors() {
    const outputText = document.getElementById('output-text').value;
    if (!outputText) {
      this.showTestResult('No text to test!', 'error');
      return;
    }

    this.showTestResult('Testing all detectors...', 'info');

    const results = {};
    Object.keys(this.aiDetectionPatterns).forEach(detector => {
      results[detector] = this.analyzeTextForAI(outputText, detector);
    });

    setTimeout(() => {
      this.displayAllTestResults(results);
    }, 2000);
  }

  analyzeTextForAI(text, detectorName) {
    const detector = this.aiDetectionPatterns[detectorName];
    let aiScore = 0;
    let patternMatches = 0;

    // Check for AI patterns
    detector.patterns.forEach(pattern => {
      const matches = (text.match(pattern) || []).length;
      if (matches > 0) {
        patternMatches += matches;
        aiScore += matches * 2; // Each match adds 2 points
      }
    });

    // Additional scoring based on characteristics
    const characteristics = this.analyzeTextCharacteristics(text);

    Object.keys(detector.scoring).forEach(characteristic => {
      if (characteristics[characteristic]) {
        aiScore += detector.scoring[characteristic];
      }
    });

    // Calculate final score (0-100)
    const finalScore = Math.min(100, aiScore);

    return {
      score: finalScore,
      patternMatches: patternMatches,
      characteristics: characteristics,
      humanized: finalScore < 30, // Score below 30 is considered humanized
      confidence: this.calculateConfidence(finalScore)
    };
  }

  analyzeTextCharacteristics(text) {
    const characteristics = {};

    // Perfect structure detection
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.trim().split(' ').length, 0) / sentences.length;
    characteristics.perfect_structure = avgSentenceLength > 15 && avgSentenceLength < 25;

    // Formal transitions
    const formalTransitions = ['furthermore', 'moreover', 'however', 'therefore', 'consequently', 'nevertheless'];
    characteristics.formal_transitions = formalTransitions.some(transition =>
      text.toLowerCase().includes(transition)
    );

    // Consistent tone
    characteristics.consistent_tone = this.detectConsistentTone(text);

    // Complex sentences
    characteristics.complex_sentences = sentences.some(sentence =>
      sentence.split(',').length > 2 || sentence.split(';').length > 1
    );

    // Technical vocabulary
    const technicalWords = ['algorithm', 'methodology', 'implementation', 'optimization', 'systematic'];
    characteristics.technical_vocabulary = technicalWords.some(word =>
      text.toLowerCase().includes(word)
    );

    // Lack of personal voice
    characteristics.lack_of_personal_voice = !text.includes('I ') && !text.includes('my ') && !text.includes('me ');

    // Consistent formatting
    characteristics.consistent_formatting = this.detectConsistentFormatting(text);

    // Sophisticated vocabulary
    const sophisticatedWords = ['comprehensive', 'extensive', 'significant', 'substantial', 'considerable'];
    characteristics.sophisticated_vocabulary = sophisticatedWords.some(word =>
      text.toLowerCase().includes(word)
    );

    // Lack of errors
    characteristics.lack_of_errors = this.detectLackOfErrors(text);

    // Academic tone
    characteristics.academic_tone = this.detectAcademicTone(text);

    return characteristics;
  }

  detectConsistentTone(text) {
    // Simple tone detection based on formality and consistency
    const formalWords = ['utilize', 'employ', 'demonstrate', 'exhibit', 'possess'];
    const informalWords = ['use', 'show', 'have', 'get', 'make'];

    const formalCount = formalWords.filter(word => text.toLowerCase().includes(word)).length;
    const informalCount = informalWords.filter(word => text.toLowerCase().includes(word)).length;

    return formalCount > informalCount || informalCount === 0;
  }

  detectConsistentFormatting(text) {
    // Check for consistent paragraph structure
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
    if (paragraphs.length < 2) return true;

    const firstParagraphLength = paragraphs[0].split(' ').length;
    return paragraphs.every(p => Math.abs(p.split(' ').length - firstParagraphLength) < 50);
  }

  detectLackOfErrors(text) {
    // Check for common human errors
    const commonErrors = ['teh', 'alot', 'definately', 'your\'re', 'their\'re'];
    return !commonErrors.some(error => text.toLowerCase().includes(error));
  }

  detectAcademicTone(text) {
    const academicWords = ['research', 'study', 'analysis', 'investigation', 'examination'];
    return academicWords.some(word => text.toLowerCase().includes(word));
  }

  calculateConfidence(score) {
    if (score < 20) return 'Very Low';
    if (score < 40) return 'Low';
    if (score < 60) return 'Medium';
    if (score < 80) return 'High';
    return 'Very High';
  }

  displayTestResult(detectorName, result) {
    const resultsDiv = document.getElementById('test-results');
    const detector = this.aiDetectionPatterns[detectorName];

    const colorClass = result.humanized ? 'text-green-400' : 'text-red-400';
    const statusIcon = result.humanized ? '✅' : '❌';

    resultsDiv.innerHTML = `
            <div class="border border-dark-600 rounded p-2 mb-2">
                <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-medium">${detector.name}</span>
                    <span class="text-xs ${colorClass}">${statusIcon}</span>
                </div>
                <div class="text-xs text-gray-400 mb-1">
                    AI Score: ${result.score}/100 (${result.confidence} confidence)
                </div>
                <div class="text-xs text-gray-500">
                    Pattern matches: ${result.patternMatches}
                </div>
                ${result.humanized ?
    '<div class="text-xs text-green-400">✓ Passes as human-written</div>' :
    '<div class="text-xs text-red-400">✗ Detected as AI-generated</div>'
}
            </div>
        `;
  }

  displayAllTestResults(results) {
    const resultsDiv = document.getElementById('test-results');
    let html = '<div class="text-xs font-medium mb-2">All Detector Results:</div>';

    let totalScore = 0;
    let passedDetectors = 0;

    Object.entries(results).forEach(([detectorName, result]) => {
      const detector = this.aiDetectionPatterns[detectorName];
      const colorClass = result.humanized ? 'text-green-400' : 'text-red-400';
      const statusIcon = result.humanized ? '✅' : '❌';

      totalScore += result.score;
      if (result.humanized) passedDetectors++;

      html += `
                <div class="border border-dark-600 rounded p-2 mb-1">
                    <div class="flex items-center justify-between">
                        <span class="text-xs">${detector.name}</span>
                        <span class="text-xs ${colorClass}">${statusIcon} ${result.score}/100</span>
                    </div>
                </div>
            `;
    });

    const averageScore = Math.round(totalScore / Object.keys(results).length);
    const overallSuccess = passedDetectors >= 3; // Pass if 3+ detectors are fooled

    html += `
            <div class="border-t border-dark-600 pt-2 mt-2">
                <div class="text-xs font-medium mb-1">Overall Results:</div>
                <div class="text-xs text-gray-400">
                    Average Score: ${averageScore}/100
                </div>
                <div class="text-xs text-gray-400">
                    Detectors Passed: ${passedDetectors}/4
                </div>
                <div class="text-xs ${overallSuccess ? 'text-green-400' : 'text-red-400'} font-medium">
                    ${overallSuccess ? '✓ Successfully evades detection' : '✗ May be detected by some tools'}
                </div>
            </div>
        `;

    resultsDiv.innerHTML = html;
  }

  showTestResult(message, type) {
    const resultsDiv = document.getElementById('test-results');
    const colorClass = type === 'error' ? 'text-red-400' : type === 'success' ? 'text-green-400' : 'text-blue-400';
    resultsDiv.innerHTML = `<div class="text-xs ${colorClass}">${message}</div>`;
  }

  // Method to generate test samples for validation
  generateTestSamples() {
    return {
      ai_original: 'Artificial intelligence is a transformative technology that has significantly impacted various industries. Furthermore, it is important to note that machine learning algorithms require extensive data analysis to function effectively. Moreover, the implementation of AI systems necessitates a systematic approach to problem-solving. Therefore, organizations must develop comprehensive strategies for integrating these technologies into their existing infrastructure.',

      humanized_light: 'AI\'s really changed how lots of industries work these days. You know, machine learning needs tons of data to actually work well. And setting up AI systems means you gotta be pretty organized about solving problems. So companies need good plans for adding these tech tools to what they already have.',

      humanized_medium: 'Honestly, artificial intelligence has completely transformed tons of industries. It\'s kinda crazy how much impact it\'s had. But here\'s the thing - machine learning algorithms actually need loads of data analysis to work properly. Like, we\'re talking massive amounts. And when you\'re implementing AI systems, you really need a solid approach to problem solving. That\'s why organizations have to come up with comprehensive strategies for integrating these technologies into their current setup.',

      humanized_heavy: 'So yeah, AI\'s basically revolutionized how businesses operate nowadays. I mean, it\'s pretty wild when you think about it. But here\'s what\'s interesting - these machine learning thingamajigs actually require tons and tons of data to function, you know? We\'re talking absolutely massive datasets here. And setting up AI systems? Well, that takes some serious problem-solving skills, let me tell you. Organizations really need to figure out solid game plans for weaving all this tech stuff into what they\'re already doing. At the end of the day, it\'s all about having a good strategy, right?'
    };
  }

  // Method to run comprehensive validation tests
  runValidationTests() {
    const samples = this.generateTestSamples();
    const results = {};

    Object.entries(samples).forEach(([sampleName, sampleText]) => {
      results[sampleName] = {};

      Object.keys(this.aiDetectionPatterns).forEach(detector => {
        results[sampleName][detector] = this.analyzeTextForAI(sampleText, detector);
      });
    });

    return results;
  }
}

// Initialize the testing suite when the page loads
document.addEventListener('DOMContentLoaded', () => {
  window.aiTester = new AIDetectionTester();

  // Add keyboard shortcut for testing (Ctrl/Cmd + T)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      const testPanel = document.getElementById('ai-test-panel');
      if (testPanel) {
        testPanel.style.display = testPanel.style.display === 'none' ? 'block' : 'none';
      }
    }
  });
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIDetectionTester;
}
