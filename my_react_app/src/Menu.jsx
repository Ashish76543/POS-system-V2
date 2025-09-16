import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

function Menu() {
  const location = useLocation();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [menu, setMenu] = useState({
    item: "f",
    customer: "f",
    rights: "f",
    company: "f",
    yearly_calendar: "f",
    monthly_calendar: "f",
    manager: "f",
    salesman: "f",
  });

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    if (location.state?.name) {
      const name = location.state.name;
      setUsername(name);

      axios
        .post("http://localhost:3000/getrights", { name })
        .then((res) => {
          if (res.data.message === "success") {
            const {
              item,
              customer,
              rights,
              company,
              yearly_calendar,
              monthly_calendar,
              manager,
              salesman,
            } = res.data.val;
            setMenu({ item, customer, rights, company, yearly_calendar, monthly_calendar, manager, salesman });
          }
        })
        .catch((err) => console.error("Error fetching rights:", err));
    }
  }, [location.state]);

  const handleNavigation = (path, includeUser = false) => {
    setDropdownOpen(false);
    if (includeUser) {
      navigate(path, { state: { name: username } });
    } else {
      navigate(path);
    }
  };

  const options = [
    { label: "Item Insert", path: "/ItemInsert", right: menu.item },
    { label: "Customer Insert", path: "/Customer", right: menu.customer },
    { label: "Rights Insert", path: "/Rights", right: menu.rights },
    { label: "Company Insert", path: "/Company", right: menu.company },
    { label: "Yearly Calendar", path: "/YearlyCalendar", right: menu.yearly_calendar },
    { label: "Monthly Calendar", path: "/MonthlyCalendar", right: menu.monthly_calendar },
    { label: "Manager Insert", path: "/Manager", right: menu.manager },
    { label: "Salesman Insert", path: "/Salesman", right: menu.salesman },
    { label: "Create Invoice", path: "/Handle", right: "y", includeUser: true },
  ];

  // Only show allowed options
  const allowedOptions = options.filter((opt) => opt.right === "y");

  return (
    <div style={{ fontFamily: "Arial" }}>
      {/* Header */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
          backgroundColor: "#333",
          color: "#fff",
        }}
      >
        <h2>Welcome, {username}</h2>
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#555",
              color: "#fff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Menu ▾
          </button>
          {dropdownOpen && (
            <ul
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                backgroundColor: "#fff",
                color: "#333",
                listStyle: "none",
                padding: 0,
                margin: 0,
                border: "1px solid #ccc",
                width: "200px",
                zIndex: 1000,
              }}
            >
              {allowedOptions.map((opt) => (
                <li
                  key={opt.label}
                  onClick={() => handleNavigation(opt.path, opt.includeUser)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #eee",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f0f0f0")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
                >
                  {opt.label}
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>
    </div>
  );
}

export default Menu;
