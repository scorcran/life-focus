import { describe, it, expect } from 'vitest';
import { routeRequest } from './index.js';

describe('packages/llm-gateway', () => {
  it('returns a stub LLM response with zero cost', async () => {
    const response = await routeRequest({
      model: 'claude-haiku-4-5',
      promptVersion: '1.0',
      input: 'test',
    });
    expect(response.costUsd).toBe(0);
    expect(typeof response.output).toBe('string');
  });
});
