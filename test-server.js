// Minimal server for testing on-device detection
const express = require('express');
const cors = require('cors');
const OnDeviceDetectionService = require('./server/services/OnDeviceDetectionService');

const app = express();
const PORT = 3001; // Use different port to avoid conflicts

app.use(cors());
app.use(express.json());

const detectionService = new OnDeviceDetectionService();

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'On-Device Detection Test Server' });
});

// Test detection endpoint
app.post('/test-detection', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const startTime = Date.now();
    const result = await detectionService.detectAI(text, { detailed: true });
    const processingTime = Date.now() - startTime;

    res.json({
      success: true,
      result,
      performance: {
        processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Detection error:', error);
    res.status(500).json({
      error: 'Detection failed',
      message: error.message
    });
  }
});

// Performance benchmark endpoint
app.post('/benchmark', async (req, res) => {
  try {
    const { text, iterations = 10 } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required' });
    }

    const results = [];

    // Warm up
    for (let i = 0; i < 3; i++) {
      await detectionService.detectAI(text);
    }

    // Benchmark
    for (let i = 0; i < iterations; i++) {
      const startTime = Date.now();
      const result = await detectionService.detectAI(text);
      const processingTime = Date.now() - startTime;

      results.push({
        iteration: i + 1,
        processingTime,
        aiProbability: result.aiProbability,
        confidenceScore: result.confidenceScore
      });
    }

    const avgTime = results.reduce((sum, r) => sum + r.processingTime, 0) / results.length;
    const minTime = Math.min(...results.map(r => r.processingTime));
    const maxTime = Math.max(...results.map(r => r.processingTime));

    res.json({
      success: true,
      benchmark: {
        iterations,
        averageTime: avgTime,
        minTime,
        maxTime,
        results
      }
    });

  } catch (error) {
    console.error('Benchmark error:', error);
    res.status(500).json({
      error: 'Benchmark failed',
      message: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔍 Test detection: POST http://localhost:${PORT}/test-detection`);
  console.log(`⚡ Benchmark: POST http://localhost:${PORT}/benchmark`);
});

module.exports = app;
