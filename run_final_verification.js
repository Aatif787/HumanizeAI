
const { AdvancedTextHumanizer, AdvancedAIDetector, AIDetectionTestSuite } = require('./advanced-humanizer.js');

async function runFinalVerification() {
  console.log('Starting Final AI Detection Evasion Verification...');

  const humanizer = new AdvancedTextHumanizer();
  const detector = new AdvancedAIDetector();
  const suite = new AIDetectionTestSuite(humanizer, detector);

  console.log('\n--- Running Comprehensive Tests ---');
  const results = await suite.runComprehensiveTests();

  console.log('\n--- Verification Summary ---');
  console.log(`Average Original AI Score: ${results.summary.averageOriginalScore}%`);
  console.log(`Average Advanced Pipeline Score: ${results.summary.averageAdvancedScore}%`);
  console.log(`Total Improvement: ${results.summary.advancedPipelineImprovement}%`);

  if (results.summary.averageAdvancedScore < 20) {
    console.log('\nSUCCESS: Advanced humanizer consistently evades AI detection (Average score < 20%)!');
  } else {
    console.log('\nWARNING: AI detection risk still remains above target (Average score >= 20%).');
  }
}

runFinalVerification().catch(console.error);
