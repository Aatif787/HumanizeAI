console.log('[AdvancedHumanizer] v1.1.8 loaded - FORCE DEPLOY');

class AdvancedTextHumanizer {
  constructor() {
    this.initializeEngines();
    this.loadDatabases();
  }

  initializeEngines() {
    this.semanticEngine = new SemanticDisassemblyEngine();
    this.styleSynthesizer = new HumanStyleSynthesizer();
    this.stylisticEngine = new StylisticReengineeringEngine();
    this.plagiarismChecker = new AIPlagiarismChecker();
    this.obfuscationEngine = new PatternObfuscationEngine();
    this.humanVerifier = new HumanVerificationEngine();
    this.aiDetector = new AdvancedAIDetector();
  }

  loadDatabases() {
    this.humanWritingDatabase = this.buildHumanWritingDatabase();
    this.aiPatternDatabase = this.buildAIPatternDatabase();
    this.semanticTemplates = this.buildSemanticTemplates();
  }

  async humanizeText(text, options = {}) {
    let config = {
      style: 'adaptive',
      complexity: 'medium',
      emotion: 'neutral',
      formality: 'adaptive',
      culturalContext: 'general',
      preserveFacts: true,
      maxRetries: 3,
      ...options
    };

    const startTime = Date.now();
    let currentText = text;
    let attempts = 0;
    let lastValidation = null;

    while (attempts < config.maxRetries) {
      try {
        attempts++;
        console.log(`🚀 Humanization attempt ${attempts}/${config.maxRetries}`);

        // Stage 0: Fact Extraction & Protection
        const factDatabase = this.extractFacts(currentText);

        // Stage 1: Semantic Disassembly
        const semanticAnalysis = this.semanticEngine.disassemble(currentText);

        // Stage 2: Human Style Synthesis
        const humanizedComponents = this.styleSynthesizer.synthesize(semanticAnalysis, config);

        // Stage 3: Stylistic Reengineering
        const reengineeredText = this.stylisticEngine.reengineer(humanizedComponents, config);

        // Stage 4: Plagiarism Elimination
        const uniqueText = await this.plagiarismChecker.ensureUniqueness(reengineeredText);

        // Stage 5: Pattern Obfuscation
        const obfuscatedText = this.obfuscationEngine.obfuscate(uniqueText);

        // Stage 6: Human Verification
        const verifiedText = this.humanVerifier.verify(obfuscatedText, { errorLevel: config.errorLevel || 'moderate' });

        // Stage 7: Fact Reinjection
        const finalText = config.preserveFacts ? this.reinjectFacts(verifiedText, factDatabase) : verifiedText;

        // Final validation
        lastValidation = await this.validateOutput(finalText);

        if (lastValidation.detectionRisk === 'minimal' || lastValidation.detectionRisk === 'low') {
          return {
            success: true,
            originalText: text,
            humanizedText: finalText,
            confidenceScore: lastValidation.confidence,
            transformations: lastValidation.transformations,
            detectionRisk: lastValidation.detectionRisk,
            analysis: lastValidation.analysis,
            metadata: {
              attempts,
              semanticComplexity: semanticAnalysis.complexity,
              processingTime: Date.now() - startTime
            }
          };
        }

        // If risk is too high, adjust parameters for next attempt
        console.log(`⚠️ Risk too high (${lastValidation.detectionRisk}). Refining...`);
        config.style = attempts === 1 ? 'creative' : 'casual';
        config.errorLevel = attempts === 1 ? 'moderate' : 'high';
        currentText = finalText; // Refine on top of previous output

      } catch (error) {
        console.error(`Attempt ${attempts} failed:`, error);
        if (attempts >= config.maxRetries) throw error;
      }
    }

    // Return the best attempt if we didn't reach 'low' risk
    return {
      success: true,
      originalText: text,
      humanizedText: currentText,
      confidenceScore: lastValidation.confidence,
      detectionRisk: lastValidation.detectionRisk,
      analysis: lastValidation.analysis,
      metadata: {
        attempts,
        processingTime: Date.now() - startTime,
        status: 'max_retries_reached'
      }
    };
  }

  extractFacts(text) {
    // Identify and protect facts (dates, numbers, names, specific entities)
    const facts = [];
    
    // Dates
    const dates = text.match(/\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi) || [];
    dates.forEach(date => facts.push({ type: 'date', value: date }));
    
    // Numbers/Stats
    const numbers = text.match(/\b\d+(?:\.\d+)?%?|\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g) || [];
    numbers.forEach(num => facts.push({ type: 'number', value: num }));
    
    // Proper Nouns (Simplified capitalized word sequences)
    const properNouns = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    properNouns.forEach(name => {
      // Filter out sentence starters
      if (!text.startsWith(name)) {
        facts.push({ type: 'entity', value: name });
      }
    });
    
    return facts;
  }

  reinjectFacts(text, factDatabase) {
    let restored = text;
    // Ensure all extracted facts are present in the final output
    // This is a simplified implementation - in a real scenario, we'd use semantic mapping
    factDatabase.forEach(fact => {
      if (!restored.toLowerCase().includes(fact.value.toLowerCase())) {
        // If a fact was lost, we'd Semantically find where it belongs
        // For now, we log it or append it as a "clarification"
        console.warn(`Fact lost during humanization: ${fact.value}`);
      }
    });
    return restored;
  }

  async validateOutput(humanizedText) {
    // Real-time analysis using AdvancedAIDetector
    const analysis = this.aiDetector.analyzeText(humanizedText);
    
    // Risk assessment based on real detection metrics
    const confidence = 100 - analysis.overallScore;
    const riskLevel = analysis.riskLevel;

    return {
      confidence: Math.round(confidence),
      detectionRisk: riskLevel,
      analysis: {
        gptScore: analysis.gptScore,
        claudeScore: analysis.claudeScore,
        formalScore: analysis.formalScore,
        overallScore: analysis.overallScore
      },
      transformations: {
        semantic: true,
        stylistic: true,
        patternObfuscation: true,
        humanVerification: true
      }
    };
  }

  buildHumanWritingDatabase() {
    return {
      casual: {
        contractions: ['don\'t', 'won\'t', 'can\'t', 'shouldn\'t', 'wouldn\'t', 'couldn\'t', 'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t'],
        fillers: ['you know', 'like', 'kind of', 'sort of', 'basically', 'actually', 'honestly', 'frankly', 'I mean', 'to be fair', 'at the end of the day'],
        informal: ['gonna', 'wanna', 'gotta', 'kinda', 'sorta', 'lemme', 'gimme', 'reckon', 'dunno', 'see ya'],
        questions: ['right?', 'you know?', 'don\'t you think?', 'wouldn\'t you say?', 'if that makes sense?', 'you get what I mean?'],
        exclamations: ['wow!', 'oh!', 'ah!', 'hey!', 'jeez!', 'man!', 'gosh!', 'holy cow!', 'no way!']
      },
      academic: {
        hedging: ['may', 'might', 'could', 'would', 'should', 'perhaps', 'possibly', 'potentially', 'arguably', 'conceivably'],
        formal: ['furthermore', 'moreover', 'additionally', 'consequently', 'therefore', 'thus', 'hence', 'notwithstanding', 'conversely'],
        cautious: ['appears to', 'seems to', 'tends to', 'is likely to', 'suggests that', 'indicates that', 'points toward', 'leads one to believe'],
        references: ['according to', 'as stated by', 'in the words of', 'as mentioned by', 'as described in', 'as evidenced by', 'drawing from']
      },
      creative: {
        metaphors: ['like a', 'as if', 'metaphorically speaking', 'figuratively', 'symbolically', 'akin to', 'reminiscent of'],
        imagery: ['vividly', 'brightly', 'darkly', 'mysteriously', 'brilliantly', 'subtly', 'hauntingly', 'ethereally'],
        emotional: ['heartfelt', 'passionate', 'intense', 'profound', 'moving', 'touching', 'powerful', 'gut-wrenching', 'soul-stirring'],
        poetic: ['whisper', 'echo', 'dance', 'flow', 'bloom', 'soar', 'linger', 'unfold', 'shimmer', 'cascade']
      },
      professional: {
        business: ['strategic', 'efficient', 'effective', 'productive', 'optimized', 'streamlined', 'scalable', 'synergistic', 'bottom-line'],
        technical: ['implementation', 'integration', 'deployment', 'configuration', 'customization', 'optimization', 'architecture', 'infrastructure'],
        action: ['drive', 'leverage', 'execute', 'deliver', 'achieve', 'accomplish', 'implement', 'facilitate', 'orchestrate', 'spearhead'],
        results: ['outcomes', 'deliverables', 'metrics', 'KPIs', 'ROI', 'performance', 'impact', 'milestones', 'benchmarks']
      },
      cultural: {
        american: { idioms: ['ballpark figure', 'touch base', 'circle back', 'drill down', 'low-hanging fruit', 'shoot the breeze', 'barking up the wrong tree'] },
        british: { idioms: ['chuffed to bits', 'taking the mickey', 'throw a spanner', 'bits and bobs', 'full of beans', 'not my cup of tea'] },
        australian: { idioms: ['no worries', 'she\'ll be right', 'fair dinkum', 'arvo', 'brekkie', 'flat out like a lizard drinking'] }
      },
      domainSpecific: {
        legal: ['pursuant to', 'herein', 'notwithstanding', 'aforementioned', 'burden of proof', 'due diligence'],
        medical: ['prognosis', 'symptomatic', 'efficacy', 'contraindicated', 'manifestation', 'clinical presentation'],
        tech: ['legacy system', 'technical debt', 'agile methodology', 'low-latency', 'end-to-end encryption'],
        marketing: ['customer journey', 'brand awareness', 'conversion rate', 'market penetration', 'segmentation']
      }
    };
  }

  buildAIPatternDatabase() {
    return {
      repetitiveStructures: [
        /\bin today's\s+\w+\s+landscape\b/gi,
        /\bit is (important|crucial|essential|vital) to note\b/gi,
        /\bplays? a (crucial|important|significant|vital) role\b/gi,
        /\bin conclusion\b/gi,
        /\bfurthermore,/gi,
        /\bmoreover,/gi,
        /\badditionally,/gi
      ],
      formalAcademic: [
        /\butilize\b/gi,
        /\bimplementation\b/gi,
        /\bfacilitate\b/gi,
        /\boptimization\b/gi,
        /\bleverage\b/gi
      ],
      passiveVoice: [
        /\b(is|are|was|were|being|been)\s+\w+ed\b/gi,
        /\b(have|has|had)\s+been\s+\w+ed\b/gi
      ],
      aiPhrases: [
        /\bit should be noted that\b/gi,
        /\bit is worth mentioning that\b/gi,
        /\bit is important to understand that\b/gi,
        /\bas mentioned (earlier|previously)\b/gi,
        /\bto put it simply\b/gi
      ],
      statisticalLanguage: [
        /\ba (significant|large|substantial) (number|amount|portion) of\b/gi,
        /\bthe majority of\b/gi,
        /\bthe vast majority of\b/gi
      ]
    };
  }

  buildSemanticTemplates() {
    return {
      sentenceStructures: {
        simple: ['Subject + Verb + Object', 'Subject + Verb + Complement'],
        compound: ['Independent clause + coordinating conjunction + independent clause'],
        complex: ['Dependent clause + independent clause', 'Independent clause + dependent clause'],
        compoundComplex: ['Independent clause + dependent clause + coordinating conjunction + independent clause']
      },
      paragraphStructures: {
        descriptive: ['Topic sentence → Supporting details → Examples → Conclusion'],
        narrative: ['Hook → Background → Rising action → Climax → Resolution'],
        persuasive: ['Claim → Evidence → Reasoning → Counterargument → Rebuttal'],
        expository: ['Introduction → Explanation → Examples → Analysis → Conclusion']
      }
    };
  }
}

// Stage 1: Semantic Disassembly Engine
class SemanticDisassemblyEngine {
  disassemble(text) {
    const sentences = this.segmentSentences(text);
    const semanticUnits = this.extractSemanticUnits(sentences);
    const aiPatterns = this.identifyAIPatterns(text);
    const complexity = this.analyzeComplexity(text);
    const thoughtFlow = this.analyzeThoughtFlow(text);

    return {
      originalText: text,
      sentences,
      semanticUnits,
      aiPatterns,
      complexity,
      thoughtFlow,
      metadata: {
        sentenceCount: sentences.length,
        avgSentenceLength: this.calculateAvgSentenceLength(sentences),
        formalityScore: this.assessFormality(text),
        emotionalTone: this.detectEmotionalTone(text)
      }
    };
  }

  analyzeThoughtFlow(text) {
    // Analyze how ideas are connected (logical progression vs. human-like associative jumps)
    const sentences = this.segmentSentences(text);
    const flow = [];
    
    for (let i = 0; i < sentences.length - 1; i++) {
      const current = sentences[i];
      const next = sentences[i+1];
      
      flow.push({
        transitionType: this.identifyTransitionType(current, next),
        coherenceScore: this.calculateCoherence(current, next),
        semanticJump: this.calculateSemanticJump(current, next)
      });
    }
    
    return flow;
  }

  identifyTransitionType(s1, s2) {
    const logicalMarkers = /\b(therefore|consequently|thus|hence|accordingly)\b/gi;
    const additiveMarkers = /\b(furthermore|moreover|additionally|also)\b/gi;
    const contrastMarkers = /\b(however|nevertheless|nonetheless|but|yet)\b/gi;
    
    if (s2.match(logicalMarkers)) return 'logical_consequence';
    if (s2.match(additiveMarkers)) return 'additive_expansion';
    if (s2.match(contrastMarkers)) return 'adversative_contrast';
    
    return 'associative_jump';
  }

  calculateCoherence(s1, s2) {
    const words1 = new Set(s1.toLowerCase().match(/\b\w+\b/g));
    const words2 = new Set(s2.toLowerCase().match(/\b\w+\b/g));
    const intersection = [...words1].filter(w => words2.has(w));
    return intersection.length / Math.max(1, Math.min(words1.size, words2.size));
  }

  calculateSemanticJump(s1, s2) {
    // High score means ideas are very different (human-like pivot)
    return 1 - this.calculateCoherence(s1, s2);
  }

  segmentSentences(text) {
    return text.match(/[^.!?]+[.!?]+/g) || [text];
  }

  extractSemanticUnits(sentences) {
    return sentences.map(sentence => ({
      original: sentence.trim(),
      subject: this.extractSubject(sentence),
      predicate: this.extractPredicate(sentence),
      objects: this.extractObjects(sentence),
      modifiers: this.extractModifiers(sentence),
      tense: this.identifyTense(sentence),
      voice: this.identifyVoice(sentence),
      semanticRole: this.identifySemanticRole(sentence)
    }));
  }

  identifyAIPatterns(text) {
    const patterns = [];

    // Check for AI writing patterns
    const aiPatterns = [
      /\bin today's\s+\w+\s+landscape\b/gi,
      /\bit is (important|crucial|essential|vital) to note\b/gi,
      /\bplays? a (crucial|important|significant|vital) role\b/gi,
      /\bfurthermore,/gi,
      /\bmoreover,/gi,
      /\badditionally,/gi,
      /\bin conclusion\b/gi,
      /\butilize\b/gi,
      /\bimplementation\b/gi,
      /\bleverage\b/gi
    ];

    aiPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        patterns.push({
          pattern: pattern.source,
          matches: matches,
          severity: matches.length * 10
        });
      }
    });

    return patterns;
  }

  extractSubject(sentence) {
    // Simplified subject extraction
    const words = sentence.split(' ');
    return words.slice(0, Math.min(3, words.length)).join(' ');
  }

  extractPredicate(sentence) {
    // Simplified predicate extraction
    const words = sentence.split(' ');
    const verbIndex = words.findIndex(word => this.isLikelyVerb(word));
    return verbIndex !== -1 ? words.slice(verbIndex).join(' ') : sentence;
  }

  extractObjects(sentence) {
    // Simplified object extraction
    return sentence.match(/\b(the|a|an)\s+(\w+)/g) || [];
  }

  extractModifiers(sentence) {
    // Extract adjectives and adverbs
    return sentence.match(/\b(\w+ly|\w+ful|\w+less|\w+ous|\w+ive)\b/g) || [];
  }

  identifyTense(sentence) {
    const pastWords = /\b(was|were|had|did|went|came|said|told|made)\b/gi;
    const presentWords = /\b(is|are|have|do|go|come|say|tell|make)\b/gi;
    const futureWords = /\b(will|shall|going to|about to)\b/gi;

    if (sentence.match(futureWords)) return 'future';
    if (sentence.match(pastWords)) return 'past';
    if (sentence.match(presentWords)) return 'present';
    return 'unknown';
  }

  identifyVoice(sentence) {
    const passivePattern = /\b(is|are|was|were|being|been)\s+\w+ed\b/gi;
    return sentence.match(passivePattern) ? 'passive' : 'active';
  }

  identifySemanticRole(sentence) {
    const descriptive = /\b(beautiful|large|small|important|significant|interesting)\b/gi;
    const action = /\b(run|jump|write|speak|create|build|develop)\b/gi;
    const cognitive = /\b(think|believe|understand|know|realize|consider)\b/gi;

    if (sentence.match(cognitive)) return 'cognitive';
    if (sentence.match(action)) return 'action';
    if (sentence.match(descriptive)) return 'descriptive';
    return 'neutral';
  }

  analyzeComplexity(text) {
    const sentences = this.segmentSentences(text);
    const avgLength = sentences.reduce((acc, sent) => acc + sent.split(' ').length, 0) / sentences.length;
    const longWords = text.match(/\b\w{7,}\b/g) || [];
    const complexStructures = text.match(/[,;:]/) || [];

    return {
      level: avgLength > 20 || longWords.length > text.split(' ').length * 0.2 ? 'high' :
        avgLength > 15 ? 'medium' : 'low',
      avgSentenceLength: avgLength,
      longWordRatio: longWords.length / text.split(' ').length,
      structuralComplexity: complexStructures.length
    };
  }

  calculateAvgSentenceLength(sentences) {
    return sentences.reduce((acc, sent) => acc + sent.split(' ').length, 0) / sentences.length;
  }

  assessFormality(text) {
    const formalWords = /\b(utilize|implement|facilitate|optimize|leverage|substantial|significant)\b/gi;
    const informalWords = /\b(like|gonna|wanna|kinda|sorta|yeah|nah)\b/gi;

    const formalMatches = text.match(formalWords) || [];
    const informalMatches = text.match(informalWords) || [];

    // Use neutralWords to avoid unused variable warning
    // const _neutralWords = text.match(/\b(is|are|was|were|have|has|do|does)\b/gi) || [];

    return formalMatches.length > informalMatches.length ? 'formal' : 'informal';
  }

  detectEmotionalTone(text) {
    const positiveWords = /\b(good|great|excellent|amazing|wonderful|fantastic|love|enjoy)\b/gi;
    const negativeWords = /\b(bad|terrible|awful|horrible|hate|dislike|problem|issue)\b/gi;
    // const neutralWords = /\b(is|are|was|were|have|has|do|does)\b/gi; // Reserved for future use

    const positive = text.match(positiveWords) || [];
    const negative = text.match(negativeWords) || [];

    if (positive.length > negative.length) return 'positive';
    if (negative.length > positive.length) return 'negative';
    return 'neutral';
  }

  isLikelyVerb(word) {
    const commonVerbs = ['is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'can', 'may', 'might', 'must', 'shall'];
    return commonVerbs.includes(word.toLowerCase()) || word.match(/\w+ed$|\w+ing$/);
  }
}

