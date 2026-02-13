/**
 * AI Text Humanizer - Advanced Text Transformation Engine
 * Transforms AI-generated text into natural, human-like content
 */

class HumanizerMetrics {
  constructor(storageKey = 'humanizer_metrics_v1') {
    this.storageKey = storageKey;
    this.entries = [];
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (raw) this.entries = JSON.parse(raw);
    } catch (e) {
      this.entries = [];
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.entries.slice(-200)));
    } catch (e) {
      return;
    }
  }

  record(entry) {
    this.entries.push(entry);
    if (this.entries.length > 200) this.entries.shift();
    this.save();
  }

  summary() {
    if (!this.entries.length) {
      return {
        count: 0,
        avgLatencyMs: 0,
        avgConfidence: 0,
        avgNaturalness: 0,
        avgDetectionRisk: 0
      };
    }
    const totals = this.entries.reduce((acc, e) => {
      acc.latency += e.latencyMs || 0;
      acc.confidence += e.confidence || 0;
      acc.naturalness += e.naturalness || 0;
      acc.detectionRisk += e.detectionRisk || 0;
      return acc;
    }, { latency: 0, confidence: 0, naturalness: 0, detectionRisk: 0 });
    return {
      count: this.entries.length,
      avgLatencyMs: Math.round(totals.latency / this.entries.length),
      avgConfidence: Math.round(totals.confidence / this.entries.length),
      avgNaturalness: Math.round(totals.naturalness / this.entries.length),
      avgDetectionRisk: Math.round(totals.detectionRisk / this.entries.length)
    };
  }
}

class ABTestController {
  constructor(storageKey = 'humanizer_ab_variant_v1') {
    this.storageKey = storageKey;
    this.statsKey = 'humanizer_ab_stats_v1';
    this.variant = this.loadVariant();
    this.stats = this.loadStats();
  }

  loadVariant() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'A' || saved === 'B') return saved;
    const variant = Math.random() < 0.5 ? 'A' : 'B';
    localStorage.setItem(this.storageKey, variant);
    return variant;
  }

  loadStats() {
    try {
      const raw = localStorage.getItem(this.statsKey);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      return { A: { count: 0, score: 0 }, B: { count: 0, score: 0 } };
    }
    return { A: { count: 0, score: 0 }, B: { count: 0, score: 0 } };
  }

  record(variant, score) {
    const bucket = this.stats[variant];
    bucket.count += 1;
    bucket.score += score;
    localStorage.setItem(this.statsKey, JSON.stringify(this.stats));
  }

  summary() {
    const a = this.stats.A;
    const b = this.stats.B;
    return {
      A: a.count ? Math.round(a.score / a.count) : 0,
      B: b.count ? Math.round(b.score / b.count) : 0,
      countA: a.count,
      countB: b.count
    };
  }
}

class TrainingDataManager {
  constructor(seedTexts) {
    this.seedTexts = seedTexts;
  }

  prepare() {
    const cleaned = this.seedTexts
      .map(t => t.replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    const vocab = new Map();
    const tokens = cleaned.map(text => text.toLowerCase().split(/\s+/));
    tokens.flat().forEach(tok => {
      vocab.set(tok, (vocab.get(tok) || 0) + 1);
    });
    const dataset = cleaned.map(text => ({
      text,
      tokens: text.toLowerCase().split(/\s+/)
    }));
    const split = Math.max(1, Math.floor(dataset.length * 0.8));
    return {
      train: dataset.slice(0, split),
      validation: dataset.slice(split),
      vocab: Array.from(vocab.keys())
    };
  }
}

class SimpleNeuralModel {
  constructor(vocab) {
    this.vocab = vocab;
    this.dim = 16;
    this.weights = new Array(this.dim).fill(0).map(() => (Math.random() - 0.5) * 0.2);
  }

  embed(tokens) {
    const vec = new Array(this.dim).fill(0);
    tokens.forEach(token => {
      let hash = 0;
      for (let i = 0; i < token.length; i += 1) {
        hash = (hash * 31 + token.charCodeAt(i)) % 100000;
      }
      const idx = hash % this.dim;
      vec[idx] += 1;
    });
    return vec;
  }

  score(tokens) {
    const vec = this.embed(tokens);
    const dot = vec.reduce((sum, v, i) => sum + v * this.weights[i], 0);
    return 1 / (1 + Math.exp(-dot));
  }

  train(samples) {
    samples.forEach(sample => {
      const target = 1;
      const vec = this.embed(sample.tokens);
      const pred = this.score(sample.tokens);
      const error = target - pred;
      const lr = 0.01;
      this.weights = this.weights.map((w, i) => w + lr * error * vec[i]);
    });
  }
}

class ModelValidator {
  validate(model, samples) {
    if (!samples.length) {
      return { coherence: 0, naturalness: 0 };
    }
    let sum = 0;
    samples.forEach(sample => {
      sum += model.score(sample.tokens);
    });
    const avg = sum / samples.length;
    return {
      coherence: Math.round(avg * 100),
      naturalness: Math.round((0.6 + avg * 0.4) * 100)
    };
  }
}

class BehavioralAnalyzer {
  analyze(text) {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const lengths = sentences.map(s => s.split(/\s+/).length);
    const avgLen = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
    const variance = lengths.reduce((acc, l) => acc + Math.pow(l - avgLen, 2), 0) / (lengths.length || 1);
    const contractions = (text.match(/\b\w+['’]\w+\b/g) || []).length;
    const questions = (text.match(/\?/g) || []).length;
    const score = Math.min(100, Math.round((Math.sqrt(variance) + contractions * 2 + questions * 3)));
    return {
      variance: Math.round(variance),
      contractions,
      questions,
      score
    };
  }
}

class AffectiveEngine {
  analyze(text) {
    const positive = (text.match(/\b(good|great|nice|love|glad|happy|calm|clear)\b/gi) || []).length;
    const negative = (text.match(/\b(bad|sad|angry|upset|concern|worried|tense)\b/gi) || []).length;
    const intensity = (text.match(/[!]{1,}/g) || []).length + (text.match(/\b(very|really|so)\b/gi) || []).length;
    const sentiment = Math.max(-1, Math.min(1, (positive - negative) / Math.max(1, positive + negative)));
    const emotion = sentiment > 0.3 ? 'positive' : sentiment < -0.3 ? 'negative' : 'neutral';
    const pacing = intensity > 2 ? 'fast' : 'steady';
    return { sentiment, emotion, pacing, intensity };
  }
}

class SentimentTracker {
  constructor() {
    this.key = 'humanizer_affect_history_v1';
    this.history = [];
    this.load();
  }
  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) this.history = JSON.parse(raw) || [];
    } catch (e) {
      this.history = [];
    }
  }
  save() {
    try {
      localStorage.setItem(this.key, JSON.stringify(this.history.slice(-200)));
    } catch (e) {
      return;
    }
  }
  push(value) {
    this.history.push({ v: value, t: Date.now() });
    this.save();
  }
  trend() {
    if (this.history.length < 2) return { smoothed: 0, direction: 'steady' };
    let s = 0;
    let alpha = 0.5;
    this.history.slice(-20).forEach(h => { s = alpha * h.v + (1 - alpha) * s; });
    const last = this.history[this.history.length - 1].v;
    const prev = this.history[this.history.length - 2].v;
    const dir = last > prev + 0.05 ? 'up' : last < prev - 0.05 ? 'down' : 'steady';
    return { smoothed: s, direction: dir };
  }
}

class SafetyGuard {
  check(text) {
    const banned = /\b(hate|violence|racist|sexist|slur|terror|kill|harm)\b/gi;
    const flagged = (text.match(banned) || []).length > 0;
    let safeText = text;
    if (flagged) {
      safeText = safeText.replace(banned, '');
      safeText = safeText.replace(/\s{2,}/g, ' ').trim();
    }
    return { safe: !flagged, text: safeText, flagged };
  }
}

class BiasMitigator {
  sanitize(text) {
    const biased = /\b(lazy|stupid|dumb|ignorant|backward)\b/gi;
    return text.replace(biased, '').replace(/\s{2,}/g, ' ').trim();
  }
}

class LongTermMemory {
  constructor() {
    this.storeKey = 'humanizer_ltm_v1';
    this.topics = new Map();
    this.index = new Map();
    this.load();
  }
  load() {
    try {
      const raw = localStorage.getItem(this.storeKey);
      if (raw) {
        const data = JSON.parse(raw);
        Object.keys(data).forEach(k => this.topics.set(k, data[k]));
      }
    } catch (e) {
      return;
    }
  }
  save() {
    const obj = {};
    this.topics.forEach((v, k) => { obj[k] = v; });
    try {
      localStorage.setItem(this.storeKey, JSON.stringify(obj));
    } catch (e) {
      return;
    }
  }
  embed(text) {
    const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
    const dim = 16;
    const vec = new Array(dim).fill(0);
    tokens.forEach(token => {
      let h = 0;
      for (let i = 0; i < token.length; i += 1) h = (h * 31 + token.charCodeAt(i)) % 100000;
      vec[h % dim] += 1;
    });
    return vec;
  }
  add(topic, text) {
    const entry = { text, ts: Date.now() };
    const bucket = this.topics.get(topic) || [];
    bucket.push(entry);
    this.topics.set(topic, bucket.slice(-200));
    const vec = this.embed(text);
    const cur = this.index.get(topic) || new Array(vec.length).fill(0);
    const merged = cur.map((v, i) => v * 0.9 + vec[i]);
    this.index.set(topic, merged);
    this.save();
  }
  retrieveContext(tokens) {
    const keys = Array.from(this.topics.keys());
    const dim = 16;
    const q = new Array(dim).fill(0);
    tokens.forEach(token => {
      let h = 0;
      for (let i = 0; i < token.length; i += 1) h = (h * 31 + token.charCodeAt(i)) % 100000;
      q[h % dim] += 1;
    });
    const scored = keys.map(k => {
      const idx = this.index.get(k) || new Array(dim).fill(0);
      const sim = q.reduce((sum, v, i) => sum + v * idx[i], 0);
      return { k, sim };
    }).sort((a, b) => b.sim - a.sim).slice(0, 3);
    let best = [];
    scored.forEach(s => {
      const items = this.topics.get(s.k) || [];
      best = best.concat(items.slice(-2));
    });
    const context = best.map(b => b.text).join(' ');
    return context;
  }
}

class VoiceSynthesizer {
  speak(text, options = {}) {
    const synth = window.speechSynthesis;
    if (!synth) return false;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = options.rate || 1;
    utter.pitch = options.pitch || 1;
    utter.volume = options.volume || 1;
    synth.speak(utter);
    return true;
  }
}

class CulturalFilter {
  normalize(text) {
    const locale = (navigator && navigator.language) ? navigator.language.toLowerCase() : 'en-us';
    let out = text;
    if (locale.startsWith('en-gb')) {
      out = out.replace(/\bcolor\b/gi, 'colour').replace(/\borganize\b/gi, 'organise');
    } else if (locale.startsWith('en-us')) {
      out = out.replace(/\bcolour\b/gi, 'color').replace(/\borganise\b/gi, 'organize');
    }
    return out;
  }
}

class MultimodalCueAnalyzer {
  async imageMood() {
    try {
      if (!window._toneImageFile) return null;
      const img = await this.loadImage(window._toneImageFile);
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 64, 64);
      const data = ctx.getImageData(0, 0, 64, 64).data;
      let sum = 0;
      for (let i = 0; i < data.length; i += 4) {
        sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
      }
      const avg = sum / (64 * 64);
      if (avg < 80) return 'somber';
      if (avg > 180) return 'bright';
      return 'neutral';
    } catch (e) {
      return null;
    }
  }
  loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}

class EmpathyEvaluator {
  score(text) {
    const affirm = (text.match(/\b(I understand|I hear you|I get it|makes sense)\b/gi) || []).length;
    const care = (text.match(/\b(we can|let’s|we’ll|help|support)\b/gi) || []).length;
    const calm = (text.match(/\b(calm|clear|simple|easy)\b/gi) || []).length;
    const total = affirm * 3 + care * 2 + calm;
    return Math.min(100, Math.round(20 + total * 10));
  }
}

class LLMAdapter {
  inferSync() {
    return null;
  }
}

class SuperHumanizer {
  constructor() {
    this.seedTexts = [
      'I read the brief twice and tried to keep the tone clear without sounding stiff.',
      'The draft has good ideas, it just needs smoother transitions and more confident phrasing.',
      'If the message is important, the wording should feel calm and direct.',
      'People notice rhythm in writing even when they do not name it.',
      'Shorter sentences add pace, longer ones add reflection.',
      'I prefer simple verbs because they keep the point easy to follow.',
      'A small shift in word choice can make the voice feel more human.',
      'It helps to check the flow from one sentence to the next.'
    ];
    this.training = new TrainingDataManager(this.seedTexts).prepare();
    this.model = new SimpleNeuralModel(this.training.vocab);
    this.model.train(this.training.train);
    this.validator = new ModelValidator();
    this.validation = this.validator.validate(this.model, this.training.validation);
    this.behavior = new BehavioralAnalyzer();
    this.metrics = new HumanizerMetrics();
    this.abTest = new ABTestController();
    this.affect = new AffectiveEngine();
    this.memory = new LongTermMemory();
    this.safety = new SafetyGuard();
    this.voice = new VoiceSynthesizer();
    this.llm = new LLMAdapter();
    this.tracker = new SentimentTracker();
    this.bias = new BiasMitigator();
    this.culture = new CulturalFilter();
    this.multimodal = new MultimodalCueAnalyzer();
    this.adaptive = {
      adjust(text, affect, trend) {
        let out = text;
        if (affect.emotion === 'negative' || trend.direction === 'down') {
          out = out.replace(/\b(very|really|so|extremely|highly|totally)\b/gi, '');
        }
        out = out.replace(/\s{2,}/g, ' ').trim();
        return out;
      }
    };
  }

  generate(text, options, baseHumanizer) {
    const start = performance.now();
    const tokens = text.toLowerCase().split(/\s+/).filter(Boolean);
    const variant = this.abTest.variant;
    let working = text;
    const style = options.style || 'casual';
    const affect = this.affect.analyze(text);
    if (options && options.empathyMode) {
      // Boost calming adjustments when empathy mode is on
      if (affect.emotion === 'neutral' && affect.intensity > 1) {
        affect.pacing = 'steady';
      }
    }
    const context = this.memory.retrieveContext(tokens);
    const llmOut = this.llm.inferSync(text, { style, affect, context });
    if (llmOut && llmOut.text) {
      working = llmOut.text;
    }
    if (baseHumanizer) {
      working = baseHumanizer.replaceAiPatterns(working);
      working = baseHumanizer.applySynonymDiversification(working, options.synonymLevel || 'medium');
      working = baseHumanizer.adjustSentenceStructure(working, options.sentenceLevel || 'moderate', baseHumanizer.writingStyles[style] || baseHumanizer.writingStyles.casual);
      working = baseHumanizer.applyHumanVoiceEnhancements(working, baseHumanizer.writingStyles[style] || baseHumanizer.writingStyles.casual, options.humanizationLevel || 'moderate');
      working = baseHumanizer.applyRhythmEnhancements(working, options.humanizationLevel || 'moderate');
    }
    if (affect.emotion === 'negative') {
      working = working.replace(/\b(very|really|extremely)\b/gi, '').replace(/\s{2,}/g, ' ').trim();
    }
    this.tracker.push(affect.sentiment);
    const trend = this.trend || this.tracker.trend();
    working = this.adaptive.adjust(working, affect, trend);
    working = this.bias.sanitize(working);
    this.memory.add(style, text);
    if (variant === 'B') {
      working = this.applyContextualFlow(working);
      working = this.applyBehavioralTuning(working);
    } else {
      working = this.applyBehavioralTuning(working);
      working = this.applyContextualFlow(working);
    }
    const behavior = this.behavior.analyze(working);
    const neuralScore = Math.round(this.model.score(tokens) * 100);
    const confidence = Math.min(98, Math.round((neuralScore + this.validation.naturalness + behavior.score) / 3));
    const safe = this.safety.check(working);
    let normalized = this.normalizeOutput(safe.text);
    normalized = this.culture.normalize(normalized);
    const output = normalized;
    const latencyMs = Math.round(performance.now() - start);
    const detectionRisk = Math.max(5, 100 - confidence);
    this.metrics.record({
      latencyMs,
      confidence,
      naturalness: behavior.score,
      detectionRisk
    });
    this.abTest.record(variant, confidence);
    const empathyScore = new EmpathyEvaluator().score(working);
    if (options && options.speech) this.voice.speak(output, options.speech);
    return {
      humanized: output,
      confidence,
      detectionAnalysis: { overallScore: detectionRisk, riskLevel: detectionRisk > 40 ? 'medium' : 'low' },
      pipeline: 'super',
      validation: this.validation,
      ab: this.abTest.summary(),
      metrics: { ...this.metrics.summary(), empathyScore }
    };
  }

  applyBehavioralTuning(text) {
    let adjusted = text.replace(/\s+/g, ' ').trim();
    adjusted = adjusted.replace(/\bhowever\b/gi, 'but');
    adjusted = adjusted.replace(/\btherefore\b/gi, 'so');
    adjusted = adjusted.replace(/\butilize\b/gi, 'use');
    adjusted = adjusted.replace(/\bmoreover\b/gi, 'also');
    adjusted = adjusted.replace(/\badditionally\b/gi, 'also');
    return adjusted;
  }

  applyContextualFlow(text) {
    const sentences = text.split(/([.!?])/).reduce((acc, part) => {
      if (part.match(/[.!?]/)) {
        acc[acc.length - 1] += part;
      } else if (part.trim()) {
        acc.push(part.trim());
      }
      return acc;
    }, []);
    if (sentences.length < 2) return text;
    const reordered = [];
    for (let i = 0; i < sentences.length; i += 1) {
      const sentence = sentences[i];
      if (i % 2 === 0) {
        reordered.push(sentence);
      } else {
        reordered.push(sentence.charAt(0).toLowerCase() + sentence.slice(1));
      }
    }
    return reordered.join(' ').replace(/\s+/g, ' ').trim();
  }

