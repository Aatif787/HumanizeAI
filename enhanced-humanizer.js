// Enhanced AI Text Humanizer - Advanced Evasion Engine
class EnhancedTextHumanizer {
  constructor() {
    this.currentStyle = 'casual'; // Default to casual for better evasion
    this.isProcessing = false;
    this.initializeEventListeners();
    this.loadEnhancedWritingStyles();
    this.initializeAdvancedSynonymDatabase();
    this.setupThemeToggle();
  }

  // Enhanced writing styles with better evasion characteristics
  enhancedWritingStyles = {
    academic: {
      name: 'Academic',
      characteristics: {
        formal: true,
        complex: true,
        citations: true,
        passive_voice_ratio: 0.3,
        sentence_length: 'varied', // Changed from 'long' to 'varied'
        vocabulary_level: 'mixed', // Changed from 'advanced' to 'mixed'
        imperfection_ratio: 0.1 // Add slight imperfections
      },
      transitions: ['Furthermore', 'Moreover', 'Additionally', 'Consequently', 'Therefore', 'Nevertheless', 'However', 'Meanwhile', 'Similarly'],
      sentence_starters: ['It is important to note that', 'Research indicates that', 'Studies suggest that', 'Evidence shows that', 'One might argue that'],
      common_phrases: ['in conclusion', 'further research', 'empirical evidence', 'theoretical framework', 'methodological approach'],
      // Add human-like elements
      human_elements: ['personally', 'I believe', 'in my opinion', 'it seems to me', 'from my perspective']
    },
    casual: {
      name: 'Casual',
      characteristics: {
        formal: false,
        contractions: true,
        slang_ratio: 0.15, // Reduced from 0.2
        sentence_length: 'varied', // Changed from 'medium' to 'varied'
        vocabulary_level: 'conversational',
        imperfection_ratio: 0.2,
        filler_words: true
      },
      transitions: ['So', 'And', 'But', 'Anyway', 'Plus', 'Also', 'Well', 'You know', 'Like', 'I mean'],
      sentence_starters: ['You know what', 'I think that', 'Honestly', 'Actually', 'Basically', 'Well,'],
      common_phrases: ['kind of', 'sort of', 'you know', 'I mean', 'at the end of the day', 'if that makes sense'],
      filler_words: ['like', 'you know', 'I mean', 'well', 'so', 'actually', 'basically'],
      human_elements: ['I feel like', 'I\'m pretty sure', 'I guess', 'I suppose', 'probably']
    },
    creative: {
      name: 'Creative',
      characteristics: {
        metaphorical: true,
        descriptive: true,
        emotional: true,
        varied_sentence_structure: true,
        vocabulary_level: 'rich',
        imperfection_ratio: 0.15,
        poetic_license: true
      },
      transitions: ['Meanwhile', 'Suddenly', 'Gradually', 'Unexpectedly', 'Naturally', 'Effortlessly', 'Mysteriously'],
      sentence_starters: ['Imagine if', 'Picture this', 'What if', 'In a world where', 'Once upon a time', 'Picture a scene where'],
      common_phrases: ['painted with words', 'danced across the page', 'whispered secrets', 'unfolded like a story', 'came alive', 'sprang to life'],
      human_elements: ['I imagine', 'I envision', 'I picture', 'I dream of', 'I wonder']
    },
    professional: {
      name: 'Professional',
      characteristics: {
        formal: true,
        concise: true,
        action_oriented: true,
        bullet_points: true,
        vocabulary_level: 'business',
        imperfection_ratio: 0.05 // Minimal for professional
      },
      transitions: ['Additionally', 'Furthermore', 'Moreover', 'Consequently', 'Therefore', 'In addition'],
      sentence_starters: ['We recommend that', 'It is essential to', 'The data indicates', 'Our analysis shows', 'Key findings suggest'],
      common_phrases: ['strategic initiative', 'actionable insights', 'key performance indicators', 'best practices', 'deliverables', 'moving forward'],
      human_elements: ['we believe', 'our team suggests', 'in our experience', 'we have found', 'our recommendation']
    }
  };