// Stage 2: Human Style Synthesizer
class HumanStyleSynthesizer {
  synthesize(semanticAnalysis, config) {
    const synthesizedUnits = semanticAnalysis.semanticUnits.map(unit =>
      this.synthesizeUnit(unit, config)
    );

    return {
      originalAnalysis: semanticAnalysis,
      synthesizedUnits,
      styleProfile: this.buildStyleProfile(config),
      culturalMarkers: this.addCulturalMarkers(config.culturalContext),
      emotionalInflections: this.addEmotionalInflections(config.emotion)
    };
  }

  synthesizeUnit(unit, config) {
    const styleElements = this.selectStyleElements(config.style);
    const sentenceStructure = this.chooseSentenceStructure(unit, config.complexity);
    const vocabulary = this.selectVocabulary(unit, config.formality);
    const emotionalTone = this.applyEmotionalTone(unit, config.emotion);

    return {
      original: unit.original,
      synthesized: this.reconstructSentence(unit, styleElements, sentenceStructure, vocabulary, emotionalTone),
      transformations: {
        style: styleElements,
        structure: sentenceStructure,
        vocabulary: vocabulary,
        emotion: emotionalTone
      }
    };
  }

  selectStyleElements(style) {
    const styleDatabase = {
      casual: {
        contractions: 0.7,
        fillers: 0.1,
        informal: 0.4,
        questions: 0.2,
        exclamations: 0.1
      },
      academic: {
        hedging: 0.6,
        formal: 0.8,
        cautious: 0.5,
        references: 0.3
      },
      creative: {
        metaphors: 0.4,
        imagery: 0.5,
        emotional: 0.6,
        poetic: 0.3
      },
      professional: {
        business: 0.6,
        technical: 0.5,
        action: 0.7,
        results: 0.4
      }
    };

    return styleDatabase[style] || styleDatabase.casual;
  }

  chooseSentenceStructure(_unit, _complexity) {
    // const structures = { // Reserved for future use
    //   simple: ['Subject-Verb-Object', 'Subject-Verb-Complement'],
    //   compound: ['Independent + coordinating conjunction + independent'],
    //   complex: ['Dependent + independent', 'Independent + dependent'],
    //   compoundComplex: ['Independent + dependent + coordinating conjunction + independent']
    // };

    const complexityMap = { low: 'simple', medium: 'compound', high: 'complex' };
    const chosenComplexity = complexityMap[_complexity] || 'medium';

    return {
      type: chosenComplexity,
      variation: this.addStructuralVariation(chosenComplexity),
      length: this.adjustLengthBasedOnComplexity(_unit.original, chosenComplexity)
    };
  }

  selectVocabulary(_unit, formality) {
    const vocabularySets = {
      formal: {
        replacements: {
          'use': 'utilize',
          'help': 'facilitate',
          'make': 'create',
          'get': 'obtain',
          'big': 'substantial',
          'important': 'significant'
        }
      },
      informal: {
        replacements: {
          'utilize': 'use',
          'facilitate': 'help',
          'create': 'make',
          'obtain': 'get',
          'substantial': 'big',
          'significant': 'important'
        }
      }
    };

    return vocabularySets[formality] || vocabularySets.informal;
  }

  applyEmotionalTone(_unit, emotion) {
    const emotionalMarkers = {
      positive: {
        words: ['great', 'wonderful', 'excellent', 'amazing', 'fantastic', 'love', 'enjoy'],
        intensity: 0.3
      },
      negative: {
        words: ['terrible', 'awful', 'horrible', 'hate', 'dislike', 'problem', 'issue'],
        intensity: 0.3
      },
      neutral: {
        words: [],
        intensity: 0
      },
      enthusiastic: {
        words: ['incredible', 'amazing', 'fantastic', 'brilliant', 'outstanding'],
        intensity: 0.6
      },
      skeptical: {
        words: ['allegedly', 'supposedly', 'apparently', 'seemingly', 'reportedly'],
        intensity: 0.4
      }
    };

    return emotionalMarkers[emotion] || emotionalMarkers.neutral;
  }

  reconstructSentence(unit, styleElements, structure, vocabulary, emotion) {
    let reconstructed = unit.original;

    // Apply vocabulary changes with linguistic variation
    reconstructed = this.applyLinguisticVariation(reconstructed, vocabulary);

    // Apply style elements
    if (Math.random() < styleElements.contractions) {
      reconstructed = this.addContractions(reconstructed);
    }

    if (Math.random() < styleElements.fillers) {
      reconstructed = this.addFillers(reconstructed);
    }

    if (Math.random() < emotion.intensity) {
      reconstructed = this.addEmotionalMarkers(reconstructed, emotion);
    }

    // Apply structural variations
    reconstructed = this.applyStructuralVariation(reconstructed, structure);

    return reconstructed;
  }

  applyLinguisticVariation(text, vocabulary) {
    let result = text;
    
    // 1. Synonym Replacement with Weighted Randomness
    Object.entries(vocabulary.replacements).forEach(([original, replacement]) => {
      if (Math.random() < 0.7) { // 70% chance to replace to avoid consistency patterns
        result = result.replace(new RegExp(`\\b${original}\\b`, 'gi'), replacement);
      }
    });

    // 2. Semantic Restructuring (Passive to Active or vice-versa to break AI rhythm)
    if (Math.random() < 0.4) {
      result = this.toggleVoice(result);
    }

    return result;
  }

  toggleVoice(sentence) {
    // Simplified voice toggling logic
    const passivePattern = /\b(is|are|was|were|being|been)\s+(\w+ed)\b/i;
    const match = sentence.match(passivePattern);
    
    if (match) {
      // Try to convert to active (very simplified)
      const verb = match[2].replace(/ed$/, '');
      return sentence.replace(passivePattern, verb);
    } else {
      // Try to convert to passive (very simplified)
      const words = sentence.split(' ');
      if (words.length > 3) {
        return `${words[0]} was ${words[1]}ed ${words.slice(2).join(' ')}`;
      }
    }
    return sentence;
  }

  addContractions(text) {
    const contractions = {
      'do not': 'don\'t',
      'does not': 'doesn\'t',
      'did not': 'didn\'t',
      'will not': 'won\'t',
      'cannot': 'can\'t',
      'could not': 'couldn\'t',
      'should not': 'shouldn\'t',
      'would not': 'wouldn\'t',
      'is not': 'isn\'t',
      'are not': 'aren\'t',
      'was not': 'wasn\'t',
      'were not': 'weren\'t'
    };

    let result = text;
    Object.entries(contractions).forEach(([formal, contraction]) => {
      result = result.replace(new RegExp(`\\b${formal}\\b`, 'gi'), contraction);
    });

    return result;
  }

  addFillers(text) {
    const fillers = ['you know', 'like', 'kind of', 'sort of', 'basically', 'actually', 'honestly'];
    const filler = fillers[Math.floor(Math.random() * fillers.length)];

    // Add filler at natural break points
    const sentences = text.split(/[.!?]/);
    if (sentences.length > 1 && Math.random() < 0.05) {
      const insertIndex = Math.floor(Math.random() * (sentences.length - 1));
      sentences[insertIndex] += `, ${filler}`;
    }

    return sentences.join('.');
  }

  addEmotionalMarkers(text, emotion) {
    if (emotion.words.length === 0) return text;

    const emotionalWord = emotion.words[Math.floor(Math.random() * emotion.words.length)];
    const intensity = emotion.intensity;

    // Replace neutral words with emotional ones
    const neutralWords = ['good', 'nice', 'okay', 'fine', 'decent'];
    const targetWord = neutralWords[Math.floor(Math.random() * neutralWords.length)];

    if (Math.random() < intensity) {
      return text.replace(new RegExp(`\\b${targetWord}\\b`, 'gi'), emotionalWord);
    }

    return text;
  }

  applyStructuralVariation(text, structure) {
    // Add variety in sentence length and structure
    const words = text.split(' ');

    if (structure.length === 'shorten' && words.length > 20) {
      // Split long sentences
      const midPoint = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, midPoint).join(' ');
      const secondHalf = words.slice(midPoint).join(' ');
      return `${firstHalf}. ${secondHalf.charAt(0).toUpperCase() + secondHalf.slice(1)}`;
    }

    if (structure.length === 'lengthen' && words.length < 8) {
      // Combine short sentences occasionally
      return text; // This would need context of surrounding sentences
    }

    return text;
  }

  addStructuralVariation(complexity) {
    const variations = {
      simple: ['Add introductory phrase', 'Add concluding phrase'],
      compound: ['Vary conjunction usage', 'Change clause order'],
      complex: ['Move dependent clause', 'Add parenthetical element'],
      compoundComplex: ['Simplify one clause', 'Add transitional phrase']
    };

    return variations[complexity] || variations.simple;
  }

  adjustLengthBasedOnComplexity(original, complexity) {
    const originalLength = original.split(' ').length;
    const adjustments = {
      simple: originalLength * 0.8,
      compound: originalLength * 1.0,
      complex: originalLength * 1.2,
      compoundComplex: originalLength * 1.4
    };

    return adjustments[complexity] || originalLength;
  }

  buildStyleProfile(config) {
    return {
      primaryStyle: config.style,
      complexity: config.complexity,
      formality: config.formality,
      emotion: config.emotion,
      culturalContext: config.culturalContext,
      confidence: 0.85
    };
  }

  addCulturalMarkers(context) {
    const culturalMarkers = {
      american: { idioms: ['ballpark figure', 'touch base', 'circle back'] },
      british: { idioms: ['chuffed to bits', 'taking the mickey', 'throw a spanner'] },
      australian: { idioms: ['no worries', 'she\'ll be right', 'fair dinkum'] }
    };

    return culturalMarkers[context] || culturalMarkers.american;
  }

  addEmotionalInflections(emotion) {
    const inflections = {
      enthusiastic: { intensity: 0.8, markers: ['!', 'incredible', 'amazing'] },
      skeptical: { intensity: 0.6, markers: ['allegedly', 'supposedly', 'apparently'] },
      neutral: { intensity: 0.1, markers: [] },
      passionate: { intensity: 0.9, markers: ['truly', 'deeply', 'absolutely'] }
    };

    return inflections[emotion] || inflections.neutral;
  }
}

// Stage 3: Stylistic Reengineering Engine
class StylisticReengineeringEngine {
  reengineer(humanizedComponents, config) {
    let text = this.reconstructText(humanizedComponents.synthesizedUnits);

    // Apply sentence complexity variations
    text = this.varySentenceComplexity(text, config.complexity);

    // Mix technical and colloquial language
    text = this.mixLanguageRegisters(text, config.style);

    // Introduce emotional inflections
    text = this.addEmotionalInflections(text, config.emotion);

    // Add stylistic noise and variations
    text = this.addStylisticNoise(text);

    return text;
  }

  reconstructText(units) {
    return units.map(unit => unit.synthesized).join(' ');
  }

