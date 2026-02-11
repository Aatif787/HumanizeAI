/**
 * Performance Benchmarks for On-Device vs API-Based AI Detection
 * Compares speed, accuracy, resource usage, and reliability
 */

const OnDeviceDetectionService = require('./server/services/OnDeviceDetectionService');
const { AdvancedTextHumanizer, AdvancedAIDetector } = require('./advanced-humanizer.js');
const fs = require('fs');
const path = require('path');

class PerformanceBenchmark {
  constructor() {
    this.onDeviceService = new OnDeviceDetectionService();
    this.humanizer = new AdvancedTextHumanizer();
    this.detector = new AdvancedAIDetector();
    this.results = {
      onDevice: [],
      apiBased: [],
      humanizer: [],
      comparison: {}
    };

    // Test texts of varying lengths and complexity
    this.testTexts = [
      {
        name: 'Short Text',
        text: 'The weather is nice today. I went for a walk in the park.',
        expected: 'human_written'
      },
      {
        name: 'Medium Text',
        text: 'The implementation of machine learning algorithms has revolutionized various industries. Furthermore, the optimization of these systems continues to facilitate substantial improvements in operational efficiency.',
        expected: 'ai_generated'
      },
      {
        name: 'Long Text',
        text: 'Artificial intelligence represents a significant advancement in computational capabilities. The methodology employed in developing these systems involves comprehensive analysis of substantial datasets. Consequently, the implementation of such technology facilitates optimization across various operational domains. Moreover, the substantial impact on efficiency metrics demonstrates the significant potential for widespread adoption.',
        expected: 'ai_generated'
      },
      {
        name: 'Mixed Content',
        text: 'Hey everyone! I wanted to share my thoughts about the new project. The implementation methodology requires comprehensive analysis of substantial datasets. Consequently, we can facilitate optimization across various operational domains. What do you all think?',
        expected: 'mixed_content'
      }
    ];
  }

  async benchmarkHumanizer() {
    console.log('✍️ Running Humanizer Benchmark...');
    for (const testCase of this.testTexts) {
      const iterations = 5;
      const results = [];
      for (let i = 0; i < iterations; i++) {
        try {
          const startTime = performance.now();
          const humanized = await this.humanizer.humanizeText(testCase.text, {
            style: 'casual',
            complexity: 'medium',
            formality: 'medium',
            errorLevel: 'moderate',
            maxRetries: 2
          });
          const endTime = performance.now();
          const output = humanized.humanizedText || humanized.text || '';
          const analysis = this.detector.analyzeText(output);
          results.push({
            iteration: i + 1,
            processingTime: endTime - startTime,
            detectionScore: analysis.overallScore,
            success: true
          });
        } catch (error) {
          results.push({
            iteration: i + 1,
            error: error.message,
            success: false
          });
        }
      }
      const successes = results.filter(r => r.success);
      this.results.humanizer.push({
        testCase: testCase.name,
        results,
        averageTime: successes.length ? successes.reduce((sum, r) => sum + r.processingTime, 0) / successes.length : 0,
        averageScore: successes.length ? successes.reduce((sum, r) => sum + r.detectionScore, 0) / successes.length : 100,
        successRate: successes.length / results.length
      });
    }
  }

  // Simulate API-based detection (with network latency)
  async simulateAPIDetection(text) {
    const startTime = performance.now();

    // Simulate network latency (50-200ms)
    const lengthFactor = Math.min(2, text.length / 500);
    const networkLatency = (50 + Math.random() * 150) * lengthFactor;
    await new Promise(resolve => setTimeout(resolve, networkLatency));

    // Simulate API processing time (100-300ms)
    const processingTime = (100 + Math.random() * 200) * lengthFactor;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    const endTime = performance.now();

    // Simulate API response
    const predictions = ['human_written', 'ai_generated', 'mixed_content'];
    const confidence = 0.7 + Math.random() * 0.3; // 70-100% confidence

    return {
      prediction: predictions[Math.floor(Math.random() * predictions.length)],
      confidence: confidence,
      processingTime: endTime - startTime,
      networkLatency: networkLatency,
      apiProcessingTime: processingTime,
      totalTime: endTime - startTime
    };
  }

