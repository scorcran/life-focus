export default function TodayPage() {
  return (
    <section aria-labelledby="today-heading">
      <h1 id="today-heading" className="display-lg" style={{ margin: 0 }}>
        Today
      </h1>
      <p className="body-lg" style={{ color: 'var(--light-on-surface-variant)' }}>
        What matters now.
      </p>
    </section>
  );
}
