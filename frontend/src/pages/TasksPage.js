import React, { useState, useEffect, useCallback } from "react";
import TaskItem from "../components/TaskItem";

export default function TasksPage({ listId, onBack }) {
  const [tasks, setTasks] = useState([]);
  const [lists, setLists] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [listName, setListName] = useState("");

  // ✅ Load tasks for this list
  const loadTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error("Failed to load tasks:", err);
      setTasks([]);
    }
  }, [listId]);

  // ✅ Load all lists and find current list name
  const loadLists = useCallback(async () => {
    try {
      const res = await fetch(`/api/lists`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        setLists(data);
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

  useEffect(() => {
    loadTasks();
    loadLists();
  }, [listId, loadTasks, loadLists]);

  // ✅ Add new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newTask }),
      });
      if (res.ok) {
        await loadTasks();
        setNewTask("");
      }
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  // ✅ Add subtask
  const handleAddSubtask = async (parentId, content) => {
    try {
      const res = await fetch(`/api/lists/${listId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content, parent_id: parentId }),
      });
      if (res.ok) {
        await loadTasks();
      }
    } catch (err) {
      console.error("Failed to add subtask:", err);
    }
  };

  // ✅ Toggle complete / collapse
  const handleToggle = async (taskId, updates) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updates),
      });
      await loadTasks();
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  // ✅ Delete task
  const handleDelete = async (taskId) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        credentials: "include",
      });
      await loadTasks();
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  // ✅ Edit task text
  const handleEdit = async (taskId, newContent) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newContent }),
      });
      await loadTasks();
    } catch (err) {
      console.error("Failed to edit task:", err);
    }
  };

  // ✅ Move top-level task to another list
  const handleMove = async (taskId, newListId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ list_id: newListId }),
      });
      if (res.ok) {
        await loadTasks(); // reload tasks in current list
      }
    } catch (err) {
      console.error("Failed to move task:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={onBack}>← Back to Lists</button>
      <h2>{listName || `List ${listId}`}</h2>

      <form onSubmit={handleAddTask}>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task"
        />
        <button type="submit">Add Task</button>
      </form>

      <ul>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            lists={lists}
            onAddSubtask={handleAddSubtask}
            onToggle={handleToggle}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onMove={handleMove} 
          />
        ))}
      </ul>
    </div>
  );
}