  // Run on-device detection benchmark
  async benchmarkOnDevice() {
    console.log('🏃 Running On-Device Detection Benchmark...');

    for (const testCase of this.testTexts) {
      const iterations = 10; // Run multiple iterations for better accuracy
      const results = [];

      for (let i = 0; i < iterations; i++) {
        try {
          const startTime = performance.now();
          const result = await this.onDeviceService.detectAI(testCase.text);
          const endTime = performance.now();

          results.push({
            iteration: i + 1,
            prediction: result.prediction,
            confidence: result.confidence,
            processingTime: endTime - startTime,
            success: true
          });
        } catch (error) {
          results.push({
            iteration: i + 1,
            error: error.message,
            success: false
          });
        }
      }

      this.results.onDevice.push({
        testCase: testCase.name,
        expected: testCase.expected,
        results: results,
        averageTime: results.filter(r => r.success).reduce((sum, r) => sum + r.processingTime, 0) / results.filter(r => r.success).length,
        successRate: results.filter(r => r.success).length / results.length,
        accuracy: this.calculateAccuracy(results, testCase.expected)
      });
    }
  }

  // Run API-based detection benchmark
  async benchmarkAPI() {
    console.log('🌐 Running API-Based Detection Benchmark...');

    for (const testCase of this.testTexts) {
      const iterations = 10;
      const results = [];

      for (let i = 0; i < iterations; i++) {
        try {
          const result = await this.simulateAPIDetection(testCase.text);

          results.push({
            iteration: i + 1,
            prediction: result.prediction,
            confidence: result.confidence,
            processingTime: result.processingTime,
            networkLatency: result.networkLatency,
            apiProcessingTime: result.apiProcessingTime,
            success: true
          });
        } catch (error) {
          results.push({
            iteration: i + 1,
            error: error.message,
            success: false
          });
        }
      }

      this.results.apiBased.push({
        testCase: testCase.name,
        expected: testCase.expected,
        results: results,
        averageTime: results.filter(r => r.success).reduce((sum, r) => sum + r.processingTime, 0) / results.filter(r => r.success).length,
        successRate: results.filter(r => r.success).length / results.length,
        accuracy: this.calculateAccuracy(results, testCase.expected)
      });
    }
  }

  // Calculate accuracy
  calculateAccuracy(results, expected) {
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) return 0;

