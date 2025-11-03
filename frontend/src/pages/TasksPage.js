/**
 * Tasks View Page Component
 * 
 * Displays all tasks for a specific todo list with hierarchical structure.
 * This is a protected route (requires authentication).
 * 
 * Features:
 * - View all tasks in a nested tree structure
 * - Create new top-level tasks
 * - Add subtasks to any task (unlimited nesting)
 * - Mark tasks complete/incomplete (cascades to subtasks)
 * - Collapse/expand task hierarchies
 * - Edit task content inline
 * - Delete tasks (cascades to all subtasks)
 * - Move top-level tasks to other lists
 * - Navigate back to lists overview
 */

import React, { useState, useEffect, useCallback } from "react";
import TaskItem from "../components/TaskItem";

export default function TasksPage({ listId, onBack }) {
  // State for tasks in hierarchical structure (nested objects)
  const [tasks, setTasks] = useState([]);
  // State for all lists (needed for the "Move" dropdown)
  const [lists, setLists] = useState([]);
  // State for new task creation form
  const [newTask, setNewTask] = useState("");
  // State for displaying the current list's name in the heading
  const [listName, setListName] = useState("");

  const loadTasks = useCallback(async () => {
    /**
     * Fetch all tasks for this list from the backend.
     */
    try {
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);  // Already in tree structure from backend
      } else {
        setTasks([]);  // Clear tasks if request fails
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);  // Clear tasks on network error
    }
  }, [listId]);  // Recreate function only when listId changes

  const loadLists = useCallback(async () => {
    /**
     * Fetch all lists for the current user.
     * 
     * Needed for two purposes:
     * 1. Find and display the current list's name
     * 2. Populate the "Move" dropdown with other lists
     */
    try {
      const res = await fetch(`/api/lists`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data);
        
        // Find the current list to display its name
        const currentList = data.find((list) => list.id === Number(listId));
        setListName(currentList ? currentList.name : "");
      } else {
        setLists([]);
        setListName("");
      }
    } catch (err) {
      console.error("Failed to load lists:", err);
      setLists([]);
      setListName("");
    }
  }, [listId]);  

  // Load tasks and lists when listId changes
  useEffect(() => {
    loadTasks();
    loadLists();
  }, [listId, loadTasks, loadLists]);

  const handleAddTask = async (e) => {
    /**
     * Create a new top-level task in this list.
     * 
     * Sends POST request without parent_id (defaults to None on backend).
     * This creates a root-level task that can have subtasks added later.
     */
    e.preventDefault();  // Prevent form submission page reload
    if (!newTask.trim()) return;  // Don't create empty tasks

    try {
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newTask }),  // No parent_id = top-level
      });
      if (res.ok) {
        await loadTasks();  // Refresh to show new task
        setNewTask("");     // Clear input field
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  const handleAddSubtask = async (parentId, content) => {
    /**
     * Create a subtask under a specific parent task.
     * 
     * Called from TaskItem when user adds a subtask.
     * Sends POST request with parent_id to create child task.
     */
    try {
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, parent_id: parentId }),
      });
      if (res.ok) {
        await loadTasks();  // Refresh to show new subtask in hierarchy
      }
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };

  const handleToggle = async (taskId, updates) => {
    /**
     * Update task properties (completion status or collapse state).
     * Backend handles the cascade logic for completion.
     */
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),  // { completed: true } or { collapsed: true }
      });
      await loadTasks();  // Refresh to show updated state
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const handleDelete = async (taskId) => {
    /**
     * Delete a task and all its subtasks.
     * Backend cascade delete 
     */
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await loadTasks();  // Refresh to remove deleted task
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const handleEdit = async (taskId, newContent) => {
    /**
     * Update a task's text content.
     * 
     * Called from TaskItem when user saves edited text.
     * Sends PATCH request with new content.
     */
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newContent }),
      });
      await loadTasks();  // Refresh to show updated content
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

  const handleMove = async (taskId, newListId) => {
    /**
     * Move a top-level task (and all its subtasks) to another list.
     * 
     * Only works for root-level tasks (subtasks stay with their parent).
     * Backend cascade_move() updates list_id for the task and all descendants.
     */
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ list_id: newListId }),
      });
      if (res.ok) {
        await loadTasks();  // Refresh to remove moved task
      }
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  };

  return (
    <div className="page-container">
      {/* Back button returns to lists overview */}
      <button onClick={onBack} className="back-btn">
        ← Back to Lists
      </button>
      
      {/* Display current list name, or fallback to "List [id]" */}
      <h2>{listName || `List ${listId}`}</h2>

      {/* Form for creating new top-level tasks */}
      <form onSubmit={handleAddTask} className="form-inline">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task"
        />
        <button type="submit">Add Task</button>
      </form>

      {/* Render task list */}
      {/* Each TaskItem renders itself and recursively renders its subtasks */}
      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}              // Task object with nested subtasks
            lists={lists}            // All lists for move dropdown
            onAddSubtask={handleAddSubtask}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onMove={handleMove}      // Only available for top-level tasks
          />
        ))}
      </ul>
    </div>
  );
}