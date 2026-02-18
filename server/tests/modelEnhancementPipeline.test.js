const { IterativeModelEnhancementPipeline } = require('../../model-enhancement-pipeline.js');
const { describe, test, expect } = global;

describe('IterativeModelEnhancementPipeline', () => {
  test('produces a structured report with validation data', async () => {
    const scenarios = [
      { name: 'baseline', text: 'This is a sample text that needs a more natural tone.' },
      { name: 'edge-empty', text: '' }
    ];
    const pipeline = new IterativeModelEnhancementPipeline({
      iterations: 1,
      targetScore: 100,
      scenarios,
      maxParallel: 5
    });
    const report = await pipeline.run();
    expect(report.bestCandidate).toBeDefined();
    expect(report.validation.edgeCases.length).toBe(1);
    expect(typeof report.bestCandidate.score.averageScore).toBe('number');
  });

  test('stress validation returns a success rate', async () => {
    const pipeline = new IterativeModelEnhancementPipeline({
      iterations: 1,
      targetScore: 100,
      maxParallel: 5
    });
    const report = await pipeline.run();
    expect(report.validation.stress.successRate).toBeGreaterThanOrEqual(0);
    expect(report.validation.stress.successRate).toBeLessThanOrEqual(100);
  });
});
