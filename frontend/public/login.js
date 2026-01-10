let cid = "";

document.addEventListener("DOMContentLoaded", () => {
  const m = document.getElementById("m");
  const p = document.getElementById("p");
  const a = document.getElementById("a");
  const q = document.getElementById("q");

  fetch("/captcha")
    .then(r => r.json())
    .then(d => {
      cid = d.id;
      q.innerText = d.q;
    });

  window.login = function () {
    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile: m.value,
        password: p.value,
        cid: cid,
        ans: a.value
      })
    })
    .then(r => r.json())
    .then(d => {
      if (d.ok) {
        localStorage.setItem("isLoggedIn", "true");
        window.location.href = "dashboard.html";
      } else {
        alert(d.msg);
      }
    })
    .catch(() => alert("Server error"));
  };
});