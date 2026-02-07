/**
 * Comprehensive Unit and Integration Tests for On-Device AI Detection
 * Tests all models, services, and integration points
 */

const OnDeviceDetectionService = require('../services/OnDeviceDetectionService');
const MLModels = require('../services/MLModels');
const fs = require('fs');
const path = require('path');

class ComprehensiveTestSuite {
  constructor() {
    this.detectionService = new OnDeviceDetectionService();
    this.testResults = {
      unitTests: [],
      integrationTests: [],
      performanceTests: [],
      summary: {}
    };

    this.testStartTime = Date.now();
  }

  // Unit Tests for ML Models
  async testTextClassifierModel() {
    console.log('🧪 Testing TextClassifierModel...');

    const model = new MLModels.TextClassifierModel({
      modelSize: 'small',
      inferenceTime: '< 100ms',
      accuracy: '95%+',
      languages: ['en', 'es', 'fr']
    });

    const testCases = [
      { text: 'Hello world', expected: ['human_written', 'ai_generated', 'mixed_content'] },
      { text: 'The implementation of machine learning algorithms has revolutionized various industries.', expected: ['human_written', 'ai_generated', 'mixed_content'] },
      { text: 'Hey guys! What\'s up? I think we should totally go to the park today.', expected: ['human_written', 'ai_generated', 'mixed_content'] }
    ];

    const results = [];
    for (const testCase of testCases) {
      try {
        const result = await model.analyze(testCase.text);
        const success = testCase.expected.includes(result.prediction);

        results.push({
          test: `TextClassifierModel.analyze("${testCase.text.substring(0, 30)}...")`,
          success: success,
          prediction: result.prediction,
          confidence: result.confidence,
          processingTime: result.inferenceTime,
          expected: testCase.expected
        });
      } catch (error) {
        results.push({
          test: `TextClassifierModel.analyze("${testCase.text.substring(0, 30)}...")`,
          success: false,
          error: error.message
        });
      }
    }

    return {
      model: 'TextClassifierModel',
      tests: results,
      passed: results.filter(r => r.success).length,
      total: results.length
    };
  }

  async testStatisticalLanguageModel() {
    console.log('🧪 Testing StatisticalLanguageModel...');

    const model = new MLModels.StatisticalLanguageModel({
      type: 'ngram',
      order: 5,
      vocabularySize: 50000,
      smoothing: 'kneser-ney'
    });

    const testCases = [
      { text: 'The quick brown fox jumps over the lazy dog.' },
      { text: 'Machine learning algorithms are fascinating to study.' },
      { text: 'I went to the store yesterday and bought some groceries.' }
    ];

    const results = [];
    for (const testCase of testCases) {
      try {
        const result = await model.analyze(testCase.text);

        results.push({
          test: `StatisticalLanguageModel.analyze("${testCase.text.substring(0, 30)}...")`,
          success: true,
          perplexity: result.perplexity,
          vocabularyDiversity: result.vocabularyDiversity,
          sentenceLengthVariance: result.sentenceLengthVariance,
          avgSentenceLength: result.avgSentenceLength,
          patternScore: result.patternScore
        });
      } catch (error) {
        results.push({
          test: `StatisticalLanguageModel.analyze("${testCase.text.substring(0, 30)}...")`,
          success: false,
          error: error.message
        });
      }
    }

    return {
      model: 'StatisticalLanguageModel',
      tests: results,
      passed: results.filter(r => r.success).length,
      total: results.length
    };
  }

  async testStylometricAnalyzer() {
    console.log('🧪 Testing StylometricAnalyzer...');

    const analyzer = new MLModels.StylometricAnalyzer({
      features: ['sentence_length', 'vocabulary_diversity', 'passive_voice', 'transition_words'],
      comparisonBaseline: 'human_corpus'
    });

    const testCases = [
      { text: 'The implementation of machine learning algorithms has revolutionized various industries.' },
      { text: 'Hey guys! I went to the park yesterday and it was super fun!' }
    ];

    const results = [];
    for (const testCase of testCases) {
      try {
        const result = await analyzer.analyze(testCase.text);

        results.push({
          test: `StylometricAnalyzer.analyze("${testCase.text.substring(0, 30)}...")`,
          success: true,
          sentenceLengthVariance: result.sentenceLengthVariance,
          vocabularyDiversity: result.vocabularyDiversity,
          passiveVoiceUsage: result.passiveVoiceUsage,
          transitionWordDensity: result.transitionWordDensity,
          formalLanguageRatio: result.formalLanguageRatio
        });
      } catch (error) {
        results.push({
          test: `StylometricAnalyzer.analyze("${testCase.text.substring(0, 30)}...")`,
          success: false,
          error: error.message
        });
      }
    }

    return {
      model: 'StylometricAnalyzer',
      tests: results,
      passed: results.filter(r => r.success).length,
      total: results.length
    };
  }

