/** Connectors stub — gcal/ placeholder. Adapters write to source-mirror only (AD-7). */

export interface ConnectorSyncResult {
  readonly connectorId: string;
  readonly provider: 'gcal' | 'gmail';
  readonly syncedAt: Date;
  readonly itemCount: number;
}

/** Placeholder gcal connector factory. Real implementation in connectors/gcal/ (Story 1.4). */
export function createGcalConnector(accountId: string): { accountId: string } {
  return { accountId };
}