  // Enhanced synonym database with more natural alternatives
  enhancedSynonymDatabase = {
    // AI-specific terms that are red flags
    'artificial intelligence': ['AI', 'smart technology', 'computer systems', 'automated tools', 'digital assistants', 'machine intelligence'],
    'algorithm': ['method', 'process', 'system', 'approach', 'technique', 'procedure', 'way of doing things'],
    'data analysis': ['looking at information', 'examining data', 'studying the numbers', 'checking out the data', 'data examination'],
    'implementation': ['putting into practice', 'carrying out', 'execution', 'rollout', 'deployment', 'putting in place'],
    'optimization': ['improvement', 'enhancement', 'fine-tuning', 'making better', 'refinement'],
    'methodology': ['approach', 'way of working', 'method', 'system', 'framework'],
    'systematic': ['organized', 'structured', 'methodical', 'planned', 'careful'],
    'comprehensive': ['thorough', 'complete', 'detailed', 'in-depth', 'full'],
    'significant': ['important', 'major', 'notable', 'considerable', 'substantial'],
    'utilize': ['use', 'make use of', 'employ', 'apply', 'take advantage of'],
    'demonstrate': ['show', 'prove', 'display', 'illustrate', 'reveal'],
    'facilitate': ['help', 'make easier', 'assist', 'enable', 'support'],
    'obtain': ['get', 'acquire', 'gain', 'receive', 'secure'],
    'exhibit': ['show', 'display', 'demonstrate', 'present', 'reveal'],
    'possess': ['have', 'own', 'hold', 'contain', 'feature'],
    'substantial': ['considerable', 'significant', 'large', 'major', 'important'],
    'consequently': ['so', 'therefore', 'as a result', 'thus', 'hence'],
    'nevertheless': ['however', 'still', 'yet', 'even so', 'despite that'],
    'furthermore': ['also', 'in addition', 'moreover', 'besides', 'what\'s more'],
    'moreover': ['also', 'in addition', 'furthermore', 'besides', 'plus'],
    'therefore': ['so', 'thus', 'hence', 'as a result', 'consequently'],
    'however': ['but', 'yet', 'still', 'nevertheless', 'even so'],
    'additionally': ['also', 'in addition', 'furthermore', 'besides', 'plus']
  };

  // Advanced AI patterns with more sophisticated replacements
  enhancedAiPatterns = [
    {
      pattern: /\bin conclusion[,:]/gi,
      humanized: ['so yeah,', 'basically,', 'to wrap things up,', 'at the end of the day,', 'all things considered,', 'to sum it up,'],
      weight: 0.8
    },
    {
      pattern: /\bfurthermore[,:]/gi,
      humanized: ['plus,', 'also,', 'and,', 'what\'s more,', 'on top of that,', 'besides,'],
      weight: 0.9
    },
    {
      pattern: /\bmoreover[,:]/gi,
      humanized: ['besides,', 'anyway,', 'you know what else,', 'also,', 'and', 'plus,'],
      weight: 0.9
    },
    {
      pattern: /\bhowever[,:]/gi,
      humanized: ['but,', 'though,', 'still,', 'yet,', 'even so,', 'that said,'],
      weight: 0.9
    },
    {
      pattern: /\btherefore[,:]/gi,
      humanized: ['so,', 'that\'s why,', 'which means,', 'consequently,', 'thus,', 'hence,'],
      weight: 0.8
    },
    {
      pattern: /\bit is important to note/gi,
      humanized: ['worth mentioning', 'good to know', 'keep in mind', 'remember', 'don\'t forget', 'it\'s worth noting'],
      weight: 0.7
    },
    {
      pattern: /\bit should be noted/gi,
      humanized: ['worth pointing out', 'interesting to note', 'good to mention', 'important to say', 'worth highlighting'],
      weight: 0.7
    },
    {
      pattern: /\bin summary[,:]/gi,
      humanized: ['to sum up,', 'basically,', 'in short,', 'to put it simply,', 'long story short,'],
      weight: 0.8
    },
    {
      pattern: /\bin addition[,:]/gi,
      humanized: ['also,', 'plus,', 'and,', 'what\'s more,', 'on top of that,', 'furthermore,'],
      weight: 0.8
    }
  ];