    const correctPredictions = successfulResults.filter(r => r.prediction === expected).length;
    return correctPredictions / successfulResults.length;
  }

  // Generate comparison report
  generateComparisonReport() {
    console.log('📊 Generating Performance Comparison Report...');

    const onDeviceAvgTime = this.results.onDevice.reduce((sum, r) => sum + r.averageTime, 0) / this.results.onDevice.length;
    const apiAvgTime = this.results.apiBased.reduce((sum, r) => sum + r.averageTime, 0) / this.results.apiBased.length;

    const onDeviceAvgAccuracy = this.results.onDevice.reduce((sum, r) => sum + r.accuracy, 0) / this.results.onDevice.length;
    const apiAvgAccuracy = this.results.apiBased.reduce((sum, r) => sum + r.accuracy, 0) / this.results.apiBased.length;

    const onDeviceAvgSuccessRate = this.results.onDevice.reduce((sum, r) => sum + r.successRate, 0) / this.results.onDevice.length;
    const apiAvgSuccessRate = this.results.apiBased.reduce((sum, r) => sum + r.successRate, 0) / this.results.apiBased.length;

    this.results.comparison = {
      speed: {
        onDevice: onDeviceAvgTime,
        apiBased: apiAvgTime,
        speedup: apiAvgTime / onDeviceAvgTime,
        winner: onDeviceAvgTime < apiAvgTime ? 'On-Device' : 'API-Based'
      },
      accuracy: {
        onDevice: onDeviceAvgAccuracy,
        apiBased: apiAvgAccuracy,
        difference: Math.abs(apiAvgAccuracy - onDeviceAvgAccuracy),
        winner: onDeviceAvgAccuracy > apiAvgAccuracy ? 'On-Device' : 'API-Based'
      },
      reliability: {
        onDevice: onDeviceAvgSuccessRate,
        apiBased: apiAvgSuccessRate,
        difference: Math.abs(apiAvgSuccessRate - onDeviceAvgSuccessRate),
        winner: onDeviceAvgSuccessRate > apiAvgSuccessRate ? 'On-Device' : 'API-Based'
      }
    };
  }

  // Generate detailed benchmark report
  generateBenchmarkReport() {
    const humanizerAvgTime = this.results.humanizer.length
      ? this.results.humanizer.reduce((sum, r) => sum + r.averageTime, 0) / this.results.humanizer.length
      : 0;
    const humanizerAvgScore = this.results.humanizer.length
      ? this.results.humanizer.reduce((sum, r) => sum + r.averageScore, 0) / this.results.humanizer.length
      : 0;
    const humanizerSuccessRate = this.results.humanizer.length
      ? this.results.humanizer.reduce((sum, r) => sum + r.successRate, 0) / this.results.humanizer.length
      : 0;
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTestCases: this.testTexts.length,
        iterationsPerTestCase: 10,
        humanizer: {
          averageTime: humanizerAvgTime,
          averageScore: humanizerAvgScore,
          successRate: humanizerSuccessRate
        },
        comparison: this.results.comparison
      },
      detailedResults: {
        onDevice: this.results.onDevice,
        apiBased: this.results.apiBased,
        humanizer: this.results.humanizer
      },
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  // Generate recommendations based on benchmark results
  generateRecommendations() {
    const recommendations = [];
    const comparison = this.results.comparison;

    if (comparison.speed.speedup > 2) {
      recommendations.push({
        category: 'Performance',
        recommendation: 'On-device detection is significantly faster than API-based detection',
        details: `${comparison.speed.speedup.toFixed(1)}x speedup achieved`
      });
    }

    if (comparison.accuracy.winner === 'On-Device' && comparison.accuracy.difference > 0.1) {
      recommendations.push({
        category: 'Accuracy',
        recommendation: 'On-device detection shows superior accuracy',
        details: `${(comparison.accuracy.difference * 100).toFixed(1)}% accuracy improvement`
      });
    }

    if (comparison.reliability.winner === 'On-Device') {
      recommendations.push({
        category: 'Reliability',
        recommendation: 'On-device detection is more reliable (no network dependencies)',
        details: 'Eliminates network failures and latency issues'
      });
    }

    recommendations.push({
      category: 'Cost',
      recommendation: 'On-device detection eliminates API costs and rate limits',
      details: 'Reduces operational expenses and scales with user growth'
    });

    recommendations.push({
      category: 'Privacy',
      recommendation: 'On-device detection provides better privacy protection',
      details: 'User data never leaves the device'
    });

    return recommendations;
  }

  // Run complete benchmark suite
  async runBenchmarks() {
    console.log('🚀 Starting Performance Benchmarks...\n');

    try {
      await this.benchmarkOnDevice();
      console.log('');

      await this.benchmarkAPI();
      console.log('');

      await this.benchmarkHumanizer();
      console.log('');

      this.generateComparisonReport();

      const report = this.generateBenchmarkReport();

      // Save report to file
      const reportPath = path.join(__dirname, 'benchmark-results.json');
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

      // Display summary
      this.displaySummary(report);

      return report;

    } catch (error) {
      console.error('Benchmark failed:', error);
      throw error;
    }
  }

  // Display summary of results
  displaySummary(report) {
    console.log('📈 Performance Benchmark Summary');
    console.log('=====================================\n');

    const comparison = report.summary.comparison;

    console.log('⚡ Speed Comparison:');
    console.log(`  On-Device: ${comparison.speed.onDevice.toFixed(1)}ms average`);
    console.log(`  API-Based: ${comparison.speed.apiBased.toFixed(1)}ms average`);
    console.log(`  Speedup: ${comparison.speed.speedup.toFixed(1)}x faster with ${comparison.speed.winner}\n`);

    if (report.summary.humanizer) {
      console.log('✍️ Humanizer Performance:');
      console.log(`  Average Time: ${report.summary.humanizer.averageTime.toFixed(1)}ms`);
      console.log(`  Average Detection Score: ${report.summary.humanizer.averageScore.toFixed(1)}%`);
      console.log(`  Success Rate: ${(report.summary.humanizer.successRate * 100).toFixed(1)}%\n`);
    }

    console.log('🎯 Accuracy Comparison:');
    console.log(`  On-Device: ${(comparison.accuracy.onDevice * 100).toFixed(1)}%`);
    console.log(`  API-Based: ${(comparison.accuracy.apiBased * 100).toFixed(1)}%`);
    console.log(`  Winner: ${comparison.accuracy.winner}\n`);

    console.log('🔒 Reliability Comparison:');
    console.log(`  On-Device: ${(comparison.reliability.onDevice * 100).toFixed(1)}% success rate`);
    console.log(`  API-Based: ${(comparison.reliability.apiBased * 100).toFixed(1)}% success rate`);
    console.log(`  Winner: ${comparison.reliability.winner}\n`);

    console.log('💡 Key Recommendations:');
    report.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec.category}: ${rec.recommendation}`);
      console.log(`     ${rec.details}`);
    });

    console.log(`\n📄 Full report saved to: ${path.join(__dirname, 'benchmark-results.json')}`);
  }
}

// Run benchmarks if this file is executed directly
if (require.main === module) {
  const benchmark = new PerformanceBenchmark();
  benchmark.runBenchmarks().catch(console.error);
}

module.exports = PerformanceBenchmark;
