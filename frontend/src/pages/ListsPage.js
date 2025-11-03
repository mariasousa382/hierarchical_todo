/**
 * Lists Overview Page Component
 * 
 * Displays all todo lists for the logged-in user.
 * This is the main landing page after login.
 * 
 * Features:
 * - Create new lists with a form input
 * - View all existing lists
 * - Inline editing of list names (double-click or edit button)
 * - Delete lists with confirmation
 * - Click on a list to view its tasks (handled by parent App.js)
 */

import React, { useState, useEffect } from "react";

export default function ListsPage({ onSelectList }) {
  // State for storing all lists from the database
  const [lists, setLists] = useState([]);
  // State for the new list creation form
  const [newListName, setNewListName] = useState("");
  // State for inline editing: which list is being edited (null = none)
  const [editingId, setEditingId] = useState(null);
  // State for inline editing: temporary text during edit
  const [editText, setEditText] = useState("");

  const loadLists = async () => {
    /**
     * Fetch all lists for the current user from the backend.
     */
    try {
      const res = await fetch("/api/lists", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setLists(data);
      }
    } catch (err) {
      console.error("Failed to load lists:", err);
    }
  };

  // Load lists when component first mounts
  useEffect(() => {
    loadLists();
  }, []);

  const handleCreate = async (e) => {
    /**
     * Create a new todo list.
     */
    e.preventDefault();  // Prevent page reload on form submit
    if (!newListName.trim()) return;  // Don't create empty lists
    
    const res = await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newListName }),
    }); // Sends POST request to /api/lists with the list name.
    
    if (res.ok) {
      setNewListName("");  // Clear the input field
      await loadLists();   // Refresh the list to show new list
    }
  };

  const handleDelete = async (listId) => {
    /**
     * Delete a list and all its tasks.
     */
    if (!window.confirm("Delete this list and all its tasks?")) return;
    // Shows confirmation dialog before deleting (prevents accidents).
    
    const res = await fetch(`/api/lists/${listId}`, {
      method: "DELETE",
      credentials: "include",
    }); // Sends DELETE request to /api/lists/:id. 
    // Backend handles cascade delete of tasks.
    
    if (res.ok) {
      await loadLists();  // Refresh to remove deleted list
    }
  };

  const handleEdit = async (listId) => {
    /**
     * Save the edited list name to the backend.
     */
    if (!editText.trim()) return;  // Don't save empty names
    
    const res = await fetch(`/api/lists/${listId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: editText }),
    }); // Sends PATCH request with the new name.
    
    if (res.ok) {
      setEditingId(null);  // Exit edit mode
      setEditText("");     // Clear edit buffer
      await loadLists();   // Refresh to show new name
    }
  };

  const startEditing = (list) => {
    /**
     * Enter inline edit mode for a list.
     */
    setEditingId(list.id); // Sets editingId to track which list is being edited.
    setEditText(list.name); // Copies current name to editText for modification.
  };

  const cancelEditing = () => {
    /**
     * Exit edit mode without saving changes.
     * Resets editingId and editText to their initial states.
     */
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="page-container">
      <h1>Your Lists</h1>

      {/* Form for creating a new list */}
      <form onSubmit={handleCreate} className="form-inline">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New list name"
        />
        <button type="submit">Add List</button>
      </form>

      {/* Display all existing lists */}
      <ul className="task-list">
        {lists.map((list) => (
          <li key={list.id}>
            {/* Conditional rendering: show edit mode OR view mode */}
            {editingId === list.id ? (
              // EDIT MODE: Show input field and save/cancel buttons
              <>
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEdit(list.id);   // Save on Enter
                    if (e.key === 'Escape') cancelEditing();      // Cancel on Escape
                  }}
                  autoFocus  // Automatically focus input when entering edit mode
                  style={{ flex: 1 }}
                />
                <button onClick={() => handleEdit(list.id)}>Save</button>
                <button onClick={cancelEditing} className="delete-btn">
                  Cancel
                </button>
              </>
            ) : (
              // VIEW MODE: Show list name and action buttons
              <>
                {/* Clicking list name navigates to its tasks */}
                <button 
                  onClick={() => onSelectList(list.id)}
                  className="list-item-btn"
                >
                  {list.name}
                </button>
                
                {/* Edit button enters inline edit mode */}
                <button 
                  onClick={() => startEditing(list)}
                  style={{ 
                    background: 'transparent', 
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  ✏️ Edit
                </button>
                
                {/* Delete button removes list after confirmation */}
                <button className="delete-btn" onClick={() => handleDelete(list.id)}>
                  🗑️ Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