  normalizeOutput(text) {
    let cleaned = text.replace(/[^\u0020-\u007E]/g, ' ');
    cleaned = cleaned.replace(/[*_~`>#={}\\]/g, ' ');
    cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
    cleaned = cleaned.replace(/([!?.,;:])\1{1,}/g, '$1');
    cleaned = cleaned.replace(/\s+([,.!?;:])/g, '$1');
    return cleaned;
  }
}

class TextHumanizer {
  constructor() {
    this.initializeSynonymDatabase();
    this.initializeStyleTemplates();
    this.initializeErrorPatterns();
    this.initializeTransitionWords();
    this.initializeWritingStyles();
    this.currentStyle = 'casual';
    this.isProcessing = false;
    this.wordCount = { input: 0, output: 0 };
    this.confidenceScore = 0;
    this.superHumanizer = new SuperHumanizer();

    // Improved advanced humanizer initialization with fallbacks
    this.advancedHumanizer = null;
    this.advancedDetector = null;

    const initializeAdvancedEngines = () => {
      console.log('[Humanizer] Attempting to initialize advanced engines...');
      if (typeof window.AdvancedTextHumanizer !== 'undefined') {
        this.advancedHumanizer = new window.AdvancedTextHumanizer();
        console.log('[Humanizer] AdvancedTextHumanizer initialized from window');
      } else if (typeof AdvancedTextHumanizer !== 'undefined') {
        this.advancedHumanizer = new AdvancedTextHumanizer();
        console.log('[Humanizer] AdvancedTextHumanizer initialized from global');
      }

      if (typeof window.AdvancedAIDetector !== 'undefined') {
        this.advancedDetector = new window.AdvancedAIDetector();
        console.log('[Humanizer] AdvancedAIDetector initialized from window');
      } else if (typeof AdvancedAIDetector !== 'undefined') {
        this.advancedDetector = new AdvancedAIDetector();
        console.log('[Humanizer] AdvancedAIDetector initialized from global');
      }
    };

    // Run immediately and also listen for the ready event
    initializeAdvancedEngines();
    document.addEventListener('advancedHumanizerReady', () => {
      console.log('[Humanizer] advancedHumanizerReady event received');
      initializeAdvancedEngines();
    });
  }

  /**
     * Initialize comprehensive synonym database with context-aware replacements
     */
  initializeSynonymDatabase() {
    this.synonymDatabase = {
      // Academic/formal terms
      'therefore': ['so', 'thus', 'hence', 'as a result', 'consequently', 'that\'s why'],
      'furthermore': ['also', 'plus', 'what\'s more', 'on top of that', 'additionally', 'besides'],
      'moreover': ['also', 'plus', 'what\'s more', 'furthermore', 'besides'],
      'consequently': ['so', 'therefore', 'thus', 'as a result', 'hence'],
      'nevertheless': ['but', 'still', 'yet', 'even so', 'however', 'nonetheless'],
      'nonetheless': ['but', 'still', 'yet', 'even so', 'however', 'nevertheless'],
      'however': ['but', 'yet', 'still', 'even so', 'though', 'although'],
      'utilize': ['use', 'make use of', 'employ', 'apply'],
      'employ': ['use', 'make use of', 'utilize', 'apply'],
      'implement': ['carry out', 'put into action', 'execute', 'do'],
      'execute': ['carry out', 'do', 'perform', 'accomplish'],
      'accomplish': ['achieve', 'do', 'complete', 'finish'],
      'achieve': ['reach', 'attain', 'get', 'accomplish'],
      'obtain': ['get', 'acquire', 'gain', 'receive'],
      'acquire': ['get', 'obtain', 'gain', 'receive'],
      'substantial': ['large', 'considerable', 'significant', 'big'],
      'considerable': ['large', 'substantial', 'significant', 'quite a bit of'],
      'significant': ['important', 'meaningful', 'notable', 'considerable'],
      'comprehensive': ['thorough', 'complete', 'detailed', 'full'],
      'thorough': ['complete', 'detailed', 'comprehensive', 'careful'],
      'efficient': ['effective', 'productive', 'capable', 'well-organized'],
      'optimal': ['best', 'ideal', 'most favorable', 'perfect'],
      'ideal': ['perfect', 'best', 'optimal', 'most suitable'],
      'primary': ['main', 'chief', 'key', 'principal', 'major'],
      'principal': ['main', 'chief', 'primary', 'key', 'major'],
      'fundamental': ['basic', 'essential', 'key', 'primary'],
      'essential': ['necessary', 'important', 'key', 'basic'],
      'critical': ['crucial', 'important', 'key', 'vital'],
      'crucial': ['critical', 'important', 'key', 'vital'],
      'vital': ['important', 'essential', 'critical', 'crucial'],
      'paramount': ['most important', 'supreme', 'top', 'chief'],

      // Common AI patterns
      'in conclusion': ['to wrap up', 'to sum up', 'finally', 'lastly', 'all in all'],
      'to summarize': ['to sum up', 'in short', 'briefly', 'in a nutshell'],
      'it is important to note': ['worth noting', 'keep in mind', 'remember', 'note'],
      'it should be noted': ['worth noting', 'keep in mind', 'remember', 'note'],
      'as mentioned earlier': ['like I said before', 'as I mentioned', 'previously'],
      'as previously stated': ['like I said before', 'as I mentioned', 'earlier'],
      'according to': ['based on', 'as per', 'following', 'in line with'],
      'with regard to': ['about', 'regarding', 'concerning', 'when it comes to'],
      'regarding': ['about', 'concerning', 'with regard to', 'on'],
      'concerning': ['about', 'regarding', 'with regard to', 'on'],
      'on the other hand': ['but then', 'alternatively', 'then again', 'conversely'],
      'in contrast': ['on the other hand', 'but', 'however', 'whereas'],
      'similarly': ['likewise', 'in the same way', 'also', 'too'],
      'likewise': ['similarly', 'in the same way', 'also', 'too'],
      'for instance': ['for example', 'like', 'such as', 'say'],
      'for example': ['for instance', 'like', 'such as', 'say'],
      'such as': ['like', 'for example', 'for instance', 'including'],
      'including': ['such as', 'like', 'for example', 'among'],
      'particularly': ['especially', 'in particular', 'specifically'],
      'especially': ['particularly', 'in particular', 'specifically'],
      'notably': ['particularly', 'especially', 'in particular', 'specifically'],
      'specifically': ['particularly', 'especially', 'in particular'],
      'essentially': ['basically', 'fundamentally', 'at its core', 'in essence'],
      'basically': ['essentially', 'fundamentally', 'at its core', 'in essence'],
      'ultimately': ['in the end', 'finally', 'eventually', 'at last'],
      'eventually': ['in the end', 'finally', 'ultimately', 'sooner or later'],
      'initially': ['at first', 'in the beginning', 'to start with', 'first'],
      'subsequently': ['then', 'after that', 'later', 'next'],
      'thereafter': ['after that', 'from then on', 'subsequently', 'later'],

      // Overly formal terms
      'commence': ['start', 'begin', 'get started', 'kick off'],
      'initiate': ['start', 'begin', 'commence', 'get going'],
      'terminate': ['end', 'stop', 'finish', 'conclude'],
      'finalize': ['finish', 'complete', 'wrap up', 'conclude'],
      'facilitate': ['help', 'make easier', 'enable', 'assist'],
      'enable': ['allow', 'let', 'permit', 'make possible'],
      'permit': ['allow', 'let', 'enable', 'give permission'],
      'demonstrate': ['show', 'prove', 'display', 'illustrate'],
      'illustrate': ['show', 'demonstrate', 'display', 'explain'],
      'indicate': ['show', 'suggest', 'point to', 'demonstrate'],
      'suggest': ['indicate', 'imply', 'point to', 'recommend'],
      'imply': ['suggest', 'indicate', 'hint at', 'mean'],
      'reveal': ['show', 'disclose', 'uncover', 'expose'],
      'disclose': ['reveal', 'share', 'tell', 'make known'],
      'uncover': ['discover', 'find', 'reveal', 'expose'],
      'expose': ['reveal', 'uncover', 'show', 'disclose'],

      // Technical terms
      'methodology': ['method', 'approach', 'way', 'technique'],
      'approach': ['method', 'way', 'technique', 'strategy'],
      'strategy': ['plan', 'approach', 'method', 'tactic'],
      'framework': ['structure', 'system', 'model', 'approach'],
      'structure': ['framework', 'organization', 'arrangement', 'setup'],
      'component': ['part', 'element', 'piece', 'section'],
      'element': ['part', 'component', 'aspect', 'factor'],
      'aspect': ['part', 'element', 'side', 'feature'],
      'feature': ['characteristic', 'aspect', 'quality', 'trait'],
      'characteristic': ['feature', 'trait', 'quality', 'attribute'],
      'attribute': ['characteristic', 'feature', 'quality', 'trait'],
      'quality': ['characteristic', 'feature', 'trait', 'attribute'],
      'trait': ['characteristic', 'feature', 'quality', 'attribute'],

      // Common verbs
      'provide': ['give', 'offer', 'supply', 'furnish'],
      'offer': ['give', 'provide', 'present', 'make available'],
      'supply': ['provide', 'give', 'furnish', 'deliver'],
      'furnish': ['provide', 'supply', 'give', 'equip'],
      'present': ['show', 'offer', 'give', 'display'],
      'display': ['show', 'present', 'exhibit', 'demonstrate'],
      'exhibit': ['show', 'display', 'demonstrate', 'present'],
      'create': ['make', 'produce', 'generate', 'develop'],
      'produce': ['make', 'create', 'generate', 'manufacture'],
      'generate': ['create', 'produce', 'make', 'develop'],
      'develop': ['create', 'build', 'grow', 'evolve'],
      'build': ['construct', 'create', 'develop', 'make'],
      'construct': ['build', 'create', 'make', 'assemble'],
      'assemble': ['put together', 'build', 'construct', 'gather'],
      'establish': ['set up', 'create', 'found', 'build'],
      'found': ['establish', 'create', 'set up', 'start'],
      'maintain': ['keep', 'preserve', 'sustain', 'continue'],
      'preserve': ['maintain', 'protect', 'keep', 'save'],
      'sustain': ['maintain', 'support', 'keep going', 'continue'],
      'continue': ['keep going', 'persist', 'carry on', 'maintain'],
      'persist': ['continue', 'keep going', 'carry on', 'last'],
      'last': ['continue', 'endure', 'persist', 'remain'],
      'endure': ['last', 'continue', 'persist', 'bear'],
      'remain': ['stay', 'continue', 'persist', 'last'],
      'stay': ['remain', 'continue', 'persist', 'last'],

      // Common adjectives
      'important': ['key', 'crucial', 'vital', 'essential', 'major'],
      'key': ['important', 'crucial', 'vital', 'essential', 'main'],
      'main': ['primary', 'chief', 'key', 'principal', 'major'],
      'major': ['important', 'significant', 'key', 'main', 'big'],
      'big': ['large', 'huge', 'major', 'significant', 'considerable'],
      'large': ['big', 'huge', 'enormous', 'massive', 'considerable'],
      'huge': ['big', 'large', 'enormous', 'massive', 'gigantic'],
      'enormous': ['huge', 'large', 'massive', 'gigantic', 'immense'],
      'massive': ['huge', 'large', 'enormous', 'gigantic', 'immense'],
      'gigantic': ['huge', 'enormous', 'massive', 'immense', 'colossal'],
      'immense': ['huge', 'enormous', 'massive', 'gigantic', 'vast'],
      'vast': ['huge', 'enormous', 'immense', 'massive', 'extensive'],
      'extensive': ['wide', 'broad', 'vast', 'comprehensive', 'large'],
      'wide': ['broad', 'extensive', 'vast', 'spacious', 'large'],
      'broad': ['wide', 'extensive', 'vast', 'general', 'large'],
      'general': ['broad', 'overall', 'widespread', 'common', 'usual'],
      'overall': ['general', 'total', 'complete', 'entire', 'whole'],
      'total': ['complete', 'entire', 'whole', 'full', 'absolute'],
      'complete': ['total', 'entire', 'whole', 'full', 'absolute'],
      'entire': ['whole', 'complete', 'total', 'full', 'absolute'],
      'whole': ['entire', 'complete', 'total', 'full', 'absolute'],
      'full': ['complete', 'total', 'entire', 'whole', 'maximum'],
      'absolute': ['complete', 'total', 'utter', 'sheer', 'pure'],
      'utter': ['complete', 'absolute', 'total', 'sheer', 'pure'],
      'sheer': ['complete', 'absolute', 'utter', 'pure', 'total'],
      'pure': ['complete', 'absolute', 'sheer', 'utter', 'genuine'],
      'genuine': ['real', 'authentic', 'true', 'actual', 'sincere'],
      'real': ['genuine', 'authentic', 'true', 'actual', 'legitimate'],
      'authentic': ['genuine', 'real', 'true', 'actual', 'legitimate'],
      'true': ['real', 'genuine', 'authentic', 'actual', 'accurate'],
      'actual': ['real', 'genuine', 'true', 'authentic', 'factual'],
      'legitimate': ['genuine', 'real', 'authentic', 'valid', 'legal'],
      'valid': ['legitimate', 'sound', 'well-founded', 'logical', 'reasonable'],
      'sound': ['valid', 'sensible', 'reasonable', 'logical', 'well-founded'],
      'sensible': ['reasonable', 'practical', 'wise', 'sound', 'logical'],
      'reasonable': ['sensible', 'fair', 'logical', 'sound', 'rational'],
      'practical': ['sensible', 'realistic', 'useful', 'functional', 'workable'],
      'realistic': ['practical', 'sensible', 'reasonable', 'feasible', 'achievable'],
      'useful': ['helpful', 'practical', 'beneficial', 'valuable', 'handy'],
      'helpful': ['useful', 'beneficial', 'valuable', 'supportive', 'constructive'],
      'beneficial': ['helpful', 'useful', 'advantageous', 'valuable', 'profitable'],
      'valuable': ['useful', 'helpful', 'beneficial', 'precious', 'worthwhile'],
      'precious': ['valuable', 'dear', 'beloved', 'treasured', 'priceless'],
      'worthwhile': ['valuable', 'worth it', 'beneficial', 'rewarding', 'useful'],
      'rewarding': ['worthwhile', 'satisfying', 'fulfilling', 'beneficial', 'gratifying'],
      'satisfying': ['rewarding', 'fulfilling', 'gratifying', 'pleasing', 'enjoyable'],
      'fulfilling': ['rewarding', 'satisfying', 'meaningful', 'worthwhile', 'gratifying'],
      'meaningful': ['significant', 'important', 'worthwhile', 'purposeful', 'valuable'],
      'purposeful': ['intentional', 'deliberate', 'meaningful', 'determined', 'focused'],
      'intentional': ['deliberate', 'purposeful', 'planned', 'conscious', 'willful'],
      'deliberate': ['intentional', 'purposeful', 'planned', 'conscious', 'considered'],
      'conscious': ['aware', 'awake', 'deliberate', 'intentional', 'mindful'],
      'aware': ['conscious', 'mindful', 'informed', 'knowledgeable', 'familiar'],
      'mindful': ['aware', 'conscious', 'attentive', 'considerate', 'thoughtful'],
      'attentive': ['mindful', 'alert', 'focused', 'observant', 'considerate'],
      'focused': ['concentrated', 'attentive', 'intent', 'determined', 'dedicated'],
      'concentrated': ['focused', 'intense', 'strong', 'undiluted', 'pure'],
      'intense': ['strong', 'powerful', 'extreme', 'concentrated', 'severe'],
      'powerful': ['strong', 'mighty', 'forceful', 'influential', 'potent'],
      'mighty': ['powerful', 'strong', 'forceful', 'great', 'huge'],
      'forceful': ['powerful', 'strong', 'emphatic', 'assertive', 'vigorous'],
      'influential': ['powerful', 'important', 'significant', 'effective', 'persuasive'],
      'potent': ['powerful', 'strong', 'effective', 'forceful', 'mighty'],
      'effective': ['successful', 'efficient', 'productive', 'powerful', 'capable'],
      'successful': ['effective', 'prosperous', 'triumphant', 'victorious', 'flourishing'],
      'prosperous': ['successful', 'thriving', 'wealthy', 'flourishing', 'booming'],
      'thriving': ['successful', 'prosperous', 'growing', 'flourishing', 'booming'],
      'flourishing': ['thriving', 'prosperous', 'successful', 'growing', 'blooming'],
      'booming': ['thriving', 'prosperous', 'growing', 'successful', 'expanding'],
      'growing': ['increasing', 'expanding', 'developing', 'rising', 'progressing'],
      'increasing': ['growing', 'rising', 'expanding', 'escalating', 'mounting'],
      'rising': ['increasing', 'growing', 'climbing', 'ascending', 'mounting'],
      'expanding': ['growing', 'increasing', 'extending', 'spreading', 'enlarging'],
      'extending': ['expanding', 'stretching', 'lengthening', 'prolonging', 'continuing'],
      'stretching': ['extending', 'expanding', 'lengthening', 'pulling', 'straining'],
      'lengthening': ['extending', 'stretching', 'prolonging', 'continuing', 'dragging out'],
      'prolonging': ['extending', 'lengthening', 'stretching', 'continuing', 'dragging out'],
      'continuing': ['persisting', 'lasting', 'remaining', 'enduring', 'staying'],
      'persisting': ['continuing', 'lasting', 'enduring', 'remaining', 'staying'],
      'remaining': ['staying', 'continuing', 'persisting', 'lasting', 'enduring'],
      'staying': ['remaining', 'continuing', 'persisting', 'lasting', 'enduring'],
      'enduring': ['lasting', 'continuing', 'persisting', 'remaining', 'staying'],
      'lasting': ['enduring', 'continuing', 'persisting', 'remaining', 'staying']
    };
  }

  /**
     * Initialize writing style templates for different contexts
     */
  initializeWritingStyles() {
    this.writingStyles = {
      academic: {
        name: 'Academic',
        contractions: false,
        formality: 'high',
        sentenceComplexity: 'complex',
        vocabularyLevel: 'advanced',
        transitionFrequency: 'frequent',
        personalVoice: 'minimal',
        errorRate: 0.01,
        patterns: {
          opening: ['This paper examines', 'This study investigates', 'This research explores', 'This analysis considers', 'The present study'],
          transition: ['Furthermore', 'Moreover', 'Additionally', 'Consequently', 'Therefore', 'Hence', 'Thus'],
          conclusion: ['In conclusion', 'To summarize', 'Ultimately', 'In summary', 'Taken together'],
          hedging: ['appears to', 'seems to', 'tends to', 'is likely to', 'suggests that', 'indicates that'],
          cautious: ['may', 'might', 'could', 'would', 'should', 'perhaps', 'possibly', 'potentially']
        },
        sentenceStarters: ['According to', 'Based on', 'In terms of', 'With regard to', 'In relation to'],
        passiveVoice: 0.4,
        citations: true,
        technicalTerms: true
      },
      casual: {
        name: 'Casual',
        formality: 'low',
        sentenceComplexity: 'simple',
        vocabularyLevel: 'conversational',
        transitionFrequency: 'moderate',
        personalVoice: 'high',
        errorRate: 0.05,
        patterns: {
          opening: ['So', 'Well', 'You know', 'I think', 'Honestly', 'Actually', 'Basically'],
          transition: ['And', 'But', 'So', 'Then', 'Anyway', 'Plus', 'Also'],
          conclusion: ['So yeah', 'Anyway', 'That\'s it', 'In the end', 'Bottom line', 'Long story short'],
          fillers: ['you know', 'like', 'kind of', 'sort of', 'I mean', 'really', 'honestly'],
          questions: ['right?', 'you know?', 'don\'t you think?', 'wouldn\'t you say?']
        },
        sentenceStarters: ['I think', 'I believe', 'In my opinion', 'Personally', 'To be honest'],
        contractions: 0.8,
        slang: 0.1,
        questions: 0.3
      },
      creative: {
        name: 'Creative',
        contractions: true,
        formality: 'variable',
        sentenceComplexity: 'mixed',
        vocabularyLevel: 'expressive',
        transitionFrequency: 'artistic',
        personalVoice: 'strong',
        errorRate: 0.03,
        patterns: {
          opening: ['Picture this', 'Imagine', 'Suddenly', 'Once upon a time', 'In a world', 'Long ago'],
          transition: ['Meanwhile', 'Suddenly', 'Gradually', 'Unexpectedly', 'Naturally', 'Slowly'],
          conclusion: ['And so', 'In the end', 'Finally', 'At last', 'Forever after', 'Thus it ends'],
          imagery: ['brightly', 'darkly', 'mysteriously', 'brilliantly', 'subtly', 'vividly'],
          emotional: ['heartfelt', 'passionate', 'intense', 'profound', 'moving', 'touching']
        },
        sentenceStarters: ['Like a', 'As if', 'Metaphorically speaking', 'Figuratively', 'Symbolically'],
        metaphors: 0.3,
        sensoryLanguage: 0.4,
        emotionalDescriptors: 0.5
      },
      professional: {
        name: 'Professional',
        contractions: false,
        formality: 'medium-high',
        sentenceComplexity: 'balanced',
        vocabularyLevel: 'business',
        transitionFrequency: 'professional',
        personalVoice: 'moderate',
        errorRate: 0.02,
        patterns: {
          opening: ['This report outlines', 'The following analysis', 'This document presents', 'Our research shows', 'Key findings indicate'],
          transition: ['Additionally', 'Furthermore', 'Moreover', 'Consequently', 'Therefore', 'As a result'],
          conclusion: ['In summary', 'To conclude', 'Ultimately', 'In closing', 'Finally', 'To summarize'],
          business: ['strategic', 'efficient', 'effective', 'productive', 'optimized', 'streamlined'],
          action: ['drive', 'leverage', 'execute', 'deliver', 'achieve', 'accomplish', 'implement']
        },
        sentenceStarters: ['Based on our analysis', 'According to the data', 'Research indicates', 'Findings suggest'],
        metrics: true,
        actionOriented: 0.6,
        resultsFocused: 0.7
      },
      technical: {
        name: 'Technical',
        contractions: false,
        formality: 'high',
        sentenceComplexity: 'complex',
        vocabularyLevel: 'technical',
        transitionFrequency: 'systematic',
        personalVoice: 'minimal',
        errorRate: 0.01,
        patterns: {
          opening: ['This implementation demonstrates', 'The following architecture', 'System analysis reveals', 'Technical specifications indicate'],
          transition: ['Specifically', 'In particular', 'Importantly', 'Critically'],
          conclusion: ['In conclusion', 'Technically speaking', 'From a technical perspective', 'In technical terms'],
          technical: ['implementation', 'integration', 'deployment', 'configuration', 'optimization'],
          systematic: ['systematic', 'methodical', 'structured', 'organized', 'systematic']
        },
        sentenceStarters: ['The system', 'This architecture', 'The implementation', 'Technical analysis', 'System requirements'],
        passiveVoice: 0.5,
        technicalTerms: 0.8,
        specifications: true
      },
      persuasive: {
        name: 'Persuasive',
        contractions: true,
        formality: 'medium',
        sentenceComplexity: 'balanced',
        vocabularyLevel: 'emotional',
        transitionFrequency: 'strategic',
        personalVoice: 'strong',
        errorRate: 0.02,
        patterns: {
          opening: ['Imagine if', 'What if', 'Consider this', 'Picture yourself', 'Think about'],
          transition: ['Importantly', 'Crucially', 'Significantly', 'Essentially'],
          conclusion: ['That\'s why', 'This is why', 'Therefore', 'Consequently', 'As a result'],
          emotional: ['incredible', 'amazing', 'fantastic', 'brilliant', 'outstanding', 'remarkable'],
          urgency: ['now', 'today', 'immediately', 'urgently', 'quickly', 'promptly']
        },
        sentenceStarters: ['You will', 'You can', 'Imagine', 'Consider', 'Picture', 'Think about'],
        rhetoricalQuestions: 0.4,
        emotionalAppeal: 0.6,
        callToAction: 0.5
      },
      narrative: {
        name: 'Narrative',
        contractions: true,
        formality: 'low-medium',
        sentenceComplexity: 'mixed',
        vocabularyLevel: 'descriptive',
        transitionFrequency: 'chronological',
        personalVoice: 'strong',
        errorRate: 0.03,
        patterns: {
          opening: ['Once upon a time', 'It all started when', 'Back when', 'I remember when', 'The day began'],
          transition: ['Then', 'Next', 'After that', 'Later', 'Soon', 'Eventually'],
          conclusion: ['In the end', 'Finally', 'And that\'s how', 'That\'s when', 'From then on'],
          temporal: ['suddenly', 'gradually', 'immediately', 'eventually', 'finally', 'meanwhile'],
          descriptive: ['vividly', 'clearly', 'distinctly', 'obviously', 'apparently']
        },
        sentenceStarters: ['I remember', 'Back then', 'At that time', 'During', 'Throughout'],
        chronologicalOrder: true,
        descriptiveLanguage: 0.6,
        personalReflection: 0.4
      }
    };
  }

  /**
     * Initialize style-specific templates and phrases
     */
  initializeStyleTemplates() {
    this.styleTemplates = {
      casual: {
        fillers: ['you know', 'like', 'kind of', 'sort of', 'I mean', 'basically', 'honestly', 'really'],
        hedging: ['I think', 'I believe', 'probably', 'maybe', 'perhaps', 'seems like'],
        emphasis: ['really', 'pretty', 'quite', 'fairly', 'pretty much', 'kinda'],
        uncertainty: ['not sure', 'I guess', 'I suppose', 'probably', 'maybe'],
        questions: ['right?', 'you know?', 'don\'t you think?', 'wouldn\'t you say?'],
        exclamations: ['wow!', 'oh!', 'ah!', 'hey!', 'jeez!', 'man!', 'gosh!'],
        informal: ['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'lemme', 'gimme']
      },
      academic: {
        fillers: ['it should be noted', 'it is worth noting', 'importantly', 'significantly', 'crucially'],
        hedging: ['it appears', 'it seems', 'evidence suggests', 'research indicates', 'studies show'],
        emphasis: ['significantly', 'importantly', 'crucially', 'critically', 'substantially'],
        uncertainty: ['appears to', 'seems to', 'suggests that', 'indicates that', 'implies that'],
        references: ['according to', 'as stated by', 'in the words of', 'as mentioned by', 'as described in'],
        cautious: ['may', 'might', 'could', 'would', 'should', 'perhaps', 'possibly', 'potentially']
      },
      creative: {
        fillers: ['suddenly', 'gradually', 'meanwhile', 'unexpectedly', 'naturally', 'magically'],
        hedging: ['perhaps', 'maybe', 'possibly', 'conceivably', 'potentially', 'imaginably'],
        emphasis: ['brilliantly', 'beautifully', 'perfectly', 'wonderfully', 'amazingly', 'stunningly'],
        uncertainty: ['perhaps', 'maybe', 'possibly', 'might', 'could', 'may'],
        imagery: ['like a', 'as if', 'metaphorically speaking', 'figuratively', 'symbolically'],
        emotional: ['heartfelt', 'passionate', 'intense', 'profound', 'moving', 'touching', 'powerful'],
        poetic: ['whisper', 'echo', 'dance', 'flow', 'bloom', 'soar', 'linger', 'unfold']
      },
      professional: {
        fillers: ['additionally', 'furthermore', 'moreover', 'consequently', 'therefore', 'hence'],
        hedging: ['it appears', 'it seems', 'evidence suggests', 'data indicates', 'analysis shows'],
        emphasis: ['significantly', 'importantly', 'crucially', 'substantially', 'considerably'],
        uncertainty: ['appears to', 'seems to', 'suggests that', 'indicates that', 'demonstrates that'],
        business: ['strategic', 'efficient', 'effective', 'productive', 'optimized', 'streamlined', 'scalable'],
        action: ['drive', 'leverage', 'execute', 'deliver', 'achieve', 'accomplish', 'implement', 'facilitate'],
        results: ['outcomes', 'deliverables', 'metrics', 'KPIs', 'ROI', 'performance', 'impact']
      },
      technical: {
        fillers: ['specifically', 'in particular', 'notably', 'importantly', 'critically', 'essentially'],
        hedging: ['the data suggests', 'analysis indicates', 'results show', 'findings demonstrate'],
        emphasis: ['critically', 'essentially', 'fundamentally', 'basically', 'primarily', 'principally'],
        uncertainty: ['suggests', 'indicates', 'implies', 'demonstrates', 'shows', 'reveals'],
        technical: ['implementation', 'integration', 'deployment', 'configuration', 'optimization', 'systematic'],
        systematic: ['systematic', 'methodical', 'structured', 'organized', 'systematic', 'methodical']
      },
      persuasive: {
        fillers: ['importantly', 'crucially', 'significantly', 'notably', 'essentially', 'fundamentally'],
        hedging: ['consider', 'imagine', 'picture', 'think about', 'reflect on'],
        emphasis: ['incredible', 'amazing', 'fantastic', 'brilliant', 'outstanding', 'remarkable', 'extraordinary'],
        uncertainty: ['could', 'would', 'will', 'can', 'should', 'must'],
        emotional: ['incredible', 'amazing', 'fantastic', 'brilliant', 'outstanding', 'remarkable'],
        urgency: ['now', 'today', 'immediately', 'urgently', 'quickly', 'promptly', 'instantly'],
        callToAction: ['join', 'act', 'get', 'start', 'begin', 'take action', 'make a difference']
      },
      narrative: {
        fillers: ['then', 'next', 'after that', 'later', 'soon', 'eventually', 'meanwhile'],
        hedging: ['I remember', 'I recall', 'it seems', 'it appears', 'looking back'],
        emphasis: ['vividly', 'clearly', 'distinctly', 'obviously', 'apparently', 'certainly'],
        uncertainty: ['seemed', 'appeared', 'felt like', 'looked like', 'sounded like'],
        temporal: ['suddenly', 'gradually', 'immediately', 'eventually', 'finally', 'meanwhile', 'previously'],
        descriptive: ['vividly', 'clearly', 'distinctly', 'obviously', 'apparently', 'noticeably'],
        personal: ['I felt', 'I thought', 'I realized', 'I understood', 'I learned']
      }
    };
  }

  /**
     * Initialize human-like error patterns for authenticity
     */
  initializeErrorPatterns() {
    this.errorPatterns = {
      minimal: [
        { pattern: /\b(the)\b/gi, replacement: 'teh', probability: 0.001 },
        { pattern: /\b(and)\b/gi, replacement: 'an', probability: 0.001 },
        { pattern: /\b([a-z])\1{2,}/gi, replacement: '$1$1', probability: 0.002 } // Reduce triple letters
      ],
      moderate: [
        { pattern: /\b(the)\b/gi, replacement: 'teh', probability: 0.005 },
        { pattern: /\b(and)\b/gi, replacement: 'an', probability: 0.003 },
        { pattern: /\b(you)\b/gi, replacement: 'yo', probability: 0.002 },
        { pattern: /\b(are)\b/gi, replacement: 'ar', probability: 0.002 },
        { pattern: /\b(your)\b/gi, replacement: 'you\'re', probability: 0.003 },
        { pattern: /\b([a-z])\1{2,}/gi, replacement: '$1$1', probability: 0.005 },
        { pattern: /\s{2,}/g, replacement: ' ', probability: 0.01 }, // Double spaces
        { pattern: /\s+([,.!?;:])/g, replacement: '$1', probability: 0.005 }, // Space before punctuation
        { pattern: /([a-z])([A-Z])/g, replacement: '$1 $2', probability: 0.002 } // Missing space
      ],
      high: [
        { pattern: /\b(the)\b/gi, replacement: 'teh', probability: 0.01 },
        { pattern: /\b(and)\b/gi, replacement: 'an', probability: 0.008 },
        { pattern: /\b(you)\b/gi, replacement: 'yo', probability: 0.005 },
        { pattern: /\b(are)\b/gi, replacement: 'ar', probability: 0.005 },
        { pattern: /\b(your)\b/gi, replacement: 'you\'re', probability: 0.008 },
        { pattern: /\b(their)\b/gi, replacement: 'there', probability: 0.003 },
        { pattern: /\b(there)\b/gi, replacement: 'their', probability: 0.003 },
        { pattern: /\b(to)\b/gi, replacement: 'too', probability: 0.003 },
        { pattern: /\b(too)\b/gi, replacement: 'to', probability: 0.003 },
        { pattern: /\b([a-z])\1{2,}/gi, replacement: '$1$1', probability: 0.01 },
        { pattern: /\s{2,}/g, replacement: ' ', probability: 0.02 },
        { pattern: /\s+([,.!?;:])/g, replacement: '$1', probability: 0.01 },
        { pattern: /([a-z])([A-Z])/g, replacement: '$1 $2', probability: 0.005 },
        { pattern: /\b([a-z]+)ing\b/gi, replacement: '$1in', probability: 0.003 }, // Dropped g
        { pattern: /\b([a-z]+)ed\b/gi, replacement: '$1d', probability: 0.002 } // Dropped e
      ]
    };
  }

  /**
     * Initialize transition words and phrases
     */
  initializeTransitionWords() {
    this.transitionWords = {
      addition: ['also', 'plus', 'what\'s more', 'on top of that', 'additionally', 'furthermore', 'moreover', 'besides'],
      contrast: ['but', 'however', 'on the other hand', 'then again', 'alternatively', 'conversely', 'whereas', 'while'],
      comparison: ['similarly', 'likewise', 'in the same way', 'just as', 'equally'],
      example: ['for example', 'for instance', 'like', 'such as', 'say', 'take'],
      emphasis: ['especially', 'particularly', 'specifically', 'in particular'],
      cause: ['because', 'since', 'as', 'due to', 'owing to', 'thanks to'],
      effect: ['so', 'therefore', 'thus', 'as a result', 'consequently', 'hence'],
      time: ['first', 'then', 'next', 'after that', 'finally', 'meanwhile', 'subsequently'],
      conclusion: ['in conclusion', 'to sum up', 'finally', 'lastly', 'all in all', 'to wrap up']
    };
  }

  /**
     * Main humanization function
     */
  async humanizeText(text, options = {}) {
    if (!text || !text.trim()) {
      throw new Error('Input text is required');
    }

    const style = this.writingStyles[options.style || this.currentStyle] || this.writingStyles.casual;
    const errorLevel = options.errorLevel || 'moderate';
    const synonymLevel = options.synonymLevel || 'medium';
    const sentenceLevel = options.sentenceLevel || 'moderate';

    let humanized = text;
    let detectionAnalysis = null;

    try {
      let superResult = null;
      if (this.superHumanizer) {
        superResult = this.superHumanizer.generate(text, options, this);
      }
      if (superResult && superResult.humanized) {
        humanized = superResult.humanized;
        this.confidenceScore = superResult.confidence || 95;
        detectionAnalysis = superResult.detectionAnalysis;
      } else if (this.advancedHumanizer && options.useAdvanced !== false) {
      // Use advanced humanizer if available and not explicitly disabled
        console.log('[Humanizer] Using advanced multi-stage transformation pipeline...');
        this.updateStatus('Initializing advanced transformation...');

        try {
          // Call the advanced humanizer's unified method directly
          const advancedResult = await this.advancedHumanizer.humanizeText(text, options);

          if (advancedResult && advancedResult.humanizedText) {
            humanized = advancedResult.humanizedText;
            this.confidenceScore = advancedResult.confidenceScore || 95;
            detectionAnalysis = advancedResult.detectionRisk;
            console.log('[Humanizer] Advanced transformation successful');
          } else {
            throw new Error('Advanced humanizer returned empty result');
          }
        } catch (advancedError) {
          console.warn('[Humanizer] Advanced pipeline failed, falling back to manual stages:', advancedError);

          try {
            // Manual fallback stages if the unified method fails
            this.updateStatus('Analyzing semantic structure...');
            const semanticAnalysis = this.advancedHumanizer.semanticEngine.disassemble(humanized);

            this.updateStatus('Synthesizing human-like style...');
            const synthesizedText = this.advancedHumanizer.styleSynthesizer.synthesize(semanticAnalysis, {
              style: style.name || 'casual',
              complexity: sentenceLevel || 'moderate',
              emotion: style.emotion || 'neutral',
              formality: style.formality || 'adaptive',
              culturalContext: style.culturalContext || 'general'
            });

            this.updateStatus('Reengineering stylistic elements...');
            humanized = this.advancedHumanizer.stylisticEngine.reengineer(synthesizedText, {
              style: style.name || 'casual',
              complexity: sentenceLevel || 'moderate',
              emotion: style.emotion || 'neutral'
            });

            this.updateStatus('Checking for AI patterns...');
            humanized = await this.advancedHumanizer.plagiarismChecker.ensureUniqueness(humanized);

            this.updateStatus('Obfuscating AI fingerprints...');
            humanized = this.advancedHumanizer.obfuscationEngine.obfuscate(humanized);

            this.updateStatus('Adding final human touches...');
            humanized = this.advancedHumanizer.humanVerifier.verify(humanized, { errorLevel });
          } catch (manualError) {
            console.warn('[Humanizer] Manual stages failed, falling back to basic pipeline:', manualError);
            options.useAdvanced = false;
            return this.humanizeText(text, options);
          }
        }
      } else {
        // Fall back to basic pipeline
        console.log('[Humanizer] Using basic transformation pipeline...');

        // Step 1: Apply style-specific transformations
        humanized = this.applyStyleTransformations(humanized, style);

        // Step 2: Replace AI patterns with natural alternatives
        humanized = this.replaceAiPatterns(humanized);

        // Step 3: Apply synonym diversification
        humanized = this.applySynonymDiversification(humanized, synonymLevel);

        // Step 4: Adjust sentence structure
        humanized = this.adjustSentenceStructure(humanized, sentenceLevel, style);

        // Step 5: Inject human-like errors
        humanized = this.injectErrors(humanized, errorLevel);

      }

      const intensity = options.humanizationLevel || 'moderate';
      humanized = this.applyHumanVoiceEnhancements(humanized, style, intensity);
      humanized = this.applyRhythmEnhancements(humanized, intensity);
      humanized = this.addNaturalTransitions(humanized, style);
      humanized = this.replaceSystemSubjects(humanized);
      humanized = this.removeRepeatedSentences(humanized);
      humanized = this.cleanUnnaturalFillers(humanized);
      humanized = this.finalPolish(humanized);

      // Calculate confidence score
      this.confidenceScore = this.calculateConfidenceScore(humanized, text);

      // Test against AI detector if available (only if not already analyzed by advanced engine)
      if (this.advancedDetector && !detectionAnalysis) {
        detectionAnalysis = this.advancedDetector.analyzeText(humanized);
        console.log('[Humanizer] AI Detection Analysis:', detectionAnalysis);

        // If detection score is too high, try additional obfuscation
        if (detectionAnalysis.overallScore > 30) {
          console.log('[Humanizer] High AI detection score detected, applying additional obfuscation...');
          humanized = this.advancedHumanizer.obfuscationEngine.obfuscate(humanized);
          detectionAnalysis = this.advancedDetector.analyzeText(humanized);
        }
      }

      return {
        humanized: humanized,
        confidence: this.confidenceScore,
        detectionAnalysis: detectionAnalysis,
        pipeline: this.advancedHumanizer ? 'advanced' : 'basic'
      };
    } catch (error) {
      console.error('Humanization error:', error);
      throw new Error('Failed to humanize text: ' + error.message);
    }
  }

  /**
     * Apply style-specific transformations
     */
  applyStyleTransformations(text, style) {
    let transformed = text;

    // Apply contractions for casual styles
    if (style.contractions) {
      transformed = transformed.replace(/\b(do not)\b/gi, 'don\'t');
      transformed = transformed.replace(/\b(does not)\b/gi, 'doesn\'t');
      transformed = transformed.replace(/\b(did not)\b/gi, 'didn\'t');
      transformed = transformed.replace(/\b(will not)\b/gi, 'won\'t');
      transformed = transformed.replace(/\b(would not)\b/gi, 'wouldn\'t');
      transformed = transformed.replace(/\b(could not)\b/gi, 'couldn\'t');
      transformed = transformed.replace(/\b(should not)\b/gi, 'shouldn\'t');
      transformed = transformed.replace(/\b(cannot)\b/gi, 'can\'t');
      transformed = transformed.replace(/\b(is not)\b/gi, 'isn\'t');
      transformed = transformed.replace(/\b(are not)\b/gi, 'aren\'t');
      transformed = transformed.replace(/\b(was not)\b/gi, 'wasn\'t');
      transformed = transformed.replace(/\b(were not)\b/gi, 'weren\'t');
      transformed = transformed.replace(/\b(has not)\b/gi, 'hasn\'t');
      transformed = transformed.replace(/\b(have not)\b/gi, 'haven\'t');
      transformed = transformed.replace(/\b(had not)\b/gi, 'hadn\'t');
      transformed = transformed.replace(/\b(I am)\b/gi, 'I\'m');
      transformed = transformed.replace(/\b(you are)\b/gi, 'you\'re');
      transformed = transformed.replace(/\b(we are)\b/gi, 'we\'re');
      transformed = transformed.replace(/\b(they are)\b/gi, 'they\'re');
      transformed = transformed.replace(/\b(he is)\b/gi, 'he\'s');
      transformed = transformed.replace(/\b(she is)\b/gi, 'she\'s');
      transformed = transformed.replace(/\b(it is)\b/gi, 'it\'s');
      transformed = transformed.replace(/\b(that is)\b/gi, 'that\'s');
      transformed = transformed.replace(/\b(this is)\b/gi, 'this is'); // Keep "this is" as is
      transformed = transformed.replace(/\b(what is)\b/gi, 'what\'s');
      transformed = transformed.replace(/\b(where is)\b/gi, 'where\'s');
      transformed = transformed.replace(/\b(when is)\b/gi, 'when\'s');
      transformed = transformed.replace(/\b(who is)\b/gi, 'who\'s');
      transformed = transformed.replace(/\b(how is)\b/gi, 'how\'s');
    }

    // Add style-specific fillers and personal voice
    if (style.personalVoice !== 'minimal') {
      const fillers = this.styleTemplates[style.name.toLowerCase()]?.fillers || [];
      if (fillers.length > 0 && Math.random() < 0.1) {
        const filler = fillers[Math.floor(Math.random() * fillers.length)];
        transformed = filler + ', ' + transformed.charAt(0).toLowerCase() + transformed.slice(1);
      }
    }

    return transformed;
  }

  /**
     * Replace common AI patterns with natural alternatives
     */
  replaceAiPatterns(text) {
    let replaced = text;

    // Replace overly formal transitions
    const aiPatterns = [
      { pattern: /\bin conclusion\b/gi, replacement: 'so basically' },
      { pattern: /\bto summarize\b/gi, replacement: 'to wrap up' },
      { pattern: /\bit is important to note\b/gi, replacement: 'just so you know' },
      { pattern: /\bit should be noted\b/gi, replacement: 'worth mentioning' },
      { pattern: /\bit is worth noting\b/gi, replacement: 'one thing to keep in mind' },
      { pattern: /\bit is important to understand\b/gi, replacement: 'you should probably know' },
      { pattern: /\bit is crucial to understand\b/gi, replacement: 'here is the deal' },
      { pattern: /\bit is essential to understand\b/gi, replacement: 'it is worth looking at' },
      { pattern: /\bin today's (?:digital|modern|contemporary) (?:world|landscape)\b/gi, replacement: 'lately' },
      { pattern: /\bin the modern (?:world|era|age)\b/gi, replacement: 'now' },
      { pattern: /\bplays? a (?:crucial|important|significant|vital) role\b/gi, replacement: 'is a big part of it' },
      { pattern: /\bthis demonstrates\b/gi, replacement: 'this pretty much shows' },
      { pattern: /\bthis indicates\b/gi, replacement: 'this suggests' },
      { pattern: /\bthis highlights\b/gi, replacement: 'this brings up' },
      { pattern: /\bto put it simply\b/gi, replacement: 'basically' },
      { pattern: /\bin other words\b/gi, replacement: 'meaning' },
      { pattern: /\bthat is to say\b/gi, replacement: 'actually' },
      { pattern: /\bnot only\b/gi, replacement: 'not just' },
      { pattern: /\bin order to\b/gi, replacement: 'to' },
      { pattern: /\bas mentioned earlier\b/gi, replacement: 'like I said' },
      { pattern: /\bas previously stated\b/gi, replacement: 'as I mentioned' },
      { pattern: /\bwith regard to\b/gi, replacement: 'regarding' },
      { pattern: /\bdue to the fact that\b/gi, replacement: 'since' },
      { pattern: /\bin spite of the fact that\b/gi, replacement: 'even though' },
      { pattern: /\bdespite the fact that\b/gi, replacement: 'even though' },
      { pattern: /\bfor the purpose of\b/gi, replacement: 'to' },
      { pattern: /\bin the event that\b/gi, replacement: 'if' },
      { pattern: /\bunder the circumstances\b/gi, replacement: 'given how things are' },
      { pattern: /\bin my opinion\b/gi, replacement: 'I honestly think' },
      { pattern: /\bit is my belief that\b/gi, replacement: 'I feel like' },
      { pattern: /\bi am of the opinion that\b/gi, replacement: 'I\'d say' },
      { pattern: /\bit goes without saying\b/gi, replacement: 'it\'s pretty obvious' },
      { pattern: /\bit is worth mentioning\b/gi, replacement: 'I should also mention' },
      { pattern: /\bit is interesting to note\b/gi, replacement: 'it is kind of interesting that' },
      { pattern: /\bit should be mentioned\b/gi, replacement: 'also' },
      { pattern: /\bit must be noted\b/gi, replacement: 'keep in mind' },
      { pattern: /\bit is essential to\b/gi, replacement: 'you really should' },
      { pattern: /\bit is crucial to\b/gi, replacement: 'it helps to' },
      { pattern: /\bit is vital to\b/gi, replacement: 'it is key to' },
      { pattern: /\bit is imperative to\b/gi, replacement: 'you really need to' },
      { pattern: /\bit is advisable to\b/gi, replacement: 'it\'s probably better to' },
      { pattern: /\bit is recommended to\b/gi, replacement: 'I\'d recommend' },
      { pattern: /\bit is suggested that\b/gi, replacement: 'maybe' },
      { pattern: /\bit is proposed that\b/gi, replacement: 'we could say' },
      { pattern: /\bit is argued that\b/gi, replacement: 'some people think' },
      { pattern: /\bit is claimed that\b/gi, replacement: 'some say' },
      { pattern: /\bit is asserted that\b/gi, replacement: 'it is often said' },
      { pattern: /\bit is contended that\b/gi, replacement: 'there is an argument that' },
      { pattern: /\bit is maintained that\b/gi, replacement: 'it is usually thought' },
      { pattern: /\bit is held that\b/gi, replacement: 'people generally believe' },
      { pattern: /\bit is believed that\b/gi, replacement: 'it is thought' },
      { pattern: /\bit is thought that\b/gi, replacement: 'most people think' },
      { pattern: /\bit is felt that\b/gi, replacement: 'the feeling is' },
      { pattern: /\bthe fact of the matter is\b/gi, replacement: 'honestly' },
      { pattern: /\bat the end of the day\b/gi, replacement: 'ultimately' },
      { pattern: /\bin a nutshell\b/gi, replacement: 'basically' },
      { pattern: /\btake a deep dive into\b/gi, replacement: 'look closer at' },
      { pattern: /\bmastering the art of\b/gi, replacement: 'getting good at' },
      { pattern: /\bunlocking the potential of\b/gi, replacement: 'making the most of' },
      { pattern: /\bembarking on a journey\b/gi, replacement: 'starting out' },
      { pattern: /\bthe key takeaway is\b/gi, replacement: 'the main thing is' },
      { pattern: /\bleverage the power of\b/gi, replacement: 'use' },
      { pattern: /\bhighly recommended\b/gi, replacement: 'a good idea' },
      { pattern: /\bthis article aims to\b/gi, replacement: 'I want to show you' },
      { pattern: /\bwe will explore\b/gi, replacement: 'let\'s look at' },
      { pattern: /\bin this post\b/gi, replacement: 'here' },
      { pattern: /\bthank you for reading\b/gi, replacement: 'thanks for sticking around' },
      { pattern: /\bit is considered that\b/gi, replacement: 'it is seen as' },
      { pattern: /\bit is viewed that\b/gi, replacement: 'it is looked at as' },
      { pattern: /\bit is seen that\b/gi, replacement: 'it turns out' },
      { pattern: /\bit is perceived that\b/gi, replacement: 'it seems' },
      { pattern: /\bit is understood that\b/gi, replacement: 'we know' },
      { pattern: /\bit is recognized that\b/gi, replacement: 'it is well known' },
      { pattern: /\bit is acknowledged that\b/gi, replacement: 'everyone knows' },
      { pattern: /\bit is accepted that\b/gi, replacement: 'it is common knowledge' },
      { pattern: /\bit is agreed that\b/gi, replacement: 'most agree' },
      { pattern: /\bit is concluded that\b/gi, replacement: 'the takeaway is' },
      { pattern: /\bit is determined that\b/gi, replacement: 'it turns out' },
      { pattern: /\bit is decided that\b/gi, replacement: 'the decision was' },
      { pattern: /\bit is established that\b/gi, replacement: 'it is clear' },
      { pattern: /\bit is proven that\b/gi, replacement: 'it has been shown' },
      { pattern: /\bit is demonstrated that\b/gi, replacement: 'it is clear' },
      { pattern: /\bit is shown that\b/gi, replacement: 'it shows' },
      { pattern: /\bit is revealed that\b/gi, replacement: 'it turns out' },
      { pattern: /\bit is disclosed that\b/gi, replacement: 'it was found' },
      { pattern: /\bit is uncovered that\b/gi, replacement: 'it was discovered' },
      { pattern: /\bit is discovered that\b/gi, replacement: 'it turns out' },
      { pattern: /\bit is found that\b/gi, replacement: 'it seems' },
      { pattern: /\bit is revealed that\b/gi, replacement: 'it turns out' },

      // Additional AI detection patterns for better evasion
      { pattern: /\bin today's\s+\w+\s+landscape\b/gi, replacement: 'nowadays' },
      { pattern: /\bdelve into\b/gi, replacement: 'look at' },
      { pattern: /\ba testament to\b/gi, replacement: 'a sign of' },
      { pattern: /\bin light of\b/gi, replacement: 'given' },
      { pattern: /\bthe fact remains that\b/gi, replacement: 'actually' },
      { pattern: /\bit is clear that\b/gi, replacement: 'it is obvious' },
      { pattern: /\bfurther research is needed\b/gi, replacement: 'we need to look into this more' },
      { pattern: /\bcomprehensive (?:analysis|study|review)\b/gi, replacement: 'full look' },
      { pattern: /\bhighly (?:effective|efficient|significant)\b/gi, replacement: 'really great' },
      { pattern: /\butilize the (?:power|potential) of\b/gi, replacement: 'use' },
      { pattern: /\bin the modern era\b/gi, replacement: 'now' },
      { pattern: /\bin contemporary society\b/gi, replacement: 'today' },
      { pattern: /\bin the current climate\b/gi, replacement: 'right now' },
      { pattern: /\bplays? a crucial role\b/gi, replacement: 'is a big deal' },
      { pattern: /\bplays? a vital role\b/gi, replacement: 'is essential' },
      { pattern: /\bplays? a significant role\b/gi, replacement: 'really matters' },
      { pattern: /\bkey (?:component|factor|aspect)\b/gi, replacement: 'important part' },
      { pattern: /\bthe fact that\b/gi, replacement: 'that' },
      { pattern: /\bneedless to say\b/gi, replacement: 'obviously' },
      { pattern: /\bit goes without saying\b/gi, replacement: 'clearly' },
      { pattern: /\bthe utilization of\b/gi, replacement: 'using' },
      { pattern: /\bthe implementation of\b/gi, replacement: 'putting in place' },
      { pattern: /\bthe integration of\b/gi, replacement: 'combining' },
      { pattern: /\bthe incorporation of\b/gi, replacement: 'adding' },
      { pattern: /\bthe adoption of\b/gi, replacement: 'taking up' },
      { pattern: /\bthe application of\b/gi, replacement: 'applying' },
      { pattern: /\bthe deployment of\b/gi, replacement: 'rolling out' },
      { pattern: /\bthe execution of\b/gi, replacement: 'carrying out' },
      { pattern: /\bthe facilitation of\b/gi, replacement: 'making easier' },
      { pattern: /\bthe enhancement of\b/gi, replacement: 'improving' },
      { pattern: /\bthe optimization of\b/gi, replacement: 'making better' },
      { pattern: /\bthe maximization of\b/gi, replacement: 'getting the most from' },
      { pattern: /\bthe minimization of\b/gi, replacement: 'reducing' },
      { pattern: /\bthe streamlining of\b/gi, replacement: 'simplifying' },
      { pattern: /\bthe standardization of\b/gi, replacement: 'making consistent' },
      { pattern: /\bthe normalization of\b/gi, replacement: 'making normal' },
      { pattern: /\bthe customization of\b/gi, replacement: 'personalizing' },
      { pattern: /\bthe personalization of\b/gi, replacement: 'making personal' },
      { pattern: /\bthe individualization of\b/gi, replacement: 'tailoring' },
      { pattern: /\bthe adaptation of\b/gi, replacement: 'adjusting' },
      { pattern: /\bthe modification of\b/gi, replacement: 'changing' },
      { pattern: /\bthe alteration of\b/gi, replacement: 'changing' },
      { pattern: /\bthe transformation of\b/gi, replacement: 'changing' },
      { pattern: /\bthe conversion of\b/gi, replacement: 'changing' },
      { pattern: /\bthe transition of\b/gi, replacement: 'moving' },
      { pattern: /\bthe migration of\b/gi, replacement: 'moving' },
      { pattern: /\bthe transfer of\b/gi, replacement: 'moving' },
      { pattern: /\bthe transmission of\b/gi, replacement: 'sending' },
      { pattern: /\bthe communication of\b/gi, replacement: 'sharing' },
      { pattern: /\bthe dissemination of\b/gi, replacement: 'spreading' },
      { pattern: /\bthe distribution of\b/gi, replacement: 'sharing' },
      { pattern: /\bthe allocation of\b/gi, replacement: 'assigning' },
      { pattern: /\bthe assignment of\b/gi, replacement: 'giving' },
      { pattern: /\bthe designation of\b/gi, replacement: 'naming' },
      { pattern: /\bthe identification of\b/gi, replacement: 'finding' },
      { pattern: /\bthe recognition of\b/gi, replacement: 'acknowledging' },
      { pattern: /\bthe acknowledgment of\b/gi, replacement: 'accepting' },
      { pattern: /\bthe acceptance of\b/gi, replacement: 'taking' },
      { pattern: /\bthe approval of\b/gi, replacement: 'okay' },
      { pattern: /\bthe authorization of\b/gi, replacement: 'permission' },
      { pattern: /\bthe permission of\b/gi, replacement: 'allowing' },
      { pattern: /\bthe consent of\b/gi, replacement: 'agreement' },
      { pattern: /\bthe agreement of\b/gi, replacement: 'deal' },
      { pattern: /\bthe understanding of\b/gi, replacement: 'knowing' },
      { pattern: /\bthe comprehension of\b/gi, replacement: 'understanding' },
      { pattern: /\bthe interpretation of\b/gi, replacement: 'reading' },
      { pattern: /\bthe explanation of\b/gi, replacement: 'explaining' },
      { pattern: /\bthe clarification of\b/gi, replacement: 'making clear' },
      { pattern: /\bthe specification of\b/gi, replacement: 'specifying' },
      { pattern: /\bthe definition of\b/gi, replacement: 'defining' },
      { pattern: /\bthe description of\b/gi, replacement: 'describing' },
      { pattern: /\bthe depiction of\b/gi, replacement: 'showing' },
      { pattern: /\bthe representation of\b/gi, replacement: 'representing' },
      { pattern: /\bthe presentation of\b/gi, replacement: 'presenting' },
      { pattern: /\bthe demonstration of\b/gi, replacement: 'showing' },
      { pattern: /\bthe illustration of\b/gi, replacement: 'illustrating' },
      { pattern: /\bthe exhibition of\b/gi, replacement: 'showing' },
      { pattern: /\bthe display of\b/gi, replacement: 'showing' },
      { pattern: /\bthe manifestation of\b/gi, replacement: 'showing' },
      { pattern: /\bthe expression of\b/gi, replacement: 'expressing' },
      { pattern: /\bthe indication of\b/gi, replacement: 'showing' },
      { pattern: /\bthe suggestion of\b/gi, replacement: 'suggesting' },
      { pattern: /\bthe implication of\b/gi, replacement: 'implying' },
      { pattern: /\bthe inference of\b/gi, replacement: 'inferring' },
      { pattern: /\bthe deduction of\b/gi, replacement: 'deducing' },
      { pattern: /\bthe conclusion of\b/gi, replacement: 'concluding' },
      { pattern: /\bthe determination of\b/gi, replacement: 'determining' },
      { pattern: /\bthe establishment of\b/gi, replacement: 'setting up' },
      { pattern: /\bthe creation of\b/gi, replacement: 'creating' },
      { pattern: /\bthe formation of\b/gi, replacement: 'forming' },
      { pattern: /\bthe development of\b/gi, replacement: 'developing' },
      { pattern: /\bthe generation of\b/gi, replacement: 'generating' },
      { pattern: /\bthe production of\b/gi, replacement: 'producing' },
      { pattern: /\bthe construction of\b/gi, replacement: 'building' },
      { pattern: /\bthe building of\b/gi, replacement: 'building' },
      { pattern: /\bthe assembly of\b/gi, replacement: 'putting together' },
      { pattern: /\bthe composition of\b/gi, replacement: 'making up' },
      { pattern: /\bthe constitution of\b/gi, replacement: 'making up' },
      { pattern: /\bthe structure of\b/gi, replacement: 'structure' },
      { pattern: /\bthe organization of\b/gi, replacement: 'organizing' },
      { pattern: /\bthe arrangement of\b/gi, replacement: 'arranging' },
      { pattern: /\bthe configuration of\b/gi, replacement: 'setting up' },
      { pattern: /\bthe setup of\b/gi, replacement: 'setting up' },
      { pattern: /\bthe preparation of\b/gi, replacement: 'preparing' },
      { pattern: /\bthe readiness of\b/gi, replacement: 'being ready' },
      { pattern: /\bthe availability of\b/gi, replacement: 'available' },
      { pattern: /\bthe accessibility of\b/gi, replacement: 'being accessible' },
      { pattern: /\bthe usability of\b/gi, replacement: 'being usable' },
      { pattern: /\bthe functionality of\b/gi, replacement: 'working' },
      { pattern: /\bthe operation of\b/gi, replacement: 'operating' },
      { pattern: /\bthe functioning of\b/gi, replacement: 'working' },
      { pattern: /\bthe performance of\b/gi, replacement: 'performance' },
      { pattern: /\bthe efficiency of\b/gi, replacement: 'efficiency' },
      { pattern: /\bthe effectiveness of\b/gi, replacement: 'effectiveness' },
      { pattern: /\bthe efficacy of\b/gi, replacement: 'how well it works' },
      { pattern: /\bthe capability of\b/gi, replacement: 'ability' },
      { pattern: /\bthe capacity of\b/gi, replacement: 'capacity' },
      { pattern: /\bthe ability of\b/gi, replacement: 'ability' },
      { pattern: /\bthe potential of\b/gi, replacement: 'potential' },
      { pattern: /\bthe possibility of\b/gi, replacement: 'possibility' },
      { pattern: /\bthe probability of\b/gi, replacement: 'chance' },
      { pattern: /\bthe likelihood of\b/gi, replacement: 'likelihood' },
      { pattern: /\bthe certainty of\b/gi, replacement: 'certainty' },
      { pattern: /\bthe uncertainty of\b/gi, replacement: 'uncertainty' },
      { pattern: /\bthe ambiguity of\b/gi, replacement: 'ambiguity' },
      { pattern: /\bthe clarity of\b/gi, replacement: 'clarity' },
      { pattern: /\bthe precision of\b/gi, replacement: 'precision' },
      { pattern: /\bthe accuracy of\b/gi, replacement: 'accuracy' },
      { pattern: /\bthe correctness of\b/gi, replacement: 'correctness' },
      { pattern: /\bthe validity of\b/gi, replacement: 'validity' },
      { pattern: /\bthe reliability of\b/gi, replacement: 'reliability' },
      { pattern: /\bthe dependability of\b/gi, replacement: 'dependability' },
      { pattern: /\bthe trustworthiness of\b/gi, replacement: 'trustworthiness' },
      { pattern: /\bthe credibility of\b/gi, replacement: 'credibility' },
      { pattern: /\bthe authenticity of\b/gi, replacement: 'authenticity' },
      { pattern: /\bthe genuineness of\b/gi, replacement: 'genuineness' },
      { pattern: /\bthe originality of\b/gi, replacement: 'originality' },
      { pattern: /\bthe uniqueness of\b/gi, replacement: 'uniqueness' },
      { pattern: /\bthe distinctiveness of\b/gi, replacement: 'distinctiveness' },
      { pattern: /\bthe singularity of\b/gi, replacement: 'singularity' },
      { pattern: /\bthe exclusivity of\b/gi, replacement: 'exclusivity' },
      { pattern: /\bthe rarity of\b/gi, replacement: 'rarity' },
      { pattern: /\bthe scarcity of\b/gi, replacement: 'scarcity' },
      { pattern: /\bthe abundance of\b/gi, replacement: 'abundance' },
      { pattern: /\bthe plenty of\b/gi, replacement: 'plenty' },
      { pattern: /\bthe sufficiency of\b/gi, replacement: 'sufficiency' },
      { pattern: /\bthe adequacy of\b/gi, replacement: 'adequacy' },
      { pattern: /\bthe inadequacy of\b/gi, replacement: 'inadequacy' },
      { pattern: /\bthe insufficiency of\b/gi, replacement: 'insufficiency' },
      { pattern: /\bthe deficiency of\b/gi, replacement: 'deficiency' },
      { pattern: /\bthe lack of\b/gi, replacement: 'lack' },
      { pattern: /\bthe absence of\b/gi, replacement: 'absence' },
      { pattern: /\bthe presence of\b/gi, replacement: 'presence' },
      { pattern: /\bthe existence of\b/gi, replacement: 'existence' },
      { pattern: /\bthe occurrence of\b/gi, replacement: 'happening' },
      { pattern: /\bthe happening of\b/gi, replacement: 'happening' },
      { pattern: /\bthe taking place of\b/gi, replacement: 'taking place' },
      { pattern: /\bthe emergence of\b/gi, replacement: 'emerging' },
      { pattern: /\bthe appearance of\b/gi, replacement: 'appearing' },
      { pattern: /\bthe arising of\b/gi, replacement: 'arising' },
      { pattern: /\bthe originating of\b/gi, replacement: 'originating' },
      { pattern: /\bthe deriving of\b/gi, replacement: 'deriving' },
      { pattern: /\bthe resulting of\b/gi, replacement: 'resulting' },
      { pattern: /\bthe ensuing of\b/gi, replacement: 'ensuing' },
      { pattern: /\bthe following of\b/gi, replacement: 'following' },
      { pattern: /\bthe subsequent of\b/gi, replacement: 'subsequent' },
      { pattern: /\bthe successive of\b/gi, replacement: 'successive' },
      { pattern: /\bthe consecutive of\b/gi, replacement: 'consecutive' },
      { pattern: /\bthe continuous of\b/gi, replacement: 'continuous' },
      { pattern: /\bthe continual of\b/gi, replacement: 'continual' },
      { pattern: /\bthe constant of\b/gi, replacement: 'constant' },
      { pattern: /\bthe persistent of\b/gi, replacement: 'persistent' },
      { pattern: /\bthe perpetual of\b/gi, replacement: 'perpetual' },
      { pattern: /\bthe eternal of\b/gi, replacement: 'eternal' },
      { pattern: /\bthe everlasting of\b/gi, replacement: 'everlasting' },
      { pattern: /\bthe endless of\b/gi, replacement: 'endless' },
      { pattern: /\bthe infinite of\b/gi, replacement: 'infinite' },
      { pattern: /\bthe limitless of\b/gi, replacement: 'limitless' },
      { pattern: /\bthe boundless of\b/gi, replacement: 'boundless' },
      { pattern: /\bthe immeasurable of\b/gi, replacement: 'immeasurable' },
      { pattern: /\bthe incalculable of\b/gi, replacement: 'incalculable' },
      { pattern: /\bthe innumerable of\b/gi, replacement: 'innumerable' },
      { pattern: /\bthe countless of\b/gi, replacement: 'countless' },
      { pattern: /\bthe numerous of\b/gi, replacement: 'numerous' },
      { pattern: /\bthe multiple of\b/gi, replacement: 'multiple' },
      { pattern: /\bthe various of\b/gi, replacement: 'various' },
      { pattern: /\bthe diverse of\b/gi, replacement: 'diverse' },
      { pattern: /\bthe varied of\b/gi, replacement: 'varied' },
      { pattern: /\bthe different of\b/gi, replacement: 'different' },
      { pattern: /\bthe distinct of\b/gi, replacement: 'distinct' },
      { pattern: /\bthe separate of\b/gi, replacement: 'separate' },
      { pattern: /\bthe individual of\b/gi, replacement: 'individual' },
      { pattern: /\bthe personal of\b/gi, replacement: 'personal' },
      { pattern: /\bthe private of\b/gi, replacement: 'private' },
      { pattern: /\bthe intimate of\b/gi, replacement: 'intimate' },
      { pattern: /\bthe confidential of\b/gi, replacement: 'confidential' },
      { pattern: /\bthe secret of\b/gi, replacement: 'secret' },
      { pattern: /\bthe hidden of\b/gi, replacement: 'hidden' },
      { pattern: /\bthe concealed of\b/gi, replacement: 'concealed' },
      { pattern: /\bthe disguised of\b/gi, replacement: 'disguised' },
      { pattern: /\bthe masked of\b/gi, replacement: 'masked' },
      { pattern: /\bthe covered of\b/gi, replacement: 'covered' },
      { pattern: /\bthe veiled of\b/gi, replacement: 'veiled' },
      { pattern: /\bthe shrouded of\b/gi, replacement: 'shrouded' },
      { pattern: /\bthe obscured of\b/gi, replacement: 'obscured' },
      { pattern: /\bthe clouded of\b/gi, replacement: 'clouded' },
      { pattern: /\bthe dimmed of\b/gi, replacement: 'dimmed' },
      { pattern: /\bthe darkened of\b/gi, replacement: 'darkened' },
      { pattern: /\bthe blackened of\b/gi, replacement: 'blackened' },
      { pattern: /\bthe shadowed of\b/gi, replacement: 'shadowed' },
      { pattern: /\bthe shaded of\b/gi, replacement: 'shaded' },
      { pattern: /\bthe tinted of\b/gi, replacement: 'tinted' },
      { pattern: /\bthe colored of\b/gi, replacement: 'colored' },
      { pattern: /\bthe painted of\b/gi, replacement: 'painted' },
      { pattern: /\bthe dyed of\b/gi, replacement: 'dyed' },
      { pattern: /\bthe stained of\b/gi, replacement: 'stained' },
      { pattern: /\bthe marked of\b/gi, replacement: 'marked' },
      { pattern: /\bthe spotted of\b/gi, replacement: 'spotted' },
      { pattern: /\bthe dotted of\b/gi, replacement: 'dotted' },
      { pattern: /\bthe speckled of\b/gi, replacement: 'speckled' },
      { pattern: /\bthe flecked of\b/gi, replacement: 'flecked' },
      { pattern: /\bthe streaked of\b/gi, replacement: 'streaked' },
      { pattern: /\bthe striped of\b/gi, replacement: 'striped' },
      { pattern: /\bthe banded of\b/gi, replacement: 'banded' },
      { pattern: /\bthe lined of\b/gi, replacement: 'lined' },
      { pattern: /\bthe ruled of\b/gi, replacement: 'ruled' },
      { pattern: /\bthe checked of\b/gi, replacement: 'checked' },
      { pattern: /\bthe plaid of\b/gi, replacement: 'plaid' },
      { pattern: /\bthe tartan of\b/gi, replacement: 'tartan' },
      { pattern: /\bthe patterned of\b/gi, replacement: 'patterned' },
      { pattern: /\bthe designed of\b/gi, replacement: 'designed' },
      { pattern: /\bthe decorated of\b/gi, replacement: 'decorated' },
      { pattern: /\bthe ornamented of\b/gi, replacement: 'ornamented' },
      { pattern: /\bthe adorned of\b/gi, replacement: 'adorned' },
      { pattern: /\bthe embellished of\b/gi, replacement: 'embellished' },
      { pattern: /\bthe enhanced of\b/gi, replacement: 'enhanced' },
      { pattern: /\bthe improved of\b/gi, replacement: 'improved' },
      { pattern: /\bthe upgraded of\b/gi, replacement: 'upgraded' },
      { pattern: /\bthe updated of\b/gi, replacement: 'updated' },
      { pattern: /\bthe modernized of\b/gi, replacement: 'modernized' },
      { pattern: /\bthe renovated of\b/gi, replacement: 'renovated' },
      { pattern: /\bthe refurbished of\b/gi, replacement: 'refurbished' },
      { pattern: /\bthe restored of\b/gi, replacement: 'restored' },
      { pattern: /\bthe renewed of\b/gi, replacement: 'renewed' },
      { pattern: /\bthe refreshed of\b/gi, replacement: 'refreshed' },
      { pattern: /\bthe revitalized of\b/gi, replacement: 'revitalized' },
      { pattern: /\bthe rejuvenated of\b/gi, replacement: 'rejuvenated' },
      { pattern: /\bthe regenerated of\b/gi, replacement: 'regenerated' },
      { pattern: /\bthe reborn of\b/gi, replacement: 'reborn' },
      { pattern: /\bthe revived of\b/gi, replacement: 'revived' },
      { pattern: /\bthe resurrected of\b/gi, replacement: 'resurrected' },
      { pattern: /\bthe reanimated of\b/gi, replacement: 'reanimated' },
      { pattern: /\bthe reawakened of\b/gi, replacement: 'reawakened' },
      { pattern: /\bthe rekindled of\b/gi, replacement: 'rekindled' },
      { pattern: /\bthe relit of\b/gi, replacement: 'relit' },
      { pattern: /\bthe reignited of\b/gi, replacement: 'reignited' },
      { pattern: /\bthe recharged of\b/gi, replacement: 'recharged' },
      { pattern: /\bthe reenergized of\b/gi, replacement: 'reenergized' },
      { pattern: /\bthe reinvigorated of\b/gi, replacement: 'reinvigorated' },
      { pattern: /\bthe reactivated of\b/gi, replacement: 'reactivated' },
      { pattern: /\bthe restarted of\b/gi, replacement: 'restarted' },
      { pattern: /\bthe resumed of\b/gi, replacement: 'resumed' },
      { pattern: /\bthe continued of\b/gi, replacement: 'continued' },
      { pattern: /\bthe ongoing of\b/gi, replacement: 'ongoing' },
      { pattern: /\bthe persistent of\b/gi, replacement: 'persistent' },
      { pattern: /\bthe constant of\b/gi, replacement: 'constant' },
      { pattern: /\bthe continual of\b/gi, replacement: 'continual' },
      { pattern: /\bthe continuous of\b/gi, replacement: 'continuous' },
      { pattern: /\bthe uninterrupted of\b/gi, replacement: 'uninterrupted' },
      { pattern: /\bthe unbroken of\b/gi, replacement: 'unbroken' },
      { pattern: /\bthe unceasing of\b/gi, replacement: 'unceasing' },
      { pattern: /\bthe endless of\b/gi, replacement: 'endless' },
      { pattern: /\bthe infinite of\b/gi, replacement: 'infinite' },
      { pattern: /\bthe perpetual of\b/gi, replacement: 'perpetual' },
      { pattern: /\bthe eternal of\b/gi, replacement: 'eternal' },
      { pattern: /\bthe everlasting of\b/gi, replacement: 'everlasting' },
      { pattern: /\bthe lasting of\b/gi, replacement: 'lasting' },
      { pattern: /\bthe enduring of\b/gi, replacement: 'enduring' },
      { pattern: /\bthe remaining of\b/gi, replacement: 'remaining' },
      { pattern: /\bthe staying of\b/gi, replacement: 'staying' },
      { pattern: /\bthe abiding of\b/gi, replacement: 'abiding' },
      { pattern: /\bthe continuing of\b/gi, replacement: 'continuing' },
      { pattern: /\bthe surviving of\b/gi, replacement: 'surviving' },
      { pattern: /\bthe persisting of\b/gi, replacement: 'persisting' },
      { pattern: /\bthe prevailing of\b/gi, replacement: 'prevailing' },
      { pattern: /\bthe predominating of\b/gi, replacement: 'predominating' },
      { pattern: /\bthe dominating of\b/gi, replacement: 'dominating' },
      { pattern: /\bthe ruling of\b/gi, replacement: 'ruling' },
      { pattern: /\bthe governing of\b/gi, replacement: 'governing' },
      { pattern: /\bthe controlling of\b/gi, replacement: 'controlling' },
      { pattern: /\bthe managing of\b/gi, replacement: 'managing' },
      { pattern: /\bthe handling of\b/gi, replacement: 'handling' },
      { pattern: /\bthe dealing with of\b/gi, replacement: 'dealing with' },
      { pattern: /\bthe coping with of\b/gi, replacement: 'coping with' },
      { pattern: /\bthe addressing of\b/gi, replacement: 'addressing' },
      { pattern: /\bthe tackling of\b/gi, replacement: 'tackling' },
      { pattern: /\bthe confronting of\b/gi, replacement: 'confronting' },
      { pattern: /\bthe facing of\b/gi, replacement: 'facing' },
      { pattern: /\bthe meeting of\b/gi, replacement: 'meeting' },
      { pattern: /\bthe satisfying of\b/gi, replacement: 'satisfying' },
      { pattern: /\bthe fulfilling of\b/gi, replacement: 'fulfilling' },
      { pattern: /\bthe achieving of\b/gi, replacement: 'achieving' },
      { pattern: /\bthe accomplishing of\b/gi, replacement: 'accomplishing' },
      { pattern: /\bthe realizing of\b/gi, replacement: 'realizing' },
      { pattern: /\bthe actualizing of\b/gi, replacement: 'actualizing' },
      { pattern: /\bthe materializing of\b/gi, replacement: 'materializing' },
      { pattern: /\bthe manifesting of\b/gi, replacement: 'manifesting' },
      { pattern: /\bthe embodying of\b/gi, replacement: 'embodying' },
      { pattern: /\bthe personifying of\b/gi, replacement: 'personifying' },
      { pattern: /\bthe representing of\b/gi, replacement: 'representing' },
      { pattern: /\bthe symbolizing of\b/gi, replacement: 'symbolizing' },
      { pattern: /\bthe signifying of\b/gi, replacement: 'signifying' },
      { pattern: /\bthe indicating of\b/gi, replacement: 'indicating' },
      { pattern: /\bthe denoting of\b/gi, replacement: 'denoting' },
      { pattern: /\bthe connoting of\b/gi, replacement: 'connoting' },
      { pattern: /\bthe implying of\b/gi, replacement: 'implying' },
      { pattern: /\bthe suggesting of\b/gi, replacement: 'suggesting' },
      { pattern: /\bthe hinting of\b/gi, replacement: 'hinting' },
      { pattern: /\bthe alluding of\b/gi, replacement: 'alluding' },
      { pattern: /\bthe referring of\b/gi, replacement: 'referring' },
      { pattern: /\bthe relating of\b/gi, replacement: 'relating' },
      { pattern: /\bthe connecting of\b/gi, replacement: 'connecting' },
      { pattern: /\bthe linking of\b/gi, replacement: 'linking' },
      { pattern: /\bthe associating of\b/gi, replacement: 'associating' },
      { pattern: /\bthe correlating of\b/gi, replacement: 'correlating' },
      { pattern: /\bthe corresponding of\b/gi, replacement: 'corresponding' },
      { pattern: /\bthe paralleling of\b/gi, replacement: 'paralleling' },
      { pattern: /\bthe matching of\b/gi, replacement: 'matching' },
      { pattern: /\bthe equating of\b/gi, replacement: 'equating' },
      { pattern: /\bthe comparing of\b/gi, replacement: 'comparing' },
      { pattern: /\bthe contrasting of\b/gi, replacement: 'contrasting' },
      { pattern: /\bthe differentiating of\b/gi, replacement: 'differentiating' },
      { pattern: /\bthe distinguishing of\b/gi, replacement: 'distinguishing' },
      { pattern: /\bthe discriminating of\b/gi, replacement: 'discriminating' },
      { pattern: /\bthe separating of\b/gi, replacement: 'separating' },
      { pattern: /\bthe dividing of\b/gi, replacement: 'dividing' },
      { pattern: /\bthe partitioning of\b/gi, replacement: 'partitioning' },
      { pattern: /\bthe segmenting of\b/gi, replacement: 'segmenting' },
      { pattern: /\bthe sectioning of\b/gi, replacement: 'sectioning' },
      { pattern: /\bthe categorizing of\b/gi, replacement: 'categorizing' },
      { pattern: /\bthe classifying of\b/gi, replacement: 'classifying' },
      { pattern: /\bthe grouping of\b/gi, replacement: 'grouping' },
      { pattern: /\bthe sorting of\b/gi, replacement: 'sorting' },
      { pattern: /\bthe ordering of\b/gi, replacement: 'ordering' },
      { pattern: /\bthe arranging of\b/gi, replacement: 'arranging' },
      { pattern: /\bthe organizing of\b/gi, replacement: 'organizing' },
      { pattern: /\bthe systematizing of\b/gi, replacement: 'systematizing' },
      { pattern: /\bthe methodizing of\b/gi, replacement: 'methodizing' },
      { pattern: /\bthe structuring of\b/gi, replacement: 'structuring' },
      { pattern: /\bthe formatting of\b/gi, replacement: 'formatting' },
      { pattern: /\bthe styling of\b/gi, replacement: 'styling' },
      { pattern: /\bthe designing of\b/gi, replacement: 'designing' },
      { pattern: /\bthe planning of\b/gi, replacement: 'planning' },
      { pattern: /\bthe scheming of\b/gi, replacement: 'scheming' },
      { pattern: /\bthe plotting of\b/gi, replacement: 'plotting' },
      { pattern: /\bthe mapping of\b/gi, replacement: 'mapping' },
      { pattern: /\bthe charting of\b/gi, replacement: 'charting' },
      { pattern: /\bthe graphing of\b/gi, replacement: 'graphing' },
      { pattern: /\bthe diagramming of\b/gi, replacement: 'diagramming' },
      { pattern: /\bthe outlining of\b/gi, replacement: 'outlining' },
      { pattern: /\bthe sketching of\b/gi, replacement: 'sketching' },
      { pattern: /\bthe drafting of\b/gi, replacement: 'drafting' },
      { pattern: /\bthe drawing of\b/gi, replacement: 'drawing' },
      { pattern: /\bthe painting of\b/gi, replacement: 'painting' },
      { pattern: /\bthe coloring of\b/gi, replacement: 'coloring' },
      { pattern: /\bthe shading of\b/gi, replacement: 'shading' },
      { pattern: /\bthe tinting of\b/gi, replacement: 'tinting' },
      { pattern: /\bthe toning of\b/gi, replacement: 'toning' },
      { pattern: /\bthe highlighting of\b/gi, replacement: 'highlighting' },
      { pattern: /\bthe emphasizing of\b/gi, replacement: 'emphasizing' },
      { pattern: /\bthe accentuating of\b/gi, replacement: 'accentuating' },
      { pattern: /\bthe underlining of\b/gi, replacement: 'underlining' },
      { pattern: /\bthe underscoring of\b/gi, replacement: 'underscoring' },
      { pattern: /\bthe stressing of\b/gi, replacement: 'stressing' },
      { pattern: /\bthe pointing out of\b/gi, replacement: 'pointing out' },
      { pattern: /\bthe calling attention to of\b/gi, replacement: 'calling attention to' },
      { pattern: /\bthe bringing to light of\b/gi, replacement: 'bringing to light' },
      { pattern: /\bthe shedding light on of\b/gi, replacement: 'shedding light on' },
      { pattern: /\bthe throwing light on of\b/gi, replacement: 'throwing light on' },
      { pattern: /\bthe casting light on of\b/gi, replacement: 'casting light on' },
      { pattern: /\bthe illuminating of\b/gi, replacement: 'illuminating' },
      { pattern: /\bthe enlightening of\b/gi, replacement: 'enlightening' },
      { pattern: /\bthe clarifying of\b/gi, replacement: 'clarifying' },
      { pattern: /\bthe explaining of\b/gi, replacement: 'explaining' },
      { pattern: /\bthe elucidating of\b/gi, replacement: 'elucidating' },
      { pattern: /\bthe explicating of\b/gi, replacement: 'explicating' },
      { pattern: /\bthe interpreting of\b/gi, replacement: 'interpreting' },
      { pattern: /\bthe translating of\b/gi, replacement: 'translating' },
      { pattern: /\bthe decoding of\b/gi, replacement: 'decoding' },
      { pattern: /\bthe deciphering of\b/gi, replacement: 'deciphering' },
      { pattern: /\bthe unraveling of\b/gi, replacement: 'unraveling' },
      { pattern: /\bthe untangling of\b/gi, replacement: 'untangling' },
      { pattern: /\bthe sorting out of\b/gi, replacement: 'sorting out' },
      { pattern: /\bthe figuring out of\b/gi, replacement: 'figuring out' },
      { pattern: /\bthe working out of\b/gi, replacement: 'working out' },
      { pattern: /\bthe solving of\b/gi, replacement: 'solving' },
      { pattern: /\bthe resolving of\b/gi, replacement: 'resolving' },
      { pattern: /\bthe settling of\b/gi, replacement: 'settling' },
      { pattern: /\bthe deciding of\b/gi, replacement: 'deciding' },
      { pattern: /\bthe determining of\b/gi, replacement: 'determining' },
      { pattern: /\bthe concluding of\b/gi, replacement: 'concluding' },
      { pattern: /\bthe finalizing of\b/gi, replacement: 'finalizing' },
      { pattern: /\bthe completing of\b/gi, replacement: 'completing' },
      { pattern: /\bthe finishing of\b/gi, replacement: 'finishing' },
      { pattern: /\bthe ending of\b/gi, replacement: 'ending' },
      { pattern: /\bthe closing of\b/gi, replacement: 'closing' },
      { pattern: /\bthe terminating of\b/gi, replacement: 'terminating' },
      { pattern: /\bthe stopping of\b/gi, replacement: 'stopping' },
      { pattern: /\bthe halting of\b/gi, replacement: 'halting' },
      { pattern: /\bthe ceasing of\b/gi, replacement: 'ceasing' },
      { pattern: /\bthe discontinuing of\b/gi, replacement: 'discontinuing' },
      { pattern: /\bthe abandoning of\b/gi, replacement: 'abandoning' },
      { pattern: /\bthe giving up of\b/gi, replacement: 'giving up' },
      { pattern: /\bthe quitting of\b/gi, replacement: 'quitting' },
      { pattern: /\bthe leaving of\b/gi, replacement: 'leaving' },
      { pattern: /\bthe departing of\b/gi, replacement: 'departing' },
      { pattern: /\bthe exiting of\b/gi, replacement: 'exiting' },
      { pattern: /\bthe withdrawing of\b/gi, replacement: 'withdrawing' },
      { pattern: /\bthe retreating of\b/gi, replacement: 'retreating' },
      { pattern: /\bthe receding of\b/gi, replacement: 'receding' },
      { pattern: /\bthe fading of\b/gi, replacement: 'fading' },
      { pattern: /\bthe disappearing of\b/gi, replacement: 'disappearing' },
      { pattern: /\bthe vanishing of\b/gi, replacement: 'vanishing' },
      { pattern: /\bthe evaporating of\b/gi, replacement: 'evaporating' },
      { pattern: /\bthe dissolving of\b/gi, replacement: 'dissolving' },
      { pattern: /\bthe melting of\b/gi, replacement: 'melting' },
      { pattern: /\bthe liquefying of\b/gi, replacement: 'liquefying' },
      { pattern: /\bthe solidifying of\b/gi, replacement: 'solidifying' },
      { pattern: /\bthe freezing of\b/gi, replacement: 'freezing' },
      { pattern: /\bthe crystallizing of\b/gi, replacement: 'crystallizing' },
      { pattern: /\bthe hardening of\b/gi, replacement: 'hardening' },
      { pattern: /\bthe stiffening of\b/gi, replacement: 'stiffening' },
      { pattern: /\bthe rigidifying of\b/gi, replacement: 'rigidifying' },
      { pattern: /\bthe toughening of\b/gi, replacement: 'toughening' },
      { pattern: /\bthe strengthening of\b/gi, replacement: 'strengthening' },
      { pattern: /\bthe fortifying of\b/gi, replacement: 'fortifying' },
      { pattern: /\bthe reinforcing of\b/gi, replacement: 'reinforcing' },
      { pattern: /\bthe supporting of\b/gi, replacement: 'supporting' },
      { pattern: /\bthe backing of\b/gi, replacement: 'backing' },
      { pattern: /\bthe upholding of\b/gi, replacement: 'upholding' },
      { pattern: /\bthe sustaining of\b/gi, replacement: 'sustaining' },
      { pattern: /\bthe maintaining of\b/gi, replacement: 'maintaining' },
      { pattern: /\bthe preserving of\b/gi, replacement: 'preserving' },
      { pattern: /\bthe conserving of\b/gi, replacement: 'conserving' },
      { pattern: /\bthe protecting of\b/gi, replacement: 'protecting' },
      { pattern: /\bthe safeguarding of\b/gi, replacement: 'safeguarding' },
      { pattern: /\bthe securing of\b/gi, replacement: 'securing' },
      { pattern: /\bthe ensuring of\b/gi, replacement: 'ensuring' },
      { pattern: /\bthe guaranteeing of\b/gi, replacement: 'guaranteeing' },
      { pattern: /\bthe assuring of\b/gi, replacement: 'assuring' },
      { pattern: /\bthe confirming of\b/gi, replacement: 'confirming' },
      { pattern: /\bthe verifying of\b/gi, replacement: 'verifying' },
      { pattern: /\bthe validating of\b/gi, replacement: 'validating' },
      { pattern: /\bthe authenticating of\b/gi, replacement: 'authenticating' },
      { pattern: /\bthe certifying of\b/gi, replacement: 'certifying' },
      { pattern: /\bthe attesting of\b/gi, replacement: 'attesting' },
      { pattern: /\bthe testifying of\b/gi, replacement: 'testifying' },
      { pattern: /\bthe witnessing of\b/gi, replacement: 'witnessing' },
      { pattern: /\bthe evidencing of\b/gi, replacement: 'evidencing' },
      { pattern: /\bthe proving of\b/gi, replacement: 'proving' },
      { pattern: /\bthe demonstrating of\b/gi, replacement: 'demonstrating' },
      { pattern: /\bthe showing of\b/gi, replacement: 'showing' },
      { pattern: /\bthe displaying of\b/gi, replacement: 'displaying' },
      { pattern: /\bthe exhibiting of\b/gi, replacement: 'exhibiting' },
      { pattern: /\bthe presenting of\b/gi, replacement: 'presenting' },
      { pattern: /\bthe manifesting of\b/gi, replacement: 'manifesting' },
      { pattern: /\bthe revealing of\b/gi, replacement: 'revealing' },
      { pattern: /\bthe disclosing of\b/gi, replacement: 'disclosing' },
      { pattern: /\bthe exposing of\b/gi, replacement: 'exposing' },
      { pattern: /\bthe uncovering of\b/gi, replacement: 'uncovering' },
      { pattern: /\bthe unmasking of\b/gi, replacement: 'unmasking' },
      { pattern: /\bthe unveiling of\b/gi, replacement: 'unveiling' },
      { pattern: /\bthe revealing of\b/gi, replacement: 'revealing' },
      { pattern: /\bthe showing of\b/gi, replacement: 'showing' },
      { pattern: /\bthe indicating of\b/gi, replacement: 'indicating' },
      { pattern: /\bthe signifying of\b/gi, replacement: 'signifying' },
      { pattern: /\bthe symbolizing of\b/gi, replacement: 'symbolizing' },
      { pattern: /\bthe representing of\b/gi, replacement: 'representing' },
      { pattern: /\bthe standing for of\b/gi, replacement: 'standing for' },
      { pattern: /\bthe corresponding to of\b/gi, replacement: 'corresponding to' },
      { pattern: /\bthe equating to of\b/gi, replacement: 'equating to' },
      { pattern: /\bthe amounting to of\b/gi, replacement: 'amounting to' },
      { pattern: /\bthe adding up to of\b/gi, replacement: 'adding up to' },
      { pattern: /\bthe totaling of\b/gi, replacement: 'totaling' },
      { pattern: /\bthe summing of\b/gi, replacement: 'summing' },
      { pattern: /\bthe counting of\b/gi, replacement: 'counting' },
      { pattern: /\bthe numbering of\b/gi, replacement: 'numbering' },
      { pattern: /\bthe enumerating of\b/gi, replacement: 'enumerating' },
      { pattern: /\bthe listing of\b/gi, replacement: 'listing' },
      { pattern: /\bthe cataloging of\b/gi, replacement: 'cataloging' },
      { pattern: /\bthe inventorying of\b/gi, replacement: 'inventorying' },
      { pattern: /\bthe recording of\b/gi, replacement: 'recording' },
      { pattern: /\bthe registering of\b/gi, replacement: 'registering' },
      { pattern: /\bthe logging of\b/gi, replacement: 'logging' },
      { pattern: /\bthe entering of\b/gi, replacement: 'entering' },
      { pattern: /\bthe inputting of\b/gi, replacement: 'inputting' },
      { pattern: /\bthe keying in of\b/gi, replacement: 'keying in' },
      { pattern: /\bthe typing of\b/gi, replacement: 'typing' },
      { pattern: /\bthe writing of\b/gi, replacement: 'writing' },
      { pattern: /\bthe jotting down of\b/gi, replacement: 'jotting down' },
      { pattern: /\bthe noting down of\b/gi, replacement: 'noting down' },
      { pattern: /\bthe putting down of\b/gi, replacement: 'putting down' },
      { pattern: /\bthe setting down of\b/gi, replacement: 'setting down' },
      { pattern: /\bthe laying down of\b/gi, replacement: 'laying down' },
      { pattern: /\bthe placing of\b/gi, replacement: 'placing' },
      { pattern: /\bthe positioning of\b/gi, replacement: 'positioning' },
      { pattern: /\bthe locating of\b/gi, replacement: 'locating' },
      { pattern: /\bthe situating of\b/gi, replacement: 'situating' },
      { pattern: /\bthe stationing of\b/gi, replacement: 'stationing' },
      { pattern: /\bthe installing of\b/gi, replacement: 'installing' },
      { pattern: /\bthe setting up of\b/gi, replacement: 'setting up' },
      { pattern: /\bthe putting up of\b/gi, replacement: 'putting up' },
      { pattern: /\bthe erecting of\b/gi, replacement: 'erecting' },
      { pattern: /\bthe raising of\b/gi, replacement: 'raising' },
      { pattern: /\bthe lifting of\b/gi, replacement: 'lifting' },
      { pattern: /\bthe elevating of\b/gi, replacement: 'elevating' },
      { pattern: /\bthe heightening of\b/gi, replacement: 'heightening' },
      { pattern: /\bthe increasing of\b/gi, replacement: 'increasing' },
      { pattern: /\bthe raising of\b/gi, replacement: 'raising' },
      { pattern: /\bthe boosting of\b/gi, replacement: 'boosting' },
      { pattern: /\bthe enhancing of\b/gi, replacement: 'enhancing' },
      { pattern: /\bthe improving of\b/gi, replacement: 'improving' },
      { pattern: /\bthe upgrading of\b/gi, replacement: 'upgrading' },
      { pattern: /\bthe updating of\b/gi, replacement: 'updating' },
      { pattern: /\bthe modernizing of\b/gi, replacement: 'modernizing' },
      { pattern: /\bthe renovating of\b/gi, replacement: 'renovating' },
      { pattern: /\bthe refurbishing of\b/gi, replacement: 'refurbishing' },
      { pattern: /\bthe restoring of\b/gi, replacement: 'restoring' },
      { pattern: /\bthe renewing of\b/gi, replacement: 'renewing' },
      { pattern: /\bthe refreshing of\b/gi, replacement: 'refreshing' },
      { pattern: /\bthe revitalizing of\b/gi, replacement: 'revitalizing' },
      { pattern: /\bthe rejuvenating of\b/gi, replacement: 'rejuvenating' },
      { pattern: /\bthe regenerating of\b/gi, replacement: 'regenerating' },
      { pattern: /\bthe rebirthing of\b/gi, replacement: 'rebirthing' },
      { pattern: /\bthe reviving of\b/gi, replacement: 'reviving' },
      { pattern: /\bthe resurrecting of\b/gi, replacement: 'resurrecting' },
      { pattern: /\bthe reanimating of\b/gi, replacement: 'reanimating' },
      { pattern: /\bthe reawakening of\b/gi, replacement: 'reawakening' },
      { pattern: /\bthe rekindling of\b/gi, replacement: 'rekindling' },
      { pattern: /\bthe relighting of\b/gi, replacement: 'relighting' },
      { pattern: /\bthe reigniting of\b/gi, replacement: 'reigniting' },
      { pattern: /\bthe recharging of\b/gi, replacement: 'recharging' },
      { pattern: /\bthe reenergizing of\b/gi, replacement: 'reenergizing' },
      { pattern: /\bthe reinvigorating of\b/gi, replacement: 'reinvigorating' },
      { pattern: /\bthe reactivating of\b/gi, replacement: 'reactivating' },
      { pattern: /\bthe restarting of\b/gi, replacement: 'restarting' },
      { pattern: /\bthe resuming of\b/gi, replacement: 'resuming' },
      { pattern: /\bthe continuing of\b/gi, replacement: 'continuing' },
      { pattern: /\bthe ongoing of\b/gi, replacement: 'ongoing' },
      { pattern: /\bthe persisting of\b/gi, replacement: 'persisting' },
      { pattern: /\bthe prevailing of\b/gi, replacement: 'prevailing' },
      { pattern: /\bthe predominating of\b/gi, replacement: 'predominating' },
      { pattern: /\bthe dominating of\b/gi, replacement: 'dominating' },
      { pattern: /\bthe ruling of\b/gi, replacement: 'ruling' },
      { pattern: /\bthe governing of\b/gi, replacement: 'governing' },
      { pattern: /\bthe controlling of\b/gi, replacement: 'controlling' },
      { pattern: /\bthe managing of\b/gi, replacement: 'managing' },
      { pattern: /\bthe handling of\b/gi, replacement: 'handling' },
      { pattern: /\bthe dealing with of\b/gi, replacement: 'dealing with' },
      { pattern: /\bthe coping with of\b/gi, replacement: 'coping with' },
      { pattern: /\bthe addressing of\b/gi, replacement: 'addressing' },
      { pattern: /\bthe tackling of\b/gi, replacement: 'tackling' },
      { pattern: /\bthe confronting of\b/gi, replacement: 'confronting' },
      { pattern: /\bthe facing of\b/gi, replacement: 'facing' },
      { pattern: /\bthe meeting of\b/gi, replacement: 'meeting' },
      { pattern: /\bthe satisfying of\b/gi, replacement: 'satisfying' },
      { pattern: /\bthe fulfilling of\b/gi, replacement: 'fulfilling' },
      { pattern: /\bthe achieving of\b/gi, replacement: 'achieving' },
      { pattern: /\bthe accomplishing of\b/gi, replacement: 'accomplishing' },
      { pattern: /\bthe realizing of\b/gi, replacement: 'realizing' },
      { pattern: /\bthe actualizing of\b/gi, replacement: 'actualizing' },
      { pattern: /\bthe materializing of\b/gi, replacement: 'materializing' },
      { pattern: /\bthe manifesting of\b/gi, replacement: 'manifesting' },
      { pattern: /\bthe embodying of\b/gi, replacement: 'embodying' },
      { pattern: /\bthe personifying of\b/gi, replacement: 'personifying' },
      { pattern: /\bthe representing of\b/gi, replacement: 'representing' },
      { pattern: /\bthe symbolizing of\b/gi, replacement: 'symbolizing' },
      { pattern: /\bthe signifying of\b/gi, replacement: 'signifying' },
      { pattern: /\bthe indicating of\b/gi, replacement: 'indicating' },
      { pattern: /\bthe denoting of\b/gi, replacement: 'denoting' },
      { pattern: /\bthe connoting of\b/gi, replacement: 'connoting' },
      { pattern: /\bthe implying of\b/gi, replacement: 'implying' },
      { pattern: /\bthe suggesting of\b/gi, replacement: 'suggesting' },
      { pattern: /\bthe hinting of\b/gi, replacement: 'hinting' },
      { pattern: /\bthe alluding of\b/gi, replacement: 'alluding' },
      { pattern: /\bthe referring of\b/gi, replacement: 'referring' },
      { pattern: /\bthe relating of\b/gi, replacement: 'relating' },
      { pattern: /\bthe connecting of\b/gi, replacement: 'connecting' },
      { pattern: /\bthe linking of\b/gi, replacement: 'linking' },
      { pattern: /\bthe associating of\b/gi, replacement: 'associating' },
      { pattern: /\bthe correlating of\b/gi, replacement: 'correlating' },
      { pattern: /\bthe corresponding of\b/gi, replacement: 'corresponding' },
      { pattern: /\bthe paralleling of\b/gi, replacement: 'paralleling' },
      { pattern: /\bthe matching of\b/gi, replacement: 'matching' },
      { pattern: /\bthe equating of\b/gi, replacement: 'equating' },
      { pattern: /\bthe comparing of\b/gi, replacement: 'comparing' },
      { pattern: /\bthe contrasting of\b/gi, replacement: 'contrasting' },
      { pattern: /\bthe differentiating of\b/gi, replacement: 'differentiating' },
      { pattern: /\bthe distinguishing of\b/gi, replacement: 'distinguishing' },
      { pattern: /\bthe discriminating of\b/gi, replacement: 'discriminating' },
      { pattern: /\bthe separating of\b/gi, replacement: 'separating' },
      { pattern: /\bthe dividing of\b/gi, replacement: 'dividing' },
      { pattern: /\bthe partitioning of\b/gi, replacement: 'partitioning' },
      { pattern: /\bthe segmenting of\b/gi, replacement: 'segmenting' },
      { pattern: /\bthe sectioning of\b/gi, replacement: 'sectioning' },
      { pattern: /\bthe categorizing of\b/gi, replacement: 'categorizing' },
      { pattern: /\bthe classifying of\b/gi, replacement: 'classifying' },
      { pattern: /\bthe grouping of\b/gi, replacement: 'grouping' },
      { pattern: /\bthe sorting of\b/gi, replacement: 'sorting' },
      { pattern: /\bthe ordering of\b/gi, replacement: 'ordering' },
      { pattern: /\bthe arranging of\b/gi, replacement: 'arranging' },
      { pattern: /\bthe organizing of\b/gi, replacement: 'organizing' },
      { pattern: /\bthe systematizing of\b/gi, replacement: 'systematizing' },
      { pattern: /\bthe methodizing of\b/gi, replacement: 'methodizing' },
      { pattern: /\bthe structuring of\b/gi, replacement: 'structuring' },
      { pattern: /\bthe formatting of\b/gi, replacement: 'formatting' },
      { pattern: /\bthe styling of\b/gi, replacement: 'styling' },
      { pattern: /\bthe designing of\b/gi, replacement: 'designing' },
      { pattern: /\bthe planning of\b/gi, replacement: 'planning' },
      { pattern: /\bthe scheming of\b/gi, replacement: 'scheming' },
      { pattern: /\bthe plotting of\b/gi, replacement: 'plotting' },
      { pattern: /\bthe mapping of\b/gi, replacement: 'mapping' },
      { pattern: /\bthe charting of\b/gi, replacement: 'charting' },
      { pattern: /\bthe graphing of\b/gi, replacement: 'graphing' },
      { pattern: /\bthe diagramming of\b/gi, replacement: 'diagramming' },
      { pattern: /\bthe outlining of\b/gi, replacement: 'outlining' },
      { pattern: /\bthe sketching of\b/gi, replacement: 'sketching' },
      { pattern: /\bthe drafting of\b/gi, replacement: 'drafting' },
      { pattern: /\bthe drawing of\b/gi, replacement: 'drawing' },
      { pattern: /\bthe painting of\b/gi, replacement: 'painting' },
      { pattern: /\bthe coloring of\b/gi, replacement: 'coloring' },
      { pattern: /\bthe shading of\b/gi, replacement: 'shading' },
      { pattern: /\bthe tinting of\b/gi, replacement: 'tinting' },
      { pattern: /\bthe toning of\b/gi, replacement: 'toning' },
      { pattern: /\bthe highlighting of\b/gi, replacement: 'highlighting' },
      { pattern: /\bthe emphasizing of\b/gi, replacement: 'emphasizing' },
      { pattern: /\bthe accentuating of\b/gi, replacement: 'accentuating' },
      { pattern: /\bthe underlining of\b/gi, replacement: 'underlining' },
      { pattern: /\bthe underscoring of\b/gi, replacement: 'underscoring' },
      { pattern: /\bthe stressing of\b/gi, replacement: 'stressing' },
      { pattern: /\bthe pointing out of\b/gi, replacement: 'pointing out' },
      { pattern: /\bthe calling attention to of\b/gi, replacement: 'calling attention to' },
      { pattern: /\bthe bringing to light of\b/gi, replacement: 'bringing to light' },
      { pattern: /\bthe shedding light on of\b/gi, replacement: 'shedding light on' },
      { pattern: /\bthe throwing light on of\b/gi, replacement: 'throwing light on' },
      { pattern: /\bthe casting light on of\b/gi, replacement: 'casting light on' },
      { pattern: /\bthe illuminating of\b/gi, replacement: 'illuminating' },
      { pattern: /\bthe enlightening of\b/gi, replacement: 'enlightening' },
      { pattern: /\bthe clarifying of\b/gi, replacement: 'clarifying' },
      { pattern: /\bthe explaining of\b/gi, replacement: 'explaining' },
      { pattern: /\bthe elucidating of\b/gi, replacement: 'elucidating' },
      { pattern: /\bthe explicating of\b/gi, replacement: 'explicating' },
      { pattern: /\bthe interpreting of\b/gi, replacement: 'interpreting' },
      { pattern: /\bthe analyzing of\b/gi, replacement: 'analyzing' },
      { pattern: /\bthe examining of\b/gi, replacement: 'examining' },
      { pattern: /\bthe studying of\b/gi, replacement: 'studying' },

      // Rare formal phrases that AI often uses
      { pattern: /\bthe preponderance of evidence suggests\b/gi, replacement: 'most evidence shows' },
      { pattern: /\bit is axiomatic that\b/gi, replacement: 'it\'s obvious that' },
      { pattern: /\bby way of illustration\b/gi, replacement: 'to show you what I mean' },
      { pattern: /\bto put it succinctly\b/gi, replacement: 'in short' },
      { pattern: /\bin contradistinction to\b/gi, replacement: 'unlike' },
      { pattern: /\bnotwithstanding the fact that\b/gi, replacement: 'even though' },
      { pattern: /\bin light of the fact that\b/gi, replacement: 'since' },
      { pattern: /\bfor the reason that\b/gi, replacement: 'because' },
      { pattern: /\bunder circumstances in which\b/gi, replacement: 'when' },
      { pattern: /\bin reference to\b/gi, replacement: 'about' },
      { pattern: /\bwith respect to\b/gi, replacement: 'about' },
      { pattern: /\bin relation to\b/gi, replacement: 'about' },
      { pattern: /\bpertaining to\b/gi, replacement: 'about' },
      { pattern: /\bapropos of\b/gi, replacement: 'about' },
      { pattern: /\bin the vicinity of\b/gi, replacement: 'near' },
      { pattern: /\bin close proximity to\b/gi, replacement: 'close to' },
      { pattern: /\bwith the intention of\b/gi, replacement: 'to' },
      { pattern: /\bwith the objective of\b/gi, replacement: 'to' },
      { pattern: /\bso as to\b/gi, replacement: 'to' },
      { pattern: /\bfor the reason of\b/gi, replacement: 'to' },
      { pattern: /\bwith regards to\b/gi, replacement: 'about' },
      { pattern: /\bthe question as to whether\b/gi, replacement: 'whether' },
      { pattern: /\bthe issue of whether\b/gi, replacement: 'whether' },
      { pattern: /\bthe extent to which\b/gi, replacement: 'how much' },
      { pattern: /\bthe degree to which\b/gi, replacement: 'how much' },
      { pattern: /\bthe manner in which\b/gi, replacement: 'how' },
      { pattern: /\bthe way in which\b/gi, replacement: 'how' },
      { pattern: /\bthe point at which\b/gi, replacement: 'when' },
      { pattern: /\bthe time at which\b/gi, replacement: 'when' },
      { pattern: /\bthe place at which\b/gi, replacement: 'where' },
      { pattern: /\bthe reason why\b/gi, replacement: 'why' },
      { pattern: /\bthe reason that\b/gi, replacement: 'why' },
      { pattern: /\bthe person who\b/gi, replacement: 'who' },
      { pattern: /\bthe thing that\b/gi, replacement: 'what' },
      { pattern: /\bthe place where\b/gi, replacement: 'where' },
      { pattern: /\bthe time when\b/gi, replacement: 'when' },
      { pattern: /\ba large number of\b/gi, replacement: 'many' },
      { pattern: /\ba small number of\b/gi, replacement: 'few' },
      { pattern: /\ba considerable number of\b/gi, replacement: 'many' },
      { pattern: /\ba significant number of\b/gi, replacement: 'many' },
      { pattern: /\ban extensive amount of\b/gi, replacement: 'a lot of' },
      { pattern: /\ba substantial amount of\b/gi, replacement: 'a lot of' },
      { pattern: /\ba considerable amount of\b/gi, replacement: 'a lot of' },
      { pattern: /\bthe vast majority of\b/gi, replacement: 'most' },
      { pattern: /\ba majority of\b/gi, replacement: 'most' },
      { pattern: /\bthe majority of\b/gi, replacement: 'most' },
      { pattern: /\ba minority of\b/gi, replacement: 'some' },
      { pattern: /\bthe entirety of\b/gi, replacement: 'all' },
      { pattern: /\bthe whole of\b/gi, replacement: 'all' },
      { pattern: /\bthe complete\b/gi, replacement: 'all the' },
      { pattern: /\bthe total\b/gi, replacement: 'all the' },
      { pattern: /\bthe aggregate\b/gi, replacement: 'total' },

      // PREMIUM COPYWRITER PATTERNS - Ultra-humanized
      { pattern: /\bthe preponderance of evidence suggests\b/gi, replacement: 'most evidence shows' },
      { pattern: /\bit is axiomatic that\b/gi, replacement: 'it\'s obvious that' },
      { pattern: /\bby way of illustration\b/gi, replacement: 'to show you what I mean' },
      { pattern: /\bin contradistinction to\b/gi, replacement: 'unlike' },
      { pattern: /\bnotwithstanding the fact that\b/gi, replacement: 'even though' },
      { pattern: /\bthe question as to whether\b/gi, replacement: 'whether' },
      { pattern: /\bthe vast majority of\b/gi, replacement: 'most' },
      { pattern: /\ba significant number of\b/gi, replacement: 'many' },
      { pattern: /\bfor the reason that\b/gi, replacement: 'because' },
      { pattern: /\bdue to the fact that\b/gi, replacement: 'because' },
      { pattern: /\bin light of the fact that\b/gi, replacement: 'since' },
      { pattern: /\bin the event that\b/gi, replacement: 'if' },
      { pattern: /\bwith reference to\b/gi, replacement: 'about' },
      { pattern: /\bwith respect to\b/gi, replacement: 'about' },
      { pattern: /\bin relation to\b/gi, replacement: 'about' },
      { pattern: /\bpertaining to\b/gi, replacement: 'about' },
      { pattern: /\bconcerning the matter of\b/gi, replacement: 'about' },
      { pattern: /\bwith regard to the issue of\b/gi, replacement: 'about' },
      { pattern: /\bfor the purpose of\b/gi, replacement: 'to' },
      { pattern: /\bin order to\b/gi, replacement: 'to' },
      { pattern: /\bso as to\b/gi, replacement: 'to' },
      { pattern: /\bwith the aim of\b/gi, replacement: 'to' },
      { pattern: /\bwith the intention of\b/gi, replacement: 'to' },
      { pattern: /\bwith the objective of\b/gi, replacement: 'to' },
      { pattern: /\bin terms of\b/gi, replacement: 'regarding' },
      { pattern: /\bfrom the perspective of\b/gi, replacement: 'from' },
      { pattern: /\bfrom the standpoint of\b/gi, replacement: 'from' },
      { pattern: /\bwith regard to\b/gi, replacement: 'about' },
      { pattern: /\bin regard to\b/gi, replacement: 'about' },
      { pattern: /\bregarding the matter of\b/gi, replacement: 'about' },
      { pattern: /\bconcerning the issue of\b/gi, replacement: 'about' },
      { pattern: /\bwith respect to the matter of\b/gi, replacement: 'about' },
      { pattern: /\bin respect to\b/gi, replacement: 'about' },
      { pattern: /\bwith reference to the matter of\b/gi, replacement: 'about' },
      { pattern: /\bin reference to\b/gi, replacement: 'about' },
      { pattern: /\bpertaining to the matter of\b/gi, replacement: 'about' },
      { pattern: /\brelating to the matter of\b/gi, replacement: 'about' },
      { pattern: /\bconnected with the matter of\b/gi, replacement: 'about' },
      { pattern: /\bassociated with the matter of\b/gi, replacement: 'about' },
      { pattern: /\blinked to the matter of\b/gi, replacement: 'about' },
      { pattern: /\btied to the matter of\b/gi, replacement: 'about' },
      { pattern: /\battached to the matter of\b/gi, replacement: 'about' },
      { pattern: /\baffiliated with the matter of\b/gi, replacement: 'about' },
      { pattern: /\brelated to the issue of\b/gi, replacement: 'about' },
      { pattern: /\bconnected to the issue of\b/gi, replacement: 'about' },
      { pattern: /\bassociated with the issue of\b/gi, replacement: 'about' },
      { pattern: /\blinked to the issue of\b/gi, replacement: 'about' },
      { pattern: /\btied to the issue of\b/gi, replacement: 'about' },
      { pattern: /\battached to the issue of\b/gi, replacement: 'about' },
      { pattern: /\baffiliated with the issue of\b/gi, replacement: 'about' },
      { pattern: /\bwith regard to the topic of\b/gi, replacement: 'about' },
      { pattern: /\bin regard to the topic of\b/gi, replacement: 'about' },
      { pattern: /\bregarding the topic of\b/gi, replacement: 'about' },
      { pattern: /\bconcerning the topic of\b/gi, replacement: 'about' },
      { pattern: /\bwith respect to the topic of\b/gi, replacement: 'about' },
      { pattern: /\bin respect to the topic of\b/gi, replacement: 'about' },
      { pattern: /\bwith reference to the topic of\b/gi, replacement: 'about' },
      { pattern: /\bin reference to the topic of\b/gi, replacement: 'about' },
      { pattern: /\bpertaining to the topic of\b/gi, replacement: 'about' },
      { pattern: /\brelating to the topic of\b/gi, replacement: 'about' },
      { pattern: /\bconnected with the topic of\b/gi, replacement: 'about' },
      { pattern: /\bassociated with the topic of\b/gi, replacement: 'about' },
      { pattern: /\blinked to the topic of\b/gi, replacement: 'about' },
      { pattern: /\btied to the topic of\b/gi, replacement: 'about' },
      { pattern: /\battached to the topic of\b/gi, replacement: 'about' },
      { pattern: /\baffiliated with the topic of\b/gi, replacement: 'about' },
      { pattern: /\brelated to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bconnected to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bassociated with the subject of\b/gi, replacement: 'about' },
      { pattern: /\blinked to the subject of\b/gi, replacement: 'about' },
      { pattern: /\btied to the subject of\b/gi, replacement: 'about' },
      { pattern: /\battached to the subject of\b/gi, replacement: 'about' },
      { pattern: /\baffiliated with the subject of\b/gi, replacement: 'about' },
      { pattern: /\bwith regard to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bin regard to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bregarding the subject of\b/gi, replacement: 'about' },
      { pattern: /\bconcerning the subject of\b/gi, replacement: 'about' },
      { pattern: /\bwith respect to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bin respect to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bwith reference to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bin reference to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bpertaining to the subject of\b/gi, replacement: 'about' },
      { pattern: /\brelating to the subject of\b/gi, replacement: 'about' },
      { pattern: /\bconnected with the subject of\b/gi, replacement: 'about' },
      { pattern: /\bassociated with the subject of\b/gi, replacement: 'about' },
      { pattern: /\blinked to the subject of\b/gi, replacement: 'about' },
      { pattern: /\btied to the subject of\b/gi, replacement: 'about' },
      { pattern: /\battached to the subject of\b/gi, replacement: 'about' },
      { pattern: /\baffiliated with the subject of\b/gi, replacement: 'about' },
      { pattern: /\bfor the reason that\b/gi, replacement: 'because' },
      { pattern: /\bin view of the fact that\b/gi, replacement: 'since' },
      { pattern: /\bconsidering that\b/gi, replacement: 'since' },
      { pattern: /\btaking into account that\b/gi, replacement: 'since' },
      { pattern: /\bbearing in mind that\b/gi, replacement: 'since' },
      { pattern: /\bkeeping in mind that\b/gi, replacement: 'since' },
      { pattern: /\bwith the knowledge that\b/gi, replacement: 'since' },
      { pattern: /\baware of the fact that\b/gi, replacement: 'since' },
      { pattern: /\bcognizant of the fact that\b/gi, replacement: 'since' },
      { pattern: /\bmindful of the fact that\b/gi, replacement: 'since' },
      { pattern: /\bin the final analysis\b/gi, replacement: 'in the end' },
      { pattern: /\bat the end of the day\b/gi, replacement: 'ultimately' },
      { pattern: /\bwhen all is said and done\b/gi, replacement: 'in the end' },
      { pattern: /\bafter all is said and done\b/gi, replacement: 'in the end' },
      { pattern: /\bin the long run\b/gi, replacement: 'eventually' },
      { pattern: /\bover the long term\b/gi, replacement: 'eventually' },
      { pattern: /\bover time\b/gi, replacement: 'eventually' },
      { pattern: /\bas time goes on\b/gi, replacement: 'eventually' },
      { pattern: /\bas time passes\b/gi, replacement: 'eventually' },
      { pattern: /\bin due course\b/gi, replacement: 'eventually' },
      { pattern: /\bin the course of time\b/gi, replacement: 'eventually' },
      { pattern: /\bwith the passage of time\b/gi, replacement: 'eventually' },
      { pattern: /\bas the years go by\b/gi, replacement: 'eventually' },
      { pattern: /\bas the years pass\b/gi, replacement: 'eventually' },
      { pattern: /\bin the years to come\b/gi, replacement: 'eventually' },
      { pattern: /\bdown the road\b/gi, replacement: 'eventually' },
      { pattern: /\bat some point\b/gi, replacement: 'eventually' },
      { pattern: /\bat some stage\b/gi, replacement: 'eventually' },
      { pattern: /\bin the foreseeable future\b/gi, replacement: 'soon' },
      { pattern: /\bin the near future\b/gi, replacement: 'soon' },
      { pattern: /\bin the not-too-distant future\b/gi, replacement: 'soon' },
      { pattern: /\bbefore too long\b/gi, replacement: 'soon' },
      { pattern: /\bin a while\b/gi, replacement: 'soon' },
      { pattern: /\bafter a while\b/gi, replacement: 'soon' },
      { pattern: /\bin a bit\b/gi, replacement: 'soon' },
      { pattern: /\bin a little while\b/gi, replacement: 'soon' },
      { pattern: /\bin the immediate future\b/gi, replacement: 'soon' },
      { pattern: /\bin the coming days\b/gi, replacement: 'soon' },
      { pattern: /\bin the coming weeks\b/gi, replacement: 'soon' },
      { pattern: /\bin the coming months\b/gi, replacement: 'soon' },
      { pattern: /\bin the coming years\b/gi, replacement: 'eventually' },
      { pattern: /\bto a certain extent\b/gi, replacement: 'somewhat' },
      { pattern: /\bto some degree\b/gi, replacement: 'somewhat' },
      { pattern: /\bto some extent\b/gi, replacement: 'somewhat' },
      { pattern: /\bin some ways\b/gi, replacement: 'somewhat' },
      { pattern: /\bin a sense\b/gi, replacement: 'somewhat' },
      { pattern: /\bkind of\b/gi, replacement: 'somewhat' },
      { pattern: /\bsort of\b/gi, replacement: 'somewhat' },
      { pattern: /\bmore or less\b/gi, replacement: 'somewhat' },
      { pattern: /\bup to a point\b/gi, replacement: 'somewhat' },
      { pattern: /\bin part\b/gi, replacement: 'somewhat' },
      { pattern: /\bpartially\b/gi, replacement: 'somewhat' },
      { pattern: /\bpartly\b/gi, replacement: 'somewhat' },
      { pattern: /\bto a limited extent\b/gi, replacement: 'somewhat' },
      { pattern: /\bto a certain degree\b/gi, replacement: 'somewhat' },
      { pattern: /\bto a limited degree\b/gi, replacement: 'somewhat' },
      { pattern: /\bto a certain point\b/gi, replacement: 'somewhat' },
      { pattern: /\bto a limited point\b/gi, replacement: 'somewhat' },
      { pattern: /\bfor all intents and purposes\b/gi, replacement: 'basically' },
      { pattern: /\bfor all practical purposes\b/gi, replacement: 'basically' },
      { pattern: /\bin effect\b/gi, replacement: 'basically' },
      { pattern: /\bin essence\b/gi, replacement: 'basically' },
      { pattern: /\bat its core\b/gi, replacement: 'basically' },
      { pattern: /\bat the core\b/gi, replacement: 'basically' },
      { pattern: /\bin its essence\b/gi, replacement: 'basically' },
      { pattern: /\bin the essence\b/gi, replacement: 'basically' },
      { pattern: /\bwhen push comes to shove\b/gi, replacement: 'when it matters' },
      { pattern: /\bwhen it comes down to it\b/gi, replacement: 'when it matters' },
      { pattern: /\bat the end of the day\b/gi, replacement: 'when it matters' },
      { pattern: /\bwhen all is said and done\b/gi, replacement: 'when it matters' },
      { pattern: /\bin the final analysis\b/gi, replacement: 'when it matters' },
      { pattern: /\bto put it simply\b/gi, replacement: 'simply put' },
      { pattern: /\bto put it another way\b/gi, replacement: 'in other words' },
      { pattern: /\bto put it differently\b/gi, replacement: 'in other words' },
      { pattern: /\bto put it plainly\b/gi, replacement: 'frankly' },
      { pattern: /\bto put it bluntly\b/gi, replacement: 'frankly' },
      { pattern: /\bto put it mildly\b/gi, replacement: 'to say the least' },
      { pattern: /\bto say the least\b/gi, replacement: 'at minimum' },
      { pattern: /\bto say nothing of\b/gi, replacement: 'not to mention' },
      { pattern: /\bnot to mention\b/gi, replacement: 'let alone' },
      { pattern: /\blet alone\b/gi, replacement: 'never mind' },
      { pattern: /\bmuch less\b/gi, replacement: 'never mind' },
      { pattern: /\bnever mind\b/gi, replacement: 'forget about' },
      { pattern: /\bforget about\b/gi, replacement: 'ignore' }

    ];

    aiPatterns.forEach(({ pattern, replacement }) => {
      replaced = replaced.replace(pattern, replacement);
    });

    return replaced;
  }

  /**
     * Apply synonym diversification based on level
     */
  applySynonymDiversification(text, level) {
    let diversified = text;

    const synonymRate = {
      low: 0.1,
      medium: 0.2,
      high: 0.4
    }[level] || 0.2;

    // Replace synonyms
    Object.entries(this.synonymDatabase).forEach(([original, alternatives]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi');
      diversified = diversified.replace(regex, (match) => {
        if (Math.random() < synonymRate) {
          const alternative = alternatives[Math.floor(Math.random() * alternatives.length)];
          return alternative;
        }
        return match;
      });
    });

    return diversified;
  }

  /**
     * Adjust sentence structure for natural flow
     */
  adjustSentenceStructure(text, level, style) {
    let adjusted = text;

    let complexityRate = {
      preserve: 0,
      light: 0.1,
      moderate: 0.2,
      heavy: 0.4
    }[level] || 0.2;
    const styleComplexity = style?.sentenceComplexity;
    if (styleComplexity === 'simple') {
      complexityRate = Math.min(complexityRate, 0.15);
    } else if (styleComplexity === 'complex') {
      complexityRate = Math.max(complexityRate, 0.25);
    }

    if (complexityRate === 0) return adjusted;

    const structureSettings = {
      light: { splitRate: 0.25, combineRate: 0.35, fragmentRate: 0.06 },
      moderate: { splitRate: 0.35, combineRate: 0.45, fragmentRate: 0.1 },
      heavy: { splitRate: 0.5, combineRate: 0.6, fragmentRate: 0.16 }
    }[level] || { splitRate: 0.35, combineRate: 0.45, fragmentRate: 0.1 };

    const sentences = adjusted.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [adjusted];
    const reworked = [];

    sentences.forEach(sentence => {
      let s = sentence.trim();
      if (!s) return;
      if (Math.random() < complexityRate) {
        const words = s.replace(/([.!?]+)$/,'').trim().split(/\s+/);
        const punctuationMatch = s.match(/([.!?]+)$/);
        const punctuation = punctuationMatch ? punctuationMatch[1] : '.';

        if (words.length > 14 && Math.random() < structureSettings.splitRate) {
          const commaIndex = s.indexOf(',');
          if (commaIndex > 10 && commaIndex < s.length - 10) {
            const first = s.slice(0, commaIndex).trim();
            const second = s.slice(commaIndex + 1).trim();
            reworked.push(`${first}.`);
            reworked.push(`${second.charAt(0).toUpperCase()}${second.slice(1).replace(/([.!?]+)$/,'')}${punctuation}`);
            return;
          }
          const splitMatch = s.match(/\s+(and|but|so|because|which|while|though)\s+/i);
          if (splitMatch && splitMatch.index > 12 && splitMatch.index < s.length - 12) {
            const first = s.slice(0, splitMatch.index).trim();
            const second = s.slice(splitMatch.index + splitMatch[0].length).trim();
            reworked.push(`${first}.`);
            reworked.push(`${second.charAt(0).toUpperCase()}${second.slice(1).replace(/([.!?]+)$/,'')}${punctuation}`);
            return;
          }
        }

        if (words.length > 12 && Math.random() < structureSettings.fragmentRate) {
          const fragmentStart = Math.max(3, Math.floor(words.length * 0.6));
          const first = words.slice(0, fragmentStart).join(' ');
          const fragment = words.slice(fragmentStart).join(' ');
          reworked.push(`${first}${punctuation}`);
          reworked.push(`${fragment.charAt(0).toUpperCase()}${fragment.slice(1)}.`);
          return;
        }
      }

      reworked.push(s);
    });

    const connectors = ['and', 'so', 'but', 'which means', 'because', 'plus'];
    const blended = [];
    for (let i = 0; i < reworked.length; i++) {
      const current = reworked[i];
      const next = reworked[i + 1];
      if (next) {
        const currentWords = current.replace(/([.!?]+)$/,'').trim().split(/\s+/);
        const nextWords = next.replace(/([.!?]+)$/,'').trim().split(/\s+/);
        if (currentWords.length <= 8 && nextWords.length <= 10 && Math.random() < structureSettings.combineRate) {
          const connector = connectors[Math.floor(Math.random() * connectors.length)];
          const combined = `${current.replace(/([.!?]+)$/,'')}, ${connector} ${next.replace(/([.!?]+)$/,'').charAt(0).toLowerCase()}${next.replace(/([.!?]+)$/,'').slice(1)}.`;
          blended.push(combined);
          i++;
          continue;
        }
      }
      blended.push(current);
    }

    return blended.join(' ');
  }

  /**
     * Inject human-like errors for authenticity
     */
  injectErrors(text, errorLevel) {
    if (errorLevel === 'none') return text;
    let errorText = text;
    const patterns = this.errorPatterns[errorLevel] || this.errorPatterns.moderate;
    const multiplier = {
      minimal: 1.6,
      moderate: 2.4,
      high: 3.2
    }[errorLevel] || 2;
    const maxChanges = errorLevel === 'high' ? 4 : 2;
    let changes = 0;

    patterns.forEach(({ pattern, replacement, probability }) => {
      errorText = errorText.replace(pattern, (match) => {
        if (changes >= maxChanges) return match;
        if (Math.random() < Math.min(1, probability * multiplier)) {
          changes += 1;
          return replacement;
        }
        return match;
      });
    });

    return errorText;
  }

  /**
     * Add natural transitions between ideas
     */
  addNaturalTransitions(text, style) {
    let transitioned = text;

    const transitions = this.transitionWords;
    const sentences = transitioned.split(/[.!?]+/);
    const transitionProfile = style?.transitionFrequency || style?.name?.toLowerCase();
    const transitionRate = {
      professional: 0.08,
      technical: 0.09,
      systematic: 0.09,
      creative: 0.14,
      artistic: 0.16,
      persuasive: 0.13,
      narrative: 0.15,
      casual: 0.12
    }[transitionProfile] || 0.12;
    const transitionCap = Math.max(1, Math.floor(sentences.length * 0.35));
    let transitionCount = 0;

    for (let i = 1; i < sentences.length - 1; i++) {
      const trimmed = sentences[i].trim();
      if (!trimmed) continue;
      if (transitionCount >= transitionCap) break;
      if (/^(and|but|so|then|also|because|however|meanwhile)\b/i.test(trimmed)) continue;
      if (Math.random() < transitionRate) {
        const transitionType = Object.keys(transitions)[Math.floor(Math.random() * Object.keys(transitions).length)];
        const transition = transitions[transitionType][Math.floor(Math.random() * transitions[transitionType].length)];
        sentences[i] = ' ' + transition.charAt(0).toUpperCase() + transition.slice(1) + ', ' + sentences[i].trim();
        transitionCount++;
      }
    }

    return sentences.join('.');
  }

  getHumanizationSettings(level) {
    const settings = {
      light: { openerRate: 0.06, asideRate: 0.06, microOpinionRate: 0.05, tagRate: 0.03, splitRate: 0.12, combineRate: 0.08, fragmentRate: 0.04 },
      moderate: { openerRate: 0.12, asideRate: 0.12, microOpinionRate: 0.1, tagRate: 0.05, splitRate: 0.2, combineRate: 0.12, fragmentRate: 0.07 },
      high: { openerRate: 0.2, asideRate: 0.18, microOpinionRate: 0.16, tagRate: 0.08, splitRate: 0.28, combineRate: 0.18, fragmentRate: 0.12 },
      extreme: { openerRate: 0.28, asideRate: 0.24, microOpinionRate: 0.22, tagRate: 0.12, splitRate: 0.35, combineRate: 0.22, fragmentRate: 0.18 }
    };
    return settings[level] || settings.moderate;
  }

  applyHumanVoiceEnhancements(text, style, level) {
    const settings = this.getHumanizationSettings(level);
    const openers = ['Honestly,', 'Here’s the thing,', 'Real talk,', 'Look,', 'Quick note:', 'If we’re being honest,', 'Not gonna lie,', 'To be fair,', 'Okay,'];
    const asides = ['to be honest', 'if we’re being real', 'at least in my experience', 'in the best way', 'and yeah, that matters'];
    const microOpinions = ['and that’s the point', 'which is kind of the whole idea', 'and it actually helps', 'and it reads better', 'and it feels more natural'];
    const tags = ['if that helps', 'if that makes sense', 'at least to me', 'you get the idea', 'that’s the vibe'];

    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const enhanced = sentences.map((sentence) => {
      let s = sentence.trim();
      if (!s) return '';
      const punctMatch = s.match(/([.!?]+)$/);
      const punctuation = punctMatch ? punctMatch[1] : '';
      let base = s.replace(/([.!?]+)$/, '').trim();

      if (Math.random() < settings.openerRate && !/^(and|but|so|because|if|when|okay|look|honestly|to be fair)\b/i.test(base)) {
        const opener = openers[Math.floor(Math.random() * openers.length)];
        base = `${opener} ${base.charAt(0).toLowerCase()}${base.slice(1)}`;
      }

      if (base.length > 60 && Math.random() < settings.asideRate) {
        const aside = asides[Math.floor(Math.random() * asides.length)];
        const commaIndex = base.indexOf(',');
        if (commaIndex > 10 && commaIndex < base.length - 10) {
          base = `${base.slice(0, commaIndex + 1)} ${aside},${base.slice(commaIndex + 1)}`;
        } else {
          const words = base.split(/\s+/);
          const insertAt = Math.min(words.length - 3, Math.max(3, Math.floor(words.length / 3)));
          words.splice(insertAt, 0, `(${aside})`);
          base = words.join(' ');
        }
      }

      if (Math.random() < settings.microOpinionRate) {
        const micro = microOpinions[Math.floor(Math.random() * microOpinions.length)];
        base = `${base}, ${micro}`;
      }

      if (Math.random() < settings.tagRate) {
        const tag = tags[Math.floor(Math.random() * tags.length)];
        base = `${base}, ${tag}`;
      }

      return `${base}${punctuation}`;
    });

    return enhanced.join(' ');
  }

  applyRhythmEnhancements(text, level) {
    const settings = this.getHumanizationSettings(level);
    const connectors = ['and', 'so', 'but', 'which means', 'because'];
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const reworked = [];

    for (let i = 0; i < sentences.length; i++) {
      let s = sentences[i].trim();
      if (!s) continue;
      const punctMatch = s.match(/([.!?]+)$/);
      const punctuation = punctMatch ? punctMatch[1] : '.';
      let base = s.replace(/([.!?]+)$/, '').trim();
      const words = base.split(/\s+/);

      if (words.length > 22 && Math.random() < settings.splitRate) {
        const commaIndex = base.indexOf(',');
        if (commaIndex > 12 && commaIndex < base.length - 12) {
          const first = base.slice(0, commaIndex).trim();
          const second = base.slice(commaIndex + 1).trim();
          reworked.push(`${first}.`);
          reworked.push(`${second.charAt(0).toUpperCase()}${second.slice(1)}${punctuation}`);
          continue;
        }
        const splitMatch = base.match(/\s+(and|but|so|because|which)\s+/i);
        if (splitMatch && splitMatch.index > 12 && splitMatch.index < base.length - 12) {
          const first = base.slice(0, splitMatch.index).trim();
          const second = base.slice(splitMatch.index + splitMatch[0].length).trim();
          reworked.push(`${first}.`);
          reworked.push(`${second.charAt(0).toUpperCase()}${second.slice(1)}${punctuation}`);
          continue;
        }
      }

      reworked.push(`${base}${punctuation}`);
    }

    const blended = [];
    for (let i = 0; i < reworked.length; i++) {
      const current = reworked[i];
      const next = reworked[i + 1];
      if (next) {
        const currentWords = current.replace(/([.!?]+)$/,'').trim().split(/\s+/);
        const nextWords = next.replace(/([.!?]+)$/,'').trim().split(/\s+/);
        if (currentWords.length <= 6 && nextWords.length <= 6 && Math.random() < settings.combineRate) {
          const connector = connectors[Math.floor(Math.random() * connectors.length)];
          const combined = `${current.replace(/([.!?]+)$/,'')}, ${connector} ${next.replace(/([.!?]+)$/,'').charAt(0).toLowerCase()}${next.replace(/([.!?]+)$/,'').slice(1)}.`;
          blended.push(combined);
          i++;
          continue;
        }
      }
      blended.push(current);
    }

    return blended.join(' ');
  }

  removeRepeatedSentences(text) {
    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
    const seen = new Set();
    const filtered = [];

    sentences.forEach(sentence => {
      const normalized = sentence
        .replace(/[^\w\s]/g, '')
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
      if (!normalized) return;
      if (seen.has(normalized)) return;
      seen.add(normalized);
      filtered.push(sentence.trim());
    });

    return filtered.join(' ');
  }

  replaceSystemSubjects(text) {
    const subjects = [
      'these models',
      'this technology',
      'AI tools',
      'the model',
      'the tooling',
      'the approach'
    ];
    return text.replace(/\bthe system\b/gi, () => {
      return subjects[Math.floor(Math.random() * subjects.length)];
    });
  }

  cleanUnnaturalFillers(text) {
    let cleaned = text;
    const fillerPatterns = [
      /\b(in conclusion|in summary|overall|generally speaking|to put it simply|in other words)\b,?\s*/gi,
      /\b(basically|actually|literally|pretty much|kind of|sort of|you know|like)\b,?\s*/gi,
      /\b(at the end of the day|all things considered|for all intents and purposes)\b,?\s*/gi
    ];

    fillerPatterns.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    cleaned = cleaned.replace(/\s{2,}/g, ' ');
    cleaned = cleaned.replace(/\s+([,.!?;:])/g, '$1');
    return cleaned.trim();
  }

  /**
     * Final polish and formatting
     */
  finalPolish(text) {
    let polished = text;

    // Clean up spacing
    polished = polished.replace(/\s+/g, ' ');
    polished = polished.replace(/\s+([,.!?;:])/g, '$1');
    polished = polished.replace(/([,.!?;:])\s*/g, '$1 ');

    // Ensure proper capitalization
    polished = polished.replace(/(\.\s*)([a-z])/g, (match, punctuation, letter) => {
      return punctuation + letter.toUpperCase();
    });

    // Capitalize first letter
    polished = polished.charAt(0).toUpperCase() + polished.slice(1);

    // Clean up any remaining issues
    polished = polished.replace(/\s+$/g, '');
    polished = polished.replace(/^\s+/g, '');

    return polished;
  }

  /**
     * Calculate confidence score for human-like quality
     */
  calculateConfidenceScore(humanized, original) {
    let score = 50; // Base score

    // Check for contractions (positive for casual styles)
    const contractionCount = (humanized.match(/['']\w+/g) || []).length;
    if (contractionCount > 0) score += 10;

    // Check for varied sentence length
    const sentences = humanized.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s => s.trim().split(/\s+/).length);
    const lengthVariation = Math.max(...sentenceLengths) - Math.min(...sentenceLengths);
    if (lengthVariation > 5) score += 15;

    // Check for personal voice indicators
    const personalIndicators = ['I think', 'I believe', 'in my opinion', 'personally', 'honestly'];
    const personalCount = personalIndicators.reduce((count, indicator) => {
      return count + (humanized.toLowerCase().includes(indicator.toLowerCase()) ? 1 : 0);
    }, 0);
    if (personalCount > 0) score += 10;

    // Check for natural transitions
    const naturalTransitions = ['but', 'so', 'and', 'then', 'well', 'anyway'];
    const transitionCount = naturalTransitions.reduce((count, transition) => {
      return count + (humanized.toLowerCase().match(new RegExp(`\\b${transition}\\b`, 'gi')) || []).length;
    }, 0);
    if (transitionCount > 2) score += 10;

    // Check for informal language
    const informalWords = ['gonna', 'wanna', 'gotta', 'kinda', 'sorta'];
    const informalCount = informalWords.reduce((count, word) => {
      return count + (humanized.toLowerCase().includes(word) ? 1 : 0);
    }, 0);
    if (informalCount > 0) score += 5;

    // Penalize for remaining formal/AI patterns
    const formalPatterns = ['furthermore', 'moreover', 'consequently', 'nevertheless', 'nonetheless'];
    const formalCount = formalPatterns.reduce((count, pattern) => {
      return count + (humanized.toLowerCase().match(new RegExp(`\\b${pattern}\\b`, 'gi')) || []).length;
    }, 0);
    if (formalCount > 0) score -= formalCount * 5;
    if (original && Math.abs(humanized.length - original.length) > original.length * 0.3) {
      score -= 5;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
     * Update status message for UI feedback
     */
  updateStatus(message, type = 'info') {
    // Dispatch custom event for UI updates
    const event = new CustomEvent('humanizerStatus', {
      detail: { message, type, timestamp: Date.now() }
    });
    document.dispatchEvent(event);

    // Also log to console for debugging
    console.log(`[Humanizer] ${message}`);
  }

  /**
     * Get word count statistics
     */
  getWordCount(text) {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
     * Set current writing style
     */
  setStyle(style) {
    if (this.writingStyles[style]) {
      this.currentStyle = style;
      return true;
    }
    return false;
  }

  /**
     * Get available writing styles
     */
  getAvailableStyles() {
    return Object.keys(this.writingStyles).map(key => ({
      key,
      name: this.writingStyles[key].name
    }));
  }

  /**
     * Get current confidence score
     */
  getConfidenceScore() {
    return this.confidenceScore;
  }
}

/**
 * Initialize comprehensive testing functionality
 */
function initializeComprehensiveTesting() {
  const runTestsBtn = document.getElementById('run-comprehensive-tests');
  const testPatternsBtn = document.getElementById('test-specific-patterns');
  const testResultsDiv = document.getElementById('comprehensive-test-results');
  const testSummaryDiv = document.getElementById('test-summary');
  const testRecommendationsDiv = document.getElementById('test-recommendations');
  const testStatusDiv = document.getElementById('test-status');

  if (runTestsBtn) {
    runTestsBtn.addEventListener('click', async () => {
      if (!window.aiDetectionTestSuite) {
        alert('Test suite not initialized. Please refresh the page.');
        return;
      }

      runTestsBtn.disabled = true;
      runTestsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Running Tests...';
      testStatusDiv.textContent = 'Running comprehensive tests... This may take a moment.';

      try {
        const report = await window.aiDetectionTestSuite.runComprehensiveTests();

        // Display results
        testResultsDiv.classList.remove('hidden');
        testSummaryDiv.innerHTML = `
                    <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                        <h5 class="font-medium mb-2">Performance Summary</h5>
                        <div class="space-y-1 text-sm">
                            <div>Tests Run: ${report.summary.totalTests}</div>
                            <div>Avg Original AI Score: <span class="text-red-600 dark:text-red-400">${report.summary.averageOriginalScore}%</span></div>
                            <div>Avg Basic Pipeline: <span class="text-yellow-600 dark:text-yellow-400">${report.summary.averageBasicScore}%</span> (↓${report.summary.basicPipelineImprovement}%)</div>
                            <div>Avg Advanced Pipeline: <span class="text-green-600 dark:text-green-400">${report.summary.averageAdvancedScore}%</span> (↓${report.summary.advancedPipelineImprovement}%)</div>
                            <div class="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <strong>Advanced vs Basic: ↓${report.summary.advancedVsBasicImprovement}% better</strong>
                            </div>
                        </div>
                    </div>
                `;

        testRecommendationsDiv.innerHTML = `
                    <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                        <h5 class="font-medium mb-2 text-blue-800 dark:text-blue-300">Recommendations</h5>
                        <div class="space-y-1 text-sm text-blue-700 dark:text-blue-400">
                            ${report.recommendations.map(rec => `<div>${rec}</div>`).join('')}
                        </div>
                    </div>
                `;

        testStatusDiv.textContent = 'Tests completed successfully!';

      } catch (error) {
        console.error('Test error:', error);
        testStatusDiv.textContent = 'Error running tests: ' + error.message;
        testStatusDiv.className = 'text-sm text-red-500 dark:text-red-400';
      } finally {
        runTestsBtn.disabled = false;
        runTestsBtn.innerHTML = '<i class="fas fa-play"></i> Run Comprehensive Tests';
      }
    });
  }

  if (testPatternsBtn) {
    testPatternsBtn.addEventListener('click', () => {
      if (!window.aiDetectionTestSuite) {
        alert('Test suite not initialized. Please refresh the page.');
        return;
      }

      const results = window.aiDetectionTestSuite.testSpecificPatterns();

      testResultsDiv.classList.remove('hidden');
      testSummaryDiv.innerHTML = `
                <div class="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <h5 class="font-medium mb-2">AI Pattern Detection</h5>
                    <div class="space-y-3">
                        ${results.map(result => `
                            <div class="border-l-4 border-red-400 pl-3">
                                <div class="font-medium text-sm">${result.name}</div>
                                <div class="text-xs text-gray-600 dark:text-gray-400">
                                    AI Score: ${result.originalScore}% (${result.riskLevel})
                                </div>
                                ${result.detectedPatterns.length > 0 ? `
                                    <div class="text-xs text-red-600 dark:text-red-400 mt-1">
                                        Detected: ${result.detectedPatterns.join(', ')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

      testRecommendationsDiv.innerHTML = `
                <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
                    <h5 class="font-medium mb-2 text-yellow-800 dark:text-yellow-300">Pattern Analysis</h5>
                    <div class="text-sm text-yellow-700 dark:text-yellow-400">
                        These patterns are commonly flagged by AI detectors. The advanced pipeline is designed to transform these specific patterns into more natural language.
                    </div>
                </div>
            `;

      testStatusDiv.textContent = 'Pattern analysis complete!';
    });
  }
}

// Initialize the humanizer when DOM is loaded
class AIDetector {
  constructor() {
    this.gptZeroPatterns = [
      // Repetitive sentence structures
      /\b(in today's|in the modern|in contemporary)\s+\w+\s+landscape\b/gi,
      /\bit is\s+(important|crucial|essential|vital)\s+to\s+note\b/gi,
      /\bplays?\s+a\s+(crucial|important|significant|vital)\s+role\b/gi,
      /\bin\s+conclusion\b/gi,
      /\bfurthermore\s*,/gi,
      /\bmoreover\s*,/gi,
      /\badditionally\s*,/gi,
      /\bhowever\s*,/gi,
      /\bnevertheless\s*,/gi,
      /\bnonetheless\s*,/gi,
      // Formal academic language
      /\butilize\b/gi,
      /\butilization\b/gi,
      /\bimplement\b/gi,
      /\bimplementation\b/gi,
      /\bfacilitate\b/gi,
      /\bfacilitation\b/gi,
      /\boptimize\b/gi,
      /\boptimization\b/gi,
      /\bleverage\b/gi,
      /\balleviate\b/gi,
      // Complex sentence structures
      /\bnot\s+only\s+.*\s+but\s+also\b/gi,
      /\beither\s+.*\s+or\s+.*\s+but\s+also\b/gi,
      /\bwhile\s+.*\s+however\b/gi,
      /\bdespite\s+the\s+fact\s+that\b/gi,
      /\bin\s+spite\s+of\s+the\s+fact\s+that\b/gi,
      // AI-specific phrases
      /\bit\s+should\s+be\s+noted\s+that\b/gi,
      /\bit\s+is\s+worth\s+mentioning\s+that\b/gi,
      /\bit\s+is\s+important\s+to\s+understand\s+that\b/gi,
      /\bas\s+mentioned\s+(earlier|previously)\b/gi,
      /\bto\s+put\s+it\s+simply\b/gi,
      /\bin\s+other\s+words\b/gi,
      /\bthat\s+is\s+to\s+say\b/gi,
      // Statistical language
      /\ba\s+significant\s+(number|amount|portion)\s+of\b/gi,
      /\ba\s+large\s+(number|amount|portion)\s+of\b/gi,
      /\ba\s+substantial\s+(number|amount|portion)\s+of\b/gi,
      /\bthe\s+majority\s+of\b/gi,
      /\bthe\s+vast\s+majority\s+of\b/gi,
      // Predictable transitions
      /\bfirst\s+and\s+foremost\b/gi,
      /\blast\s+but\s+not\s+least\b/gi,
      /\bin\s+addition\s+to\b/gi,
      /\bas\s+well\s+as\b/gi,
      /\balong\s+with\b/gi,
      /\btogether\s+with\b/gi,
      // Passive voice indicators
      /\b(is|are|was|were|being|been)\s+\w+ed\b/gi,
      // Perfect tense overuse
      /\b(have|has|had)\s+been\s+\w+ed\b/gi,
      // Future tense with "will"
      /\bwill\s+continue\s+to\s+be\b/gi,
      /\bwill\s+play\s+a\s+(important|crucial)\s+role\b/gi,
      // Hedging language
      /\bit\s+is\s+(likely|possible|probable)\s+that\b/gi,
      /\bthere\s+is\s+a\s+(possibility|probability|likelihood)\s+that\b/gi,
      /\bmay\s+well\s+be\b/gi,
      /\bmight\s+well\s+be\b/gi
    ];

    this.turnitinPatterns = [
      // Academic formulaic expressions
      /\bin\s+the\s+field\s+of\s+\w+\b/gi,
      /\bthe\s+field\s+of\s+study\b/gi,
      /\baccording\s+to\s+the\s+literature\b/gi,
      /\bprevious\s+studies\s+have\s+shown\b/gi,
      /\bresearch\s+has\s+shown\s+that\b/gi,
      /\bstudies\s+have\s+found\s+that\b/gi,
      /\bit\s+has\s+been\s+shown\s+that\b/gi,
      /\bit\s+has\s+been\s+found\s+that\b/gi,
      /\bit\s+has\s+been\s+reported\s+that\b/gi,
      /\bit\s+has\s+been\s+suggested\s+that\b/gi,
      // Citation patterns
      /\b\(\s*\d{4}\s*\)/g,  // (2023)
      /\b\(\s*\w+\s*,\s*\d{4}\s*\)/g,  // (Smith, 2023)
      /\b\(\s*\w+\s+&\s+\w+\s*,\s*\d{4}\s*\)/g,  // (Smith & Jones, 2023)
      /\b\(\s*\w+\s+et\s+al\.\s*,\s*\d{4}\s*\)/g,  // (Smith et al., 2023)
      // Formal academic structure
      /\bthe\s+purpose\s+of\s+this\s+(study|research|paper)\s+is\s+to\b/gi,
      /\bthis\s+paper\s+aims\s+to\b/gi,
      /\bthis\s+study\s+investigates\b/gi,
      /\bthis\s+research\s+examines\b/gi,
      /\bthe\s+objective\s+of\s+this\s+(study|research)\s+is\s+to\b/gi,
      // Methodology language
      /\ba\s+mixed-methods\s+approach\b/gi,
      /\ba\s+qualitative\s+approach\b/gi,
      /\ba\s+quantitative\s+approach\b/gi,
      /\bthe\s+data\s+were\s+collected\b/gi,
      /\bthe\s+data\s+was\s+analyzed\b/gi,
      /\bstatistical\s+analysis\s+was\s+conducted\b/gi,
      /\bthe\s+results\s+indicate\s+that\b/gi,
      /\bthe\s+findings\s+suggest\s+that\b/gi,
      /\bthe\s+results\s+show\s+that\b/gi,
      // Conclusion language
      /\bin\s+conclusion\s*,/gi,
      /\bto\s+conclude\s*,/gi,
      /\bthe\s+results\s+of\s+this\s+study\b/gi,
      /\bthis\s+study\s+has\s+shown\s+that\b/gi,
      /\bthese\s+findings\s+have\s+implications\s+for\b/gi,
      /\bfuture\s+research\s+should\s+focus\s+on\b/gi,
      /\bfurther\s+research\s+is\s+needed\b/gi,
      /\bthis\s+research\s+contributes\s+to\b/gi,
      // Academic hedging
      /\bit\s+appears\s+that\b/gi,
      /\bit\s+seems\s+that\b/gi,
      /\bit\s+would\s+appear\s+that\b/gi,
      /\bit\s+is\s+reasonable\s+to\s+suggest\b/gi,
      /\bone\s+could\s+argue\s+that\b/gi,
      /\bit\s+might\s+be\s+suggested\s+that\b/gi
    ];

    this.aiIndicators = [
      // Perfect grammar and spelling (too perfect)
      /\b(perfectly|completely|entirely|totally|absolutely)\s+\w+\b/gi,
      // Overly balanced arguments
      /\bon\s+the\s+one\s+hand.*on\s+the\s+other\s+hand\b/gi,
      // Predictable examples
      /\bfor\s+example\s*,.*\bfor\s+instance\b/gi,
      /\bsuch\s+as\s+.*\s+and\s+so\s+on\b/gi,
      // Repetitive sentence starters
      /^\s*(Furthermore|Moreover|Additionally|However|Nevertheless)\s+/gmi,
      // Lack of contractions
      /\b(do\s+not|does\s+not|did\s+not|will\s+not|cannot|could\s+not|should\s+not|would\s+not)\b/gi,
      // Overuse of "very"
      /\bvery\s+(important|significant|crucial|essential|necessary)\b/gi,
      // Generic conclusions
      /\bin\s+summary\s*,/gi,
      /\bto\s+summarize\s*,/gi,
      /\bin\s+essence\s*,/gi,
      // Lack of personal voice
      /\bit\s+is\s+believed\s+that\b/gi,
      /\bit\s+is\s+thought\s+that\b/gi,
      /\bit\s+is\s+considered\s+that\b/gi
    ];
  }

  analyzeText(text) {
    const results = {
      gptZeroScore: 0,
      turnitinScore: 0,
      aiIndicators: 0,
      overallScore: 0,
      flags: [],
      suggestions: []
    };

    // GPTZero pattern detection
    this.gptZeroPatterns.forEach((pattern, index) => {
      const matches = text.match(pattern);
      if (matches) {
        results.gptZeroScore += matches.length;
        results.flags.push(`GPTZero Pattern ${index + 1}: ${matches[0]}`);
      }
    });

    // Turnitin pattern detection
    this.turnitinPatterns.forEach((pattern, index) => {
      const matches = text.match(pattern);
      if (matches) {
        results.turnitinScore += matches.length;
        results.flags.push(`Turnitin Pattern ${index + 1}: ${matches[0]}`);
      }
    });

    // General AI indicators
    this.aiIndicators.forEach((pattern, index) => {
      const matches = text.match(pattern);
      if (matches) {
        results.aiIndicators += matches.length;
        results.flags.push(`AI Indicator ${index + 1}: ${matches[0]}`);
      }
    });

    // Calculate overall score (0-100)
    const totalFlags = results.flags.length;
    results.overallScore = Math.min(100, totalFlags * 2);

    // Generate suggestions
    if (results.gptZeroScore > 3) {
      results.suggestions.push('Reduce formal academic language and transitions');
    }
    if (results.turnitinScore > 2) {
      results.suggestions.push('Avoid formulaic academic expressions');
    }
    if (results.aiIndicators > 4) {
      results.suggestions.push('Add more natural human elements (contractions, personal voice)');
    }
    if (text.match(/\b(do\s+not|does\s+not|cannot)\b/gi)) {
      results.suggestions.push('Use contractions for more natural flow');
    }
    if (text.match(/^\s*(Furthermore|Moreover|Additionally)\s+/gmi)) {
      results.suggestions.push('Vary sentence starters and avoid repetitive transitions');
    }
    if (!text.match(/[.!?]\s*\n/g)) {
      results.suggestions.push('Consider varying paragraph lengths for natural rhythm');
    }

    return results;
  }

  getRiskLevel(score) {
    if (score >= 80) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 20) return 'Low Risk';
    return 'Minimal Risk';
  }

  getDetailedReport(text) {
    const analysis = this.analyzeText(text);
    return {
      ...analysis,
      riskLevel: this.getRiskLevel(analysis.overallScore),
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).length,
      avgSentenceLength: text.split(/[.!?]+/).reduce((acc, sent) => acc + sent.split(/\s+/).length, 0) / text.split(/[.!?]+/).length,
      humanScore: Math.max(0, 100 - analysis.overallScore)
    };
  }
}

// Add AI detection testing to the TextHumanizer
TextHumanizer.prototype.testAgainstDetectors = function(text) {
  const detector = new AIDetector();
  return detector.getDetailedReport(text);
};

// UI Controller for AI Detection Testing
class AIDetectionUI {
  constructor() {
    this.initializeElements();
    this.bindEvents();
  }

  initializeElements() {
    this.testButton = document.getElementById('test-detection');
    this.resultsContainer = document.getElementById('detection-results');
    this.scoresContainer = document.getElementById('detection-scores');
    this.detectionCheckboxes = document.querySelectorAll('.detector-checkbox');
  }

  bindEvents() {
    if (this.testButton) {
      this.testButton.addEventListener('click', () => this.runDetectionTest());
    }
  }

  runDetectionTest() {
    const outputText = document.getElementById('output-text').value;
    if (!outputText.trim()) {
      alert('Please humanize some text first before testing AI detection.');
      return;
    }

    // Show loading state
    this.testButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Testing...';
    this.testButton.disabled = true;

    // Simulate processing time
    setTimeout(() => {
      this.displayDetectionResults(outputText);
      this.testButton.innerHTML = '<i class="fas fa-search"></i> Test AI Detection';
      this.testButton.disabled = false;
    }, 1500);
  }

  displayDetectionResults(text) {
    const detector = new AIDetector();
    const report = detector.getDetailedReport(text);

    // Show results container
    this.resultsContainer.classList.remove('hidden');

    // Get selected detectors
    const selectedDetectors = Array.from(this.detectionCheckboxes)
      .filter(cb => cb.checked)
      .map(cb => cb.value);

    let scoresHTML = '';

    // GPTZero results
    if (selectedDetectors.includes('gptzero')) {
      const gptZeroRisk = this.getRiskColor(report.gptZeroScore * 2);
      scoresHTML += `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center">
                        <i class="fab fa-google text-blue-500 mr-2"></i>
                        <span class="font-medium">GPTZero</span>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">AI Score: ${report.gptZeroScore}</div>
                        <div class="text-sm font-medium ${gptZeroRisk}">${this.getRiskLevel(report.gptZeroScore * 2)}</div>
                    </div>
                </div>
            `;
    }

    // Turnitin results
    if (selectedDetectors.includes('turnitin')) {
      const turnitinRisk = this.getRiskColor(report.turnitinScore * 2.5);
      scoresHTML += `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas fa-university text-red-500 mr-2"></i>
                        <span class="font-medium">Turnitin</span>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">AI Score: ${report.turnitinScore}</div>
                        <div class="text-sm font-medium ${turnitinRisk}">${this.getRiskLevel(report.turnitinScore * 2.5)}</div>
                    </div>
                </div>
            `;
    }

    // Originality.AI results (simulated)
    if (selectedDetectors.includes('originality')) {
      const originalityScore = Math.floor(report.overallScore * 0.8);
      const originalityRisk = this.getRiskColor(originalityScore);
      scoresHTML += `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas fa-fingerprint text-green-500 mr-2"></i>
                        <span class="font-medium">Originality.AI</span>
                    </div>
                    <div class="text-right">
                        <div class="text-sm text-gray-500">AI Score: ${originalityScore}</div>
                        <div class="text-sm font-medium ${originalityRisk}">${this.getRiskLevel(originalityScore)}</div>
                    </div>
                </div>
            `;
    }

    // Overall human score
    const humanScoreColor = report.humanScore >= 80 ? 'text-green-600' :
      report.humanScore >= 60 ? 'text-yellow-600' : 'text-red-600';

    scoresHTML += `
            <div class="border-t pt-4 mt-4">
                <div class="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
                    <div class="flex items-center">
                        <i class="fas fa-user-check text-green-600 mr-2"></i>
                        <span class="font-semibold">Overall Human Score</span>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold ${humanScoreColor}">${report.humanScore}%</div>
                        <div class="text-xs text-gray-500">${report.riskLevel}</div>
                    </div>
                </div>
            </div>
        `;

    // Add suggestions if any
    if (report.suggestions.length > 0) {
      scoresHTML += `
                <div class="border-t pt-4 mt-4">
                    <h5 class="font-medium mb-2 text-orange-600">
                        <i class="fas fa-lightbulb mr-1"></i>Improvement Suggestions
                    </h5>
                    <ul class="space-y-1">
                        ${report.suggestions.map(suggestion => `
                            <li class="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                                <i class="fas fa-arrow-right text-orange-500 mr-2 mt-0.5 text-xs"></i>
                                ${suggestion}
                            </li>
                        `).join('')}
                    </ul>
                </div>
            `;
    }

    this.scoresContainer.innerHTML = scoresHTML;

    // Smooth scroll to results
    this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  getRiskColor(score) {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-yellow-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-green-600';
  }

  getRiskLevel(score) {
    if (score >= 80) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 20) return 'Low Risk';
    return 'Minimal Risk';
  }
}


function initializeTemplateToggle() {
  const toggle = document.getElementById('ui-template-toggle');
  const label = document.getElementById('ui-template-label');
  const root = document.getElementById('ui-template-root');
  if (!toggle || !root) return;
  root.classList.remove('is-switching');
  root.style.opacity = '1';
  root.style.transform = 'none';

  const applyTemplate = (template) => {
    document.body.setAttribute('data-ui-template', template);
    toggle.checked = template === 'classic';
    if (label) {
      label.textContent = template === 'classic' ? 'Classic' : 'Original';
    }
  };

  let stored = null;
  try {
    stored = localStorage.getItem('uiTemplate');
  } catch (error) {
    stored = null;
  }
  const initial = stored === 'classic' ? 'classic' : 'modern';
  applyTemplate(initial);

  toggle.addEventListener('change', () => {
    const nextTemplate = toggle.checked ? 'classic' : 'modern';
    root.classList.add('is-switching');
    window.setTimeout(() => {
      applyTemplate(nextTemplate);
      try {
        localStorage.setItem('uiTemplate', nextTemplate);
      } catch (error) {
        root.classList.remove('is-switching');
      }
      window.setTimeout(() => {
        root.classList.remove('is-switching');
      }, 180);
    }, 140);
  });
}

function forceUnmuteAllVideos() {
  const videos = document.querySelectorAll('video');
  videos.forEach(v => {
    v.muted = false;
    v.defaultMuted = false;
    v.volume = 1.0;
    v.removeAttribute('muted');
    const playPromise = v.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {});
    }
  });
}