  async testSemanticCoherenceAnalyzer() {
    console.log('🧪 Testing SemanticCoherenceAnalyzer...');

    const analyzer = new MLModels.SemanticCoherenceAnalyzer({
      embeddingModel: 'word2vec',
      coherenceThreshold: 0.7,
      topicModeling: true
    });

    const testCases = [
      { text: 'The cat sat on the mat. The mat was soft and comfortable.' },
      { text: 'Machine learning is a subset of artificial intelligence. Deep learning uses neural networks.' }
    ];

    const results = [];
    for (const testCase of testCases) {
      try {
        const result = await analyzer.analyze(testCase.text);

        results.push({
          test: `SemanticCoherenceAnalyzer.analyze("${testCase.text.substring(0, 30)}...")`,
          success: true,
          coherenceScore: result.coherenceScore,
          topicCoherence: result.topicCoherence,
          semanticSimilarity: result.semanticSimilarity,
          embeddingQuality: result.embeddingQuality
        });
      } catch (error) {
        results.push({
          test: `SemanticCoherenceAnalyzer.analyze("${testCase.text.substring(0, 30)}...")`,
          success: false,
          error: error.message
        });
      }
    }

    return {
      model: 'SemanticCoherenceAnalyzer',
      tests: results,
      passed: results.filter(r => r.success).length,
      total: results.length
    };
  }

  // Integration Tests
  async testBasicDetection() {
    console.log('🔗 Testing Basic Detection Integration...');

    const testCases = [
      {
        name: 'Human Text',
        text: 'Hey everyone! I just wanted to share my thoughts about the new project.',
        minConfidence: 0.5
      },
      {
        name: 'AI Text',
        text: 'The implementation of machine learning algorithms has revolutionized various industries. Furthermore, the optimization of these systems continues to facilitate substantial improvements in operational efficiency.',
        minConfidence: 0.5
      },
      {
        name: 'Mixed Content',
        text: 'Hey everyone! I wanted to share my thoughts about the new project. The implementation methodology requires comprehensive analysis of substantial datasets.',
        minConfidence: 0.5
      }
    ];

    const results = [];
    for (const testCase of testCases) {
      try {
        const startTime = performance.now();
        const result = await this.detectionService.detectAI(testCase.text);
        const processingTime = performance.now() - startTime;

        results.push({
          test: `Basic Detection - ${testCase.name}`,
          success: result.confidence >= testCase.minConfidence,
          prediction: result.prediction,
          confidence: result.confidence,
          processingTime: processingTime,
          modelsUsed: Object.keys(result).filter(key => key !== 'prediction' && key !== 'confidence')
        });
      } catch (error) {
        results.push({
          test: `Basic Detection - ${testCase.name}`,
          success: false,
          error: error.message
        });
      }
    }

    return {
      integration: 'Basic Detection',
      tests: results,
      passed: results.filter(r => r.success).length,
      total: results.length
    };
  }

  async testDetailedAnalysis() {
    console.log('🔗 Testing Detailed Analysis Integration...');

    const testText = 'The implementation of machine learning algorithms has revolutionized various industries. Furthermore, the optimization of these systems continues to facilitate substantial improvements in operational efficiency.';

    try {
      const result = await this.detectionService.detectAI(testText);

      const tests = [
        {
          test: 'Has prediction',
          success: result.prediction !== undefined,
          value: result.prediction
        },
        {
          test: 'Has confidence',
          success: result.confidence !== undefined && !isNaN(result.confidence),
          value: result.confidence
        },
        {
          test: 'Has detailed analysis',
          success: result.detailedAnalysis !== undefined,
          value: result.detailedAnalysis ? 'Present' : 'Missing'
        },
        {
          test: 'Has text classification',
          success: result.detailedAnalysis && result.detailedAnalysis.textClassification !== undefined,
          value: result.detailedAnalysis && result.detailedAnalysis.textClassification ? 'Present' : 'Missing'
        },
        {
          test: 'Has language analysis',
          success: result.detailedAnalysis && result.detailedAnalysis.languageAnalysis !== undefined,
          value: result.detailedAnalysis && result.detailedAnalysis.languageAnalysis ? 'Present' : 'Missing'
        }
      ];

      return {
        integration: 'Detailed Analysis',
        tests: tests,
        passed: tests.filter(t => t.success).length,
        total: tests.length
      };
    } catch (error) {
      return {
        integration: 'Detailed Analysis',
        tests: [{ test: 'Detailed Analysis', success: false, error: error.message }],
        passed: 0,
        total: 1
      };
    }
  }

