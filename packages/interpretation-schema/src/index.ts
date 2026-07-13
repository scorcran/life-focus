import { z } from 'zod';

/** Zod contract: Assertion — the typed output of LLM extraction (AD-3). */
export const AssertionSchema = z.object({
  id: z.string(),
  fact: z.string(),
  confidence: z.number().min(0).max(1),
  provenance: z.object({
    sourceRef: z.string(),
    model: z.string(),
    promptVersion: z.string(),
  }),
  context: z.enum(['work', 'personal', 'joint']),
});

export type Assertion = z.infer<typeof AssertionSchema>;

/** Stub ContextSnapshot schema — single source of truth for the planner input. */
export const ContextSnapshotSchema = z.object({
  userId: z.string(),
  now: z.date(),
});

export type ContextSnapshot = z.infer<typeof ContextSnapshotSchema>;