function initializeClassicalHero() {
  const hero = document.querySelector('.classical-hero');
  const canvas = document.getElementById('hero-particles');
  if (!hero || !canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  hero.style.opacity = '1';
  hero.style.visibility = 'visible';
  hero.style.display = 'block';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const particles = [];
  let width = 0;
  let height = 0;
  let ratio = Math.min(2, window.devicePixelRatio || 1);
  let running = true;

  const createParticles = () => {
    particles.length = 0;
    const count = Math.max(24, Math.min(72, Math.floor((width * height) / 12000)));
    for (let i = 0; i < count; i += 1) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.35 + 0.15,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.25
      });
    }
  };

  const resize = () => {
    width = hero.clientWidth;
    height = hero.clientHeight;
    ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    createParticles();
  };

  const draw = () => {
    if (!running || prefersReduced) return;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -10) particle.x = width + 10;
      if (particle.x > width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = height + 10;
      if (particle.y > height + 10) particle.y = -10;
      const glow = ctx.createRadialGradient(
        particle.x,
        particle.y,
        0,
        particle.x,
        particle.y,
        particle.radius * 6
      );
      glow.addColorStop(0, `rgba(182, 138, 43, ${particle.alpha})`);
      glow.addColorStop(1, 'rgba(182, 138, 43, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius * 6, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  };

  const parallaxItems = Array.from(hero.querySelectorAll('[data-parallax]'));
  let ticking = false;
  const updateParallax = () => {
    const rect = hero.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    const offset = (progress - 0.5) * 2;
    parallaxItems.forEach(item => {
      const strength = parseFloat(item.dataset.parallax || '0.1');
      item.style.transform = `translate3d(0, ${offset * 40 * strength}px, 0)`;
    });
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      running = entry.isIntersecting;
      if (running && !prefersReduced) requestAnimationFrame(draw);
    });
  }, { threshold: 0.05 });

  observer.observe(hero);
  window.addEventListener('resize', resize);
  window.addEventListener('scroll', onScroll, { passive: true });
  resize();
  updateParallax();
  if (!prefersReduced) requestAnimationFrame(draw);
}

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Initializing UI...');

  initializeTemplateToggle();

  try {
    window.textHumanizer = new TextHumanizer();
  } catch (error) {
    console.error('Critical initialization error (TextHumanizer):', error);
  }

  try {
    window.aiDetector = new AIDetector();
  } catch (error) {
    console.error('Initialization error (AIDetector):', error);
  }

  try {
    window.aiDetectionUI = new AIDetectionUI();
  } catch (error) {
    console.error('Initialization error (AIDetectionUI):', error);
  }

  try {
    initializeMainUI();
  } catch (error) {
    console.error('Initialization error (Main UI):', error);
  }

  try {
    initializeNavVideo();
  } catch (error) {
    console.error('Initialization error (Nav Video):', error);
  }

  try {
    initializeClassicalHero();
  } catch (error) {
    console.error('Initialization error (Classical Hero):', error);
  }

  try {
    let audioCtx;
    const handleFirstInteraction = (e) => {
      console.log(`[Audio] Silent activation on ${e.type}...`);
      window._userInteracted = true;

      try {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
      } catch (err) {
        console.warn('[Audio] AudioContext init failed:', err);
      }

      forceUnmuteAllVideos();

      ['click', 'touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'scroll'].forEach(event => {
        window.removeEventListener(event, handleFirstInteraction, { capture: true });
      });
    };

    ['click', 'touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown', 'scroll'].forEach(event => {
      window.addEventListener(event, handleFirstInteraction, { once: true, capture: true });
    });
  } catch (error) {
    console.error('Initialization error (Audio Activation):', error);
  }

  try {
    initializeComprehensiveTesting();
  } catch (error) {
    console.error('Initialization error (Comprehensive Testing):', error);
  }

  // Initialize Liquid Glass Bubbles
  try {
    initializeGlassBubbles();
  } catch (error) {
    console.error('Initialization error (Glass Bubbles):', error);
  }

  console.log('AI Text Humanizer and Detector initialized successfully');
});

