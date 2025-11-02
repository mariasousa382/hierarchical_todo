import React, { useState } from "react";

export default function TaskItem({
  task,
  lists,
  onAddSubtask,
  onToggle,
  onDelete,
  onEdit,
  onMove,
}) {
  const [showInput, setShowInput] = useState(false);
  const [subtaskText, setSubtaskText] = useState("");
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.content);
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);

  const handleAdd = () => {
    if (!subtaskText.trim()) return;
    onAddSubtask(task.id, subtaskText);
    setSubtaskText("");
    setShowInput(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    onEdit(task.id, editText);
    setEditing(false);
  };

  const handleCollapseToggle = () => {
    onToggle(task.id, { collapsed: !task.collapsed });
  };

  const handleMoveClick = () => {
    setShowMoveDropdown(!showMoveDropdown);
  };

  const handleMoveSelect = (newListId) => {
    onMove(task.id, newListId);
    setShowMoveDropdown(false);
  };

  return (
    <li style={{ marginLeft: task.parent_id ? "1.5rem" : "0" }}>
      <div>
        {/* ✅ Checkbox toggle */}
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onToggle(task.id, { completed: !task.completed })}
        />

        {/* ✅ Collapse toggle */}
        <button
          onClick={handleCollapseToggle}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          {task.collapsed ? "▶" : "▼"}
        </button>

        {/* ✅ Edit task text */}
        {editing ? (
          <form onSubmit={handleEditSubmit} style={{ display: "inline" }}>
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
              onBlur={() => setEditing(false)}
            />
          </form>
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            style={{
              textDecoration: task.completed ? "line-through" : "none",
              cursor: "pointer",
            }}
          >
            {task.content}
          </span>
        )}

        {/* ✅ Subtask + delete buttons */}
        <button onClick={() => setShowInput(!showInput)}>+ Subtask</button>
        <button onClick={() => onDelete(task.id)}>🗑</button>

        {/* ✅ Only show move button for top-level tasks */}
        {!task.parent_id && (
          <>
            <button onClick={handleMoveClick}>Move</button>
            {showMoveDropdown && (
              <select
                onChange={(e) => handleMoveSelect(parseInt(e.target.value))}
                defaultValue=""
              >
                <option value="" disabled>
                  Select list
                </option>
                {lists
                  .filter((l) => l.id !== task.list_id) // exclude current list
                  .map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.name}
                    </option>
                  ))}
              </select>
            )}
          </>
        )}
      </div>

      {/* ✅ Subtask input field */}
      {showInput && (
        <div style={{ marginLeft: "1.5rem" }}>
          <input
            value={subtaskText}
            onChange={(e) => setSubtaskText(e.target.value)}
            placeholder="Subtask name"
          />
          <button onClick={handleAdd}>Add</button>
        </div>
      )}

      {/* ✅ Recursive rendering of subtasks */}
      {!task.collapsed && task.subtasks?.length > 0 && (
        <ul>
          {task.subtasks.map((sub) => (
            <TaskItem
              key={sub.id}
              task={sub}
              lists={lists}
              onAddSubtask={onAddSubtask}
              onToggle={onToggle}
              onDelete={onDelete}
              onEdit={onEdit}
              onMove={onMove}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
