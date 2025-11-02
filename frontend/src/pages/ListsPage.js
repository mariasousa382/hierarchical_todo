import React, { useState, useEffect } from "react";

export default function ListsPage({ onSelectList }) {
  const [lists, setLists] = useState([]);
  const [newList, setNewList] = useState("");

  // ✅ Load all lists
  const loadLists = async () => {
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

  // ✅ Load lists on mount
  useEffect(() => {
    loadLists();
  }, []);

  // ✅ Add a new list
  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newList.trim()) return;
    await fetch("/api/lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name: newList }),
    });
    setNewList("");
    loadLists();
  };

  // ✅ Delete a list
  const handleDeleteList = async (listId, listName) => {
    if (!window.confirm(`Delete list "${listName}"?`)) return;
    await fetch(`/api/lists/${listId}`, {
      method: "DELETE",
      credentials: "include",
    });
    loadLists();
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Your Lists</h2>

      <form onSubmit={handleAddList}>
        <input
          value={newList}
          onChange={(e) => setNewList(e.target.value)}
          placeholder="New list name"
        />
        <button type="submit">Add List</button>
      </form>

      <ul>
        {lists.map((list) => (
          <li key={list.id} style={{ marginTop: "0.5rem" }}>
            <button onClick={() => onSelectList(list.id)}>
              {list.name}
            </button>
            <button
              onClick={() => handleDeleteList(list.id, list.name)}
              className="delete-btn"
            >
              🗑 Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
