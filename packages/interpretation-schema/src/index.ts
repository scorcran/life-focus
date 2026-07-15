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

/** Protection levels for policy rules. */
export const ProtectionLevelSchema = z.enum(['private', 'sensitive', 'shared', 'public']);

export type ProtectionLevel = z.infer<typeof ProtectionLevelSchema>;

/** A single policy rule. */
export const PolicyRuleSchema = z.object({
  id: z.string(),
  description: z.string(),
  protectionLevel: ProtectionLevelSchema,
});

export type PolicyRule = z.infer<typeof PolicyRuleSchema>;

/**
 * Canonical PolicySet — single source of truth (AD-2: no duplication).
 * Consumed by both @life-focus/policy and @life-focus/planner.
 */
export const PolicySetSchema = z.object({
  rules: z.array(PolicyRuleSchema).readonly(),
  maxWorkHoursPerDay: z.number().positive().max(24),
});

export type PolicySet = z.infer<typeof PolicySetSchema>;