  varySentenceComplexity(text, _complexity) {
    const parts = text.split(/([.!?]+\s*)/);
    const sentences = [];
    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i] + (parts[i + 1] || '');
      if (sentence.trim()) {
        sentences.push(sentence);
      }
    }

    // Complexity fluctuation model: cycles through different target complexities
    // to create a "human-like" rhythm (short, medium, long, medium, short, etc.)
    const rhythmPattern = [0.2, 0.5, 0.8, 0.6, 0.3]; // Fluctuating complexity targets
    
    const variedSentences = sentences.map((sentence, index) => {
      const trimmed = sentence.trim();
      if (trimmed === '') return sentence;

      // Preserve trailing punctuation/space
      const trailingMatch = sentence.match(/[.!?]+\s*$/);
      const trailing = trailingMatch ? trailingMatch[0] : '. ';

      // Base variation on rhythm pattern + random noise + global complexity setting
      const patternTarget = rhythmPattern[index % rhythmPattern.length];
      const complexityWeight = _complexity === 'high' ? 0.2 : _complexity === 'low' ? -0.2 : 0;
      const variation = Math.max(0, Math.min(1, patternTarget + (Math.random() - 0.5) * 0.2 + complexityWeight));

      if (variation < 0.25) {
        // 1. Short, punchy sentence
        return this.simplifyToShortPunchy(trimmed.replace(/[.!?]$/, '')) + trailing;
      } else if (variation < 0.5) {
        // 2. Medium length, standard structure
        return this.addMinorVariation(trimmed.replace(/[.!?]$/, '')) + trailing;
      } else if (variation < 0.75) {
        // 3. Complex sentence with dependent clauses
        return this.addComplexity(trimmed.replace(/[.!?]$/, '')) + trailing;
      } else {
        // 4. Highly complex/elaborate sentence
        return this.elaborateSentence(trimmed.replace(/[.!?]$/, '')) + trailing;
      }
    });

    return variedSentences.join(' ').replace(/\s+/g, ' ').trim();
  }

  simplifyToShortPunchy(sentence) {
    const words = sentence.split(' ');
    if (words.length <= 6) return sentence;

    // Try to extract the core subject-verb-object
    // This is a simplified heuristic: take first few words and last few
    if (words.length > 12) {
      return words.slice(0, 8).join(' ');
    }
    return sentence;
  }

  elaborateSentence(sentence) {
    const elaborations = [
      (s) => `${s}, a fact that cannot be overlooked in this context`,
      (s) => `While it might seem straightforward, ${s.charAt(0).toLowerCase() + s.slice(1)}, which leads to further questions`,
      (s) => `${s}, especially when considering the broader implications of the situation`,
      (s) => `In light of recent developments, ${s.charAt(0).toLowerCase() + s.slice(1)}`,
      (s) => `${s} (and this is something experts often point out)`
    ];

    const elaborator = elaborations[Math.floor(Math.random() * elaborations.length)];
    return elaborator(sentence);
  }

  shortenSentence(sentence) {
    const words = sentence.split(' ');
    if (words.length <= 10) return sentence;

    // Find natural break point
    const breakPoint = Math.floor(words.length * 0.6);
    const firstPart = words.slice(0, breakPoint).join(' ');
    const secondPart = words.slice(breakPoint).join(' ');

    return `${firstPart}. ${secondPart.charAt(0).toUpperCase() + secondPart.slice(1)}`;
  }

  splitCompoundSentence(sentence) {
    const conjunctions = /\b(and|but|or|so|yet|for|nor)\b/gi;
    const match = sentence.match(conjunctions);

    if (match && match.length > 0) {
      const parts = sentence.split(conjunctions);
      if (parts.length > 1) {
        return `${parts[0].trim()}. ${parts[1].trim()}`;
      }
    }

    return sentence;
  }

  addComplexity(sentence) {
    const introductoryPhrases = [
      'Interestingly enough,', 'It\'s worth noting that', 'What\'s particularly fascinating is that',
      'One can\'t help but notice that', 'It becomes apparent that'
    ];

    const concludingPhrases = [
      'which is quite remarkable', 'as it turns out', 'believe it or not',
      'surprisingly enough', 'believe me'
    ];

    const intro = introductoryPhrases[Math.floor(Math.random() * introductoryPhrases.length)];
    const conclusion = concludingPhrases[Math.floor(Math.random() * concludingPhrases.length)];

    if (Math.random() < 0.5) {
      return `${intro} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
    } else {
      return `${sentence} ${conclusion}`;
    }
  }

  addMinorVariation(sentence) {
    const variations = [
      (s) => s, // Original
      (s) => `Well, ${s.charAt(0).toLowerCase() + s.slice(1)}`,
      (s) => `${s}, actually`,
      (s) => `${s}, you know`,
      (s) => `So, ${s.charAt(0).toLowerCase() + s.slice(1)}`
    ];

    const variation = variations[Math.floor(Math.random() * variations.length)];
    return variation(sentence);
  }

  mixLanguageRegisters(text, style) {
    const technicalTerms = [
      'methodology', 'implementation', 'optimization', 'strategic', 'scalable',
      'efficiency', 'performance', 'metrics', 'analytics', 'framework'
    ];

    const colloquialTerms = [
      'way of doing things', 'putting into practice', 'making better',
      'smart', 'can grow', 'getting things done', 'how well it works',
      'numbers', 'looking at data', 'game plan'
    ];

    let mixedText = text;

    // Randomly replace some technical terms with colloquial ones
    if (style === 'casual' || Math.random() < 0.1) {
      for (let i = 0; i < technicalTerms.length; i++) {
        if (Math.random() < 0.2) {
          const regex = new RegExp(`\\b${technicalTerms[i]}\\b`, 'gi');
          mixedText = mixedText.replace(regex, colloquialTerms[i]);
        }
      }
    }

    // Avoid injecting colloquialisms to keep writing clean

    return mixedText;
  }

  addEmotionalInflections(text, emotion) {
    const emotionalExpressions = {
      enthusiastic: {
        words: ['incredible!', 'amazing!', 'fantastic!', 'brilliant!', 'outstanding!'],
        phrases: ['I\'m really excited about', 'It\'s absolutely wonderful that', 'I\'m thrilled to say that']
      },
      skeptical: {
        words: ['allegedly', 'supposedly', 'apparently', 'seemingly', 'reportedly'],
        phrases: ['It\'s claimed that', 'Some say that', 'It\'s been suggested that']
      },
      passionate: {
        words: ['truly', 'deeply', 'absolutely', 'completely', 'totally'],
        phrases: ['I firmly believe that', 'I\'m convinced that', 'I strongly feel that']
      },
      neutral: {
        words: [],
        phrases: ['It appears that', 'It seems that', 'One might say that']
      }
    };

    const expressions = emotionalExpressions[emotion] || emotionalExpressions.neutral;

    if (expressions.words.length > 0 && Math.random() < 0.3) {
      const word = expressions.words[Math.floor(Math.random() * expressions.words.length)];
      // Replace neutral words with emotional ones
      text = text.replace(/\bgood\b/gi, word.replace('!', ''));
    }

    if (expressions.phrases.length > 0 && Math.random() < 0.2) {
      const phrase = expressions.phrases[Math.floor(Math.random() * expressions.phrases.length)];
      const sentences = text.split(/[.!?]/);
      if (sentences.length > 0) {
        sentences[0] = `${phrase} ${sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1)}`;
        text = sentences.join('.');
      }
    }

    return text;
  }

  addStylisticNoise(text) {
    // Add random stylistic elements that humans use
    const noiseElements = [
      () => this.addRandomAdverbs(text),
      () => this.addMetaphors(text),
      () => this.addParentheticalRemarks(text),
      () => this.addRhetoricalQuestions(text)
    ];

    // Apply 1-2 random noise elements
    const numApplications = Math.floor(Math.random() * 2) + 1;
    let noisyText = text;

    for (let i = 0; i < numApplications; i++) {
      const element = noiseElements[Math.floor(Math.random() * noiseElements.length)];
      noisyText = element();
    }

    return noisyText;
  }

  addRandomAdverbs(text) {
    const adverbs = ['surprisingly', 'interestingly', 'curiously', 'oddly', 'strangely', 'remarkably', 'notably'];
    const adverb = adverbs[Math.floor(Math.random() * adverbs.length)];

    const sentences = text.split(/[.!?]/);
    if (sentences.length > 1 && Math.random() < 0.3) {
      const insertIndex = Math.floor(Math.random() * sentences.length);
      sentences[insertIndex] = `${adverb}, ${sentences[insertIndex].trim()}`;
    }

    return sentences.join('.');
  }

  addMetaphors(text) {
    const metaphors = [
      'like a well-oiled machine', 'like clockwork', 'like a breath of fresh air',
      'like night and day', 'like apples and oranges'
    ];

    if (Math.random() < 0.2) {
      const metaphor = metaphors[Math.floor(Math.random() * metaphors.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 0) {
        const lastSentence = sentences[sentences.length - 1].trim();
        if (lastSentence.length > 0) {
          sentences[sentences.length - 1] = `${lastSentence} ${metaphor}`;
        }
      }

      return sentences.join('.');
    }

    return text;
  }

  addParentheticalRemarks(text) {
    const remarks = [
      '(and I mean this sincerely)', '(believe me)', '(you know what I mean)',
      '(if that makes sense)', '(just my opinion)', '(funny enough)'
    ];

    if (Math.random() < 0.15) {
      const remark = remarks[Math.floor(Math.random() * remarks.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 1) {
        const insertIndex = Math.floor(sentences.length / 2);
        sentences[insertIndex] += ` ${remark}`;
      }

      return sentences.join('.');
    }

    return text;
  }

  addRhetoricalQuestions(text) {
    const questions = [
      'right?', 'don\'t you think?', 'wouldn\'t you say?', 'you know?',
      'makes sense?', 'see what I mean?', 'follow me?'
    ];

    if (Math.random() < 0.2) {
      const question = questions[Math.floor(Math.random() * questions.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 0) {
        const lastSentence = sentences[sentences.length - 1].trim();
        if (lastSentence.length > 0) {
          sentences[sentences.length - 1] = `${lastSentence}, ${question}`;
        }
      }

      return sentences.join('.');
    }

    return text;
  }
}

// Stage 4: AI Plagiarism Checker
class AIPlagiarismChecker {
  constructor() {
    this.aiContentDatabase = this.buildAIContentDatabase();
    this.similarityThreshold = 0.7;
  }

  async ensureUniqueness(text) {
    const chunks = this.chunkText(text);
    const uniqueChunks = [];

    for (const chunk of chunks) {
      const similarity = await this.checkSimilarity(chunk);

      if (similarity.score > this.similarityThreshold) {
        const paraphrasedChunk = await this.paraphraseChunk(chunk, similarity.matches);
        uniqueChunks.push(paraphrasedChunk);
      } else {
        uniqueChunks.push(chunk);
      }
    }

    return uniqueChunks.join(' ');
  }

  buildAIContentDatabase() {
    return {
      commonAIPhrases: [
        'in today\'s rapidly evolving landscape',
        'it is important to note that',
        'plays a crucial role in',
        'it should be noted that',
        'as mentioned previously',
        'furthermore, it is evident that',
        'in conclusion, it can be said that',
        'the significance of this cannot be overstated',
        'it is worth mentioning that',
        'this highlights the importance of'
      ],
      academicFormulas: [
        'according to recent studies',
        'research has shown that',
        'it has been demonstrated that',
        'previous research indicates that',
        'the data suggests that',
        'these findings imply that',
        'further research is needed to',
        'this study aims to investigate',
        'the purpose of this research is to'
      ],
      technicalTemplates: [
        'the implementation of',
        'the optimization of',
        'the utilization of',
        'the facilitation of',
        'the integration of',
        'the deployment of',
        'the configuration of',
        'the customization of'
      ]
    };
  }

  chunkText(text) {
    // Split into semantic chunks of 50-100 words
    const words = text.split(' ');
    const chunks = [];

    for (let i = 0; i < words.length; i += 75) {
      chunks.push(words.slice(i, i + 75).join(' '));
    }

    return chunks;
  }

  async checkSimilarity(chunk) {
    const matches = [];
    let totalScore = 0;

    // Check against AI content database
    const allPatterns = [
      ...this.aiContentDatabase.commonAIPhrases,
      ...this.aiContentDatabase.academicFormulas,
      ...this.aiContentDatabase.technicalTemplates
    ];

    allPatterns.forEach(pattern => {
      const similarity = this.calculateSimilarity(chunk, pattern);
      if (similarity > 0.5) {
        matches.push({
          pattern,
          similarity,
          position: chunk.toLowerCase().indexOf(pattern.toLowerCase())
        });
        totalScore += similarity;
      }
    });

    return {
      score: totalScore / Math.max(1, matches.length),
      matches
    };
  }

  calculateSimilarity(text1, text2) {
    // Simple cosine similarity based on word overlap
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);

    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }

  async paraphraseChunk(chunk, matches) {
    let paraphrased = chunk;

    matches.forEach(match => {
      const paraphrasedPattern = this.generateParaphrase(match.pattern);
      paraphrased = paraphrased.replace(
        new RegExp(match.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'),
        paraphrasedPattern
      );
    });

    return paraphrased;
  }

  generateParaphrase(original) {
    const paraphraseTemplates = {
      'in today\'s rapidly evolving landscape': [
        'in our constantly changing world',
        'with how quickly things are developing',
        'given the current pace of change',
        'in this era of rapid development'
      ],
      'it is important to note that': [
        'keep in mind that',
        'what\'s worth remembering is',
        'don\'t forget that',
        'it\'s worth mentioning that'
      ],
      'plays a crucial role in': [
        'is really important for',
        'makes a big difference in',
        'is key to',
        'has a major impact on'
      ],
      'according to recent studies': [
        'based on what researchers have found',
        'as recent research shows',
        'looking at the latest findings',
        'from what scientists have discovered'
      ],
      'further research is needed to': [
        'we need to look more into',
        'more investigation is required to',
        'additional studies should explore',
        'researchers should continue examining'
      ]
    };

    const paraphrases = paraphraseTemplates[original.toLowerCase()];
    if (paraphrases) {
      return paraphrases[Math.floor(Math.random() * paraphrases.length)];
    }

    // If no template exists, use synonym replacement
    return this.synonymReplacement(original);
  }

  synonymReplacement(text) {
    const synonymMap = {
      'important': 'significant',
      'crucial': 'vital',
      'rapidly': 'quickly',
      'evolving': 'changing',
      'landscape': 'environment',
      'note': 'mention',
      'role': 'part',
      'according': 'based',
      'research': 'studies',
      'demonstrated': 'shown',
      'implementation': 'use',
      'optimization': 'improvement'
    };

    let result = text;
    Object.entries(synonymMap).forEach(([original, synonym]) => {
      result = result.replace(new RegExp(`\\b${original}\\b`, 'gi'), synonym);
    });

    return result;
  }
}

// Stage 5: Pattern Obfuscation Engine
class PatternObfuscationEngine {
  obfuscate(text) {
    let obfuscated = text;

    // Apply multiple obfuscation techniques in a logical order
    obfuscated = this.obfuscateWordFrequencies(obfuscated);
    obfuscated = this.addStylisticNoise(obfuscated);
    obfuscated = this.restructureSentences(obfuscated);
    obfuscated = this.maskSyntacticPatterns(obfuscated);
    obfuscated = this.applySyntacticJitter(obfuscated);
    obfuscated = this.addHumanInconsistencies(obfuscated);
    obfuscated = this.addHumanThoughtPivots(obfuscated);
    obfuscated = this.breakSemanticCoherence(obfuscated);
    obfuscated = this.breakParagraphStructure(obfuscated);
    obfuscated = this.injectPersonalVoice(obfuscated);
    obfuscated = this.splitComplexSentences(obfuscated);
    obfuscated = this.applyAdversarialPerturbations(obfuscated);

    // Final cleanup to fix artifacts
    obfuscated = obfuscated
      .replace(/([.!?]),/g, '$1') // Fix "., " or "!, "
      .replace(/,([.!?])/g, '$1') // Fix ",. "
      .replace(/\s+([.!?])/g, '$1') // Fix " . "
      .replace(/([.!?])\s*([.!?])/g, '$1 ') // Fix ".. " or ".! "
      .replace(/(\s+),/g, ',') // Fix " ,"
      .replace(/,\s*,/g, ',') // Fix ", ,"
      .replace(/\s(and|but|or|so|yet|for|nor)\.?$/gi, '.') // Fix trailing conjunctions
      .replace(/\s+/g, ' ') // Fix multiple spaces
      .trim();

    return obfuscated;
  }

  applyAdversarialPerturbations(text) {
    // Specifically target AI detection signals with adversarial techniques
    let perturbed = text;
    
    // 1. Break N-gram patterns (common AI detection method)
    perturbed = this.breakNGrams(perturbed);
    
    // 2. Inject adversarial noise (tiny, imperceptible changes that confuse classifiers)
    perturbed = this.injectAdversarialNoise(perturbed);
    
    return perturbed;
  }

  breakNGrams(text) {
    // Break 3-gram and 4-gram patterns that AI often produces
    const sentences = text.split(/([.!?]\s+)/);
    return sentences.map(s => {
      if (s.length < 10) return s;
      const words = s.split(' ');
      if (words.length > 10 && Math.random() < 0.3) {
        // Insert a tiny "adversarial" filler or swap order
        const idx = Math.floor(words.length / 2);
        words.splice(idx, 0, Math.random() < 0.5 ? 'just' : 'actually');
      }
      return words.join(' ');
    }).join('');
  }

  injectAdversarialNoise(text) {
    // Inject subtle linguistic noise to lower classifier confidence
    return text.replace(/\b(very|really|quite|extremely)\b/gi, (match) => {
      const noise = ['', 'well,', 'honestly,', 'sort of'];
      return Math.random() < 0.2 ? `${noise[Math.floor(Math.random() * noise.length)]} ${match}` : match;
    });
  }

  splitSentencesPreserve(text) {
    // Split into sentences while preserving the punctuation and trailing whitespace
    // Using a regex that captures the delimiters to keep them
    const parts = text.split(/([.!?]+\s*)/);
    const sentences = [];
    for (let i = 0; i < parts.length; i += 2) {
      const sentence = parts[i] + (parts[i + 1] || '');
      if (sentence.trim()) {
        sentences.push(sentence);
      }
    }
    return sentences;
  }

  breakParagraphStructure(text) {
    // Break "perfect" paragraph structure by randomly combining or splitting
    let paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    if (paragraphs.length <= 1) return text;

    let result = [];
    for (let i = 0; i < paragraphs.length; i++) {
      if (Math.random() < 0.2 && i < paragraphs.length - 1) {
        // Combine with next paragraph
        result.push(paragraphs[i] + ' ' + paragraphs[i + 1]);
        i++; // Skip next one
      } else if (Math.random() < 0.15) {
        // Split current paragraph at a random sentence
        const sentences = this.splitSentencesPreserve(paragraphs[i]);
        if (sentences.length > 3) {
          const splitIndex = Math.floor(sentences.length / 2) + (Math.random() > 0.5 ? 1 : -1);
          const p1 = sentences.slice(0, splitIndex).join(' ');
          const p2 = sentences.slice(splitIndex).join(' ');
          result.push(p1.trim());
          result.push(p2.trim());
        } else {
          result.push(paragraphs[i]);
        }
      } else {
        result.push(paragraphs[i]);
      }
    }
    return result.join('\n\n');
  }

  injectPersonalVoice(text) {
    // Inject personal pronouns and markers to break impersonal AI tone
    const personalMarkers = [
      'I think', 'I believe', 'in my opinion', 'from what I\'ve seen',
      'personally, I feel', 'to me, it seems', 'I\'ve noticed that',
      'honestly, I\'m not 100% sure but', 'as far as I can tell',
      'if you ask me', 'it feels like', 'I guess'
    ];

    let sentences = text.split(/([.!?]\s+)/);
    for (let i = 0; i < sentences.length; i++) {
      if (sentences[i].length > 20 && Math.random() < 0.15) {
        const marker = personalMarkers[Math.floor(Math.random() * personalMarkers.length)];
        const firstChar = sentences[i].trim().charAt(0);
        if (firstChar === firstChar.toUpperCase()) {
          sentences[i] = marker + ' ' + firstChar.toLowerCase() + sentences[i].trim().slice(1);
        }
      }
    }
    return sentences.join('');
  }

  splitComplexSentences(text) {
    // Split overly long or complex sentences (break AI syntactic regularity)
    let sentences = text.split(/([.!?]\s+)/);
    let result = [];

    for (let i = 0; i < sentences.length; i++) {
      const s = sentences[i];
      if (s.includes(',') && s.split(' ').length > 25 && Math.random() < 0.3) {
        // Find a good place to split (e.g., at a comma followed by a conjunction)
        const splitPatterns = [
          /, and /i, /, but /i, /, because /i, /, which /i, /, although /i
        ];
        let splitFound = false;
        for (const pattern of splitPatterns) {
          if (pattern.test(s)) {
            const parts = s.split(pattern);
            if (parts.length === 2) {
              result.push(parts[0] + '. ' + parts[1]);
              splitFound = true;
              break;
            }
          }
        }
        if (!splitFound) result.push(s);
      } else {
        result.push(s);
      }
    }
    return result.join('');
  }

  breakSemanticCoherence(text) {
    // Inject slightly off-topic or conversational remarks to break AI-like high coherence
    // Only used for longer texts where coherence is a strong signal
    const remarks = [
      'Anyway, I digress.',
      'But that\'s a whole other story.',
      'Just a random thought there.',
      'I hope that makes some sense.',
      'Getting back to the point though,',
      'I\'m probably overthinking this, but',
      'If you see what I mean.',
      'Kind of a tangent, I know.',
      'But anyway, where was I?',
      'Sorry, my mind wandered for a second.',
      'Wait, that reminded me of something else.',
      'Not that it matters much right now.',
      'But I suppose that\'s besides the point.',
      'Actually, let me double check that thought.',
      'It\'s a bit complicated, I guess.',
      'If that sounds right to you.',
      'I mean, you get what I\'m saying, right?',
      'But yeah, moving on.',
      'I think I\'m getting ahead of myself.',
      'Anyway, back to what I was saying.',
      'Wait, why did I even bring that up?',
      'Actually, it doesn\'t really change much, but still.',
      'I should probably stay on track here.',
      'I\'m just thinking out loud at this point.',
      'If that makes any sense at all.',
      'Actually, I might be getting a bit off track.',
      'But I guess you already knew that.',
      'Wait, I think I missed something important there.',
      'Now that I think about it, it\'s kind of funny.',
      'Actually, let me try to explain that better.',
      'Anyway, I\'m getting off topic here.',
      'But I guess that\'s just how my brain works.',
      'Wait, did I already say that?',
      'Actually, let me take a step back for a second.',
      'But yeah, you get the idea.',
      'I mean, it\'s not like it\'s a huge deal, but still.',
      'Actually, I should probably clarify that a bit.',
      'Wait, I just thought of something else.',
      'But anyway, back to the main point.',
      'Actually, that\'s a bit of a weird way to put it.',
      'I don\'t know why I just thought of that.',
      'But that\'s just my two cents on the matter.',
      'Wait, I think I\'m repeating myself now.',
      'Actually, let\'s just skip that part for now.',
      'But anyway, let\'s not get bogged down in details.'
    ];

    const sentences = this.splitSentencesPreserve(text);
    if (sentences.length > 6) { // Increased from 4
      const numRemarks = Math.floor(sentences.length / 8) + 1; // Reduced frequency
      let usedIndices = new Set();
      for (let i = 0; i < numRemarks; i++) {
        if (Math.random() < 0.4) { // Reduced from 0.7
          const remark = remarks[Math.floor(Math.random() * remarks.length)];
          // Avoid placing remarks at the very beginning or end, and avoid clustering
          let index;
          let attempts = 0;
          do {
            index = Math.floor(Math.random() * (sentences.length - 4)) + 2;
            attempts++;
          } while ((usedIndices.has(index) || usedIndices.has(index - 1) || usedIndices.has(index + 1)) && attempts < 10);

          if (attempts < 10) {
            usedIndices.add(index);
            sentences.splice(index, 0, ` ${remark} `);
          }
        }
      }
    }

    return sentences.join('').replace(/\s+/g, ' ').trim();
  }

  applySyntacticJitter(text) {
    // Randomly adjust syntactic structure to break AI predictability
    const sentences = this.splitSentencesPreserve(text);

    const result = sentences.map(sentence => {
      let s = sentence.trim();
      if (s.length < 15) return sentence;

      // Technique 0: Direct pattern removal for common AI artifacts
      // These are high-confidence AI signals and should usually be replaced
      const criticalPatterns = [
        { pattern: /\bin today's\s+[\w\s]+\s+landscape\b/gi, replacement: 'nowadays' },
        { pattern: /\bit is (important|crucial|essential|vital|worth noting) to (note|mention|remember|understand)\b/gi, replacement: 'you gotta realize' },
        { pattern: /\bplays? a (crucial|important|significant|vital) role\b/gi, replacement: 'is a big deal' },
        { pattern: /\bleverage\b/gi, replacement: 'use' },
        { pattern: /\bimplementation\b/gi, replacement: 'setup' },
        { pattern: /\boptimization\b/gi, replacement: 'improvement' },
        { pattern: /\bcomprehensive\b/gi, replacement: 'full' },
        { pattern: /\bsystematic\b/gi, replacement: 'step-by-step' },
        { pattern: /\bmethodology\b/gi, replacement: 'way of doing it' },
        { pattern: /\bfacilitate\b/gi, replacement: 'help' },
        { pattern: /\butilize\b/gi, replacement: 'use' },
        { pattern: /\bsubstantial\b/gi, replacement: 'a lot of' },
        { pattern: /\bdemonstrate\b/gi, replacement: 'show' },
        { pattern: /\bin conclusion\b/gi, replacement: 'so basically' },
        { pattern: /\bfurthermore\b/gi, replacement: 'plus' },
        { pattern: /\bmoreover\b/gi, replacement: 'also' },
        { pattern: /\badditionally\b/gi, replacement: 'and also' },
        { pattern: /\bconsequently\b/gi, replacement: 'so' },
        { pattern: /\btherefore\b/gi, replacement: 'that means' },
        { pattern: /\bnevertheless\b/gi, replacement: 'still' },
        { pattern: /\bit's worth noting that\b/gi, replacement: 'just so you know,' },
        { pattern: /\bit's important to understand that\b/gi, replacement: 'you should know,' },
        { pattern: /\bwhat's particularly interesting is\b/gi, replacement: 'get this,' },
        { pattern: /\bthis highlights the fact that\b/gi, replacement: 'this shows how' },
        { pattern: /\bit's fascinating to consider\b/gi, replacement: 'it\'s pretty wild that' },
        { pattern: /\bwhen we examine\b/gi, replacement: 'looking at' },
        { pattern: /\bwe can see that\b/gi, replacement: 'it\'s clear that' },
        { pattern: /\bit becomes clear that\b/gi, replacement: 'you can see that' },
        { pattern: /\bthe significance of this\b/gi, replacement: 'why this matters' },
        { pattern: /\bcannot be overstated\b/gi, replacement: 'is a huge deal' },
        { pattern: /\bit should be noted that\b/gi, replacement: 'also,' },
        { pattern: /\bas mentioned (earlier|previously)\b/gi, replacement: 'like I said,' },
        { pattern: /\bto put it simply\b/gi, replacement: 'basically,' },
        { pattern: /\bin other words\b/gi, replacement: 'what I mean is,' },
        { pattern: /\bwhat this means is\b/gi, replacement: 'this means' },
        { pattern: /\bthe bottom line is\b/gi, replacement: 'at the end of the day,' },
        { pattern: /\ba (significant|large|substantial) (number|amount|portion) of\b/gi, replacement: 'a lot of' },
        { pattern: /\bthe majority of\b/gi, replacement: 'most' },
        { pattern: /\bthe vast majority of\b/gi, replacement: 'pretty much all' },
        { pattern: /\bit is evident that\b/gi, replacement: 'it\'s obvious that' },
        { pattern: /\bit is clear that\b/gi, replacement: 'clearly,' },
        { pattern: /\bresearch has shown that\b/gi, replacement: 'turns out,' },
        { pattern: /\bstudies have demonstrated that\b/gi, replacement: 'people have found that' },
        { pattern: /\ba multitude of\b/gi, replacement: 'tons of' },
        { pattern: /\boperational efficiency\b/gi, replacement: 'efficiency' },
        { pattern: /\bcompetitive advantages\b/gi, replacement: 'an edge' },
        { pattern: /\btransform the way we\b/gi, replacement: 'change how we' },
        { pattern: /\bcontinued development\b/gi, replacement: 'ongoing work' },
        { pattern: /\bstrategic decision-making\b/gi, replacement: 'planning' },
        { pattern: /\bartificial intelligence\b/gi, replacement: 'AI' }
      ];

      criticalPatterns.forEach(cp => {
        s = s.replace(cp.pattern, cp.replacement);
      });

      // Technique 1: Move adverbs to different positions
      if (Math.random() < 0.3) { // Reduced from 0.5
        const adverbs = [
          'certainly', 'definitely', 'probably', 'mostly', 'basically',
          'actually', 'honestly', 'literally', 'really', 'clearly',
          'frankly', 'simply', 'totally', 'essentially', 'virtually',
          'supposedly', 'presumably', 'seemingly', 'apparently', 'possibly',
          'honestly', 'seriously', 'truly', 'completely', 'absolutely'
        ];
        for (const adv of adverbs) {
          const regex = new RegExp(`\\b${adv}\\s+`, 'i');
          if (regex.test(s)) {
            s = s.replace(regex, '');
            const words = s.split(' ');
            if (words.length > 4) {
              const insertPos = Math.floor(Math.random() * (words.length - 2)) + 1;
              words.splice(insertPos, 0, adv);
              s = words.join(' ');
              break;
            }
          }
        }
      }

      // Technique 2: Invert simple phrases or use more natural/casual starts
      if (Math.random() < 0.3) { // Reduced from 0.45
        const inversions = [
          { pattern: /\bit is (clear|evident|obvious) that/i, replacement: 'clearly,' },
          { pattern: /\bit is (important|crucial) to/i, replacement: 'honestly, you should' },
          { pattern: /\bthere is a\b/i, replacement: 'we have a' },
          { pattern: /\bit seems that/i, replacement: 'apparently,' },
          { pattern: /\bI believe that/i, replacement: 'honestly,' },
          { pattern: /\bfurthermore,/i, replacement: 'and another thing,' },
          { pattern: /\bmoreover,/i, replacement: 'plus,' },
          { pattern: /\bin addition,/i, replacement: 'also,' },
          { pattern: /\bconsequently,/i, replacement: 'so basically,' },
          { pattern: /\btherefore,/i, replacement: 'which means,' },
          { pattern: /\bit is worth noting that/i, replacement: 'just so you know,' },
          { pattern: /\bit should be noted that/i, replacement: 'it\'s worth pointing out that,' },
          { pattern: /\bresearch suggests that/i, replacement: 'looks like,' },
          { pattern: /\bstudies show that/i, replacement: 'from what I\'ve seen,' },
          { pattern: /\bit is possible that/i, replacement: 'maybe,' },
          { pattern: /\bone might argue that/i, replacement: 'some people say,' },
          { pattern: /\bit is generally accepted that/i, replacement: 'most people agree that,' },
          { pattern: /\bin conclusion,/i, replacement: 'so, at the end of the day,' }
        ];
        for (const inv of inversions) {
          if (inv.pattern.test(s)) {
            s = s.replace(inv.pattern, inv.replacement);
            break;
          }
        }
      }

      // Technique 3: Add "you know" or "I mean" in the middle of sentences
      if (Math.random() < 0.15) { // Reduced from 0.3
        const words = s.split(' ');
        if (words.length > 8) { // Increased threshold from 6
          const insertPos = Math.floor(Math.random() * (words.length - 4)) + 2;
          const fillers = [', you know, ', ', I mean, ', ', like, ', ', honestly, ', ', basically, ', ', sort of, ', ', kind of, ', ', I guess, ', ', for what it\'s worth, '];
          const filler = fillers[Math.floor(Math.random() * fillers.length)];
          words[insertPos] += filler;
          s = words.join(' ');
        }
      }

      // Technique 4: Change "and" to semi-colons or vice-versa
      if (Math.random() < 0.15) { // Reduced from 0.25
        if (s.includes(' and ')) {
          s = s.replace(' and ', '; ');
        } else if (s.includes('; ')) {
          s = s.replace('; ', ' and ');
        }
      }

      // Technique 5: Add a quick "wait" or "hold on" at the start
      if (Math.random() < 0.1) { // Reduced from 0.15
        const starts = ['Wait, ', 'Hold on, ', 'Actually, ', 'So, ', 'Listen, ', 'Look, ', 'Anyway, ', 'Well, '];
        const start = starts[Math.floor(Math.random() * starts.length)];
        s = start + s.charAt(0).toLowerCase() + s.slice(1);
      }

      // Preserve trailing space from original sentence if it exists
      const originalTrailingSpace = sentence.match(/\s+$/);
      return s + (originalTrailingSpace ? originalTrailingSpace[0] : ' ');
    });

    return result.join('').replace(/\s+/g, ' ').trim();
  }

  addHumanThoughtPivots(text) {
    // Inject human-like thought pivots ("Actually...", "On second thought...")
    let pivoted = text;
    const pivots = [
      'Wait, let me rephrase that.',
      'Actually, come to think of it,',
      'Or maybe it\'s more like this:',
      'But then again,',
      'Looking back at it,',
      'I mean, if you think about it,',
      'Wait, I should probably mention that',
      'Actually, forget that for a second.',
      'So, here is the thing about that:',
      'Actually, I was just thinking,',
      'Wait, I just realized something.',
      'Now that I\'m writing this down,',
      'Let me try that again,',
      'Actually, that\'s not quite right.',
      'Wait, I should clarify something here.',
      'Hold on, I just had a thought.',
      'Actually, if you look at it another way,',
      'I was just thinking about how',
      'Wait, let me take a step back here.',
      'Actually, it\'s funny you should mention that,',
      'Wait, I think I\'m missing the point.',
      'Actually, that reminds me of something else.',
      'Hold on, let me double check that.',
      'Actually, I should probably explain why.',
      'Wait, I just had a better idea.',
      'Now that I\'m looking at it again,',
      'Actually, it\'s a bit more complex than that.',
      'Wait, I should probably simplify this.',
      'Actually, I was just wondering if',
      'Hold on, I might be wrong about that.',
      'Actually, I just remembered something important.',
      'Wait, let me double check that for you.',
      'Actually, that\'s not exactly what I meant.',
      'Wait, I should probably reword that.',
      'Actually, it\'s kind of a long story.',
      'Wait, I just had a realization.',
      'Actually, I think I can explain it better.',
      'Wait, let me try a different approach.',
      'Actually, that\'s a good point.',
      'Wait, I should probably address that.',
      'Actually, I just thought of a better way to put it.',
      'Wait, that\'s not what I was going to say at all.',
      'Actually, let me start over for a second.',
      'Wait, I think I\'m getting mixed up here.',
      'Actually, it\'s simpler than I\'m making it out to be.'
    ];

    const sentences = this.splitSentencesPreserve(pivoted);
    if (sentences.length > 5) { // Increased from 3
      // Increase probability and allow multiple pivots for longer texts
      const numPivots = Math.floor(sentences.length / 8) + 1; // Reduced from /6
      let usedIndices = new Set();

      for (let i = 0; i < numPivots; i++) {
        if (Math.random() < 0.3) { // Reduced from 0.4
          const pivot = pivots[Math.floor(Math.random() * pivots.length)];
          let index;
          let attempts = 0;
          do {
            index = Math.floor(Math.random() * (sentences.length - 3)) + 1;
            attempts++;
          } while ((usedIndices.has(index) || usedIndices.has(index - 1) || usedIndices.has(index + 1)) && attempts < 10);

          if (attempts < 10) {
            usedIndices.add(index);
            sentences.splice(index, 0, `${pivot} `);
          }
        }
      }
    }

    return sentences.join('').replace(/\s+/g, ' ').trim();
  }

  obfuscateWordFrequencies(text) {
    // Identify and vary repetitive word usage
    const words = text.toLowerCase().split(/\s+/);
    const wordFreq = {};

    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    let variedText = text;

    // Replace frequently used words with synonyms
    Object.entries(wordFreq).forEach(([word, freq]) => {
      if (freq > 4 && this.hasSynonyms(word)) { // Increased threshold from 3
        const synonyms = this.getSynonyms(word);
        let replacementCount = 0;

        variedText = variedText.replace(new RegExp(`\\b${word}\\b`, 'gi'), (match) => {
          if (replacementCount < Math.floor(freq * 0.25)) { // Reduced from 0.3
            replacementCount++;
            return synonyms[Math.floor(Math.random() * synonyms.length)];
          }
          return match;
        });
      }
    });

    return variedText;
  }

  addStylisticNoise(text) {
    // Add human-like inconsistencies and variations
    const noiseTechniques = [
      () => this.addRandomAdverbs(text),
      () => this.addColloquialExpressions(text),
      () => this.addParentheticalRemarks(text),
      () => this.addRhetoricalQuestions(text),
      () => this.addFillersAndHesitations(text),
      () => this.addPersonalRemarks(text),
      () => this.addSlangAndIdioms(text),
      () => this.addHumanLikeTypos(text),
      () => this.addInformalContractions(text),
      () => this.replaceAITransitions(text)
    ];

    // Increase injection probability and apply multiple techniques
    let noisyText = text;
    const numTechniques = Math.floor(Math.random() * 2) + 1; // Reduced from 1-3 to 1-2
    for (let i = 0; i < numTechniques; i++) {
      if (Math.random() < 0.35) { // Reduced from 0.6
        const technique = noiseTechniques[Math.floor(Math.random() * noiseTechniques.length)];
        noisyText = technique();
      }
    }

    return noisyText;
  }

  addSlangAndIdioms(text) {
    const expressions = [
      { formal: /very/gi, slang: 'super' },
      { formal: /understand/gi, slang: 'get' },
      { formal: /difficult/gi, slang: 'tough' },
      { formal: /good/gi, slang: 'cool' },
      { formal: /amazing/gi, slang: 'mind-blowing' },
      { formal: /problem/gi, slang: 'mess' },
      { formal: /exhausted/gi, slang: 'beat' },
      { formal: /friend/gi, slang: 'buddy' },
      { formal: /excited/gi, slang: 'hyped' },
      { formal: /suspicious/gi, slang: 'sketchy' },
      { formal: /excellent/gi, slang: 'top-notch' },
      { formal: /information/gi, slang: 'info' },
      { formal: /honestly/gi, slang: 'to be real' },
      { formal: /actually/gi, slang: 'really' },
      { formal: /completely/gi, slang: 'totally' },
      { formal: /perhaps/gi, slang: 'maybe' },
      { formal: /frequently/gi, slang: 'all the time' },
      { formal: /significant/gi, slang: 'huge' },
      { formal: /substantial/gi, slang: 'massive' },
      { formal: /utilize/gi, slang: 'use' },
      { formal: /landscape/gi, slang: 'scene' },
      { formal: /evolve/gi, slang: 'change up' },
      { formal: /strategy/gi, slang: 'plan' },
      { formal: /substantial/gi, slang: 'big-time' },
      { formal: /consequently/gi, slang: 'so basically' },
      { formal: /crucial/gi, slang: 'big deal' },
      { formal: /artificial intelligence/gi, slang: 'AI' },
      { formal: /benefits/gi, slang: 'perks' },
      { formal: /improve/gi, slang: 'level up' },
      { formal: /process/gi, slang: 'drill' },
      { formal: /method/gi, slang: 'way' },
      { formal: /success/gi, slang: 'win' }
    ];

    let slanged = text;
    // Increased probability to 0.6 and max replacements to 4
    const numReplacements = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numReplacements; i++) {
      if (Math.random() < 0.6) {
        const exp = expressions[Math.floor(Math.random() * expressions.length)];
        slanged = slanged.replace(exp.formal, exp.slang);
      }
    }
    return slanged;
  }

  addHumanLikeTypos(text) {
    const commonTypos = [
      { correct: 'the', typo: 'teh' },
      { correct: 'and', typo: 'adn' },
      { correct: 'that', typo: 'taht' },
      { correct: 'with', typo: 'wiht' }
    ];

    let withTypos = text;
    if (Math.random() < 0.05) {
      const typoObj = commonTypos[Math.floor(Math.random() * commonTypos.length)];
      withTypos = withTypos.replace(new RegExp(`\\b${typoObj.correct}\\b`, 'i'), typoObj.typo);
    }
    return withTypos;
  }

  addInformalContractions(text) {
    const informal = [
      { formal: /going to/gi, replacement: 'gonna' },
      { formal: /want to/gi, replacement: 'wanna' },
      { formal: /got to/gi, replacement: 'gotta' },
      { formal: /kind of/gi, replacement: 'kinda' },
      { formal: /sort of/gi, replacement: 'sorta' }
    ];

    let contracted = text;
    if (Math.random() < 0.2) {
      const item = informal[Math.floor(Math.random() * informal.length)];
      contracted = contracted.replace(item.formal, item.replacement);
    }
    return contracted;
  }

  addRandomAdverbs(text) {
    const adverbs = [
      'surprisingly', 'interestingly', 'curiously', 'oddly', 'strangely',
      'remarkably', 'significantly', 'substantially', 'considerably'
    ];

    const adverb = adverbs[Math.floor(Math.random() * adverbs.length)];

    // Insert at beginning of random sentence
    const sentences = this.splitSentencesPreserve(text);
    if (sentences.length > 1 && Math.random() < 0.05) {
      const insertIndex = Math.floor(Math.random() * sentences.length);
      const sentence = sentences[insertIndex].trim();
      sentences[insertIndex] = `${adverb}, ${sentence.charAt(0).toLowerCase() + sentence.slice(1)} `;
    }

    return sentences.join('');
  }

  addColloquialExpressions(text) {
    const expressions = [
      'you know', 'like', 'sort of', 'kind of', 'basically', 'actually',
      'honestly', 'frankly', 'believe me', 'trust me', 'I mean',
      'at the end of the day', 'long story short', 'for what it\'s worth',
      'to be fair', 'to be honest', 'if I\'m being real', 'no joke',
      'I guess', 'I suppose', 'pretty much', 'kind of a big deal',
      'not gonna lie', 'to be perfectly blunt', 'here\'s the thing',
      'point is', 'bottom line is', 'real talk', 'to be honest with you',
      'between you and me', 'mind you', 'fair enough'
    ];

    let colloquialText = text;
    const sentences = this.splitSentencesPreserve(colloquialText);

    if (sentences.length > 1) {
      const numExpressions = Math.floor(sentences.length / 4) + 1; // Reduced from /3 + 2
      for (let i = 0; i < numExpressions; i++) {
        if (Math.random() < 0.35) { // Reduced from 0.45
          const expression = expressions[Math.floor(Math.random() * expressions.length)];
          const insertIndex = Math.floor(Math.random() * (sentences.length - 1));
          const sentence = sentences[insertIndex].trim();
          // Remove trailing punctuation before adding expression
          const punc = sentence.match(/[.!?]+$/)?.[0] || '';
          const cleanSentence = sentence.replace(/[.!?]+$/, '');
          sentences[insertIndex] = `${cleanSentence}, ${expression}${punc} `;
        }
      }
    }

    return sentences.join('').replace(/\s+/g, ' ').trim();
  }

  replaceAITransitions(text) {
    const aiTransitions = [
      { pattern: /\bfurthermore\b/gi, replacements: ['plus', 'and also', 'on top of that', 'another thing is'] },
      { pattern: /\bmoreover\b/gi, replacements: ['also', 'not only that but', 'what\'s more'] },
      { pattern: /\bconsequently\b/gi, replacements: ['so', 'as a result', 'because of that', 'which means'] },
      { pattern: /\btherefore\b/gi, replacements: ['so', 'that\'s why', 'which is why'] },
      { pattern: /\badditionally\b/gi, replacements: ['also', 'and', 'plus', 'as well'] },
      { pattern: /\bnevertheless\b/gi, replacements: ['still', 'even so', 'but', 'anyway'] },
      { pattern: /\bnonetheless\b/gi, replacements: ['still', 'but anyway', 'even with that'] },
      { pattern: /\bin conclusion\b/gi, replacements: ['so basically', 'all in all', 'to wrap up', 'long story short'] },
      { pattern: /\bsubsequently\b/gi, replacements: ['then', 'after that', 'later on'] },
      { pattern: /\butilize\b/gi, replacements: ['use', 'go with', 'try out'] },
      { pattern: /\bin today's\s+(?:[\w-]+\s+){0,3}landscape\b/gi, replacements: ['nowadays', 'the way things are now', 'in the current scene'] },
      { pattern: /\bit is (important|crucial|essential|vital) to note\b/gi, replacements: ['you gotta realize', 'keep in mind', 'the main thing is'] },
      { pattern: /\bplays? a (crucial|important|significant|vital) role\b/gi, replacements: ['is a big deal', 'really matters', 'has a huge impact'] },
      { pattern: /\bleverage\b/gi, replacements: ['use', 'make the most of', 'work with'] },
      { pattern: /\bimplementation\b/gi, replacements: ['setup', 'rollout', 'launch'] },
      { pattern: /\balgorithm\b/gi, replacements: ['process', 'logic', 'steps'] },
      { pattern: /\boptimization\b/gi, replacements: ['improvement', 'tuning', 'cleanup'] },
      { pattern: /\bmethodology\b/gi, replacements: ['approach', 'way of doing things', 'plan'] },
      { pattern: /\bsystematic\b/gi, replacements: ['step-by-step', 'organized', 'thorough'] },
      { pattern: /\bcomprehensive\b/gi, replacements: ['full', 'complete', 'all-out'] },
      { pattern: /\bit is\b/gi, replacements: ['it\'s', 'basically it\'s'] },
      { pattern: /\bthere are\b/gi, replacements: ['you got', 'we have', 'there\'s'] },
      { pattern: /\bone must\b/gi, replacements: ['you have to', 'you gotta'] },
      { pattern: /\bit should be\b/gi, replacements: ['it needs to be', 'probably should be'] }
    ];

    let humanized = text;
    aiTransitions.forEach(trans => {
      // Increased probability to 1.0 for critical AI patterns to ensure complete removal
      const prob = trans.pattern.toString().includes('landscape') ||
                   trans.pattern.toString().includes('note') ||
                   trans.pattern.toString().includes('role') ||
                   trans.pattern.toString().includes('is') ||
                   trans.pattern.toString().includes('are') ? 1.0 : 0.95;

      if (Math.random() < prob) {
        const replacement = trans.replacements[Math.floor(Math.random() * trans.replacements.length)];
        humanized = humanized.replace(trans.pattern, replacement);
      }
    });
    return humanized;
  }

  addParentheticalRemarks(text) {
    const remarks = [
      '(and I mean this sincerely)', '(believe me)', '(you know what I mean)',
      '(if that makes sense)', '(just my opinion)', '(funny enough)',
      '(strange as it sounds)', '(believe it or not)', '(as it turns out)'
    ];

    if (Math.random() < 0.05) {
      const remark = remarks[Math.floor(Math.random() * remarks.length)];
      const sentences = this.splitSentencesPreserve(text);

      if (sentences.length > 1) {
        const insertIndex = Math.floor(sentences.length / 2);
        // Find a good place to insert - ideally after the first word of the sentence
        const words = sentences[insertIndex].trim().split(' ');
        if (words.length > 3) {
          words.splice(1, 0, remark);
          sentences[insertIndex] = words.join(' ') + ' ';
        } else {
          sentences[insertIndex] = sentences[insertIndex].trim() + ` ${remark} `;
        }
      }

      return sentences.join('');
    }

    return text;
  }

  addRhetoricalQuestions(text) {
    const questions = [
      'right?', 'don\'t you think?', 'wouldn\'t you say?', 'you know?',
      'makes sense?', 'see what I mean?', 'follow me?', 'agree?'
    ];

    if (Math.random() < 0.05) {
      const question = questions[Math.floor(Math.random() * questions.length)];
      const sentences = this.splitSentencesPreserve(text);

      if (sentences.length > 0) {
        const lastIndex = sentences.length - 1;
        const sentence = sentences[lastIndex].trim();
        // Remove trailing punctuation before adding question
        const cleanSentence = sentence.replace(/[.!?]+$/, '');
        sentences[lastIndex] = `${cleanSentence}, ${question} `;
      }

      return sentences.join('');
    }

    return text;
  }

  addFillersAndHesitations(text) {
    const fillers = ['um', 'uh', 'er', 'well', 'so', 'you know'];

    if (Math.random() < 0.05) {
      const filler = fillers[Math.floor(Math.random() * fillers.length)];
      const sentences = this.splitSentencesPreserve(text);

      if (sentences.length > 0) {
        const insertIndex = Math.floor(Math.random() * sentences.length);
        const sentence = sentences[insertIndex].trim();
        sentences[insertIndex] = `${filler}, ${sentence.charAt(0).toLowerCase() + sentence.slice(1)} `;
      }

      return sentences.join('');
    }

    return text;
  }

  addPersonalRemarks(text) {
    const personalRemarks = [
      'I\'ve noticed that', 'In my experience', 'From what I\'ve seen', 'I believe that',
      'It seems to me that', 'I\'ve found that', 'Personally, I think'
    ];

    if (Math.random() < 0.05) {
      const remark = personalRemarks[Math.floor(Math.random() * personalRemarks.length)];
      const sentences = this.splitSentencesPreserve(text);

      if (sentences.length > 0) {
        const sentence = sentences[0].trim();
        sentences[0] = `${remark} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)} `;
      }

      return sentences.join('');
    }

    return text;
  }

  restructureSentences(text) {
    // Apply burstiness (variation in sentence length)
    let restructuredText = this.applyBurstiness(text);

    const sentences = this.splitSentencesPreserve(restructuredText);
    const restructured = [];

    sentences.forEach(sentence => {
      const trimmed = sentence.trim();
      if (trimmed === '') {
        restructured.push(sentence);
        return;
      }

      // Preserve trailing space if it exists
      const trailingMatch = sentence.match(/\s+$/);
      const trailing = trailingMatch ? trailingMatch[0] : ' ';

      // Randomly restructure some sentences
      if (Math.random() < 0.4) {
        restructured.push(this.restructureSingleSentence(trimmed) + trailing);
      } else {
        restructured.push(trimmed + trailing);
      }
    });

    return restructured.join('').replace(/\s+/g, ' ').trim();
  }

  applyBurstiness(text) {
    // Create a mix of short, punchy sentences and longer, complex ones
    const sentences = this.splitSentencesPreserve(text);
    if (sentences.length < 2) return text;

    const bursty = [];
    for (let i = 0; i < sentences.length; i++) {
      let s = sentences[i].trim();
      const words = s.split(/\s+/);
      const wordCount = words.length;

      // Logic to create extreme variance
      if (i % 5 === 0 && wordCount > 15) { // Less frequent, only for long sentences
        // Break long sentence into a short one and the rest - but only at a comma if possible
        const commaIndex = words.slice(5, 12).findIndex(w => w.endsWith(','));
        let splitPoint;
        if (commaIndex !== -1) {
          splitPoint = commaIndex + 6;
        } else {
          // If no comma, don't split, just keep as is to avoid fragments
          bursty.push(s + ' ');
          continue;
        }

        const punchyPart = words.slice(0, splitPoint).join(' ');
        const rest = words.slice(splitPoint).join(' ');

        // Add proper punctuation
        const punctuatedPunchy = punchyPart.replace(/[.!?]+$/, '') + '.';
        bursty.push(punctuatedPunchy + ' ');
        bursty.push(rest.charAt(0).toUpperCase() + rest.slice(1) + ' ');
      } else if (i % 5 === 1) {
        // Very long, rambling sentence - only if it's already somewhat long
        if (wordCount > 10) {
          const ramblingSuffixes = [
            ', especially when you consider how much it actually impacts everything else we do on a daily basis.',
            ', which is why it\'s so important to look at the bigger picture and not just the immediate results.',
            ', and honestly, that\'s just the tip of the iceberg when it comes to what\'s really going on here.',
            ', but that\'s just one way of looking at a much more complicated situation.'
          ];
          const suffix = ramblingSuffixes[Math.floor(Math.random() * ramblingSuffixes.length)];
          const cleanS = s.replace(/[.!?]+$/, '');
          bursty.push(cleanS + suffix + ' ');
        } else {
          bursty.push(s + ' ');
        }
      } else {
        // keep as is
        bursty.push(s + ' ');
      }
    }

    return bursty.join('').replace(/\s+/g, ' ').trim();
  }

  restructureSingleSentence(sentence) {
    const trimmed = sentence.trim();
    if (trimmed.split(/\s+/).length < 4) {
      return sentence;
    }

    const techniques = [
      () => this.frontLoadSentence(trimmed),
      () => this.backLoadSentence(trimmed),
      () => this.addParentheticalInsertion(trimmed),
      () => this.splitIntoMultipleSentences(trimmed),
      () => this.changeToQuestion(trimmed),
      () => this.addEmphasisPhrase(trimmed)
    ];

    const technique = techniques[Math.floor(Math.random() * techniques.length)];
    return technique();
  }

  changeToQuestion(sentence) {
    const questionStarters = ['Have you ever considered that', 'Did you know that', 'What if'];
    const starter = questionStarters[Math.floor(Math.random() * questionStarters.length)];
    const s = sentence.replace(/[.!?]+$/, '');
    return `${starter} ${s.charAt(0).toLowerCase() + s.slice(1)}?`;
  }

  addEmphasisPhrase(sentence) {
    const emphasis = ['And get this:', 'Check this out:', 'The reality is,', 'To be perfectly honest,'];
    const phrase = emphasis[Math.floor(Math.random() * emphasis.length)];
    return `${phrase} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
  }

  frontLoadSentence(sentence) {
    const introductoryElements = [
      'What\'s interesting is that', 'The thing is', 'Here\'s the deal',
      'Believe it or not', 'You know what\'s funny?'
    ];

    const element = introductoryElements[Math.floor(Math.random() * introductoryElements.length)];
    return `${element} ${sentence.charAt(0).toLowerCase() + sentence.slice(1)}`;
  }

  backLoadSentence(sentence) {
    const concludingElements = [
      'which is quite something', 'believe me', 'you know what I mean',
      'if you can believe it', 'as it turns out'
    ];

    const element = concludingElements[Math.floor(Math.random() * concludingElements.length)];
    const s = sentence.replace(/[.!?]+$/, '');
    const punc = sentence.match(/[.!?]+$/)?.[0] || '.';
    return `${s}, ${element}${punc}`;
  }

  addParentheticalInsertion(sentence) {
    const insertions = [
      '(and this is important)', '(trust me on this)', '(you\'ll want to remember this)',
      '(here\'s the kicker)', '(this is where it gets interesting)'
    ];

    const insertion = insertions[Math.floor(Math.random() * insertions.length)];
    const words = sentence.trim().split(/\s+/);

    if (words.length > 8) {
      const insertPosition = Math.floor(words.length / 2);
      words.splice(insertPosition, 0, insertion);
      return words.join(' ');
    }

    return sentence;
  }

  splitIntoMultipleSentences(sentence) {
    const words = sentence.trim().split(/\s+/);

    if (words.length > 15) {
      // Try to find a natural split point (like after a comma)
      const commaIndex = words.slice(5, -5).findIndex(w => w.endsWith(','));
      let splitPoint;
      if (commaIndex !== -1) {
        splitPoint = commaIndex + 6;
      } else {
        splitPoint = Math.floor(words.length / 2);
      }
      const firstPart = words.slice(0, splitPoint).join(' ');
      const secondPart = words.slice(splitPoint).join(' ');

      const punctuatedFirst = firstPart.replace(/[.!?]+$/, '') + '.';
      return `${punctuatedFirst} ${secondPart.charAt(0).toUpperCase() + secondPart.slice(1)}`;
    }

    return sentence;
  }

  maskSyntacticPatterns(text) {
    // Mask common AI syntactic patterns
    let masked = text;

    // Replace overused conjunctions
    const conjunctionReplacements = {
      'furthermore': ['plus', 'also', 'what\'s more', 'on top of that'],
      'moreover': ['besides', 'also', 'in addition'],
      'additionally': ['also', 'too', 'as well'],
      'however': ['but', 'yet', 'still', 'though'],
      'nevertheless': ['still', 'yet', 'even so'],
      'consequently': ['so', 'thus', 'hence', 'therefore']
    };

    Object.entries(conjunctionReplacements).forEach(([original, replacements]) => {
      const replacement = replacements[Math.floor(Math.random() * replacements.length)];
      masked = masked.replace(new RegExp(`\\b${original}\\b`, 'gi'), replacement);
    });

    return masked;
  }

  addHumanInconsistencies(text) {
    let inconsistent = text;

    // Add minor inconsistencies that humans make
    if (Math.random() < 0.1) {
      // Occasional double space
      inconsistent = inconsistent.replace(/\s+/g, '  ');
    }

    if (Math.random() < 0.05) {
      // Occasional missing article
      inconsistent = inconsistent.replace(/\b(the|a|an)\s+/g, '');
    }

    if (Math.random() < 0.08) {
      // Occasional extra comma
      const sentences = this.splitSentencesPreserve(inconsistent);
      if (sentences.length > 1) {
        const insertIndex = Math.floor(Math.random() * sentences.length);
        sentences[insertIndex] = sentences[insertIndex].replace(/\s+/, ', ');
      }
      inconsistent = sentences.join('');
    }

    if (Math.random() < 0.06) {
      // Occasional capitalization inconsistency - only apply to a few words
      const words = inconsistent.split(' ');
      if (words.length > 5) {
        const numToChange = Math.floor(Math.random() * 2) + 1;
        for (let i = 0; i < numToChange; i++) {
          const idx = Math.floor(Math.random() * words.length);
          if (words[idx].length > 1) {
            words[idx] = Math.random() < 0.5 ? words[idx].toLowerCase() : words[idx].toUpperCase();
          }
        }
        inconsistent = words.join(' ');
      }
    }

    return inconsistent;
  }

  hasSynonyms(word) {
    const w = word.toLowerCase();
    return Object.prototype.hasOwnProperty.call(this.getSynonymDatabase(), w);
  }

  getSynonyms(word) {
    const database = this.getSynonymDatabase();
    return database[word.toLowerCase()] || [word];
  }

  getSynonymDatabase() {
    return {
      'important': ['significant', 'crucial', 'vital', 'essential', 'key', 'noteworthy', 'major', 'no small feat', 'meaningful'],
      'significant': ['important', 'notable', 'substantial', 'considerable', 'meaningful', 'serious', 'telling', 'weighty'],
      'crucial': ['vital', 'critical', 'essential', 'key', 'pivotal', 'decisive', 'make-or-break', 'central'],
      'rapidly': ['quickly', 'swiftly', 'fast', 'speedily', 'at a breakneck pace', 'hurriedly', 'like wildfire', 'in a flash'],
      'environment': ['setting', 'context', 'surroundings', 'atmosphere', 'backdrop', 'scenario', 'scene', 'landscape'],
      'utilize': ['use', 'make use of', 'employ', 'leverage', 'apply', 'work with', 'tap into', 'go with'],
      'implement': ['start', 'put in place', 'carry out', 'execute', 'apply', 'set up', 'kick off', 'get going'],
      'facilitate': ['help', 'make easier', 'assist', 'enable', 'promote', 'simplify', 'grease the wheels', 'clear the path'],
      'optimization': ['improvement', 'refinement', 'tuning', 'betterment', 'enhancement', 'polishing', 'tweaking'],
      'leverage': ['use', 'take advantage of', 'exploit', 'apply', 'harness', 'capitalize on', 'make the most of'],
      'substantial': ['large', 'big', 'considerable', 'significant', 'hefty', 'sizable', 'solid', 'massive'],
      'effective': ['successful', 'efficient', 'productive', 'useful', 'potent', 'solid', 'winning', 'killer'],
      'efficient': ['effective', 'streamlined', 'productive', 'slick', 'smooth', 'tight', 'well-oiled'],
      'consequently': ['so', 'therefore', 'as a result', 'thus', 'hence', 'it follows that', 'which means', 'so basically'],
      'moreover': ['also', 'besides', 'what\'s more', 'additionally', 'plus', 'not only that', 'to boot'],
      'furthermore': ['also', 'in addition', 'on top of that', 'plus', 'moreover', 'and another thing', 'to add to that'],
      'however': ['but', 'yet', 'still', 'though', 'even so', 'on the other hand', 'then again', 'mind you'],
      'demonstrate': ['show', 'prove', 'display', 'exhibit', 'illustrate', 'reveal', 'point out', 'make clear'],
      'indicate': ['show', 'suggest', 'point to', 'signal', 'mean', 'hint at', 'suggest', 'spell out'],
      'necessary': ['needed', 'required', 'essential', 'vital', 'must-have', 'obligatory', 'called for'],
      'provide': ['give', 'offer', 'supply', 'present', 'deliver', 'hand over', 'dish out', 'come up with'],
      'various': ['different', 'many', 'a range of', 'several', 'diverse', 'all sorts of', 'a bunch of', 'various kinds of'],
      'additional': ['more', 'extra', 'added', 'further', 'spare', 'on top of', 'bonus'],
      'complete': ['finish', 'end', 'wrap up', 'total', 'full', 'entire', 'get through', 'knock out'],
      'understand': ['get', 'grasp', 'know', 'see', 'comprehend', 'follow', 'wrap your head around', 'figure out'],
      'difficult': ['hard', 'tough', 'tricky', 'challenging', 'knotty', 'uphill', 'pain in the neck'],
      'problem': ['issue', 'trouble', 'mess', 'hiccup', 'setback', 'headache', 'glitch', 'snag'],
      'solution': ['answer', 'way out', 'fix', 'remedy', 'cure', 'workaround', 'key'],
      'analyze': ['look into', 'check out', 'break down', 'study', 'scrutinize', 'size up'],
      'determine': ['figure out', 'decide', 'set', 'establish', 'pin down', 'nail down'],
      'establish': ['set up', 'create', 'build', 'form', 'found', 'start'],
      'explore': ['look at', 'dive into', 'check out', 'examine', 'probe'],
      'identify': ['find', 'spot', 'pick out', 'name', 'pinpoint'],
      'increase': ['boost', 'ramp up', 'grow', 'raise', 'step up'],
      'decrease': ['cut', 'drop', 'lower', 'reduce', 'slash'],
      'improve': ['boost', 'fix up', 'enhance', 'upgrade', 'better'],
      'ensure': ['make sure', 'guarantee', 'see to it', 'check'],
      'require': ['need', 'demand', 'call for', 'ask for'],
      'process': ['way', 'method', 'system', 'routine', 'flow'],
      'impact': ['effect', 'hit', 'influence', 'mark', 'dent'],
      'transform': ['change', 'turn into', 'remake', 'reshape', 'flip'],
      'complex': ['tricky', 'knotty', 'involved', 'messy', 'deep'],
      'fundamental': ['basic', 'core', 'main', 'bottom-line'],
      'perspective': ['view', 'take', 'angle', 'standpoint', 'outlook'],
      'objective': ['goal', 'aim', 'target', 'point'],
      'strategy': ['plan', 'approach', 'game plan', 'tactic'],
      'conclusion': ['end', 'wrap-up', 'finish', 'outcome'],
      'initial': ['first', 'early', 'starting', 'opening'],
      'primarily': ['mostly', 'mainly', 'chiefly', 'for the most part'],
      'specifically': ['to be exact', 'particularly', 'in particular', 'mostly'],
      'potentially': ['maybe', 'possibly', 'could be', 'might'],
      'essentially': ['basically', 'pretty much', 'at its core', 'at the end of the day'],
      'virtually': ['almost', 'nearly', 'practically', 'basically'],
      'consistently': ['always', 'all the time', 'regularly', 'without fail'],
      'frequently': ['often', 'a lot', 'regularly', 'time and again'],
      'rarely': ['hardly ever', 'seldom', 'once in a blue moon'],
      'sufficient': ['enough', 'plenty', 'decent'],
      'appropriate': ['right', 'fitting', 'proper', 'suitable'],
      'comprehensive': ['full', 'thorough', 'complete', 'all-out'],
      'uniquely': ['only', 'special', 'distinctly'],
      'relatively': ['fairly', 'pretty', 'somewhat', 'kind of']
    };
  }
}

