import { useState } from "react";
import "./TasksPage.css"; // можно вынести в отдельный TaskModal.css, если захочешь

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function TaskModal({ mode, task, onClose, onCreated }) {
  const isCreate = mode === "create";

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "normal");
  const [assignedTo, setAssignedTo] = useState(
    task?.assigned_to ? String(task.assigned_to) : "",
  );
  const [status] = useState(task?.status || "open");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!isCreate) {
      onClose();
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          priority,
          assignedTo: assignedTo ? Number(assignedTo) : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create task");
      } else {
        onCreated?.(data.task);
      }
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="modal-header">
          <h2>{isCreate ? "New task" : task.title}</h2>
        </header>

        <div className="modal-body">
          {/* левая часть — описание */}
          <div className="modal-main">
            {isCreate ? (
              <>
                <input
                  className="modal-title-input"
                  placeholder="Task summary..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <textarea
                  className="modal-description"
                  placeholder="Write a task description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </>
            ) : (
              <>
                <p className="modal-task-summary">{task.title}</p>
                <pre className="modal-task-description">
                  {task.description || "No description"}
                </pre>
              </>
            )}
          </div>

          {/* правая часть — свойства */}
          <aside className="modal-sidebar">
            {!isCreate && (
              <div className="modal-field">
                <span className="label">ID</span>
                <span>{task.id}</span>
              </div>
            )}

            <div className="modal-field">
              <span className="label">Priority</span>
              {isCreate ? (
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="low">Low</option>
                  <option value="normal">Medium</option>
                  <option value="high">High</option>
                </select>
              ) : (
                <span>{task.priority}</span>
              )}
            </div>

            <div className="modal-field">
              <span className="label">State</span>
              {isCreate ? (
                <span>Will be set to “open”</span>
              ) : (
                <span>{status}</span>
              )}
            </div>

            <div className="modal-field">
              <span className="label">Assigned to</span>
              {isCreate ? (
                <input
                  type="number"
                  placeholder="User ID (optional)"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                />
              ) : (
                <span>{task.assignee_name || "-"}</span>
              )}
            </div>
          </aside>
        </div>

        {error && <p className="error-message">{error}</p>}

        <footer className="modal-footer">
          {isCreate ? (
            <>
              <button className="primary-btn" onClick={handleSubmit}>
                Create
              </button>
              <button className="secondary-btn" onClick={onClose}>
                Cancel
              </button>
            </>
          ) : (
            <button className="secondary-btn" onClick={onClose}>
              Close
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