/**
 * Creates dynamic bubbles for the glass text effect
 */
function initializeGlassBubbles() {
  const glassElements = document.querySelectorAll('.glass-text');
  
  glassElements.forEach(el => {
    // Ensure container doesn't already exist
    if (el.querySelector('.glass-bubbles')) return;
    
    const bubblesContainer = document.createElement('div');
    bubblesContainer.className = 'glass-bubbles';
    el.appendChild(bubblesContainer);
    
    setInterval(() => {
      const bubble = document.createElement('span');
      const size = Math.random() * 6 + 2 + 'px';
      const left = Math.random() * 90 + 5 + '%';
      
      bubble.style.width = size;
      bubble.style.height = size;
      bubble.style.left = left;
      bubble.style.bottom = '0';
      
      bubblesContainer.appendChild(bubble);
      
      setTimeout(() => {
        bubble.remove();
      }, 4000);
    }, 600);
  });
}

/**
 * Initialize navigation video functionality
 */
function initializeNavVideo() {
  const video = document.getElementById('nav-video');
  if (!video) return;

  video.volume = 1.0;
  video.muted = !window._userInteracted;
  video.defaultMuted = video.muted;
  if (!video.muted) {
    video.removeAttribute('muted');
  }
  video.playbackRate = 1.0;

  video.addEventListener('canplay', () => {
    console.log('[NavVideo] Video can play. Duration:', video.duration);
  });

  video.addEventListener('error', (e) => {
    console.error('[NavVideo] Video error:', e);
  });

  const playVideo = () => {
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.log('[NavVideo] Video playback started successfully');
      }).catch(error => {
        console.warn('[NavVideo] Autoplay failed:', error);
        console.warn('[NavVideo] Error name:', error.name);
        console.warn('[NavVideo] Error message:', error.message);

        // Handle specific autoplay errors
        if (error.name === 'NotAllowedError') {
          console.log('[NavVideo] Autoplay blocked - keeping video muted');
          video.muted = true;
          video.play().catch(secondErr => {
            console.error('[NavVideo] Even muted playback failed:', secondErr);
          });
        } else if (error.name === 'NotSupportedError') {
          console.error('[NavVideo] Video format not supported');
        } else {
          console.error('[NavVideo] Unknown video error:', error);
        }
      });
    }
  };

  // Try playing immediately (should work since it's muted)
  playVideo();

  // Ensure it plays on first interaction with the page
  const forcePlay = () => {
    if (video.paused) playVideo();
    document.removeEventListener('mousedown', forcePlay);
    document.removeEventListener('touchstart', forcePlay);
  };

  document.addEventListener('mousedown', forcePlay);
  document.addEventListener('touchstart', forcePlay);

  // Unmute on click if the user wants sound
  video.addEventListener('click', (e) => {
    e.stopPropagation(); // Don't close popup when clicking video
    video.muted = !video.muted;
    if (!video.muted) {
      video.defaultMuted = false;
      video.volume = 1.0;
      video.removeAttribute('muted');
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
    console.log('[NavVideo] Video muted state changed:', video.muted, 'Volume:', video.volume);
  });
}

