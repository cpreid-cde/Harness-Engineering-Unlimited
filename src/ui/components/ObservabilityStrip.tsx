export function ObservabilityStrip() {
  return (
    <section className="observability" aria-label="Agent legible feedback">
      <div>
        <strong>Logs</strong>
        <span>ticket.search emits query and result count</span>
      </div>
      <div>
        <strong>Traces</strong>
        <span>journey=ticket-search records API latency</span>
      </div>
      <div>
        <strong>Checks</strong>
        <span>boundaries, doc links, journeys, quality score</span>
      </div>
    </section>
  );
}
