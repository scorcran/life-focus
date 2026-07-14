export default function InboxPage() {
  return (
    <section aria-labelledby="inbox-heading">
      <h1 id="inbox-heading" className="headline-lg" style={{ margin: 0 }}>
        Inbox
      </h1>
      <p className="body-lg" style={{ color: 'var(--light-on-surface-variant)' }}>
        Nothing waiting for a decision.
      </p>
    </section>
  );
}
