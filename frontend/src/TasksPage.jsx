import { useEffect, useState } from "react";
import TaskModal from "./TaskModal.jsx";
import "./TasksPage.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  async function fetchTasks(query) {
    setLoading(true);
    setError("");
    try {
      const url = query
        ? `${API_BASE}/api/tasks?search=${encodeURIComponent(query)}`
        : `${API_BASE}/api/tasks`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load tasks: ${res.status}`);
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTasks(search.trim() || undefined);
  };

  const handleOpenTask = (task) => {
    setSelectedTask(task);
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
  };

  const handleTaskCreated = () => {
    setIsCreateOpen(false);
    fetchTasks(search.trim() || undefined);
  };

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">TeamBoard</div>

        <nav className="sidebar-nav">
          <button className="sidebar-link sidebar-link-active">
            Search bar with tasks
          </button>
          <button className="sidebar-link">Project description</button>
          <button className="sidebar-link">Kanban board</button>
        </nav>

        <div className="sidebar-bottom">
          <button className="sidebar-link">FAQ</button>
          <button className="sidebar-link">Notifications</button>
          <button className="sidebar-link sidebar-profile">
            Account / User name
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="main">
        <header className="main-header">
          <h1>Search bar with tasks</h1>
          <button
            className="new-task-btn"
            onClick={() => setIsCreateOpen(true)}
          >
            New task
          </button>
        </header>

        <section className="tasks-panel">
          <form className="tasks-search" onSubmit={handleSearchSubmit}>
            <label>
              Search bar
              <input
                type="text"
                placeholder="Search by summary, assignee or keyword..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button type="submit">Search</button>
          </form>

          {loading && <p>Loading tasks…</p>}
          {error && <p className="error-message">{error}</p>}

          <div className="tasks-table-wrapper">
            <table className="tasks-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Summary</th>
                  <th>State</th>
                  <th>Assigned to</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="empty-cell">
                      No tasks found
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr
                      key={task.id}
                      className="tasks-row"
                      onClick={() => handleOpenTask(task)}
                    >
                      <td>{task.id}</td>
                      <td>{task.title}</td>
                      <td>{task.status}</td>
                      <td>{task.assignee_name || "-"}</td>
                      <td>{task.priority}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Modals */}
      {isCreateOpen && (
        <TaskModal
          mode="create"
          onClose={() => setIsCreateOpen(false)}
          onCreated={handleTaskCreated}
        />
      )}

      {selectedTask && (
        <TaskModal mode="view" task={selectedTask} onClose={handleCloseTask} />
      )}
    </div>
  );
}
