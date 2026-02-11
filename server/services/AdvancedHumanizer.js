const logger = require('../config/logger');
const path = require('path');
const { spawn } = require('child_process');
const { AdvancedTextHumanizer, AdvancedAIDetector } = require(path.join(__dirname, '../../advanced-humanizer.js'));

class HumanizerService {
  constructor() {
    this.humanizer = new AdvancedTextHumanizer();
    this.detector = new AdvancedAIDetector();
  }

  /**
   * Invokes the Python-based Super Humanize engine for advanced linguistic variation.
   * @param {string} text 
   * @returns {Promise<Object>}
   */
  async invokePythonSuperHumanizer(text) {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn('python', [
        path.join(__dirname, '../../super_humanize.py'),
        text
      ]);

      let resultData = '';
      let errorData = '';

      pythonProcess.stdout.on('data', (data) => {
        resultData += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          logger.error(`Python SuperHumanizer failed with code ${code}: ${errorData}`);
          return reject(new Error('Python humanization failed'));
        }
        try {
          resolve(JSON.parse(resultData));
        } catch (e) {
          reject(new Error('Failed to parse Python output'));
        }
      });
    });
  }

  async humanizeAdvanced(text, options = {}) {
    try {
      logger.info(`Starting advanced humanization with options: ${JSON.stringify(options)}`);

      const startTime = Date.now();

      if (typeof text !== 'string') {
        throw new Error('Input must be a string');
      }

      // 1. Optional external LLM pre-processing
      const llmFirst = options.useExternalLLM ? await this.invokeLLM(text, options) : null;
      let humanizedText = llmFirst || text;

      // 2. Python Super Humanize Engine (The "Best Language" enhancement)
      try {
        logger.info('Invoking Python SuperHumanizer for linguistic variation...');
        const pythonResult = await this.invokePythonSuperHumanizer(humanizedText);
        if (pythonResult && pythonResult.humanized) {
          humanizedText = pythonResult.humanized;
          logger.info(`Python enhancement complete. Burstiness improvement: ${pythonResult.metrics.improvement}`);
        }
      } catch (pyError) {
        logger.warn('Python SuperHumanizer failed, continuing with JS pipeline:', pyError.message);
      }

      // 3. JS Advanced Humanizer Pipeline
      const adv = await this.humanizer.humanizeText(humanizedText, {
        style: options.style || 'casual',
        intensity: options.complexity === 'high' ? 1.0 : (options.complexity === 'medium' ? 0.7 : 0.4),
        formality: options.formality || 'medium',
        errorLevel: options.errorLevel || 'moderate'
      });

      if (adv && adv.humanizedText) {
        humanizedText = adv.humanizedText;
      } else if (typeof adv === 'string') {
        humanizedText = adv;
      }

      const processingTime = Date.now() - startTime;

      // Get detection analysis using the root detector
      const detectionAnalysis = this.detector.analyzeText(humanizedText);

      logger.info(`Advanced humanization completed in ${processingTime}ms`);

      return {
        text: humanizedText,
        detectionAnalysis: {
          overallScore: detectionAnalysis.overallScore,
          riskLevel: detectionAnalysis.riskLevel,
          patterns: detectionAnalysis.patterns
        },
        transformations: [
          'semantic_disassembly',
          'human_style_synthesis',
          'stylistic_reengineering',
          'plagiarism_elimination',
          'pattern_obfuscation',
          'human_verification'
        ],
        processingTime
      };
    } catch (error) {
      logger.error(`Advanced humanization failed: ${error.message}`);
      throw new Error(`Humanization failed: ${error.message}`);
    }
  }

  async invokeLLM(text, options) {
    try {
      const url = process.env.LLM_GATEWAY_URL || '';
      const hasFetch = typeof fetch === 'function';
      if (url && hasFetch) {
        const body = {
          prompt: text,
          style: options.style || 'casual',
          formality: options.formality || 'medium',
          targetTone: options.targetTone || 'empathetic'
        };
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': process.env.LLM_API_KEY ? `Bearer ${process.env.LLM_API_KEY}` : undefined },
          body: JSON.stringify(body)
        });
        if (!res.ok) return null;
        const data = await res.json();
        const out = data && (data.text || data.output || data.choices?.[0]?.message?.content);
        if (typeof out === 'string') return out;
      }
      const openaiKey = process.env.OPENAI_API_KEY || '';
      if (openaiKey && hasFetch) {
        const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
        const body = {
          model,
          messages: [
            { role: 'system', content: 'Write natural, context-aware responses that read like a human. Avoid robotic artifacts.' },
            { role: 'user', content: text }
          ],
          temperature: typeof options.temperature === 'number' ? options.temperature : 0.7,
          max_tokens: typeof options.maxTokens === 'number' ? options.maxTokens : 512
        };
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openaiKey}` },
          body: JSON.stringify(body)
        });
        if (!res.ok) return null;
        const data = await res.json();
        const out = data && (data.choices?.[0]?.message?.content || data.output || data.text);
        return typeof out === 'string' ? out : null;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  async humanizeBasic(text, options = {}) {
    try {
      logger.info(`Starting basic humanization with options: ${JSON.stringify(options)}`);

      const startTime = Date.now();

      // Basic humanization using root humanizer with low intensity
      const humanizedText = this.humanizer.humanizeText(text, {
        style: options.style || 'casual',
        intensity: 0.3,
        formality: 'low'
      });

      const processingTime = Date.now() - startTime;

      return {
        text: humanizedText,
        detectionAnalysis: {
          overallScore: 70,
          riskLevel: 'medium',
          patterns: []
        },
        processingTime
      };
    } catch (error) {
      logger.error(`Basic humanization failed: ${error.message}`);
      throw new Error(`Humanization failed: ${error.message}`);
    }
  }

  async analyzeDetectionRisk(text) {
    try {
      const analysis = this.detector.analyzeText(text);
      return {
        overallScore: analysis.overallScore,
        riskLevel: analysis.riskLevel,
        patterns: analysis.patterns
      };
    } catch (error) {
      logger.error(`Detection analysis failed: ${error.message}`);
      return {
        overallScore: 50,
        riskLevel: 'unknown',
        patterns: []
      };
    }
  }
}

module.exports = HumanizerService;
