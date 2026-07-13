import { describe, it, expect } from 'vitest';
import { appendEvent } from './index.js';

describe('packages/ledger', () => {
  it('appends a domain event and returns it with eventSeq', async () => {
    const event = await appendEvent({
      eventType: 'CommitmentAccepted',
      actor: 'user-1',
      context: 'work',
      payload: { title: 'Team meeting' },
    });
    expect(event.eventType).toBe('CommitmentAccepted');
    expect(event.context).toBe('work');
    expect(typeof event.eventSeq).toBe('number');
  });
});