// Stage 6: Human Verification Engine
class HumanVerificationEngine {
  constructor() {
    this.commonErrors = this.buildCommonErrorDatabase();
    this.errorLevels = {
      none: { typoRate: 0, grammarRate: 0, punctuationRate: 0 },
      minimal: { typoRate: 0.01, grammarRate: 0.005, punctuationRate: 0.01 },
      moderate: { typoRate: 0.02, grammarRate: 0.01, punctuationRate: 0.02 },
      high: { typoRate: 0.03, grammarRate: 0.02, punctuationRate: 0.03 }
    };
  }

  verify(text, options = {}) {
    let verified = text;
    const errorLevel = options.errorLevel || 'moderate';

    // Apply human verification checks
    verified = this.ensureNaturalFlow(verified);
    verified = this.addHumanDecisionMaking(verified);
    verified = this.simulateHumanWritingProcess(verified);
    verified = this.injectHumanErrors(verified, errorLevel);
    verified = this.finalHumanTouches(verified);

    return verified;
  }

  ensureNaturalFlow(text) {
    // Check and fix unnatural sentence transitions
    const sentences = text.split(/[.!?]/);
    const flowingSentences = [];

    for (let i = 0; i < sentences.length; i++) {
      let sentence = sentences[i].trim();

      if (sentence === '') continue;

      // Fix repetitive sentence starters
      if (i > 0) {
        const prevSentence = sentences[i - 1];
        sentence = this.avoidRepetitiveStart(sentence, prevSentence);
      }

      // Ensure natural transitions
      if (i > 0 && i < sentences.length - 1) {
        sentence = this.addNaturalTransition(sentence, sentences[i - 1], sentences[i + 1]);
      }

      flowingSentences.push(sentence);
    }

    return flowingSentences.join('. ') + (text.match(/[.!?]$/) || [''])[0];
  }

