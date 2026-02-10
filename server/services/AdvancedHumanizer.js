const logger = require('../config/logger');
const path = require('path');
const { AdvancedTextHumanizer, AdvancedAIDetector } = require(path.join(__dirname, '../../advanced-humanizer.js'));

class HumanizerService {
  constructor() {
    this.humanizer = new AdvancedTextHumanizer();
    this.detector = new AdvancedAIDetector();
  }

  async humanizeAdvanced(text, options = {}) {
    try {
      logger.info(`Starting advanced humanization with options: ${JSON.stringify(options)}`);

      const startTime = Date.now();

      if (typeof text !== 'string') {
        throw new Error('Input must be a string');
      }
      const llmFirst = options.useExternalLLM ? await this.invokeLLM(text, options) : null;
      let humanizedText = llmFirst || null;

      // Use the root advanced-humanizer logic
      if (!humanizedText) {
        const adv = await this.humanizer.humanizeText(text, {
          style: options.style || 'casual',
          intensity: options.complexity === 'high' ? 1.0 : (options.complexity === 'medium' ? 0.7 : 0.4),
          formality: options.formality || 'medium',
          errorLevel: options.errorLevel || 'moderate'
        });
        if (adv && adv.humanizedText) {
          humanizedText = adv.humanizedText;
        } else if (typeof adv === 'string') {
          humanizedText = adv;
        } else {
          humanizedText = text;
        }
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
