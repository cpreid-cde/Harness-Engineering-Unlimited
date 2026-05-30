import type { Assignee } from "../../types/ticket";

export function AssigneeQueue({ assignees }: { assignees: Assignee[] }) {
  return (
    <aside className="queue" aria-label="Assignee queue">
      <h2>Assignee queue</h2>
      {assignees.map((assignee) => (
        <div className="queue__row" key={assignee.id}>
          <div>
            <strong>{assignee.name}</strong>
            <span>{assignee.queue.replace("_", " ")}</span>
          </div>
          <b>{assignee.activeTickets}</b>
        </div>
      ))}
    </aside>
  );
}
