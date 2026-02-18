/**
 * On-Device Detection System Integration Test
 * Comprehensive testing of the new on-device detection system
 */

class OnDeviceDetectionTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.testResults = [];
    this.authToken = null;
    this.testUser = {
      username: 'testuser_' + Date.now(),
      email: 'test_' + Date.now() + '@example.com',
      password: 'TestPassword123!'
    };
  }

  async runAllTests() {
    console.log('🚀 Starting On-Device Detection System Integration Tests...\n');

    try {
      await this.setupTestUser();
      await this.testDetectionEndpoints();
      await this.testPerformanceBenchmarks();
      await this.testOfflineFallback();
      await this.testErrorHandling();
      await this.generateReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
      this.testResults.push({
        test: 'Test Suite',
        status: 'FAILED',
        error: error.message
      });
    }

    return this.testResults;
  }

  async setupTestUser() {
    console.log('👤 Setting up test user...');

    // Register user
    const registerResponse = await fetch(`${this.baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.testUser)
    });

    if (!registerResponse.ok) {
      throw new Error('Failed to register test user');
    }

    // Login to get token
    const loginResponse = await fetch(`${this.baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.testUser.email,
        password: this.testUser.password
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Failed to login test user');
    }

    const loginData = await loginResponse.json();
    this.authToken = loginData.token;

    console.log('✅ Test user setup complete\n');
  }

  async testDetectionEndpoints() {
    console.log('🔍 Testing detection endpoints...');

    const testTexts = [
      {
        name: 'AI Generated Text',
        text: 'The implementation of artificial intelligence in modern society has revolutionized various industries. Machine learning algorithms can process vast amounts of data to identify patterns and make predictions with remarkable accuracy. This technological advancement continues to shape our future in unprecedented ways.'
      },
      {
        name: 'Human Written Text',
        text: 'Hey there! So, I was thinking about grabbing coffee later - maybe around 3? The weather\'s been kinda weird lately, huh? Anyway, let me know if you\'re free. Oh, and don\'t forget to bring that book you mentioned!'
      },
      {
        name: 'Mixed Content',
        text: 'The rapid advancement of AI technology has transformed how we work. Like, seriously, it\'s crazy how much things have changed! Machine learning models can now process complex datasets, which is pretty amazing when you think about it.'
      }
    ];

    for (const testCase of testTexts) {
      try {
        const startTime = performance.now();

        const response = await fetch(`${this.baseUrl}/api/detect/ai-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify({
            text: testCase.text,
            options: { detailed: true }
          })
        });

        const processingTime = performance.now() - startTime;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        this.testResults.push({
          test: `Detection - ${testCase.name}`,
          status: 'PASSED',
          processingTime,
          aiProbability: result.data.detection.aiProbability,
          humanProbability: result.data.detection.humanProbability,
          confidenceScore: result.data.detection.confidenceScore,
          riskLevel: result.data.detection.riskLevel,
          modelsUsed: result.data.detection.analysis ? Object.keys(result.data.detection.analysis) : []
        });

        console.log(`✅ ${testCase.name}: AI=${(result.data.detection.aiProbability * 100).toFixed(1)}%, Time=${processingTime.toFixed(0)}ms`);

      } catch (error) {
        this.testResults.push({
          test: `Detection - ${testCase.name}`,
          status: 'FAILED',
          error: error.message
        });
        console.log(`❌ ${testCase.name}: ${error.message}`);
      }
    }

    console.log('');
  }

  async testPerformanceBenchmarks() {
    console.log('⚡ Running performance benchmarks...');

    const testText = 'Artificial intelligence has revolutionized the way we approach problem-solving in various industries. The integration of machine learning algorithms has enabled unprecedented levels of automation and efficiency.';

    // Warm up
    for (let i = 0; i < 3; i++) {
      await fetch(`${this.baseUrl}/api/detect/ai-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ text: testText })
      });
    }

    // Benchmark runs
    const benchmarkRuns = 10;
    const processingTimes = [];

    for (let i = 0; i < benchmarkRuns; i++) {
      const startTime = performance.now();

      const response = await fetch(`${this.baseUrl}/api/detect/ai-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({ text: testText })
      });

      const processingTime = performance.now() - startTime;
      processingTimes.push(processingTime);

      if (!response.ok) {
        throw new Error(`Benchmark run ${i + 1} failed`);
      }
    }

    const avgTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
    const minTime = Math.min(...processingTimes);
    const maxTime = Math.max(...processingTimes);

    this.testResults.push({
      test: 'Performance Benchmark',
      status: 'PASSED',
      avgProcessingTime: avgTime,
      minProcessingTime: minTime,
      maxProcessingTime: maxTime,
      totalRuns: benchmarkRuns
    });

    console.log(`✅ Performance: Avg=${avgTime.toFixed(1)}ms, Min=${minTime.toFixed(1)}ms, Max=${maxTime.toFixed(1)}ms`);
    console.log('');
  }

  async testOfflineFallback() {
    console.log('🌐 Testing offline fallback mechanisms...');

    try {
      // Test with network simulation delay
      const testText = 'This is a test text for offline fallback detection.';

      const response = await fetch(`${this.baseUrl}/api/detect/ai-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`
        },
        body: JSON.stringify({
          text: testText,
          options: { simulateOffline: true }
        })
      });

      if (!response.ok) {
        throw new Error('Fallback test failed');
      }

      const result = await response.json();

      this.testResults.push({
        test: 'Offline Fallback',
        status: 'PASSED',
        fallbackUsed: result.data.detection.service === 'FallbackDetection',
        aiProbability: result.data.detection.aiProbability,
        processingTime: result.data.detection.processingTime
      });

      console.log(`✅ Offline fallback: Used=${result.data.detection.service === 'FallbackDetection'}, Time=${result.data.detection.processingTime}ms`);

    } catch (error) {
      this.testResults.push({
        test: 'Offline Fallback',
        status: 'FAILED',
        error: error.message
      });
      console.log(`❌ Offline fallback: ${error.message}`);
    }

    console.log('');
  }

  async testErrorHandling() {
    console.log('🛡️ Testing error handling...');

    const errorTests = [
      {
        name: 'Empty Text',
        data: { text: '' }
      },
      {
        name: 'Invalid Text Type',
        data: { text: 123 }
      },
      {
        name: 'Missing Text',
        data: {}
      },
      {
        name: 'Very Long Text',
        data: { text: 'a'.repeat(10000) }
      }
    ];

    for (const testCase of errorTests) {
      try {
        const response = await fetch(`${this.baseUrl}/api/detect/ai-content`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`
          },
          body: JSON.stringify(testCase.data)
        });

        if (response.ok) {
          throw new Error('Expected error but got success response');
        }

        const errorResult = await response.json();

        this.testResults.push({
          test: `Error Handling - ${testCase.name}`,
          status: 'PASSED',
          errorCode: errorResult.error?.code,
          errorMessage: errorResult.error?.message
        });

        console.log(`✅ ${testCase.name}: Properly handled with error code`);

      } catch (error) {
        this.testResults.push({
          test: `Error Handling - ${testCase.name}`,
          status: 'FAILED',
          error: error.message
        });
        console.log(`❌ ${testCase.name}: ${error.message}`);
      }
    }

    console.log('');
  }

  async generateReport() {
    console.log('📊 GENERATING TEST REPORT...\n');

    const passedTests = this.testResults.filter(r => r.status === 'PASSED').length;
    const totalTests = this.testResults.length;
    const successRate = (passedTests / totalTests * 100).toFixed(1);

    console.log('='.repeat(60));
    console.log('ON-DEVICE DETECTION SYSTEM INTEGRATION TEST REPORT');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${successRate}%`);
    console.log('='.repeat(60));

    // Performance Summary
    const perfTests = this.testResults.filter(r => r.processingTime);
    if (perfTests.length > 0) {
      const avgProcessingTime = perfTests.reduce((sum, test) => sum + test.processingTime, 0) / perfTests.length;
      console.log(`\nAverage Processing Time: ${avgProcessingTime.toFixed(1)}ms`);
    }

    // Benchmark Summary
    const benchmark = this.testResults.find(r => r.test === 'Performance Benchmark');
    if (benchmark && benchmark.status === 'PASSED') {
      console.log('\nPerformance Benchmark Results:');
      console.log(`- Average: ${benchmark.avgProcessingTime.toFixed(1)}ms`);
      console.log(`- Minimum: ${benchmark.minProcessingTime.toFixed(1)}ms`);
      console.log(`- Maximum: ${benchmark.maxProcessingTime.toFixed(1)}ms`);
      console.log(`- Total Runs: ${benchmark.totalRuns}`);
    }

    // Failed Tests
    const failedTests = this.testResults.filter(r => r.status === 'FAILED');
    if (failedTests.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      failedTests.forEach(test => {
        console.log(`- ${test.test}: ${test.error}`);
      });
    }

    console.log('\n' + '='.repeat(60));

    return {
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      successRate,
      results: this.testResults
    };
  }
}

// Run tests if this file is executed directly
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OnDeviceDetectionTester;
} else {
  // Browser execution
  window.OnDeviceDetectionTester = OnDeviceDetectionTester;
}

// Auto-run tests when called from command line
if (typeof window === 'undefined') {
  const tester = new OnDeviceDetectionTester();
  tester.runAllTests().then(results => {
    console.log('\n🎯 Test execution completed!');
    process.exit(results.filter(r => r.status === 'FAILED').length > 0 ? 1 : 0);
  }).catch(error => {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  });
}
