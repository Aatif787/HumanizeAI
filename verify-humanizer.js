const { AdvancedTextHumanizer } = require('./advanced-humanizer.js');
const EnhancedAIDetectionTester = require('./enhanced-ai-detection-tester.js');

async function verifyHumanizer() {
  const humanizer = new AdvancedTextHumanizer();
  const tester = new EnhancedAIDetectionTester();

  const aiText = 'In today\'s rapidly evolving technological landscape, the significance of artificial intelligence cannot be overstated. It is important to note that the implementation of advanced algorithms consistently demonstrates superior performance across a multitude of sectors. Furthermore, the systematic methodology employed in data analysis facilitates the optimization of operational efficiency, thereby enabling organizations to achieve substantial competitive advantages. Moreover, the integration of machine learning models provides comprehensive solutions to complex problems that were previously considered unsolvable. In conclusion, it should be noted that the continued development of AI technology will undoubtedly transform the way we approach innovation and strategic decision-making in the future.';

  console.log('--- Original AI Text ---');
  console.log(aiText);

  console.log('\n--- Humanizing... ---');
  const result = await humanizer.humanizeText(aiText);

  if (!result.success) {
    console.error('Humanization failed:', result.error);
    return;
  }

  const humanizedText = result.humanizedText;
  console.log('\n--- Humanized Text ---');
  console.log(humanizedText);

  console.log('\n--- Running Enhanced AI Detection Test ---');

  // Test both original and humanized text
  const detectors = ['gptzero', 'turnitin', 'originality', 'crossplag'];

  console.log('\n[Original Text Analysis]');
  const originalResults = tester.performEnhancedAITests(aiText, detectors);
  console.log(`Overall AI Score: ${originalResults.overallScore.toFixed(2)}%`);
  detectors.forEach(d => {
    if (originalResults.individualResults[d]) {
      console.log(`- ${d}: ${originalResults.individualResults[d].aiScore.toFixed(2)}% (Confidence: ${originalResults.individualResults[d].confidence}%)`);
    }
  });

  console.log('\n[Humanized Text Analysis]');
  const humanizedResults = tester.performEnhancedAITests(humanizedText, detectors);
  console.log(`Overall AI Score: ${humanizedResults.overallScore.toFixed(2)}%`);
  detectors.forEach(d => {
    if (humanizedResults.individualResults[d]) {
      console.log(`- ${d}: ${humanizedResults.individualResults[d].aiScore.toFixed(2)}% (Confidence: ${humanizedResults.individualResults[d].confidence}%)`);
      if (humanizedResults.individualResults[d].aiScore > 50) {
        console.log(`  Patterns detected: ${humanizedResults.individualResults[d].detectedPatterns.length}`);
        console.log(`  Recommendations: ${humanizedResults.individualResults[d].recommendations.slice(0, 2).join(', ')}`);
      }
    }
  });

  if (humanizedResults.overallScore < originalResults.overallScore) {
    console.log(`\nSUCCESS: AI score reduced from ${originalResults.overallScore.toFixed(2)}% to ${humanizedResults.overallScore.toFixed(2)}%`);
  } else {
    console.log(`\nFAILURE: AI score did not improve significantly (${humanizedResults.overallScore.toFixed(2)}%)`);
  }
}

verifyHumanizer().catch(err => console.error(err));
