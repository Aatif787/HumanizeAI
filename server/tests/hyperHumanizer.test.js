const HumanizerService = require('../services/AdvancedHumanizer');
const { describe, test, expect, beforeAll } = global;

describe('Hyper-Advanced Humanizer', () => {
  let service;

  beforeAll(() => {
    service = new HumanizerService();
  });

  test('advanced humanization latency under 100ms (short text)', async () => {
    const input = 'I need a calm, clear rewrite that reads naturally.';
    const t0 = Date.now();
    const result = await service.humanizeAdvanced(input, { style: 'casual', complexity: 'medium', formality: 'medium' });
    const t1 = Date.now();
    expect(typeof result.text).toBe('string');
    expect(t1 - t0).toBeLessThan(100);
  });

  test('graceful degradation when LLM unavailable', async () => {
    const input = 'Please rewrite in a friendly tone.';
    process.env.LLM_GATEWAY_URL = '';
    const result = await service.humanizeAdvanced(input, { style: 'casual', complexity: 'low', formality: 'low' });
    expect(typeof result.text).toBe('string');
    expect(result.transformations.length).toBeGreaterThan(0);
  });

  test('stress: parallel requests succeed without errors', async () => {
    const inputs = Array.from({ length: 50 }, (_, i) => `Sample ${i} text for stress test.`);
    const tasks = inputs.map(t => service.humanizeAdvanced(t, { style: 'casual', complexity: 'low', formality: 'low' }));
    const results = await Promise.all(tasks);
    const ok = results.every(r => typeof r.text === 'string');
    expect(ok).toBe(true);
  });
});
