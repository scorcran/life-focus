import type { CSSProperties } from 'react';
import type { PolicyTemplateState } from '@life-focus/ledger';
import { POLICY_TEMPLATES } from '../../../lib/onboarding/policy-templates.js';
import {
  acceptPolicyTemplate,
  declinePolicyTemplate,
} from '../../../app/(app)/onboarding/boundaries-actions.js';

/**
 * Starter policy templates (Story 2.2). Two cards, each with the template's
 * plain-language explanation, an editable textarea pre-filled with the saved or
 * default content, and Accept / Decline forms. Status is conveyed by TEXT +
 * ICON (never color alone): an accepted card shows "✓ Accepted", a declined card
 * shows "○ Not added" plus a calm "you can add this later" line and is NOT
 * re-prompted with the editor. Keyboard-operable with the global focus ring.
 * Light tokens only.
 */

const sectionStyle: CSSProperties = {
  marginTop: 24,
  maxWidth: 640,
  padding: '20px 24px',
  backgroundColor: 'var(--light-surface-container-low)',
  border: '1px solid var(--light-outline-variant)',
  borderRadius: 12,
};

const cardStyle: CSSProperties = {
  marginTop: 16,
  padding: '16px 20px',
  borderRadius: 8,
  border: '1px solid var(--light-outline-variant)',
  backgroundColor: 'var(--light-surface-container-lowest)',
};

const statusStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  color: 'var(--light-on-surface-variant)',
};

const textareaStyle: CSSProperties = {
  width: '100%',
  marginTop: 12,
  padding: '10px 12px',
  borderRadius: 6,
  border: '1px solid var(--light-outline)',
  background: 'var(--light-surface)',
  color: 'var(--light-on-surface)',
  fontFamily: 'var(--font-body)',
  fontSize: 16,
  lineHeight: 1.6,
  minHeight: 96,
  resize: 'vertical',
};

const acceptButtonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: 'none',
  backgroundColor: 'var(--light-primary)',
  color: 'var(--light-on-primary)',
  cursor: 'pointer',
};

const declineButtonStyle: CSSProperties = {
  padding: '10px 18px',
  borderRadius: 8,
  border: '1px solid var(--light-outline)',
  backgroundColor: 'transparent',
  color: 'var(--light-on-surface-variant)',
  cursor: 'pointer',
};

/** The status marker + word for a template — shape + text, never color alone. */
function statusChip(status: PolicyTemplateState['status']): { icon: string; word: string } {
  switch (status) {
    case 'accepted':
      return { icon: '✓', word: 'Accepted' };
    case 'declined':
      return { icon: '○', word: 'Not added' };
    default:
      return { icon: '◇', word: 'Not yet decided' };
  }
}

export function PolicyTemplates({ policies }: { policies: readonly PolicyTemplateState[] }) {
  const byId = new Map(policies.map((p) => [p.templateId, p]));

  return (
    <section aria-labelledby="policies-heading" style={sectionStyle}>
      <h2 id="policies-heading" className="headline-md" style={{ margin: 0, color: 'var(--light-on-surface)' }}>
        Starter policies
      </h2>
      <p className="body-md" style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}>
        Two starting rules for how your day is planned. Edit the wording to fit you, then accept — or
        set one aside for now.
      </p>

      {POLICY_TEMPLATES.map((template) => {
        const state = byId.get(template.id);
        const status = state?.status ?? 'pending';
        const chip = statusChip(status);
        const editorValue = state?.status === 'accepted' && state.content
          ? state.content
          : template.defaultContent;

        return (
          <article
            key={template.id}
            aria-labelledby={`policy-${template.id}-title`}
            style={cardStyle}
          >
            <h3
              id={`policy-${template.id}-title`}
              className="headline-md"
              style={{ margin: 0, fontSize: 20, color: 'var(--light-on-surface)' }}
            >
              {template.title}
            </h3>
            <p className="body-md" style={{ margin: '6px 0 0', color: 'var(--light-on-surface-variant)' }}>
              {template.explanation}
            </p>

            <p className="label-caps" style={{ margin: '12px 0 0', ...statusStyle }}>
              <span aria-hidden="true">{chip.icon}</span>
              <span>{chip.word}</span>
            </p>

            {status === 'declined' ? (
              // Recorded once, never nagged — a calm "add later" state, no editor.
              <p className="body-md" style={{ margin: '8px 0 0', color: 'var(--light-on-surface-variant)' }}>
                You can add this later from Policy &amp; Boundaries.
              </p>
            ) : (
              <>
                <form action={acceptPolicyTemplate}>
                  <input type="hidden" name="templateId" value={template.id} />
                  <label
                    htmlFor={`policy-${template.id}-content`}
                    className="label-md"
                    style={{ display: 'block', marginTop: 12 }}
                  >
                    Policy wording
                  </label>
                  <textarea
                    id={`policy-${template.id}-content`}
                    name="content"
                    required
                    defaultValue={editorValue}
                    style={textareaStyle}
                  />
                  <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                    <button type="submit" className="label-md" style={acceptButtonStyle}>
                      {status === 'accepted' ? 'Save changes' : 'Accept'}
                    </button>
                  </div>
                </form>
                {status !== 'accepted' && (
                  <form action={declinePolicyTemplate} style={{ marginTop: 12 }}>
                    <input type="hidden" name="templateId" value={template.id} />
                    <button type="submit" className="label-md" style={declineButtonStyle}>
                      Not now
                    </button>
                  </form>
                )}
              </>
            )}
          </article>
        );
      })}
    </section>
  );
}