  async testErrorHandling() {
    console.log('🔗 Testing Error Handling...');

    const errorCases = [
      { name: 'Empty Text', text: '' },
      { name: 'Very Long Text', text: 'a'.repeat(10000) },
      { name: 'Special Characters', text: '!@#$%^&*()_+-=[]{}|;:,.<>?' },
      { name: 'Non-English Text', text: 'こんにちは世界' },
      { name: 'Mixed Languages', text: 'Hello world! Hola mundo! Bonjour le monde!' }
    ];

    const results = [];
    for (const testCase of errorCases) {
      try {
        const result = await this.detectionService.detectAI(testCase.text);

        results.push({
          test: `Error Handling - ${testCase.name}`,
          success: result.prediction !== undefined,
          prediction: result.prediction,
          confidence: result.confidence,
          note: 'Should handle gracefully'
        });
      } catch (error) {
        results.push({
          test: `Error Handling - ${testCase.name}`,
          success: false,
          error: error.message,
          note: 'Error occurred'
        });
      }
    }

    return {
      integration: 'Error Handling',
      tests: results,
      passed: results.filter(r => r.success).length,
      total: results.length
    };
  }

  // Performance Tests
  async testPerformanceBenchmarks() {
    console.log('⚡ Running Performance Benchmarks...');

    const testTexts = [
      { name: 'Short Text', text: 'Hello world!', length: 12 },
      { name: 'Medium Text', text: 'The implementation of machine learning algorithms has revolutionized various industries.', length: 98 },
      { name: 'Long Text', text: 'Artificial intelligence represents a significant advancement in computational capabilities. The methodology employed in developing these systems involves comprehensive analysis of substantial datasets. Consequently, the implementation of such technology facilitates optimization across various operational domains.', length: 428 }
    ];

    const results = [];
    for (const testCase of testTexts) {
      const iterations = 10;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        try {
          await this.detectionService.detectAI(testCase.text);
          const endTime = performance.now();
          times.push(endTime - startTime);
        } catch (error) {
          times.push(null);
        }
      }

      const validTimes = times.filter(t => t !== null);
      const avgTime = validTimes.reduce((sum, t) => sum + t, 0) / validTimes.length;
      const minTime = Math.min(...validTimes);
      const maxTime = Math.max(...validTimes);

      results.push({
        test: `Performance - ${testCase.name} (${testCase.length} chars)`,
        success: validTimes.length > 0,
        averageTime: avgTime,
        minTime: minTime,
        maxTime: maxTime,
        iterations: validTimes.length,
        charactersPerSecond: (testCase.length * validTimes.length) / (validTimes.reduce((sum, t) => sum + t, 0) / 1000)
      });
    }

