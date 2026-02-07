/**
 * AI Evasion Verification Test
 * Tests the humanization effectiveness against the built-in AI detector
 */

const AdvancedTextHumanizer = require('./advanced-humanizer');
const OnDeviceDetectionService = require('./server/services/OnDeviceDetectionService');

class EvasionVerificationTest {
  constructor() {
    this.humanizer = new AdvancedTextHumanizer();
    this.detector = new OnDeviceDetectionService();
  }

  async runTests() {
    console.log('🚀 Starting AI Evasion Verification Tests...\n');

    const testCases = [
      {
        name: 'Standard AI Response',
        text: 'Artificial intelligence is a transformative technology that has significantly impacted various industries. Furthermore, it is important to note that machine learning algorithms require extensive data analysis to function effectively. Moreover, the implementation of AI systems necessitates a systematic approach to problem-solving. Therefore, organizations must develop comprehensive strategies for integrating these technologies into their existing infrastructure.'
      },
      {
        name: 'Academic Style AI',
        text: 'The implementation of machine learning algorithms has revolutionized data processing capabilities in modern computing systems. It is essential to consider the implications of such advancements on the future of work and human-machine collaboration. Furthermore, the optimization of these systems remains a primary focus of current research.'
      }
    ];

    for (const testCase of testCases) {
      console.log(`\n--- Testing Case: ${testCase.name} ---`);
      
      // 1. Initial Detection
      const initialResult = await this.detector.detectAI(testCase.text);
      console.log(`Original Detection: ${initialResult.prediction} (${initialResult.confidence}%)`);

      // 2. Humanization
      console.log('Humanizing text...');
      const humanizedResult = await this.humanizer.humanizeText(testCase.text);
      const humanizedText = humanizedResult.humanizedText;
      console.log(`Humanized Text: "${humanizedText.substring(0, 100)}..."`);

      // 3. Post-Humanization Detection
      const finalResult = await this.detector.detectAI(humanizedText);
      console.log(`Final Detection: ${finalResult.prediction} (${finalResult.confidence}%)`);

      if (finalResult.prediction === 'human_written' || finalResult.confidence < initialResult.confidence) {
        console.log('✅ SUCCESS: Evasion improved');
      } else {
        console.log('❌ FAILURE: Evasion did not improve significantly');
      }
    }
  }
}

const tester = new EvasionVerificationTest();
tester.runTests().catch(console.error);
