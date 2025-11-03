/**
 * Task Item Component - Recursive Task Renderer
 * 
 * This is the core component that makes hierarchical tasks work.
 * It renders a single task and recursively renders all its subtasks.
 * 
 * Key Features:
 * - Displays task with checkbox, content, and action buttons
 * - Inline editing (double-click to edit, Enter to save, Escape to cancel)
 * - Add subtasks (creates nested tasks under this task)
 * - Toggle completion (checkbox marks complete/incomplete)
 * - Collapse/expand subtasks (show/hide children)
 * - Delete task and all subtasks (with confirmation)
 * - Move top-level tasks to other lists (only for root tasks)
 * 
 * TaskItem renders itself for each subtask.
 * Instead of having separate components for different nesting levels,
 * TaskItem calls itself for each child. This handles arbitrary depth
 * automatically without additional code. Each level has the same functionality.
 */

import React, { useState } from "react";
import "./TaskItem.css";

export default function TaskItem({
  task,
  lists,
  onAddSubtask,
  onToggle,
  onDelete,
  onEdit,
  onMove,
}) {
  // Local state for subtask creation form
  const [showInput, setShowInput] = useState(false);
  const [subtaskText, setSubtaskText] = useState("");
  
  // Local state for inline editing
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(task.content);
  
  // Local state for move dropdown
  const [showMoveDropdown, setShowMoveDropdown] = useState(false);

  const handleAdd = () => {
    /**
     * Create a new subtask under this task.
     */
    if (!subtaskText.trim()) return;  // Don't create empty subtasks
    onAddSubtask(task.id, subtaskText);  // Call parent handler
    setSubtaskText("");  // Clear input
    setShowInput(false);  // Hide form
  };

  const handleEditSubmit = (e) => {
    /**
     * Save edited task content.
     */
    e.preventDefault();
    if (!editText.trim()) return;  // Don't save empty content
    onEdit(task.id, editText);  // Call parent handler
    setEditing(false);  // Exit edit mode
  };

  const handleCollapseToggle = () => {
    /**
     * Toggle visibility of subtasks.
     * 
     * Updates the task's 'collapsed' property in the database.
     * This is UI state that persists across page reloads.
     */
    onToggle(task.id, { collapsed: !task.collapsed });
  };

  const handleMoveClick = () => {
    /**
     * Show/hide the move dropdown menu.
     * Only available for top-level tasks (!task.parent_id).
     * Dropdown shows all other lists the task can be moved to.
     */
    setShowMoveDropdown(!showMoveDropdown);
  };

  const handleMoveSelect = (newListId) => {
    /**
     * Move this task (and all subtasks) to another list.
     * 
     * Called when user selects a list from the dropdown.
     * Backend handles updating list_id for task and all descendants.
     */
    onMove(task.id, newListId);
    setShowMoveDropdown(false);
  };

  // Check if this task has children (for collapse button visibility)
  const hasChildren = task.subtasks && task.subtasks.length > 0;

  return (
    <li className={`task-item ${task.parent_id ? 'nested' : ''}`}>
      <div className={`task-card ${task.completed ? 'completed' : ''}`}>
        <div className="task-header">
          {/* Checkbox for marking task complete/incomplete */}
          {/* Completion cascades to all subtasks (handled by backend) */}
          <input
            type="checkbox"
            className="task-checkbox"
            checked={task.completed || false}
            onChange={() => {
              console.log('Checkbox clicked!', task.id);
              onToggle(task.id, { completed: !task.completed });
            }}
          />

          {/* Collapse/expand button - only shown if task has children */}
          {hasChildren && (
            <button
              onClick={handleCollapseToggle}
              className="collapse-btn"
            >
              {task.collapsed ? "▶" : "▼"}
            </button>
          )}

          {/* Task content - shows input when editing, text otherwise */}
          {editing ? (
            // EDIT MODE: Input field with keyboard shortcuts
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="task-edit-input"
              autoFocus  // Automatically focus when entering edit mode
              onBlur={handleEditSubmit}  // Save when clicking away
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleEditSubmit(e);  // Save on Enter
                if (e.key === 'Escape') setEditing(false);   // Cancel on Escape
              }}
            />
          ) : (
            // VIEW MODE: Text with double-click to edit
            <span
              className={`task-content ${task.completed ? 'completed' : ''}`}
              onDoubleClick={() => setEditing(true)}  // Enter edit mode
            >
              {task.content}
            </span>
          )}
        </div>

        {/* Action buttons row */}
        <div className="task-actions">
          {/* Add subtask button - toggles input form */}
          <button 
            onClick={() => setShowInput(!showInput)} 
            className="action-btn subtask-btn"
          >
            ➕ Subtask
          </button>
          
          {/* Delete button with confirmation dialog */}
          <button 
            onClick={() => {
              if (window.confirm('Delete this task and all subtasks?')) {
                onDelete(task.id);
              }
            }}
            className="action-btn delete-btn"
          >
            🗑️ Delete
          </button>

          {/* Move button - only visible for top-level tasks */}
          {!task.parent_id && (
            <>
              <button 
                onClick={handleMoveClick} 
                className="action-btn move-btn"
              >
                📋 Move
              </button>
              
              {/* Move dropdown - shows when move button clicked */}
              {showMoveDropdown && (
                <select
                  onChange={(e) => handleMoveSelect(parseInt(e.target.value))}
                  defaultValue=""
                  className="move-dropdown"
                >
                  <option value="" disabled>
                    Select list
                  </option>
                  {/* Filter out current list - can't move to same list */}
                  {lists
                    .filter((l) => l.id !== task.list_id)
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

        {/* Subtask creation form - shown when showInput is true */}
        {showInput && (
          <div className="subtask-input-container">
            <div className="subtask-input-form">
              <input
                value={subtaskText}
                onChange={(e) => setSubtaskText(e.target.value)}
                placeholder="Enter subtask name..."
                className="subtask-input"
                autoFocus  // Focus automatically when form appears
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();      // Create on Enter
                  if (e.key === 'Escape') setShowInput(false);  // Cancel on Escape
                }}
              />
              <button onClick={handleAdd} className="subtask-add-btn">
                Add
              </button>
              <button 
                onClick={() => setShowInput(false)} 
                className="action-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RECURSIVE PART: Render all subtasks */}
      {/* Only render if not collapsed and has children */}
      {/* Each child renders as a TaskItem, which can have its own children */}
      {!task.collapsed && hasChildren && (
        <ul className="subtasks-list">
          {task.subtasks.map((child) => (
            // Each child gets the same props and callbacks
            // This creates the unlimited nesting capability
            <TaskItem
              key={child.id}
              task={child}              
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