  // Enhanced human-like error patterns with more variety
  enhancedErrorPatterns = {
    none: [],
    light: [
      { pattern: /\bthe\b/g, replacement: 'teh', probability: 0.008 },
      { pattern: /\band\b/g, replacement: 'an', probability: 0.005 },
      { pattern: /\bof\b/g, replacement: 'fo', probability: 0.003 },
      { pattern: /\byour\b/g, replacement: 'you\'re', probability: 0.006 },
      { pattern: /\btheir\b/g, replacement: 'there', probability: 0.004 },
      { pattern: /\bits\b/g, replacement: 'it\'s', probability: 0.005 },
      { pattern: /\bdefinitely\b/g, replacement: 'definately', probability: 0.003 },
      { pattern: /\bseparate\b/g, replacement: 'seperate', probability: 0.002 },
      { pattern: /\bnecessary\b/g, replacement: 'neccessary', probability: 0.002 }
    ],
    medium: [
      { pattern: /\bthe\b/g, replacement: 'teh', probability: 0.015 },
      { pattern: /\band\b/g, replacement: 'an', probability: 0.01 },
      { pattern: /\byour\b/g, replacement: 'you\'re', probability: 0.012 },
      { pattern: /\btheir\b/g, replacement: 'there', probability: 0.01 },
      { pattern: /\bits\b/g, replacement: 'it\'s', probability: 0.01 },
      { pattern: /\ba lot\b/g, replacement: 'alot', probability: 0.008 },
      { pattern: /\bdefinitely\b/g, replacement: 'definately', probability: 0.008 },
      { pattern: /\bseparate\b/g, replacement: 'seperate', probability: 0.006 },
      { pattern: /\bnecessary\b/g, replacement: 'neccessary', probability: 0.006 },
      { pattern: /\boccurred\b/g, replacement: 'occured', probability: 0.005 },
      { pattern: /\baccommodate\b/g, replacement: 'accomodate', probability: 0.004 },
      { pattern: /\bapparent\b/g, replacement: 'apparant', probability: 0.004 }
    ],
    heavy: [
      { pattern: /\bthe\b/g, replacement: 'teh', probability: 0.025 },
      { pattern: /\band\b/g, replacement: 'an', probability: 0.02 },
      { pattern: /\byour\b/g, replacement: 'you\'re', probability: 0.02 },
      { pattern: /\btheir\b/g, replacement: 'there', probability: 0.018 },
      { pattern: /\bits\b/g, replacement: 'it\'s', probability: 0.018 },
      { pattern: /\ba lot\b/g, replacement: 'alot', probability: 0.015 },
      { pattern: /\bdefinitely\b/g, replacement: 'definately', probability: 0.015 },
      { pattern: /\bseparate\b/g, replacement: 'seperate', probability: 0.012 },
      { pattern: /\bnecessary\b/g, replacement: 'neccessary', probability: 0.012 },
      { pattern: /\boccurred\b/g, replacement: 'occured', probability: 0.01 },
      { pattern: /\baccommodate\b/g, replacement: 'accomodate', probability: 0.008 },
      { pattern: /\bapparent\b/g, replacement: 'apparant', probability: 0.008 },
      { pattern: /\bcalendar\b/g, replacement: 'calender', probability: 0.006 },
      { pattern: /\bcolleague\b/g, replacement: 'collegue', probability: 0.006 },
      { pattern: /\bembarrass\b/g, replacement: 'embarass', probability: 0.005 }
    ]
  };

  // Filler words and hesitations for more natural speech
  fillerWords = {
    light: ['like', 'you know', 'I mean', 'well', 'so', 'actually'],
    medium: ['like', 'you know', 'I mean', 'well', 'so', 'actually', 'basically', 'literally', 'totally', 'pretty much'],
    heavy: ['like', 'you know', 'I mean', 'well', 'so', 'actually', 'basically', 'literally', 'totally', 'pretty much', 'kinda', 'sorta', 'um', 'uh']
  };

