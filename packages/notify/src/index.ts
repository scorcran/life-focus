/** Notify stub — in-app notifications adapter (AD-5 broker). */

export interface Notification {
  readonly id: string;
  readonly userId: string;
  readonly message: string;
  readonly sentAt: Date;
}

/** Stub: send a notification. Real transport deferred beyond MVP. */
export async function sendNotification(userId: string, message: string): Promise<Notification> {
  return {
    // crypto.randomUUID() is a global on Node 24; later stories will switch to uuidv7 per convention
    id: `notif-${crypto.randomUUID()}`,
    userId,
    message,
    sentAt: new Date(),
  };
}