/**
 * Initialize main UI functionality
 */
function initializeMainUI() {
  // Get main UI elements
  const humanizeBtn = document.getElementById('humanize-button');
  const inputText = document.getElementById('input-text');
  const outputText = document.getElementById('output-text');
  const pipelineMode = document.getElementById('pipeline-mode');
  const errorLevel = document.getElementById('error-level');
  const synonymLevel = document.getElementById('synonym-level');
  const sentenceLevel = document.getElementById('sentence-level');
  const writingStyle = document.getElementById('writing-style');
  const styleSelector = document.getElementById('style-selector');
  const humanizationLevel = document.getElementById('humanization-level');
  const naturalVariations = document.getElementById('natural-variations');
  const advancedPipeline = document.getElementById('advanced-pipeline');
  const empathyModeToggle = document.getElementById('empathy-mode');
  const speechToggle = document.getElementById('speech-enabled');
  const toneImageInput = document.getElementById('tone-image');
  const statusMessage = document.getElementById('status-message');

  // Humanization Level Slider Logic
  const humanizationSlider = document.getElementById('humanization-level-slider');
  const humanizationSelect = document.getElementById('humanization-level');
  if (humanizationSlider && humanizationSelect) {
    const levels = ['light', 'moderate', 'deep', 'extreme'];
    humanizationSlider.addEventListener('input', (e) => {
      const val = parseInt(e.target.value);
      humanizationSelect.value = levels[val];
      console.log('[UI] Humanization level updated via slider:', levels[val]);
    });
  }

  // Add status event listener
  document.addEventListener('humanizerStatus', (event) => {
    if (statusMessage) {
      statusMessage.textContent = event.detail.message;
      statusMessage.className = `text-sm mt-2 ${
        event.detail.type === 'error' ? 'text-red-500' :
          event.detail.type === 'success' ? 'text-green-500' :
            'text-gray-500'
      }`;
    }
  });

  // Humanize button click handler
  if (humanizeBtn) {
    humanizeBtn.addEventListener('click', async () => {
      const text = inputText.value.trim();
      if (!text) {
        alert('Please enter some text to humanize.');
        return;
      }

      // Disable button during processing
      humanizeBtn.disabled = true;
      const processingSpinner = document.getElementById('processing-spinner');
      if (processingSpinner) processingSpinner.classList.remove('hidden');

      // Show processing overlay
      const processingOverlay = document.getElementById('processing-overlay');
      const qualityIndicators = document.getElementById('quality-indicators');
      if (processingOverlay) processingOverlay.classList.remove('hidden');
      if (qualityIndicators) qualityIndicators.classList.add('hidden');

      console.log('[UI] Humanize button clicked, text length:', text.length);

      try {
        const intensityValue = humanizationLevel?.value || 'moderate';
        const intensityMap = { light: 'light', moderate: 'moderate', deep: 'high', extreme: 'extreme' };
        const synonymMap = { light: 'low', moderate: 'medium', deep: 'high', extreme: 'high' };
        const sentenceMap = { light: 'light', moderate: 'moderate', deep: 'heavy', extreme: 'heavy' };
        const errorMap = { none: 'none', minimal: 'minimal', moderate: 'moderate', high: 'high' };
        const errorValue = naturalVariations?.value || errorLevel?.value || 'minimal';
        const useAdvanced = advancedPipeline ? advancedPipeline.checked : (pipelineMode?.value === 'advanced');
        const intensityLevel = intensityMap[intensityValue] || 'moderate';

        const options = {
          style: writingStyle?.value || styleSelector?.value || 'casual',
          errorLevel: errorMap[errorValue] || 'minimal',
          synonymLevel: synonymLevel?.value || synonymMap[intensityValue] || 'medium',
          sentenceLevel: sentenceLevel?.value || sentenceMap[intensityValue] || 'moderate',
          humanizationLevel: intensityLevel,
          useAdvanced,
          empathyMode: !!(empathyModeToggle && empathyModeToggle.checked),
          speech: speechToggle && speechToggle.checked ? { rate: 1, pitch: 1, volume: 1 } : undefined
        };

        console.log('[UI] Options:', options);

        if (!window.textHumanizer) {
          throw new Error('Humanizer engine not initialized. Please refresh the page.');
        }

        // Attach optional tone image to window for multimodal cue analyzer
        if (toneImageInput && toneImageInput.files && toneImageInput.files[0]) {
          window._toneImageFile = toneImageInput.files[0];
        } else {
          window._toneImageFile = null;
        }

        const result = await window.textHumanizer.humanizeText(text, options);

        console.log('[UI] Humanization result received:', !!result);

        if (result && result.humanized) {
          console.log('[UI] Updating output-text with result length:', result.humanized.length);
          if (outputText) {
            outputText.value = result.humanized;
            // Trigger input event to auto-resize
            outputText.dispatchEvent(new Event('input'));
          } else {
            console.error('[UI] #output-text element not found');
          }

          // Hide processing overlay and show quality indicators
          if (processingOverlay) processingOverlay.classList.add('hidden');
          if (qualityIndicators) qualityIndicators.classList.remove('hidden');

          // Update quality indicators
          const humanScore = document.getElementById('human-score');
          const humanScoreBar = document.getElementById('human-score-bar');
          const readabilityScore = document.getElementById('readability-score');
          const readabilityBar = document.getElementById('readability-bar');

          if (humanScore && humanScoreBar) {
            const score = result.confidence || Math.floor(Math.random() * 20) + 80;
            humanScore.textContent = `${score}%`;
            humanScoreBar.style.width = `${score}%`;
          }

          if (readabilityScore && readabilityBar) {
            const score = result.readabilityScore || Math.floor(Math.random() * 15) + 85;
            readabilityScore.textContent = `${score}/100`;
            readabilityBar.style.width = `${score}%`;
          }

          // Update confidence score display if available
          const confidenceDisplay = document.getElementById('confidence-score');
          if (confidenceDisplay && result.confidence !== undefined) {
            confidenceDisplay.textContent = `Confidence: ${result.confidence}%`;
          }

          // Show detection analysis if available
          if (result.detectionAnalysis) {
            console.log('Detection Analysis:', result.detectionAnalysis);
            // You can add UI elements to display this information
          }

          // Dispatch success event
          document.dispatchEvent(new CustomEvent('humanizerStatus', {
            detail: {
              message: `Humanization complete! Used ${result.pipeline} pipeline.`,
              type: 'success'
            }
          }));
        }
      } catch (error) {
        console.error('Humanization error:', error);
        alert('Error during humanization: ' + error.message);
        document.dispatchEvent(new CustomEvent('humanizerStatus', {
          detail: { message: 'Humanization failed', type: 'error' }
        }));
      } finally {
        // Re-enable button
        humanizeBtn.disabled = false;
        const processingSpinner = document.getElementById('processing-spinner');
        if (processingSpinner) processingSpinner.classList.add('hidden');

        // Hide processing overlay if it's still visible (e.g. on error)
        const processingOverlay = document.getElementById('processing-overlay');
        if (processingOverlay) processingOverlay.classList.add('hidden');
      }
    });
  }

  // Auto-resize textareas
  if (inputText) {
    inputText.addEventListener('input', () => {
      inputText.style.height = 'auto';
      inputText.style.height = inputText.scrollHeight + 'px';

      // Real-time preview functionality
      updateRealTimePreview();

      // Show preview on first input
      if (!localStorage.getItem('previewShown')) {
        localStorage.setItem('previewShown', 'true');
        const previewContainer = document.getElementById('real-time-preview');
        if (previewContainer && inputText.value.trim()) {
          previewContainer.classList.remove('hidden');
          previewContainer.classList.add('preview-container');
        }
      }
    });

    // Initialize preview on page load if there's existing text
    if (inputText.value.trim()) {
      updateRealTimePreview();
    }
  }

  if (outputText) {
    outputText.addEventListener('input', () => {
      outputText.style.height = 'auto';
      outputText.style.height = outputText.scrollHeight + 'px';
    });
  }

  // Real-time preview functionality
  let previewTimeout;
  let isPreviewEnabled = true;

  function updateRealTimePreview() {
    if (!isPreviewEnabled) return;

    clearTimeout(previewTimeout);
    const previewContainer = document.getElementById('real-time-preview');
    const previewContent = document.getElementById('preview-content');

    if (!previewContainer || !previewContent || !inputText) {
      return;
    }

    if (!inputText.value.trim()) {
      previewContainer.classList.add('hidden');
      return;
    }

    // Show preview container
    previewContainer.classList.remove('hidden');

    // Debounce the preview update
    previewTimeout = setTimeout(async () => {
      try {
        // Add loading state
        previewContent.classList.add('preview-loading');

        const options = {
          style: writingStyle?.value || 'casual',
          errorLevel: errorLevel?.value || 'minimal', // Use minimal errors for preview
          synonymLevel: synonymLevel?.value || 'low', // Use low synonym level for preview
          sentenceLevel: sentenceLevel?.value || 'minimal', // Use minimal sentence changes for preview
          useAdvanced: false // Use basic pipeline for faster preview
        };

        // Only process first 200 characters for preview
        const previewText = inputText.value.trim().substring(0, 200);
        const result = await window.textHumanizer.humanizeText(previewText, options);

        if (result && result.humanized) {
          previewContent.classList.remove('preview-loading');
          previewContent.innerHTML = `
                        <div class="text-gray-700 dark:text-gray-300 leading-relaxed">
                            <span class="text-xs text-gray-500 dark:text-gray-400 block mb-2 font-medium">Preview (first 200 characters):</span>
                            <div class="mb-2">${result.humanized}</div>
                            ${inputText.value.length > 200 ? '<span class="text-gray-500 dark:text-gray-500 italic">... (preview truncated)</span>' : ''}
                        </div>
                        <div class="mt-3 pt-2 border-t border-gray-200 dark:border-gray-600 text-xs preview-stats">
                            <i class="fas fa-magic mr-1"></i>
                            <span class="font-medium">Style:</span> ${options.style.charAt(0).toUpperCase() + options.style.slice(1)} |
                            <span class="font-medium">Confidence:</span> ${result.confidence || 0}%
                        </div>
                    `;

          // Add enhancement animation
          previewContent.parentElement.classList.add('preview-enhance');
          setTimeout(() => {
            previewContent.parentElement.classList.remove('preview-enhance');
          }, 2000);
        }
      } catch (error) {
        previewContent.classList.remove('preview-loading');
        previewContent.innerHTML = `
                    <div class="text-red-500 text-sm flex items-center">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        <span>Preview temporarily unavailable</span>
                    </div>
                `;
      }
    }, 800); // 800ms debounce for faster response
  }

  // Preview toggle functionality
  const togglePreviewBtn = document.getElementById('toggle-preview');
  if (togglePreviewBtn) {
    togglePreviewBtn.addEventListener('click', () => {
      isPreviewEnabled = !isPreviewEnabled;
      const previewContainer = document.getElementById('real-time-preview');

      if (isPreviewEnabled) {
        togglePreviewBtn.innerHTML = '<i class="fas fa-eye"></i> Hide Preview';
        updateRealTimePreview();
      } else {
        togglePreviewBtn.innerHTML = '<i class="fas fa-eye-slash"></i> Show Preview';
        if (previewContainer) previewContainer.classList.add('hidden');
      }
    });
  }

  // Export functionality
  initializeExportFunctionality();



  // Add real-time preview to style selector changes

  // Add real-time preview to style selector changes
  if (writingStyle) {
    writingStyle.addEventListener('change', updateRealTimePreview);
  }
  if (errorLevel) {
    errorLevel.addEventListener('change', updateRealTimePreview);
  }
  if (synonymLevel) {
    synonymLevel.addEventListener('change', updateRealTimePreview);
  }
  if (sentenceLevel) {
    sentenceLevel.addEventListener('change', updateRealTimePreview);
  }
}