  // Personal voice elements
  personalVoiceElements = {
    opinions: ['I think', 'I believe', 'In my opinion', 'I feel like', 'It seems to me', 'Personally', 'I suppose', 'I guess'],
    experiences: ['I\'ve noticed', 'I\'ve found that', 'In my experience', 'From what I\'ve seen', 'I\'ve learned that'],
    uncertainties: ['probably', 'maybe', 'perhaps', 'likely', 'possibly', 'I\'m pretty sure', 'I think'],
    emotions: ['honestly', 'frankly', 'truthfully', 'seriously', 'honestly speaking', 'to be honest']
  };

  initializeEventListeners() {
    // Enhanced text input events
    const inputText = document.getElementById('input-text');

    inputText.addEventListener('input', () => {
      this.updateCharacterCount();
      this.enhancedLivePreview();
    });

    // Style buttons
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.selectStyle(e.target.dataset.style);
      });
    });

    // Main action buttons
    document.getElementById('humanize-btn').addEventListener('click', () => {
      this.enhancedHumanizeText();
    });

    document.getElementById('clear-input').addEventListener('click', () => {
      this.clearInput();
    });

    document.getElementById('copy-output').addEventListener('click', () => {
      this.copyOutput();
    });

    // Export buttons
    document.getElementById('export-txt').addEventListener('click', () => {
      this.exportAsTxt();
    });

    document.getElementById('export-docx').addEventListener('click', () => {
      this.exportAsDocx();
    });

    // Mobile menu
    document.getElementById('mobile-menu-btn').addEventListener('click', () => {
      this.toggleMobileMenu();
    });
  }

  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Check for saved theme preference or default to dark
    const currentTheme = localStorage.getItem('theme') || 'dark';
    html.className = currentTheme;

    themeToggle.addEventListener('click', () => {
      const newTheme = html.className === 'dark' ? 'light' : 'dark';
      html.className = newTheme;
      localStorage.setItem('theme', newTheme);
    });
  }

  selectStyle(style) {
    this.currentStyle = style;

    // Update button states
    document.querySelectorAll('.style-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-style="${style}"]`).classList.add('active');

    // Trigger live preview if there's text
    this.enhancedLivePreview();
  }

  updateCharacterCount() {
    const inputText = document.getElementById('input-text').value;
    const outputText = document.getElementById('output-text').value;

    document.getElementById('input-count').textContent = `${inputText.length} characters`;
    document.getElementById('output-count').textContent = `${outputText.length} characters`;
  }

  enhancedLivePreview() {
    // More sophisticated live preview
    const inputText = document.getElementById('input-text').value;
    if (inputText.length < 30) return; // Lower threshold for preview

    // Apply enhanced transformations for preview
    const preview = this.applyEnhancedTransformations(inputText);
    if (preview !== inputText) {
      document.getElementById('output-text').placeholder = `Preview: ${preview.substring(0, 120)}...`;
    }
  }

  applyEnhancedTransformations(text) {
    // Enhanced transformation for preview
    let transformed = text;

    // Replace AI patterns with higher priority
    this.enhancedAiPatterns.forEach(pattern => {
      if (pattern.pattern.test(transformed)) {
        const replacement = pattern.humanized[Math.floor(Math.random() * pattern.humanized.length)];
        transformed = transformed.replace(pattern.pattern, replacement);
      }
    });

    // Add some personal voice elements
    if (Math.random() < 0.3) {
      const personalElement = this.personalVoiceElements.opinions[Math.floor(Math.random() * this.personalVoiceElements.opinions.length)];
      transformed = personalElement + ', ' + transformed.charAt(0).toLowerCase() + transformed.slice(1);
    }

    return transformed;
  }

  async enhancedHumanizeText() {
    if (this.isProcessing) return;

    const inputText = document.getElementById('input-text').value.trim();
    if (!inputText) {
      this.showMessage('Please enter some text to humanize.', 'error');
      return;
    }

    this.isProcessing = true;
    this.showProgress(true);

    try {
      // Simulate processing time for better UX
      await this.simulateEnhancedProcessing();

      const humanizedText = await this.performEnhancedHumanization(inputText);
      document.getElementById('output-text').value = humanizedText;
      this.updateCharacterCount();
      this.showMessage('Text successfully humanized with enhanced evasion!', 'success');

    } catch (error) {
      console.error('Enhanced humanization error:', error);
      this.showMessage('An error occurred during enhanced humanization. Please try again.', 'error');
    } finally {
      this.isProcessing = false;
      this.showProgress(false);
    }
  }

  async simulateEnhancedProcessing() {
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    return new Promise(resolve => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 12; // Slower, more realistic progress
        if (progress > 85) progress = 85;

        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;

        if (progress >= 85) {
          clearInterval(interval);
          setTimeout(() => {
            progressBar.style.width = '100%';
            progressText.textContent = '100%';
            setTimeout(resolve, 500);
          }, 300);
        }
      }, 200);
    });
  }

  async performEnhancedHumanization(text) {
    let humanized = text;
    const style = this.enhancedWritingStyles[this.currentStyle];
    const options = this.getHumanizationOptions();

    // Step 1: Break down AI text into manageable chunks
    const chunks = this.breakIntoChunks(humanized);
    let processedChunks = [];

    for (let chunk of chunks) {
      // Step 2: Apply enhanced style-specific transformations
      chunk = this.applyEnhancedStyleTransformations(chunk, style);

      // Step 3: Replace enhanced AI patterns
      chunk = this.replaceEnhancedAiPatterns(chunk);

      // Step 4: Apply enhanced synonym diversification
      chunk = this.applyEnhancedSynonymDiversification(chunk);

      // Step 5: Add personal voice elements
      chunk = this.injectPersonalVoice(chunk, style);

      // Step 6: Add filler words and hesitations
      chunk = this.addFillerWords(chunk, style);

      // Step 7: Vary sentence structure significantly
      chunk = this.enhancedVarySentenceStructure(chunk, style);

      // Step 8: Inject enhanced human-like errors if enabled
      if (options.errorLevel !== 'none') {
        chunk = this.injectEnhancedErrors(chunk, options.errorLevel);
      }

      // Step 9: Add natural but imperfect transitions
      chunk = this.addImperfectTransitions(chunk, style);

      // Step 10: Final enhanced polish
      chunk = this.enhancedFinalPolish(chunk);

      processedChunks.push(chunk);
    }

    humanized = processedChunks.join(' ');

    // Step 11: Add overall natural flow variations
    humanized = this.addNaturalFlowVariations(humanized);

    return humanized;
  }

  breakIntoChunks(text) {
    // Break text into sentence-level chunks for better processing
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }

  applyEnhancedStyleTransformations(text, style) {
    let transformed = text;

    // Add personal voice elements early
    if (Math.random() < 0.4) {
      const personalElement = style.human_elements[Math.floor(Math.random() * style.human_elements.length)];
      transformed = personalElement + ' ' + transformed.charAt(0).toLowerCase() + transformed.slice(1);
    }

    // Apply style-specific characteristics with more variation
    if (style.characteristics.formal) {
      // Mix formal and informal elements for natural flow
      if (Math.random() < 0.3) {
        transformed = transformed.replace(/\b(can't|cannot)\b/gi, 'cannot');
      }
      if (Math.random() < 0.2) {
        transformed = transformed.replace(/\b(won't)\b/gi, 'will not');
      }
    }

    if (style.characteristics.contractions) {
      // Add contractions but not perfectly consistently
      if (Math.random() < 0.6) {
        transformed = transformed.replace(/\b(do not)\b/gi, 'don\'t');
      }
      if (Math.random() < 0.5) {
        transformed = transformed.replace(/\b(will not)\b/gi, 'won\'t');
      }
      if (Math.random() < 0.4) {
        transformed = transformed.replace(/\b(cannot)\b/gi, 'can\'t');
      }
    }

    return transformed;
  }

  replaceEnhancedAiPatterns(text) {
    let transformed = text;

    // Apply enhanced AI pattern replacements with weighted randomness
    this.enhancedAiPatterns.forEach(pattern => {
      if (pattern.pattern.test(transformed) && Math.random() < pattern.weight) {
        const replacement = pattern.humanized[Math.floor(Math.random() * pattern.humanized.length)];
        transformed = transformed.replace(pattern.pattern, replacement);
      }
    });

    return transformed;
  }

  applyEnhancedSynonymDiversification(text) {
    let transformed = text;
    const words = Object.keys(this.enhancedSynonymDatabase);

    // Replace words with more sophisticated variation
    words.forEach(word => {
      if (Math.random() < 0.4) { // 40% chance to replace each word
        const synonyms = this.enhancedSynonymDatabase[word];
        const replacement = synonyms[Math.floor(Math.random() * synonyms.length)];
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        transformed = transformed.replace(regex, replacement);
      }
    });

    return transformed;
  }

  injectPersonalVoice(text, style) {
    let transformed = text;

    // Add personal opinions
    const opinionChance = style?.characteristics?.formal ? 0.15 : 0.3;
    if (Math.random() < opinionChance) {
      const opinion = this.personalVoiceElements.opinions[Math.floor(Math.random() * this.personalVoiceElements.opinions.length)];
      transformed = opinion + ' ' + transformed.charAt(0).toLowerCase() + transformed.slice(1);
    }

    // Add personal experiences
    if (Math.random() < 0.2) {
      const experience = this.personalVoiceElements.experiences[Math.floor(Math.random() * this.personalVoiceElements.experiences.length)];
      if (Math.random() < 0.5) {
        transformed = experience + ', ' + transformed.charAt(0).toLowerCase() + transformed.slice(1);
      }
    }

    // Add uncertainties
    if (Math.random() < 0.25) {
      const uncertainty = this.personalVoiceElements.uncertainties[Math.floor(Math.random() * this.personalVoiceElements.uncertainties.length)];
      // Insert uncertainty into appropriate places
      const sentences = transformed.split('. ');
      if (sentences.length > 1 && Math.random() < 0.5) {
        sentences[1] = uncertainty + ' ' + sentences[1];
        transformed = sentences.join('. ');
      }
    }

    // Add emotional expressions
    if (Math.random() < 0.15) {
      const emotion = this.personalVoiceElements.emotions[Math.floor(Math.random() * this.personalVoiceElements.emotions.length)];
      transformed = emotion + ', ' + transformed;
    }

    return transformed;
  }

  addFillerWords(text, style) {
    if (!style.characteristics.filler_words) return text;

    let transformed = text;
    const fillers = this.fillerWords[style.characteristics.filler_words === true ? 'medium' : style.characteristics.filler_words];

    // Add filler words at natural break points
    const sentences = transformed.split('. ');
    for (let i = 0; i < sentences.length; i++) {
      if (Math.random() < 0.2) { // 20% chance per sentence
        const filler = fillers[Math.floor(Math.random() * fillers.length)];
        sentences[i] = filler + ' ' + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
      }
    }

    return sentences.join('. ');
  }

  enhancedVarySentenceStructure(text, style) {
    let sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    let transformed = '';

    sentences.forEach((sentence, index) => {
      sentence = sentence.trim();

      // Vary sentence length significantly
      if (style.characteristics.sentence_length === 'varied') {
        if (Math.random() < 0.3) {
          // Make some sentences very short
          if (sentence.length > 50 && Math.random() < 0.5) {
            const shortVersion = sentence.split(',')[0] + '.';
            sentence = shortVersion;
          }
        }
        if (Math.random() < 0.2) {
          // Make some sentences longer by combining
          if (index < sentences.length - 1 && Math.random() < 0.3) {
            sentence += '; ' + sentences[index + 1];
            sentences.splice(index + 1, 1);
          }
        }
      }

      // Add sentence starters with variation
      if (index === 0 && style.sentence_starters && Math.random() < 0.3) {
        const starter = style.sentence_starters[Math.floor(Math.random() * style.sentence_starters.length)];
        sentence = starter + ' ' + sentence.charAt(0).toLowerCase() + sentence.slice(1);
      }

      transformed += sentence + '. ';
    });

    return transformed.trim();
  }

  injectEnhancedErrors(text, errorLevel) {
    let transformed = text;
    const errors = this.enhancedErrorPatterns[errorLevel] || [];

    errors.forEach(error => {
      if (Math.random() < error.probability) {
        const regex = new RegExp(error.pattern, 'gi');
        transformed = transformed.replace(regex, error.replacement);
      }
    });

    // Add additional natural errors
    if (errorLevel === 'heavy' && Math.random() < 0.05) {
      // Add double spaces occasionally
      transformed = transformed.replace(/\./g, '.  ');
    }

    if (errorLevel === 'medium' && Math.random() < 0.03) {
      // Add missing punctuation
      const sentences = transformed.split('. ');
      for (let i = 0; i < sentences.length; i++) {
        if (Math.random() < 0.1) {
          sentences[i] = sentences[i].replace(/\.$/, '');
        }
      }
      transformed = sentences.join('. ');
    }

    return transformed;
  }

  addImperfectTransitions(text, style) {
    let transformed = text;

    // Add natural but imperfect transitions
    const imperfectTransitions = ['So,', 'And then,', 'But anyway,', 'Well,', 'You know,', 'Like,', 'Actually,'];
    const transitionChance = style?.characteristics?.formal ? 0.08 : 0.15;

    // Insert imperfect transitions at random points
    const sentences = transformed.split('. ');
    for (let i = 1; i < sentences.length; i++) {
      if (Math.random() < transitionChance) {
        const transition = imperfectTransitions[Math.floor(Math.random() * imperfectTransitions.length)];
        sentences[i] = transition + ' ' + sentences[i].charAt(0).toLowerCase() + sentences[i].slice(1);
      }
    }

    transformed = sentences.join('. ');

    // Add paragraph-level transitions
    const paragraphs = transformed.split('\n\n');
    for (let i = 1; i < paragraphs.length; i++) {
      if (Math.random() < 0.3) {
        const transition = imperfectTransitions[Math.floor(Math.random() * imperfectTransitions.length)];
        paragraphs[i] = transition + ' ' + paragraphs[i].charAt(0).toLowerCase() + paragraphs[i].slice(1);
      }
    }

    return paragraphs.join('\n\n');
  }

  addNaturalFlowVariations(text) {
    let transformed = text;

    // Add rhetorical questions occasionally
    if (Math.random() < 0.1) {
      const questions = ['Right?', 'You know?', 'Make sense?', 'See what I mean?', 'Follow me?'];
      const question = questions[Math.floor(Math.random() * questions.length)];
      transformed += ' ' + question;
    }

    // Add interjections
    if (Math.random() < 0.08) {
      const interjections = ['Oh,', 'Well,', 'Hmm,', 'Ah,', 'Hey,'];
      const interjection = interjections[Math.floor(Math.random() * interjections.length)];
      transformed = interjection + ' ' + transformed.charAt(0).toLowerCase() + transformed.slice(1);
    }

    // Add parenthetical expressions
    if (Math.random() < 0.06) {
      const parentheses = ['(you know)', '(I think)', '(probably)', '(if that makes sense)', '(well)'];
      const parenthetical = parentheses[Math.floor(Math.random() * parentheses.length)];
      const sentences = transformed.split('. ');
      if (sentences.length > 1) {
        const insertIndex = Math.floor(Math.random() * (sentences.length - 1)) + 1;
        sentences[insertIndex] = sentences[insertIndex] + ' ' + parenthetical;
        transformed = sentences.join('. ');
      }
    }

    return transformed;
  }

  enhancedFinalPolish(text) {
    // Enhanced final polish with intentional imperfections
    let polished = text;

    // Clean up major issues but leave some character
    polished = polished.replace(/\s{3,}/g, '  '); // Allow double spaces
    polished = polished.replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => p1 + ' ' + p2.toUpperCase());

    // Occasionally leave minor imperfections
    if (Math.random() < 0.05) {
      // Leave a double space or minor inconsistency
      const sentences = polished.split('. ');
      if (sentences.length > 2) {
        const randomIndex = Math.floor(Math.random() * (sentences.length - 1)) + 1;
        sentences[randomIndex] = '  ' + sentences[randomIndex]; // Add double space
        polished = sentences.join('. ');
      }
    }

    return polished.trim();
  }

  getHumanizationOptions() {
    return {
      humanizationLevel: document.getElementById('humanization-level').value,
      errorLevel: document.getElementById('error-level').value,
      preserveFormatting: document.getElementById('preserve-formatting').checked,
      addTransitions: document.getElementById('add-transitions').checked
    };
  }

  showProgress(show) {
    const progressContainer = document.getElementById('progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const humanizeBtn = document.getElementById('humanize-btn');

    if (show) {
      progressContainer.classList.remove('hidden');
      progressBar.style.width = '0%';
      progressText.textContent = '0%';
      humanizeBtn.disabled = true;
      humanizeBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enhancing...';
    } else {
      progressContainer.classList.add('hidden');
      humanizeBtn.disabled = false;
      humanizeBtn.innerHTML = '<i class="fas fa-magic mr-2"></i>Humanize Text';
    }
  }

  showMessage(message, type) {
    // Create and show a temporary message
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 px-6 py-3 rounded-lg z-50 animate-slide-up ${
      type === 'success' ? 'bg-green-900 border border-green-700 text-green-300' : 'bg-red-900 border border-red-700 text-red-300'
    }`;
    messageDiv.textContent = message;

    document.body.appendChild(messageDiv);

    setTimeout(() => {
      messageDiv.remove();
    }, 3000);
  }

  clearInput() {
    document.getElementById('input-text').value = '';
    document.getElementById('output-text').value = '';
    this.updateCharacterCount();
    this.showMessage('Input cleared!', 'success');
  }

  async copyOutput() {
    const outputText = document.getElementById('output-text').value;
    if (!outputText) {
      this.showMessage('No text to copy!', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(outputText);
      this.showMessage('Text copied to clipboard!', 'success');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = outputText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showMessage('Text copied to clipboard!', 'success');
    }
  }

  exportAsTxt() {
    const outputText = document.getElementById('output-text').value;
    if (!outputText) {
      this.showMessage('No text to export!', 'error');
      return;
    }

    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced-humanized-text-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showMessage('Text exported as .txt file!', 'success');
  }

  exportAsDocx() {
    const outputText = document.getElementById('output-text').value;
    if (!outputText) {
      this.showMessage('No text to export!', 'error');
      return;
    }

    // Create a simple HTML document that can be opened as .docx
    const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Enhanced Humanized Text</title>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
                    .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                    .content { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Enhanced Humanized Text</h1>
                    <p>Generated on ${new Date().toLocaleDateString()} with advanced evasion techniques</p>
                </div>
                <div class="content">${outputText.replace(/\n/g, '<br>')}</div>
            </body>
            </html>
        `;

    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enhanced-humanized-text-${new Date().toISOString().slice(0, 10)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showMessage('Text exported as .doc file!', 'success');
  }

  toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenu.classList.toggle('hidden');
  }

  loadEnhancedWritingStyles() {
    console.log('Enhanced writing styles loaded:', Object.keys(this.enhancedWritingStyles));
  }

  initializeAdvancedSynonymDatabase() {
    console.log('Advanced synonym database initialized with', Object.keys(this.enhancedSynonymDatabase).length, 'phrases');
  }
}

// Initialize the enhanced application
document.addEventListener('DOMContentLoaded', () => {
  // Replace the original humanizer with the enhanced version
  window.textHumanizer = new EnhancedTextHumanizer();

  // Update the humanize button to use the enhanced version
  document.getElementById('humanize-btn').addEventListener('click', () => {
    window.textHumanizer.enhancedHumanizeText();
  });
});

// Enhanced keyboard shortcuts
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter to humanize
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault();
    if (window.textHumanizer) {
      window.textHumanizer.enhancedHumanizeText();
    }
  }

  // Ctrl/Cmd + L to clear input
  if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
    e.preventDefault();
    if (window.textHumanizer) {
      window.textHumanizer.clearInput();
    }
  }

  // Ctrl/Cmd + C to copy output (when output is focused)
  if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement.id === 'output-text') {
    // Let default copy behavior work
    setTimeout(() => {
      if (window.textHumanizer) {
        window.textHumanizer.showMessage('Text copied to clipboard!', 'success');
      }
    }, 100);
  }
});