  avoidRepetitiveStart(current, previous) {
    const currentStart = current.split(' ')[0].toLowerCase();
    const previousStart = previous.split(' ')[0].toLowerCase();

    if (currentStart === previousStart) {
      // Add variation
      const variations = {
        'the': ['this', 'that', 'a'],
        'it': ['this', 'that', 'the thing'],
        'however': ['but', 'still', 'yet', 'though'],
        'furthermore': ['plus', 'also', 'what\'s more'],
        'moreover': ['besides', 'also', 'in addition']
      };

      if (variations[currentStart]) {
        const variation = variations[currentStart][Math.floor(Math.random() * variations[currentStart].length)];
        return current.replace(new RegExp(`^${currentStart}`, 'i'), variation);
      }
    }

    return current;
  }

  addNaturalTransition(current, _previous, _next) {
    // Add transitional phrases where needed
    const transitionWords = ['also', 'plus', 'and', 'but', 'however', 'though'];

    const contextBoost = (_previous && _previous.trim() ? 0.03 : 0) + (_next && _next.trim() ? 0.02 : 0);
    if (Math.random() < 0.1 + contextBoost) {
      const transition = transitionWords[Math.floor(Math.random() * transitionWords.length)];
      return `${transition}, ${current.charAt(0).toLowerCase() + current.slice(1)}`;
    }

    return current;
  }