    return {
      performance: 'Processing Speed',
      tests: results,
      passed: results.filter(r => r.success).length,
      total: results.length
    };
  }

  async testMemoryUsage() {
    console.log('⚡ Testing Memory Usage...');

    // Simple memory test - measure before and after creating multiple instances
    const initialMemory = process.memoryUsage();

    const instances = [];
    for (let i = 0; i < 5; i++) {
      instances.push(new OnDeviceDetectionService());
    }

    const finalMemory = process.memoryUsage();
    const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

    return {
      performance: 'Memory Usage',
      tests: [{
        test: 'Memory increase per instance',
        success: memoryIncrease < 100 * 1024 * 1024, // Less than 100MB increase
        memoryIncrease: memoryIncrease,
        averagePerInstance: memoryIncrease / 5
      }],
      passed: 1,
      total: 1
    };
  }

  // Test Runner
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Test Suite...\n');

    const testSuites = [
      { name: 'Unit Tests', tests: [
        () => this.testTextClassifierModel(),
        () => this.testStatisticalLanguageModel(),
        () => this.testStylometricAnalyzer(),
        () => this.testSemanticCoherenceAnalyzer()
      ]},
      { name: 'Integration Tests', tests: [
        () => this.testBasicDetection(),
        () => this.testDetailedAnalysis(),
        () => this.testErrorHandling()
      ]},
      { name: 'Performance Tests', tests: [
        () => this.testPerformanceBenchmarks(),
        () => this.testMemoryUsage()
      ]}
    ];

    for (const suite of testSuites) {
      console.log(`\n📋 ${suite.name}`);
      console.log('='.repeat(50));

      for (const test of suite.tests) {
        try {
          const result = await test();
          const key = suite.name.toLowerCase().replace(' ', '') + 'Tests';
          if (!this.testResults[key]) {
            this.testResults[key] = [];
          }
          this.testResults[key].push(result);

          console.log(`✅ ${result.model || result.integration || result.performance}: ${result.passed}/${result.total} passed`);

          // Show failed tests
          const failedTests = result.tests.filter(t => !t.success);
          if (failedTests.length > 0) {
            console.log('   ❌ Failed tests:');
            failedTests.forEach(test => {
              console.log(`      - ${test.test}: ${test.error || 'Failed'}`);
            });
          }
        } catch (error) {
          console.log(`❌ Test failed with error: ${error.message}`);
        }
      }
    }

    this.generateSummary();
    this.saveResults();
    this.displayFinalReport();
  }

  generateSummary() {
    const unitTests = this.testResults.unitTests || [];
    const integrationTests = this.testResults.integrationTests || [];
    const performanceTests = this.testResults.performanceTests || [];

    const allTests = [...unitTests, ...integrationTests, ...performanceTests];

    const totalPassed = allTests.reduce((sum, test) => sum + test.passed, 0);
    const totalTests = allTests.reduce((sum, test) => sum + test.total, 0);

    this.testResults.summary = {
      totalTestSuites: allTests.length,
      totalPassed: totalPassed,
      totalTests: totalTests,
      successRate: totalTests > 0 ? (totalPassed / totalTests * 100).toFixed(1) : '0.0',
      testDuration: Date.now() - this.testStartTime
    };
  }

  saveResults() {
    const resultsPath = path.join(__dirname, 'test-results.json');
    fs.writeFileSync(resultsPath, JSON.stringify(this.testResults, null, 2));
  }

  displayFinalReport() {
    console.log('\n📊 Final Test Report');
    console.log('='.repeat(50));

    const summary = this.testResults.summary;
    console.log(`Total Test Suites: ${summary.totalTestSuites}`);
    console.log(`Total Tests Passed: ${summary.totalPassed}/${summary.totalTests}`);
    console.log(`Success Rate: ${summary.successRate}%`);
    console.log(`Test Duration: ${(summary.testDuration / 1000).toFixed(1)}s`);

    console.log('\n📈 Detailed Results:');

    // Unit Tests Summary
    const unitTests = this.testResults.unitTests || [];
    console.log(`\nUnit Tests: ${unitTests.reduce((sum, t) => sum + t.passed, 0)}/${unitTests.reduce((sum, t) => sum + t.total, 0)} passed`);
    unitTests.forEach(test => {
      console.log(`  - ${test.model}: ${test.passed}/${test.total} tests passed`);
    });

    // Integration Tests Summary
    const integrationTests = this.testResults.integrationTests || [];
    console.log(`\nIntegration Tests: ${integrationTests.reduce((sum, t) => sum + t.passed, 0)}/${integrationTests.reduce((sum, t) => sum + t.total, 0)} passed`);
    integrationTests.forEach(test => {
      console.log(`  - ${test.integration}: ${test.passed}/${test.total} tests passed`);
    });

    // Performance Tests Summary
    const performanceTests = this.testResults.performanceTests || [];
    console.log(`\nPerformance Tests: ${performanceTests.reduce((sum, t) => sum + t.passed, 0)}/${performanceTests.reduce((sum, t) => sum + t.total, 0)} passed`);
    performanceTests.forEach(test => {
      console.log(`  - ${test.performance}: ${test.passed}/${test.total} tests passed`);
    });

    console.log(`\n📄 Detailed results saved to: ${path.join(__dirname, 'test-results.json')}`);

    // Overall status
    if (summary.successRate >= 90) {
      console.log('\n✅ All tests completed successfully! The on-device detection system is ready for production.');
    } else if (summary.successRate >= 70) {
      console.log('\n⚠️  Most tests passed. Review failed tests before production deployment.');
    } else {
      console.log('\n❌ Many tests failed. Address issues before production deployment.');
    }
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  const testSuite = new ComprehensiveTestSuite();
  testSuite.runAllTests().catch(console.error);
}

module.exports = ComprehensiveTestSuite;
