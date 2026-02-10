/**
 * On-Device Detection Integration Test
 * Direct testing of detection functionality without auth requirements
 */

const OnDeviceDetectionService = require('./server/services/OnDeviceDetectionService');

class SimpleDetectionTest {
  constructor() {
    this.detectionService = new OnDeviceDetectionService();
    this.testResults = [];
  }

  async runTests() {
    console.log('🚀 Starting On-Device Detection Integration Tests...\n');

    try {
      await this.testBasicDetection();
      await this.testDetailedAnalysis();
      await this.testPerformance();
      await this.generateReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      console.error(error.stack);
    }
  }

  async testBasicDetection() {
    console.log('🔍 Testing basic detection...');

    const testCases = [
      {
        name: 'Human-written text',
        text: 'I went to the store yesterday and bought some groceries. The weather was nice and I decided to walk instead of driving.',
        expected: 'human_written'
      },
      {
        name: 'AI-generated text',
        text: 'In the contemporary digital landscape, artificial intelligence has emerged as a transformative force, fundamentally reshaping paradigms across multifaceted industries through the implementation of sophisticated machine learning algorithms.',
        expected: 'ai_generated'
      },
      {
        name: 'Mixed content',
        text: 'I love going to the park on weekends. The utilization of green spaces for recreational activities has been shown to provide significant psychological benefits, including reduced stress levels and enhanced cognitive function.',
        expected: 'mixed_content'
      }
    ];

    for (const testCase of testCases) {
      try {
        const startTime = Date.now();
        const result = await this.detectionService.detectAI(testCase.text);
        const processingTime = Date.now() - startTime;

        this.testResults.push({
          test: 'basic_detection',
          name: testCase.name,
          result: result,
          processingTime: processingTime,
          success: result.prediction === testCase.expected,
          details: result
        });

        console.log(`  ✅ ${testCase.name}: ${result.prediction} (${result.confidence}%) - ${processingTime}ms`);

      } catch (error) {
        console.error(`  ❌ ${testCase.name}: ${error.message}`);
        this.testResults.push({
          test: 'basic_detection',
          name: testCase.name,
          success: false,
          error: error.message
        });
      }
    }

    console.log('');
  }

  async testDetailedAnalysis() {
    console.log('📊 Testing detailed analysis...');

    const testText = 'The implementation of machine learning algorithms has revolutionized data processing capabilities in modern computing systems.';

    try {
      const result = await this.detectionService.detectAI(testText, { detailed: true });

      this.testResults.push({
        test: 'detailed_analysis',
        name: 'Detailed AI Detection',
        success: !!result.analysis,
        details: result
      });

      console.log('  ✅ Detailed analysis completed');
      console.log(`     Prediction: ${result.prediction}`);
      console.log(`     Confidence: ${result.confidence}%`);

      if (result.analysis) {
        console.log(`     Models used: ${Object.keys(result.analysis).join(', ')}`);
      }

    } catch (error) {
      console.error(`  ❌ Detailed analysis: ${error.message}`);
      this.testResults.push({
        test: 'detailed_analysis',
        name: 'Detailed AI Detection',
        success: false,
        error: error.message
      });
    }

    console.log('');
  }

  async testPerformance() {
    console.log('⚡ Testing performance...');

    const testTexts = [
      'Short text sample.',
      'This is a medium length text sample that contains a few sentences about various topics to test the performance of the detection system.',
      'This is a longer text sample that contains multiple sentences about various topics including technology, science, and everyday life. The purpose of this text is to test how well the system handles longer content and whether it can maintain good performance with increased text length.',
      'This is a very long text sample that contains many sentences about various topics including technology, science, education, health, and everyday life. The purpose of this text is to test how well the system handles very long content and whether it can maintain good performance with significantly increased text length. Performance testing is important to ensure that the system can handle real-world usage scenarios where users might submit texts of varying lengths, from short social media posts to long articles or documents.'
    ];

    const results = [];

    for (const text of testTexts) {
      try {
        const startTime = Date.now();
        const result = await this.detectionService.detectAI(text);
        const processingTime = Date.now() - startTime;

        results.push({
          textLength: text.length,
          processingTime: processingTime,
          prediction: result.prediction,
          confidence: result.confidence
        });

      } catch (error) {
        console.error(`  ❌ Performance test failed: ${error.message}`);
      }
    }

    this.testResults.push({
      test: 'performance',
      name: 'Performance Analysis',
      success: results.length > 0,
      details: results
    });

    console.log('  ✅ Performance test completed');
    results.forEach((result, index) => {
      console.log(`     Text ${index + 1} (${result.textLength} chars): ${result.processingTime}ms`);
    });

    console.log('');
  }

  generateReport() {
    console.log('📋 Test Report Summary');
    console.log('========================');

    const totalTests = this.testResults.length;
    const successfulTests = this.testResults.filter(test => test.success).length;
    const successRate = (successfulTests / totalTests * 100).toFixed(1);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${successfulTests}`);
    console.log(`Failed: ${totalTests - successfulTests}`);
    console.log(`Success Rate: ${successRate}%`);

    // Performance summary
    const performanceTests = this.testResults.filter(test => test.test === 'performance');
    if (performanceTests.length > 0) {
      const details = performanceTests[0].details;
      if (details && details.length > 0) {
        const avgProcessingTime = details.reduce((sum, result) => sum + result.processingTime, 0) / details.length;
        console.log(`Average Processing Time: ${avgProcessingTime.toFixed(1)}ms`);
      }
    }

    // Basic detection summary
    const basicTests = this.testResults.filter(test => test.test === 'basic_detection');
    if (basicTests.length > 0) {
      const successfulBasic = basicTests.filter(test => test.success).length;
      console.log(`Basic Detection Accuracy: ${(successfulBasic / basicTests.length * 100).toFixed(1)}%`);
    }

    console.log('\n🎯 Integration test completed!');
  }
}

// Run the tests
const tester = new SimpleDetectionTest();
tester.runTests();