  addHumanDecisionMaking(text) {
    // Simulate human decision-making process
    const decisions = [
      () => this.addPersonalReflection(text),
      () => this.addConsiderationProcess(text),
      () => this.addSpontaneousThought(text),
      () => this.addUncertaintyExpression(text)
    ];

    // Apply 1-2 human decision elements
    const numDecisions = Math.floor(Math.random() * 2) + 1;
    let decidedText = text;

    for (let i = 0; i < numDecisions; i++) {
      const decision = decisions[Math.floor(Math.random() * decisions.length)];
      decidedText = decision();
    }

    return decidedText;
  }

  addPersonalReflection(text) {
    const reflections = [
      'I\'ve been thinking about this and',
      'It just occurred to me that',
      'I can\'t help but think that',
      'Personally, I believe that',
      'In my own experience,'
    ];

    if (Math.random() < 0.3) {
      const reflection = reflections[Math.floor(Math.random() * reflections.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 0) {
        sentences[0] = `${reflection} ${sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1)}`;
      }

      return sentences.join('.');
    }

    return text;
  }

  addConsiderationProcess(text) {
    const considerations = [
      'after giving it some thought',
      'having considered all the options',
      'thinking it through carefully',
      'weighing all the factors',
      'taking everything into account'
    ];

    if (Math.random() < 0.25) {
      const consideration = considerations[Math.floor(Math.random() * considerations.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 1) {
        const insertIndex = Math.floor(sentences.length / 2);
        sentences[insertIndex] = `${consideration}, ${sentences[insertIndex].trim()}`;
      }

      return sentences.join('.');
    }

    return text;
  }

  addSpontaneousThought(text) {
    const spontaneous = [
      'oh, and another thing',
      'wait, I just realized',
      'actually, come to think of it',
      'you know what?',
      'here\'s the thing',
      'come to think of it'
    ];

    if (Math.random() < 0.2) {
      const thought = spontaneous[Math.floor(Math.random() * spontaneous.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 1) {
        const insertIndex = Math.floor(sentences.length * 0.7);
        sentences[insertIndex] = `${thought}, ${sentences[insertIndex].trim()}`;
      }

      return sentences.join('.');
    }

    return text;
  }

  addUncertaintyExpression(text) {
    const uncertainties = [
      'I\'m not entirely sure, but',
      'I think, though I could be wrong, that',
      'it seems to me, though I\'m not certain, that',
      'if I had to guess, I\'d say that',
      'I\'m pretty sure that'
    ];

    if (Math.random() < 0.25) {
      const uncertainty = uncertainties[Math.floor(Math.random() * uncertainties.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 0) {
        sentences[0] = `${uncertainty} ${sentences[0].charAt(0).toLowerCase() + sentences[0].slice(1)}`;
      }

      return sentences.join('.');
    }

    return text;
  }

  simulateHumanWritingProcess(text) {
    // Simulate the human writing process with revisions and second thoughts
    let processed = text;

    // Add revision markers
    if (Math.random() < 0.05) {
      processed = this.addRevisionMarkers(processed);
    }

    // Add second thoughts
    if (Math.random() < 0.05) {
      processed = this.addSecondThoughts(processed);
    }

    // Add clarification attempts
    if (Math.random() < 0.05) {
      processed = this.addClarifications(processed);
    }

    return processed;
  }

  addRevisionMarkers(text) {
    const revisionMarkers = [
      'or rather', 'I should say', 'actually', 'come to think of it',
      'on second thought', 'or maybe I should say'
    ];

    if (Math.random() < 0.3) {
      const marker = revisionMarkers[Math.floor(Math.random() * revisionMarkers.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 1) {
        const insertIndex = Math.floor(sentences.length / 2);
        const originalSentence = sentences[insertIndex];
        const revisedPart = this.generateRevisedVersion(originalSentence);

        sentences[insertIndex] = `${originalSentence} ${marker} ${revisedPart}`;
      }

      return sentences.join('.');
    }

    return text;
  }

  generateRevisedVersion(sentence) {
    // Generate a slightly different version of the sentence
    const words = sentence.split(' ');

    if (words.length > 5) {
      // Replace a few words with synonyms
      const synonymMap = {
        'important': 'significant',
        'big': 'large',
        'good': 'great',
        'bad': 'terrible',
        'use': 'utilize',
        'make': 'create',
        'get': 'obtain',
        'help': 'assist'
      };

      let revised = sentence;
      Object.entries(synonymMap).forEach(([original, synonym]) => {
        if (Math.random() < 0.3) {
          revised = revised.replace(new RegExp(`\\b${original}\\b`, 'gi'), synonym);
        }
      });

      return revised;
    }

    return sentence;
  }

  addSecondThoughts(text) {
    const secondThoughts = [
      'though I\'m not entirely sure about that',
      'but then again, maybe I\'m wrong',
      'though I could be mistaken',
      'but that\'s just my take on it',
      'though others might see it differently'
    ];

    if (Math.random() < 0.25) {
      const thought = secondThoughts[Math.floor(Math.random() * secondThoughts.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 0) {
        sentences[sentences.length - 1] += ` ${thought}`;
      }

      return sentences.join('.');
    }

    return text;
  }

  addClarifications(text) {
    const clarifications = [
      'what I mean is',
      'to clarify',
      'in other words',
      'to put it another way',
      'what I\'m trying to say is'
    ];

    if (Math.random() < 0.3) {
      const clarification = clarifications[Math.floor(Math.random() * clarifications.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 1) {
        const insertIndex = Math.floor(sentences.length * 0.6);
        sentences[insertIndex] = `${clarification} ${sentences[insertIndex].trim()}`;
      }

      return sentences.join('.');
    }

    return text;
  }

  finalHumanTouches(text) {
    // Apply final human-like touches
    let final = text;

    // Add occasional emphasis
    if (Math.random() < 0.05) {
      final = this.addEmphasis(final);
    }

    // Add natural rhythm variations
    if (Math.random() < 0.08) {
      final = this.addRhythmVariation(final);
    }

    // Add final personal touch
    if (Math.random() < 0.05) {
      final = this.addPersonalTouch(final);
    }

    return final;
  }

  buildCommonErrorDatabase() {
    return {
      typos: {
        'the': ['teh', 'hte', 'tge'],
        'and': ['adn', 'an', 'nad'],
        'that': ['taht', 'thta', 'htat'],
        'with': ['wiht', 'wth', 'wit'],
        'for': ['fro', 'fo', 'fir'],
        'you': ['yuo', 'yu', 'u'],
        'are': ['aer', 'ar', 're'],
        'is': ['si', 'i'],
        'to': ['ot', 'too', 't'],
        'of': ['fo', 'ov'],
        'in': ['ni', 'on'],
        'it': ['ti', 't'],
        'on': ['no', 'in'],
        'at': ['ta', 'et'],
        'by': ['yb', 'bi'],
        'as': ['sa', 'es'],
        'be': ['eb', 'ba'],
        'or': ['ro', 'ar'],
        'an': ['na', 'en'],
        'if': ['fi', 'ef'],
        'up': ['pu', 'ap'],
        'about': ['aboot', 'abotu', 'abot'],
        'because': ['cuz', 'bc', 'becuse'],
        'really': ['rely', 'reallly', 'relly'],
        'people': ['peeps', 'peole', 'peolpe'],
        'think': ['thnk', 'thnk', 'thik'],
        'know': ['kno', 'knw', 'konw'],
        'would': ['woudl', 'wud', 'woud'],
        'should': ['shoudl', 'shud', 'shoud'],
        'could': ['coudl', 'cud', 'coud'],
        'there': ['their', 'they\'re', 'ther'],
        'their': ['there', 'they\'re', 'thier'],
        'they\'re': ['there', 'their', 'theyre'],
        'your': ['you\'re', 'ur', 'yor'],
        'you\'re': ['your', 'u\'re', 'youre'],
        'believe': ['beleive', 'belive'],
        'receive': ['recieve', 'recive'],
        'definitely': ['definately', 'definatly'],
        'separate': ['seperate', 'separet'],
        'government': ['govment', 'goverment'],
        'environment': ['enviorment', 'enviroment']
      },
      grammar: {
        subjectVerb: [
          { correct: 'is', incorrect: 'are', context: 'singular' },
          { correct: 'are', incorrect: 'is', context: 'plural' },
          { correct: 'was', incorrect: 'were', context: 'singular_past' },
          { correct: 'were', incorrect: 'was', context: 'plural_past' }
        ],
        pronoun: [
          { correct: 'their', incorrect: 'there', context: 'possessive' },
          { correct: 'there', incorrect: 'their', context: 'location' },
          { correct: 'your', incorrect: 'you\'re', context: 'possessive' },
          { correct: 'you\'re', incorrect: 'your', context: 'contraction' }
        ],
        tense: [
          { correct: 'went', incorrect: 'goed', context: 'past' },
          { correct: 'gone', incorrect: 'went', context: 'participle' },
          { correct: 'began', incorrect: 'begun', context: 'past' }
        ]
      },
      punctuation: {
        comma: [
          { correct: '', incorrect: ',', context: 'unnecessary' },
          { correct: ',', incorrect: '', context: 'missing' }
        ],
        apostrophe: [
          { correct: 'it\'s', incorrect: 'its', context: 'contraction' },
          { correct: 'its', incorrect: 'it\'s', context: 'possessive' },
          { correct: 'don\'t', incorrect: 'dont', context: 'contraction' },
          { correct: 'can\'t', incorrect: 'cant', context: 'contraction' }
        ],
        capitalization: [
          { correct: 'i', incorrect: 'I', context: 'pronoun' },
          { correct: 'i\'m', incorrect: 'I\'m', context: 'contraction' }
        ]
      }
    };
  }

  injectHumanErrors(text, errorLevel) {
    const errorRates = this.errorLevels[errorLevel] || this.errorLevels.none;
    let errorInjected = text;

    // Inject typos
    if (Math.random() < errorRates.typoRate) {
      errorInjected = this.injectTypos(errorInjected);
    }

    // Inject grammar errors
    if (Math.random() < errorRates.grammarRate) {
      errorInjected = this.injectGrammarErrors(errorInjected);
    }

    // Inject punctuation errors
    if (Math.random() < errorRates.punctuationRate) {
      errorInjected = this.injectPunctuationErrors(errorInjected);
    }

    return errorInjected;
  }

  injectTypos(text) {
    const words = text.split(' ');
    const typoRate = 0.02; // 2% of words get typos

    for (let i = 0; i < words.length; i++) {
      if (Math.random() < typoRate) {
        const word = words[i].toLowerCase().replace(/[.,!?;:"'()[\]{}]/g, '');

        if (this.commonErrors.typos[word]) {
          const typos = this.commonErrors.typos[word];
          const typo = typos[Math.floor(Math.random() * typos.length)];

          // Preserve original punctuation and capitalization
          const punctuation = words[i].match(/[.,!?;:"'()[\]{}]$/);
          const isCapitalized = words[i][0] === words[i][0].toUpperCase();

          let replacement = typo;
          if (isCapitalized) {
            replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1);
          }
          if (punctuation) {
            replacement += punctuation[0];
          }

          words[i] = replacement;
        }
      }
    }

    return words.join(' ');
  }

  injectGrammarErrors(text) {
    let errorInjected = text;

    // Common human slips: "could of" instead of "could have"
    if (Math.random() < 0.2) {
      errorInjected = errorInjected.replace(/\b(could|should|would) have\b/gi, '$1 of');
    }

    // Double negatives (common in casual speech)
    if (Math.random() < 0.1) {
      errorInjected = errorInjected.replace(/\bdon't have any\b/gi, 'don\'t have no');
      errorInjected = errorInjected.replace(/\bdoesn't have any\b/gi, 'doesn\'t have no');
    }

    // Subject-verb agreement errors (expanded)
    if (Math.random() < 0.3) {
      errorInjected = errorInjected.replace(/\bis\b/g, (match, offset) => {
        const before = text.substring(Math.max(0, offset - 20), offset);
        if (before.match(/\b(they|we|you|people)\b/i)) {
          return 'are';
        }
        return match;
      });
      errorInjected = errorInjected.replace(/\bare\b/g, (match, offset) => {
        const before = text.substring(Math.max(0, offset - 20), offset);
        if (before.match(/\b(he|she|it|everyone|somebody)\b/i)) {
          return 'is';
        }
        return match;
      });
    }

    // Adjective/Adverb confusion
    if (Math.random() < 0.15) {
      errorInjected = errorInjected.replace(/\breally well\b/gi, 'real good');
      errorInjected = errorInjected.replace(/\bdoing well\b/gi, 'doing good');
    }

    // Pronoun confusion (expanded)
    if (Math.random() < 0.25) {
      errorInjected = errorInjected.replace(/\btheir\b/gi, 'there');
      errorInjected = errorInjected.replace(/\byour\b/gi, 'you\'re');
      errorInjected = errorInjected.replace(/\bits\b/gi, 'it\'s');
    }

    // Tense errors (expanded)
    if (Math.random() < 0.2) {
      errorInjected = errorInjected.replace(/\bwent\b/gi, 'goed');
      errorInjected = errorInjected.replace(/\bsaw\b/gi, 'seen');
    }

    return errorInjected;
  }

  injectPunctuationErrors(text) {
    let errorInjected = text;

    // Missing apostrophes
    if (Math.random() < 0.3) {
      errorInjected = errorInjected.replace(/\bdont\b/g, 'dont');
      errorInjected = errorInjected.replace(/\bcant\b/g, 'cant');
      errorInjected = errorInjected.replace(/\bwont\b/g, 'wont');
    }

    // Unnecessary commas
    if (Math.random() < 0.2) {
      errorInjected = errorInjected.replace(/\b(and|but|or)\s+/g, '$1, ');
    }

    // Capitalization errors
    if (Math.random() < 0.2) {
      errorInjected = errorInjected.replace(/\bI\b/g, 'i');
      errorInjected = errorInjected.replace(/\bI'm\b/g, 'i\'m');
    }

    return errorInjected;
  }

  addEmphasis(text) {
    const emphasisMarkers = [
      'really', 'truly', 'absolutely', 'definitely', 'certainly',
      'honestly', 'frankly', 'seriously', 'genuinely'
    ];

    if (Math.random() < 0.3) {
      const emphasis = emphasisMarkers[Math.floor(Math.random() * emphasisMarkers.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 0) {
        const targetIndex = Math.floor(Math.random() * sentences.length);
        sentences[targetIndex] = sentences[targetIndex].replace(
          /\b(good|great|important|amazing|wonderful)\b/gi,
          `${emphasis} $&`
        );
      }

      return sentences.join('.');
    }

    return text;
  }

  addRhythmVariation(text) {
    // Add natural rhythm variations through sentence length mixing
    const sentences = text.split(/[.!?]/);
    const varied = [];

    sentences.forEach((sentence, index) => {
      if (sentence.trim() === '') return;

      // Mix short and long sentences
      if (index % 3 === 0 && Math.random() < 0.5) {
        // Make some sentences deliberately short
        const words = sentence.split(' ');
        if (words.length > 8) {
          const shortVersion = words.slice(0, 4).join(' ');
          varied.push(`${shortVersion}. ${sentence}`);
          return;
        }
      }

      varied.push(sentence);
    });

    return varied.join('.');
  }

  addPersonalTouch(text) {
    const personalTouches = [
      'and that\'s all I have to say about that',
      'but hey, that\'s just my two cents',
      'make of that what you will',
      'take it for what it\'s worth',
      'food for thought, I suppose',
      'draw your own conclusions',
      'but what do I know?'
    ];

    if (Math.random() < 0.05) {
      const touch = personalTouches[Math.floor(Math.random() * personalTouches.length)];
      const sentences = text.split(/[.!?]/);

      if (sentences.length > 0) {
        sentences[sentences.length - 1] += `. ${touch}`;
      }

      return sentences.join('.');
    }

    return text;
  }
}

// Advanced AI Detector for testing
class AdvancedAIDetector {
  constructor() {
    this.detectionPatterns = this.buildAdvancedDetectionPatterns();
    this.llmFingerprints = this.buildLLMFingerprints();
  }

  buildAdvancedDetectionPatterns() {
    return {
      // GPT patterns
      gpt: [
        /\bin today's\s+\w+\s+landscape\b/gi,
        /\bit is (important|crucial|essential|vital) to note\b/gi,
        /\bplays? a (crucial|important|significant|vital) role\b/gi,
        /\bfurthermore,/gi,
        /\bmoreover,/gi,
        /\badditionally,/gi,
        /\bin conclusion\b/gi,
        /\butilize\b/gi,
        /\bleverage\b/gi,
        /\bimplementation\b/gi
      ],

      // Claude patterns
      claude: [
        /\bit's worth noting that\b/gi,
        /\bit's important to understand that\b/gi,
        /\bwhat's particularly interesting is\b/gi,
        /\bthis highlights the fact that\b/gi,
        /\bit's fascinating to consider\b/gi,
        /\bwhen we examine\b/gi,
        /\bwe can see that\b/gi,
        /\bit becomes clear that\b/gi
      ],

      // General AI patterns
      general: [
        /\bthe significance of this\b/gi,
        /\bcannot be overstated\b/gi,
        /\bit should be noted that\b/gi,
        /\bas mentioned (earlier|previously)\b/gi,
        /\bto put it simply\b/gi,
        /\bin other words\b/gi,
        /\bwhat this means is\b/gi,
        /\bthe bottom line is\b/gi
      ],

      // Statistical/formal language
      formal: [
        /\ba (significant|large|substantial) (number|amount|portion) of\b/gi,
        /\bthe majority of\b/gi,
        /\bthe vast majority of\b/gi,
        /\bit is evident that\b/gi,
        /\bit is clear that\b/gi,
        /\bresearch has shown that\b/gi,
        /\bstudies have demonstrated that\b/gi
      ]
    };
  }

  buildLLMFingerprints() {
    return {
      // Syntactic fingerprints
      syntax: {
        avgSentenceLength: 18.5,
        passiveVoiceRatio: 0.15,
        complexSentenceRatio: 0.35,
        transitionWordDensity: 0.08
      },

      // Lexical fingerprints
      lexical: {
        formalWordRatio: 0.12,
        technicalTermDensity: 0.06,
        hedgingLanguageRatio: 0.04,
        abstractNounRatio: 0.09
      },

      // Semantic fingerprints
      semantic: {
        topicConsistency: 0.95,
        logicalFlowScore: 0.92,
        argumentStructureRegularity: 0.88,
        evidenceCitationPattern: 0.15
      }
    };
  }

  analyzeText(text) {
    const results = {
      overallScore: 0,
      gptScore: this.calculateGPTScore(text),
      claudeScore: this.calculateClaudeScore(text),
      formalScore: this.calculateFormalScore(text),
      syntacticFingerprint: this.analyzeSyntacticFingerprint(text),
      lexicalFingerprint: this.analyzeLexicalFingerprint(text),
      semanticFingerprint: this.analyzeSemanticFingerprint(text),
      riskLevel: 'unknown',
      detailedAnalysis: {}
    };

    results.overallScore = this.calculateOverallScore(results);
    results.riskLevel = this.determineRiskLevel(results.overallScore);
    results.detailedAnalysis = this.generateDetailedAnalysis(text, results);

    return results;
  }

  calculateGPTScore(text) {
    const patterns = this.detectionPatterns.gpt;
    let score = 0;

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 8;
      }
    });

    return Math.min(100, score);
  }

  calculateClaudeScore(text) {
    const patterns = this.detectionPatterns.claude;
    let score = 0;

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 7;
      }
    });

    return Math.min(100, score);
  }

  calculateFormalScore(text) {
    const patterns = this.detectionPatterns.formal;
    let score = 0;

    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        score += matches.length * 6;
      }
    });

    return Math.min(100, score);
  }

  analyzeSyntacticFingerprint(text) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const words = text.split(/\s+/);

    const avgSentenceLength = words.length / sentences.length;
    const passiveVoiceMatches = text.match(/\b(is|are|was|were|being|been)\s+\w+ed\b/gi) || [];
    const passiveVoiceRatio = passiveVoiceMatches.length / sentences.length;

    const complexSentences = sentences.filter(s => s.split(/[,;]/).length > 2);
    const complexSentenceRatio = complexSentences.length / sentences.length;

    const transitionWords = text.match(/\b(however|moreover|furthermore|additionally|consequently|therefore|thus)\b/gi) || [];
    const transitionWordDensity = transitionWords.length / words.length;

    return {
      avgSentenceLength,
      passiveVoiceRatio,
      complexSentenceRatio,
      transitionWordDensity,
      matchesLLMFingerprint: this.compareSyntacticFingerprint(avgSentenceLength, passiveVoiceRatio, complexSentenceRatio, transitionWordDensity)
    };
  }

  compareSyntacticFingerprint(avgLength, passiveRatio, complexRatio, transitionDensity) {
    const syntax = this.llmFingerprints.syntax;

    const lengthMatch = Math.abs(avgLength - syntax.avgSentenceLength) < 3;
    const passiveMatch = Math.abs(passiveRatio - syntax.passiveVoiceRatio) < 0.05;
    const complexMatch = Math.abs(complexRatio - syntax.complexSentenceRatio) < 0.1;
    const transitionMatch = Math.abs(transitionDensity - syntax.transitionWordDensity) < 0.02;

    return lengthMatch && passiveMatch && complexMatch && transitionMatch;
  }

  analyzeLexicalFingerprint(text) {
    const words = text.split(/\s+/);

    const formalWords = text.match(/\b(utilize|implement|facilitate|optimize|leverage|substantial|significant|crucial|vital)\b/gi) || [];
    const formalWordRatio = formalWords.length / words.length;

    const technicalTerms = text.match(/\b(methodology|implementation|optimization|framework|methodology|strategic|scalable)\b/gi) || [];
    const technicalTermDensity = technicalTerms.length / words.length;

    const hedgingLanguage = text.match(/\b(may|might|could|would|should|perhaps|possibly|potentially|appears to|seems to)\b/gi) || [];
    const hedgingRatio = hedgingLanguage.length / words.length;

    const abstractNouns = text.match(/\b(significance|importance|relevance|applicability|effectiveness|efficiency)\b/gi) || [];
    const abstractNounRatio = abstractNouns.length / words.length;

    return {
      formalWordRatio,
      technicalTermDensity,
      hedgingLanguageRatio: hedgingRatio,
      abstractNounRatio,
      matchesLLMFingerprint: this.compareLexicalFingerprint(formalWordRatio, technicalTermDensity, hedgingRatio, abstractNounRatio)
    };
  }

  compareLexicalFingerprint(formalRatio, technicalRatio, hedgingRatio, abstractRatio) {
    const lexical = this.llmFingerprints.lexical;

    const formalMatch = Math.abs(formalRatio - lexical.formalWordRatio) < 0.03;
    const technicalMatch = Math.abs(technicalRatio - lexical.technicalTermDensity) < 0.02;
    const hedgingMatch = Math.abs(hedgingRatio - lexical.hedgingLanguageRatio) < 0.02;
    const abstractMatch = Math.abs(abstractRatio - lexical.abstractNounRatio) < 0.03;

    return formalMatch && technicalMatch && hedgingMatch && abstractMatch;
  }

  analyzeSemanticFingerprint(text) {
    // Simplified semantic analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());

    // Topic consistency (simplified)
    const topics = this.extractTopics(text);
    const topicConsistency = topics.length > 0 ? 0.95 : 0.7;

    // Logical flow (simplified)
    const transitionWords = text.match(/\b(however|moreover|furthermore|additionally|consequently|therefore|thus|hence)\b/gi) || [];
    const logicalFlowScore = Math.min(1, transitionWords.length / (sentences.length * 0.3));

    // Argument structure regularity (simplified)
    const argumentMarkers = text.match(/\b(evidence|suggests|indicates|demonstrates|proves|shows)\b/gi) || [];
    const argumentStructureRegularity = Math.min(1, argumentMarkers.length / (sentences.length * 0.2));

    // Evidence citation pattern (simplified)
    const evidenceCitations = text.match(/\b(studies|research|data|findings|evidence)\b/gi) || [];
    const evidenceCitationPattern = Math.min(1, evidenceCitations.length / (sentences.length * 0.15));

    return {
      topicConsistency,
      logicalFlowScore,
      argumentStructureRegularity,
      evidenceCitationPattern,
      matchesLLMFingerprint: this.compareSemanticFingerprint(topicConsistency, logicalFlowScore, argumentStructureRegularity, evidenceCitationPattern)
    };
  }

  extractTopics(text) {
    // Simplified topic extraction
    const commonWords = text.match(/\b\w{4,}\b/gi) || [];
    const wordFreq = {};

    commonWords.forEach(_word => {
      wordFreq[_word.toLowerCase()] = (wordFreq[_word.toLowerCase()] || 0) + 1;
    });

    return Object.entries(wordFreq)
      .filter(([, freq]) => freq > 2)
      .map(([word]) => word);
  }

  compareSemanticFingerprint(topicConsistency, logicalFlow, argumentRegularity, evidencePattern) {
    const semantic = this.llmFingerprints.semantic;

    const topicMatch = Math.abs(topicConsistency - semantic.topicConsistency) < 0.1;
    const logicalMatch = Math.abs(logicalFlow - semantic.logicalFlowScore) < 0.15;
    const argumentMatch = Math.abs(argumentRegularity - semantic.argumentStructureRegularity) < 0.1;
    const evidenceMatch = Math.abs(evidencePattern - semantic.evidenceCitationPattern) < 0.05;

    return topicMatch && logicalMatch && argumentMatch && evidenceMatch;
  }

  calculateOverallScore(results) {
    const weights = {
      gptScore: 0.25,
      claudeScore: 0.2,
      formalScore: 0.15,
      syntacticFingerprint: 0.2,
      lexicalFingerprint: 0.1,
      semanticFingerprint: 0.1
    };

    let score = 0;
    score += results.gptScore * weights.gptScore;
    score += results.claudeScore * weights.claudeScore;
    score += results.formalScore * weights.formalScore;
    score += (results.syntacticFingerprint.matchesLLMFingerprint ? 50 : 0) * weights.syntacticFingerprint;
    score += (results.lexicalFingerprint.matchesLLMFingerprint ? 30 : 0) * weights.lexicalFingerprint;
    score += (results.semanticFingerprint.matchesLLMFingerprint ? 20 : 0) * weights.semanticFingerprint;

    return Math.min(100, Math.max(0, score));
  }

  determineRiskLevel(score) {
    if (score >= 80) return 'extremely_high';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    if (score >= 20) return 'low';
    return 'minimal';
  }

  generateDetailedAnalysis(text, results) {
    return {
      summary: `Text shows ${results.riskLevel} risk of AI detection with overall score of ${results.overallScore}/100`,
      keyFindings: [
        `GPT patterns detected: ${results.gptScore}/100`,
        `Claude patterns detected: ${results.claudeScore}/100`,
        `Formal language score: ${results.formalScore}/100`,
        `Syntactic fingerprint match: ${results.syntacticFingerprint.matchesLLMFingerprint}`,
        `Lexical fingerprint match: ${results.lexicalFingerprint.matchesLLMFingerprint}`,
        `Semantic fingerprint match: ${results.semanticFingerprint.matchesLLMFingerprint}`
      ],
      recommendations: this.generateRecommendations(results),
      confidence: Math.max(0, 100 - results.overallScore)
    };
  }

  generateRecommendations(results) {
    const recommendations = [];

    if (results.gptScore > 30) {
      recommendations.push('Reduce GPT-specific patterns like \'furthermore,\' and \'moreover,\'');
      recommendations.push('Avoid overused AI phrases like \'in today\'s landscape\'');
    }

    if (results.claudeScore > 25) {
      recommendations.push('Reduce Claude-specific hedging language');
      recommendations.push('Use more direct, less cautious phrasing');
    }

    if (results.formalScore > 40) {
      recommendations.push('Reduce formal academic language');
      recommendations.push('Add more casual, conversational elements');
    }

    if (results.syntacticFingerprint.matchesLLMFingerprint) {
      recommendations.push('Vary sentence length and structure more');
      recommendations.push('Reduce passive voice usage');
      recommendations.push('Use fewer transition words');
    }

    if (results.lexicalFingerprint.matchesLLMFingerprint) {
      recommendations.push('Reduce formal vocabulary density');
      recommendations.push('Use more everyday language');
      recommendations.push('Add colloquial expressions');
    }

    if (recommendations.length === 0) {
      recommendations.push('Text appears human-like with minimal AI patterns');
      recommendations.push('Maintain current writing style');
    }

    return recommendations;
  }
}

// Initialize the advanced humanizer when DOM is loaded
/**
 * Comprehensive AI Detection Testing Suite
 */
class AIDetectionTestSuite {
  constructor(humanizer, detector) {
    this.humanizer = humanizer;
    this.detector = detector;
    this.testResults = [];
  }

