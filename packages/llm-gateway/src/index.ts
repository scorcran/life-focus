/** LLM Gateway stub — model routing, cost log, prompt versions (AD-3). */

export type ModelId = 'claude-haiku-4-5' | 'claude-sonnet-5';

export interface LlmRequest {
  readonly model: ModelId;
  readonly promptVersion: string;
  readonly input: string;
}

export interface LlmResponse {
  readonly output: string;
  readonly tokensUsed: number;
  readonly costUsd: number;
}

/**
 * Stub: route an LLM request through the single gateway.
 * No actual model calls in Epic 1 — stub returns placeholder.
 */
export async function routeRequest(_req: LlmRequest): Promise<LlmResponse> {
  return { output: '', tokensUsed: 0, costUsd: 0 };
}
