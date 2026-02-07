const { AdvancedTextHumanizer, AdvancedAIDetector, AIDetectionTestSuite } = require('./advanced-humanizer.js');

async function main() {
    const humanizer = new AdvancedTextHumanizer();
    const detector = new AdvancedAIDetector();
    const suite = new AIDetectionTestSuite(humanizer, detector);

    console.log('--- Running Comprehensive AI Detection Tests ---');
    const report = await suite.runComprehensiveTests();

    console.log('\n--- Test Report Summary ---');
    console.log(JSON.stringify(report.summary, null, 2));

    console.log('\n--- Detailed Recommendations ---');
    report.recommendations.forEach(rec => console.log(`- ${rec}`));
}

main().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