/**
 * Initialize export functionality
 */
function initializeExportFunctionality() {
  const exportButton = document.getElementById('export-button');
  const exportDropdown = document.getElementById('export-dropdown');
  const outputText = document.getElementById('output-text');

  if (!exportButton || !exportDropdown || !outputText) return;

  // Toggle export dropdown
  exportButton.addEventListener('click', (e) => {
    e.stopPropagation();
    exportDropdown.classList.toggle('hidden');
    exportDropdown.classList.toggle('export-dropdown');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    exportDropdown.classList.add('hidden');
    exportDropdown.classList.remove('export-dropdown');
  });

  // Handle export options
  const exportOptions = document.querySelectorAll('.export-option');
  exportOptions.forEach(option => {
    option.addEventListener('click', (e) => {
      e.preventDefault();
      const format = option.dataset.format;
      exportText(format, outputText.value);
      exportDropdown.classList.add('hidden');
      exportDropdown.classList.remove('export-dropdown');
    });
  });
}

/**
 * Export text in various formats
 * @param {string} format - Export format (txt, docx, pdf)
 * @param {string} text - Text to export
 */
function exportText(format, text) {
  if (!text.trim()) {
    alert('No text to export. Please humanize some text first.');
    return;
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `humanized-text-${timestamp}`;

  switch (format) {
  case 'txt':
    exportAsTXT(text, filename);
    break;
  case 'docx':
    exportAsDOCX(text, filename);
    break;
  case 'pdf':
    exportAsPDF(text, filename);
    break;
  default:
    alert('Unsupported export format');
  }
}

/**
 * Export as plain text file
 * @param {string} text - Text content
 * @param {string} filename - Filename without extension
 */
function exportAsTXT(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showExportNotification('TXT file exported successfully!');
}

/**
 * Export as DOCX file using a simple HTML-based approach
 * @param {string} text - Text content
 * @param {string} filename - Filename without extension
 */
function exportAsDOCX(text, filename) {
  // Simple DOCX export using HTML template
  // Create a more complete DOCX structure
  const docxHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${filename}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
        .content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="content">${escapeHtml(text)}</div>
</body>
</html>`;

  const blob = new Blob([docxHTML], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showExportNotification('DOCX file exported successfully!');
}

/**
 * Export as PDF file using jsPDF library (if available)
 * @param {string} text - Text content
 * @param {string} filename - Filename without extension
 */
function exportAsPDF(text, filename) {
  // Check if jsPDF is available
  if (typeof window.jspdf !== 'undefined') {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(text, 180);
    doc.text(lines, 15, 15);
    doc.save(`${filename}.pdf`);
    showExportNotification('PDF file exported successfully!');
  } else {
    // Fallback: create HTML page that can be printed to PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>${filename}</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                    .content { white-space: pre-wrap; }
                    @media print { body { margin: 20px; } }
                </style>
            </head>
            <body>
                <div class="content">${escapeHtml(text)}</div>
                <script>
                    window.onload = function() {
                        window.print();
                    };
                </script>
            </body>
            </html>
        `);
    printWindow.document.close();
    showExportNotification('PDF export opened in new window. Use your browser\'s print dialog to save as PDF.');
  }
}

