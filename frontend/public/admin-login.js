async function adminLogin() {

  const username = document.getElementById("adminUser").value.trim();
  const password = document.getElementById("adminPass").value.trim();
  const msg = document.getElementById("loginMsg");

  if (!username || !password) {
    msg.innerText = "All fields required";
    return;
  }

  try {

    const res = await fetch("/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.ok) {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "admin-dashboard.html";
    } else {
      msg.innerText = "Invalid Credentials";
    }

  } catch (err) {
    msg.innerText = "Server error";
  }
}

async function loadActiveSellers() {

  const res = await fetch("/admin-active-sellers");
  const users = await res.json();

  const box = document.getElementById("sellerList");

  if (users.length === 0) {
    box.innerHTML = "No active sellers";
    return;
  }

  let html = "";

  users.forEach(u => {
    html += `
      <div style="border:1px solid #ccc; padding:10px; margin:10px;">
        <strong>User ID:</strong> ${u.userId}<br>
        <strong>Balance:</strong> ₹${u.balance}<br>
        <strong>Bank:</strong> ${u.banks[0]?.bankName || "N/A"}<br>
        <strong>Account:</strong> ${u.banks[0]?.acc || "N/A"}
      </div>
    `;
  });

  box.innerHTML = html;
}

async function adminLogin() {

  const username = document.getElementById("adminUser").value.trim();
  const password = document.getElementById("adminPass").value.trim();
  const msg = document.getElementById("loginMsg");

  if (!username || !password) {
    msg.innerText = "All fields required";
    return;
  }

  try {

    const res = await fetch("/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (data.ok) {
      localStorage.setItem("isAdmin", "true");
      window.location.href = "admin-dashboard.html";
    } else {
      msg.innerText = "Invalid Credentials";
    }

  } catch (err) {
    msg.innerText = "Server error";
  }
}

async function loadActiveSellers() {

  const res = await fetch("/admin-active-sellers");
  const users = await res.json();

  const box = document.getElementById("sellerList");

  if (users.length === 0) {
    box.innerHTML = "No active sellers";
    return;
  }

  let html = "";

  users.forEach(u => {
    html += `
      <div style="border:1px solid #ccc; padding:10px; margin:10px;">
        <strong>User ID:</strong> ${u.userId}<br>
        <strong>Balance:</strong> ₹${u.balance}<br>
        <strong>Bank:</strong> ${u.banks[0]?.bankName || "N/A"}<br>
        <strong>Account:</strong> ${u.banks[0]?.acc || "N/A"}
      </div>
    `;
  });

  box.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", loadActiveSellers);