  /**
     * Run comprehensive detection tests
     */
  async runComprehensiveTests(testTexts = []) {
    const defaultTests = [
      {
        name: 'Academic Essay Sample',
        text: 'Artificial intelligence has revolutionized numerous industries by providing innovative solutions to complex problems. The implementation of machine learning algorithms has enabled organizations to optimize their operational efficiency while reducing costs. Furthermore, the integration of AI technologies has facilitated enhanced decision-making processes across various sectors. Consequently, businesses that leverage these advanced technologies gain significant competitive advantages in the marketplace.',
        expectedStyle: 'academic'
      },
      {
        name: 'Business Report Sample',
        text: 'This report analyzes the quarterly performance metrics and provides comprehensive insights into operational efficiency. The data demonstrates substantial improvements in key performance indicators, particularly in customer satisfaction and revenue generation. Moreover, the implementation of new strategic initiatives has yielded positive results across multiple departments.',
        expectedStyle: 'professional'
      },
      {
        name: 'Creative Writing Sample',
        text: 'The old lighthouse stood proudly against the crashing waves, its weathered face telling stories of countless storms weathered and ships guided to safety. Sarah felt a strange connection to this ancient sentinel, as if it held secrets that only she could understand.',
        expectedStyle: 'creative'
      },
      {
        name: 'Casual Blog Post',
        text: 'Hey everyone! So I was thinking about trying out this new recipe I found online, and honestly, it turned out way better than I expected. You know how sometimes you try something new and it\'s just kind of meh? Well, this definitely wasn\'t one of those times!',
        expectedStyle: 'casual'
      }
    ];

    const tests = testTexts.length > 0 ? testTexts : defaultTests;

    console.log('🧪 Starting comprehensive AI detection testing...');

    for (const test of tests) {
      console.log(`Testing: ${test.name}`);

      // Test original text
      const originalAnalysis = this.detector.analyzeText(test.text);

      // Humanize with basic pipeline
      const basicResult = await this.humanizer.humanizeText(test.text, {
        style: test.expectedStyle,
        useAdvanced: false
      });
      const basicAnalysis = this.detector.analyzeText(basicResult.humanizedText);

      // Humanize with advanced pipeline
      console.log('  Applying advanced humanization...');
      const advancedResult = await this.humanizer.humanizeText(test.text, {
        style: test.expectedStyle,
        useAdvanced: true
      });
      const advancedAnalysis = this.detector.analyzeText(advancedResult.humanizedText);

      // Multi-tool Simulation (Turnitin, GPTZero, Originality.ai)
      const multiToolAnalysis = this.simulateMultiToolDetection(advancedResult.humanizedText);

      const testResult = {
        name: test.name,
        original: {
          text: test.text.substring(0, 100) + '...',
          detectionScore: originalAnalysis.overallScore,
          riskLevel: originalAnalysis.riskLevel
        },
        basicPipeline: {
          detectionScore: basicAnalysis.overallScore,
          riskLevel: basicAnalysis.riskLevel,
          improvement: originalAnalysis.overallScore - basicAnalysis.overallScore
        },
        advancedPipeline: {
          detectionScore: advancedAnalysis.overallScore,
          riskLevel: advancedAnalysis.riskLevel,
          improvement: originalAnalysis.overallScore - advancedAnalysis.overallScore,
          multiTool: multiToolAnalysis
        }
      };

      this.testResults.push(testResult);

      console.log(`  Original: ${originalAnalysis.overallScore}% AI (${originalAnalysis.riskLevel})`);
      console.log(`  Basic: ${basicAnalysis.overallScore}% AI (${basicAnalysis.riskLevel}) - Improved by ${testResult.basicPipeline.improvement}%`);
      console.log(`  Advanced: ${advancedAnalysis.overallScore}% AI (${advancedAnalysis.riskLevel}) - Improved by ${testResult.advancedPipeline.improvement}%`);
      console.log(`  Multi-Tool Evasion: ${multiToolAnalysis.evasionConfidence}% confidence`);
    }

    return this.generateTestReport();
  }

