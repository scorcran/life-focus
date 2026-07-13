import { describe, it, expect } from 'vitest';
import { sendNotification } from './index.js';

describe('packages/notify', () => {
  it('send notification returns a notification with userId and message', async () => {
    const notif = await sendNotification('user-1', 'Hello!');
    expect(notif.userId).toBe('user-1');
    expect(notif.message).toBe('Hello!');
    expect(notif.sentAt instanceof Date).toBe(true);
  });
});
