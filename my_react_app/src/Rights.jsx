import React, { useEffect, useState } from "react";
import axios from "axios";

function Rights() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const result = await axios.get("http://localhost:3000/getallusers");
        setUsers(result.data);
      } catch (err) {
        setError("Failed to load users");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Handle checkbox toggle
  const handleChange = (field) => {
    setSelectedUser({
      ...selectedUser,
      [field]: selectedUser[field] === "y" ? "f" : "y",
    });
  };

  // Submit updated rights
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedUser) return;
    setSaving(true);
    try {
      await axios.post("http://localhost:3000/updaterights", {
        total: [selectedUser],
      });
      // Update users list locally
      setUsers(
        users.map((u) =>
          u.username === selectedUser.username ? selectedUser : u
        )
      );
      alert("Rights updated successfully!");
    } catch (err) {
      console.error("Error updating rights:", err);
    } finally {
      setSaving(false);
    }
  };

  // Filtered users by search
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <p>Loading users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  // ✅ Full list of rights fields (old + new)
  const rightsFields = [
    "item",
    "customer",
    "rights",
    "company",
    "monthly_calendar",
    "yearly_calendar",
    "manager",
    "salesman",
    // Newly added from your schema updates
    "customer_type",
    "supplier_type",
    "supplier",
    "item_group",
    "item_section",
    "item_brand",
    "currency",
  ];

  return (
    <div style={{ display: "flex", height: "90vh", fontFamily: "Arial" }}>
      {/* Left Panel: Users List */}
      <div
        style={{
          width: "250px",
          borderRight: "1px solid #ccc",
          padding: "10px",
          overflowY: "auto",
        }}
      >
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "5px", marginBottom: "10px" }}
        />
        <ul style={{ listStyle: "none", padding: 0 }}>
          {filteredUsers.map((user) => (
            <li
              key={user.username}
              onClick={() => setSelectedUser(user)}
              style={{
                padding: "8px",
                cursor: "pointer",
                backgroundColor:
                  selectedUser?.username === user.username ? "#eee" : "#fff",
                borderBottom: "1px solid #ccc",
              }}
            >
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Panel: User Rights */}
      <div style={{ flex: 1, padding: "20px" }}>
        {selectedUser ? (
          <div>
            <h2>Rights for: {selectedUser.username}</h2>
            <form
              onSubmit={handleSubmit}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "10px",
              }}
            >
              {rightsFields.map((field) => (
                <label
                  key={field}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "5px",
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUser[field] === "y"}
                    onChange={() => handleChange(field)}
                  />
                  {field.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                </label>
              ))}
              <div style={{ gridColumn: "1 / -1" }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: "8px 16px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  {saving ? "Saving..." : "Update Rights"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <p>Select a user to view and edit rights</p>
        )}
      </div>
    </div>
  );
}

export default Rights;