  simulateMultiToolDetection(text) {
    // Simulate specialized detection algorithms
    const results = {
      turnitin: this.simulateTurnitin(text),
      gptZero: this.simulateGPTZero(text),
      originality: this.simulateOriginality(text),
      evasionConfidence: 0
    };

    results.evasionConfidence = Math.round(
      (results.turnitin.evasionScore + results.gptZero.evasionScore + results.originality.evasionScore) / 3
    );

    return results;
  }

  simulateTurnitin(text) {
    // Turnitin focuses on similarity and pattern matching
    const patterns = text.match(/\b\w{5,}\b/g) || [];
    const uniquePatterns = new Set(patterns).size;
    const evasionScore = Math.min(100, (uniquePatterns / Math.max(1, patterns.length)) * 120);
    return { name: 'Turnitin', evasionScore };
  }

  simulateGPTZero(text) {
    // GPTZero focuses on perplexity and burstiness
    const sentences = text.split(/[.!?]/).filter(s => s.trim());
    const lengths = sentences.map(s => s.split(' ').length);
    const variance = this.calculateVariance(lengths);
    const evasionScore = Math.min(100, (variance / 10) * 100);
    return { name: 'GPTZero', evasionScore };
  }

  simulateOriginality(text) {
    // Originality.ai uses deep learning classifiers
    const detectorAnalysis = this.detector.analyzeText(text);
    const evasionScore = 100 - detectorAnalysis.overallScore;
    return { name: 'Originality.ai', evasionScore };
  }

  calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    return numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
  }

  /**
     * Generate comprehensive test report
     */
  generateTestReport() {
    const totalTests = this.testResults.length;
    const avgOriginalScore = this.testResults.reduce((sum, result) => sum + result.original.detectionScore, 0) / totalTests;
    const avgBasicScore = this.testResults.reduce((sum, result) => sum + result.basicPipeline.detectionScore, 0) / totalTests;
    const avgAdvancedScore = this.testResults.reduce((sum, result) => sum + result.advancedPipeline.detectionScore, 0) / totalTests;

    const basicImprovement = avgOriginalScore - avgBasicScore;
    const advancedImprovement = avgOriginalScore - avgAdvancedScore;
    const advancedVsBasic = avgBasicScore - avgAdvancedScore;

    const report = {
      summary: {
        totalTests,
        averageOriginalScore: Math.round(avgOriginalScore),
        averageBasicScore: Math.round(avgBasicScore),
        averageAdvancedScore: Math.round(avgAdvancedScore),
        basicPipelineImprovement: Math.round(basicImprovement),
        advancedPipelineImprovement: Math.round(advancedImprovement),
        advancedVsBasicImprovement: Math.round(advancedVsBasic)
      },
      recommendations: this.generateRecommendations(avgAdvancedScore),
      detailedResults: this.testResults
    };

    console.log('\n📊 COMPREHENSIVE TEST REPORT');
    console.log('=====================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Average Original AI Score: ${Math.round(avgOriginalScore)}%`);
    console.log(`Average Basic Pipeline Score: ${Math.round(avgBasicScore)}% (↓${Math.round(basicImprovement)}%)`);
    console.log(`Average Advanced Pipeline Score: ${Math.round(avgAdvancedScore)}% (↓${Math.round(advancedImprovement)}%)`);
    console.log(`Advanced vs Basic Improvement: ↓${Math.round(advancedVsBasic)}%`);
    console.log('\n' + this.generateRecommendations(avgAdvancedScore).join('\n'));

    return report;
  }

  /**
     * Generate recommendations based on test results
     */
  generateRecommendations(avgScore) {
    const recommendations = [];

    if (avgScore < 20) {
      recommendations.push('✅ Excellent! Advanced pipeline is highly effective.');
    } else if (avgScore < 35) {
      recommendations.push('✅ Good performance! Advanced pipeline is working well.');
    } else if (avgScore < 50) {
      recommendations.push('⚠️ Moderate performance. Consider additional fine-tuning.');
    } else {
      recommendations.push('🔴 Needs improvement. Review humanization strategies.');
    }

    if (avgScore > 30) {
      recommendations.push('Consider increasing burstiness and syntactic jitter.');
      recommendations.push('💡 Try adjusting error injection levels for better results.');
      recommendations.push('💡 Experiment with different writing styles.');
    }

    return recommendations;
  }

  /**
     * Test against specific AI patterns
     */
  testSpecificPatterns() {
    const patterns = [
      {
        name: 'Formal Transitions',
        text: 'Furthermore, the implementation of these strategies will consequently result in substantial improvements. Moreover, organizations must nevertheless consider alternative approaches.',
        patterns: ['furthermore', 'consequently', 'moreover', 'nevertheless']
      },
      {
        name: 'Academic Language',
        text: 'This comprehensive analysis demonstrates the significant impact of technological advancement on operational efficiency. The substantial improvements indicate optimal implementation strategies.',
        patterns: ['comprehensive', 'demonstrates', 'significant', 'substantial', 'optimal']
      },
      {
        name: 'Business Jargon',
        text: 'We need to leverage our core competencies to maximize ROI and optimize deliverables. This will facilitate seamless integration and enhance scalability.',
        patterns: ['leverage', 'core competencies', 'maximize', 'optimize', 'facilitate']
      }
    ];

    return patterns.map(pattern => {
      const analysis = this.detector.analyzeText(pattern.text);
      return {
        name: pattern.name,
        originalScore: analysis.overallScore,
        detectedPatterns: analysis.detectedPatterns || [],
        riskLevel: analysis.riskLevel
      };
    });
  }
}

// Explicitly expose classes to window for script.js to access
if (typeof window !== 'undefined') {
  window.AdvancedTextHumanizer = AdvancedTextHumanizer;
  window.AdvancedAIDetector = AdvancedAIDetector;
  window.PatternObfuscationEngine = PatternObfuscationEngine;
  window.AIDetectionTestSuite = AIDetectionTestSuite;
}

// Browser initialization - only run in browser environment
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function() {
    try {
      window.advancedHumanizer = new AdvancedTextHumanizer();
      window.advancedDetector = new AdvancedAIDetector();

      // Initialize test suite safely
      if (window.textHumanizer) {
        window.aiDetectionTestSuite = new AIDetectionTestSuite(window.textHumanizer, window.advancedDetector);
      }

      console.log('🚀 Advanced AI Text Humanizer initialized with multi-stage transformation pipeline');
      console.log('🧪 AI Detection Test Suite ready for comprehensive testing');

      // Dispatch event to signal readiness
      document.dispatchEvent(new CustomEvent('advancedHumanizerReady'));

    } catch (e) {
      console.error('Error initializing Advanced Humanizer:', e);
    }
  });
}

// Export for Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AdvancedTextHumanizer,
    PatternObfuscationEngine,
    AdvancedAIDetector,
    AIDetectionTestSuite
  };
}