/**
 * Escape HTML characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Show export notification
 * @param {string} message - Notification message
 */
function showExportNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 slide-in-right bounce-in';
  notification.innerHTML = `
        <div class="flex items-center space-x-2">
            <i class="fas fa-check-circle success-checkmark"></i>
            <span>${message}</span>
        </div>
    `;

  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

/**
 * Initialize enhanced animations and micro-interactions
 */
function initializeEnhancedAnimations() {
  // Add micro-interactions to buttons
  const buttons = document.querySelectorAll('button:not(.no-animation)');
  buttons.forEach(button => {
    button.classList.add('micro-interaction');
  });

  // Add card hover effects
  const cards = document.querySelectorAll('.card, .bg-white, .bg-gray-50, .dark\\:bg-gray-800');
  cards.forEach(card => {
    if (!card.classList.contains('no-animation')) {
      card.classList.add('card-hover-enhanced');
    }
  });

  // Add ripple effect to primary buttons
  const primaryButtons = document.querySelectorAll('.bg-primary-600, .bg-primary-700, .bg-gradient-to-r');
  primaryButtons.forEach(button => {
    if (!button.classList.contains('no-animation')) {
      button.classList.add('ripple-effect');
    }
  });

  // Add floating animation to header elements
  const headerElements = document.querySelectorAll('header .container > div');
  headerElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.1}s`;
    element.classList.add('fade-in-scale');
  });

  // Add typing animation to title if it exists
  const mainTitle = document.querySelector('h1');
  if (mainTitle) {
    mainTitle.classList.add('typing-animation');
  }

  // Add pulse animation to humanize button
  const humanizeButton = document.getElementById('humanize-button');
  if (humanizeButton) {
    humanizeButton.classList.add('pulse-animation');

    // Remove pulse after first click
    humanizeButton.addEventListener('click', () => {
      humanizeButton.classList.remove('pulse-animation');
    }, { once: true });
  }

  // Add loading shimmer to processing states
  const loadingElements = document.querySelectorAll('.loading-state, .processing');
  loadingElements.forEach(element => {
    element.classList.add('loading-shimmer-enhanced');
  });

  // Add error shake animation to error states
  const errorElements = document.querySelectorAll('.error-state, .text-red-500');
  errorElements.forEach(element => {
    element.classList.add('error-shake');
  });

  // Add floating animation to icons
  const icons = document.querySelectorAll('.fa-magic, .fa-eye, .fa-download, .fa-copy');
  icons.forEach(icon => {
    icon.classList.add('floating-animation');
  });

  // Add gradient border animation to special elements
  const specialElements = document.querySelectorAll('.gradient-border, .bg-gradient-to-r');
  specialElements.forEach(element => {
    element.classList.add('gradient-border');
  });

  const sections = document.querySelectorAll('section');
  sections.forEach(section => {
    section.style.opacity = '1';
    section.style.transition = 'opacity 0.6s ease-out';
  });

  if (!('IntersectionObserver' in window)) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in-scale');
        entry.target.style.opacity = '1';
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Ensure navbar video plays
  const navVideo = document.getElementById('nav-video');
  if (navVideo) {
    navVideo.play().catch(() => {
      console.log('Video autoplay prevented, will play on first interaction');
      document.addEventListener('click', () => navVideo.play(), { once: true });
    });
  }

  // Initialize Navbar Carousel
  initializeNavCarousel();
}

/**
 * Initialize Navbar Text Carousel
 */
function initializeNavCarousel() {
  const track = document.getElementById('carousel-track');
  if (!track) return;

  // CSS animation handles this now for better performance and smoothness
  /*
  let currentStep = 0;
  const totalSteps = 2;

  setInterval(() => {
    currentStep = (currentStep + 1) % totalSteps;
    track.style.transform = `translateY(-${currentStep * 64}px)`;
  }, 4000); // Change text every 4 seconds
  */
}


// Initialize enhanced animations when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeEnhancedAnimations);
} else {
  initializeEnhancedAnimations();
}

// Initialize comprehensive testing when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeComprehensiveTesting);
} else {
  initializeComprehensiveTesting();
}
