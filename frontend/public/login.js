let cid = "";

document.addEventListener("DOMContentLoaded", () => {
  const m = document.getElementById("m");
  const p = document.getElementById("p");

  window.login = function () {
    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mobile: m.value,
        password: p.value
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
    .catch(err => {
      console.error(err);
      alert("Server error");
    });
  };
});
