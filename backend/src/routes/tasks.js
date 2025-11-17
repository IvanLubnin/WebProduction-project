import express from "express";
import { query } from "../db/db.js";
// import { authRequired } from "../middlewares.js"; 

const router = express.Router();

/**
 * GET /api/tasks
 * Optional query param: ?search=...
 * Global search by title, description, assignee username/email
 */
router.get("/", async (req, res) => {
  const { search } = req.query;

  try {
    let result;

    if (search) {
      const pattern = `%${search}%`;
      result = await query(
        `
        SELECT
          t.*,
          u.username AS assignee_name,
          u.email    AS assignee_email
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        WHERE
          t.title ILIKE $1
          OR t.description ILIKE $1
          OR u.username ILIKE $1
          OR u.email ILIKE $1
        ORDER BY t.created_at DESC
        `,
        [pattern],
      );
    } else {
      result = await query(
        `
        SELECT
          t.*,
          u.username AS assignee_name,
          u.email    AS assignee_email
        FROM tasks t
        LEFT JOIN users u ON t.assigned_to = u.id
        ORDER BY t.created_at DESC
        `,
      );
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/tasks
 * body: { title, description?, priority?, dueDate?, assignedTo? }
 */
router.post("/", async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // TODO: replace `createdBy` with req.user.id when auth is wired
    const createdBy = 1;

    const result = await query(
      `
      INSERT INTO tasks
        (title, description, priority, due_date, created_by, assigned_to)
      VALUES
        ($1, $2, COALESCE($3, 'normal'), $4, $5, $6)
      RETURNING *
      `,
      [title, description || null, priority, dueDate || null, createdBy, assignedTo || null],
    );

    res.status(201).json({ message: "Task created", task: result.rows[0] });
  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/tasks/:id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query(
      `
      SELECT
        t.*,
        u.username AS assignee_name,
        u.email    AS assignee_email
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.id = $1
      `,
      [id],
    );

    const task = result.rows[0];

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(task);
  } catch (err) {
    console.error("Error fetching task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * PUT /api/tasks/:id
 * body: { title?, description?, status?, priority?, dueDate?, assignedTo? }
 */
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  try {
    const result = await query(
      `
      UPDATE tasks
      SET
        title       = COALESCE($1, title),
        description = COALESCE($2, description),
        status      = COALESCE($3, status),
        priority    = COALESCE($4, priority),
        due_date    = COALESCE($5, due_date),
        assigned_to = COALESCE($6, assigned_to),
        updated_at  = NOW()
      WHERE id = $7
      RETURNING *
      `,
      [title, description, status, priority, dueDate, assignedTo, id],
    );

    const task = result.rows[0];

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task updated", task });
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/tasks/:id
 */
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await query("DELETE FROM tasks WHERE id = $1 RETURNING id", [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
