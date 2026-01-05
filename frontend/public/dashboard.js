function hideAll() {
  document.getElementById("homeSection").style.display = "none";
  document.getElementById("exchangeSection").style.display = "none";
  document.getElementById("agentSection").style.display = "none";
  document.getElementById("meSection").style.display = "none";
}

function setActive(el) {
  document.querySelectorAll(".nav-item")
    .forEach(item => item.classList.remove("active"));
  if (el) el.classList.add("active");
}

function showHome(el) {
  hideAll();
  document.getElementById("homeSection").style.display = "block";
  setActive(el);
}

function showExchange(el) {
  hideAll();
  document.getElementById("exchangeSection").style.display = "block";
  setActive(el);
}

function showAgent(el) {
  hideAll();
  document.getElementById("agentSection").style.display = "block";
  setActive(el);
}

function showMe(el) {
  hideAll();
  document.getElementById("meSection").style.display = "block";
  setActive(el);
}

function copyInvite() {
  const text = document.getElementById("inviteCode").innerText;
  navigator.clipboard.writeText(text);
  alert("Invite code copied!");
}

function logoutUser() {
  localStorage.removeItem("user");
  localStorage.removeItem("isLoggedIn");
  window.location.href = "index.html";
}

/* DEFAULT LOAD */
document.addEventListener("DOMContentLoaded", () => {
  showHome(document.querySelector(".nav-item"));
});