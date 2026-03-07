/* ================== COMMON ================== */
function hideAll() {
  document.querySelectorAll(".page").forEach(p => {
    p.style.display = "none";
  });
}

function setActive(el) {
  document.querySelectorAll(".nav-item")
    .forEach(i => i.classList.remove("active"));
  if (el) el.classList.add("active");
}

/* ================== BOTTOM NAV ================== */
function showHome(el) {
  hideAll();
  document.getElementById("homeSection").style.display = "block";
  setActive(el);
}

function showExchange(el) {
  hideAll();
  document.getElementById("exchangeSection").style.display = "block";
  setActive(el);

  showSelectedBank(); // 🔥 backend से load करेगा
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

  // 🔥 USER ID DISPLAY CODE (यहाँ paste करना है)
  const uid = localStorage.getItem("userId");
  const userIdElement = document.getElementById("userId");

  if (uid && userIdElement) {
    userIdElement.innerText = uid;
  }
}

/* ================== INVITE ================== */
function generateInviteCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function shareInvite() {
  const code = localStorage.getItem("inviteCode");
  const link = `${window.location.origin}/register.html?invite=${code}`;
  navigator.clipboard.writeText(link)
    .then(() => alert("Invite link copied"));
}

                              /* ================== BANK ================== */


                    

// ================== SHOW PAYMENT METHOD ==================

function openAddBank() {
  document.getElementById("addOptions").style.display = "none";
  document.getElementById("addBankForm").style.display = "block";
  document.getElementById("addUpiForm").style.display = "none";
}

function openAddUPI() {
  document.getElementById("addOptions").style.display = "none";
  document.getElementById("addBankForm").style.display = "none";
  document.getElementById("addUpiForm").style.display = "block";
}

async function showSelectedBank() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch("/user/" + userId);
  const data = await res.json();

  const box = document.getElementById("selectedBankText");
  if (!box) return;

  if (!data.ok) return;

  if (data.paymentMethod && data.paymentMethod.type) {

    if (data.paymentMethod.type === "bank") {
      box.innerHTML =` 
        ${data.paymentMethod.bankName}<br>
        ${data.paymentMethod.acc}
      `;
    }

    if (data.paymentMethod.type === "upi") {
      box.innerHTML =` 
        UPI: ${data.paymentMethod.upiId}
      `;
    }

    box.style.color = "#000";
    return;
  }

  box.innerText = "No payment method added";
  box.style.color = "#999";
}

async function openBankCards() {
  hideAll();
  document.getElementById("bankSection").style.display = "block";

  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch("/user/" + userId);
  const data = await res.json();

  const box = document.getElementById("paymentInfoBox");
  const addOptions = document.getElementById("addOptions");

  if (!data.ok) {
    box.innerHTML = "Error loading data";
    return;
  }

  // 🔥 If payment exists
  if (data.paymentMethod && data.paymentMethod.type) {

    if (data.paymentMethod.type === "bank") {
      box.innerHTML =` 
        <div>
          <strong>Bank:</strong><br>
          ${data.paymentMethod.bankName}<br>
          ${data.paymentMethod.acc}<br>
          ${data.paymentMethod.ifsc}
        </div>
        <br>
        <button onclick="removePayment()" style="background:red;color:white;padding:6px 12px;border:none;border-radius:5px;">
          Remove Payment Method
        </button>
     ` ;
    }

    if (data.paymentMethod.type === "upi") {
      box.innerHTML = `
        <div>
          <strong>UPI:</strong><br>
          ${data.paymentMethod.upiId}
        </div>
        <br>
        <button onclick="removePayment()" style="background:red;color:white;padding:6px 12px;border:none;border-radius:5px;">
          Remove Payment Method
        </button>
      `;
    }

    addOptions.style.display = "none";
    return;
  }

  // 🔥 If no payment
  box.innerHTML = "<p>No payment method added</p>";
  addOptions.style.display = "block";
}


async function saveBank() {
  const userId = localStorage.getItem("userId");

  const bankName = document.getElementById("bankName")?.value ||
                   document.getElementById("exbankName")?.value;

  const acc = document.getElementById("accountNumber")?.value ||
              document.getElementById("exaccountNumber")?.value;

  const ifsc = document.getElementById("ifsc")?.value ||
               document.getElementById("exifsc")?.value;

  if (!bankName || !acc || !ifsc) {
    alert("All bank fields required");
    return;
  }

  const res = await fetch("/add-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: Number(userId),
      type: "bank",
      bankName,
      acc,
      ifsc
    })
  });

  const data = await res.json();

  if (!data.ok) {
    alert(data.msg);
    return;
  }

  alert("Bank Added Successfully");

  showSelectedBank();
  openBankCards();
}


async function saveUPI() {

  const userId = localStorage.getItem("userId");
  const upiId = document.getElementById("upiId").value;

  const res = await fetch("/add-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      userId: Number(userId),
      type: "upi",
      upiId
    })
  });

  const data = await res.json();

  if (!data.ok) {
    alert(data.msg);
    return;
  }

  alert("UPI Added Successfully");
   showSelectedBank();
}

// ================== remove PAYMENT METHOD ==================

async function removePayment() {
  const userId = localStorage.getItem("userId");

  const res = await fetch("/remove-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: Number(userId) })
  });

  const data = await res.json();

  if (!data.ok) {
    alert("Error removing payment");
    return;
  }

  alert("Payment method removed");
  openBankCards();
  showSelectedBank();
}


// ================== SHOW PAYMENT METHOD ==================


/* ================== ORDERS ================== */

async function openMyOrders() {
  hideAll();
  const section = document.getElementById("ordersSection");
  section.style.display = "block";

  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch("/my-orders/" + userId);
  const data = await res.json();

  if (!data.ok || data.orders.length === 0) {
    section.innerHTML = "<h3>Order Details</h3><p>No order records</p>";
    return;
  }

  let html = "<h3>Order Details</h3>";

  data.orders.forEach(o => {
    html += `
      <div class="me-item">
        <strong>${o.orderId}</strong><br>
        ${o.amount} USDT<br>
        Status: ${o.status === "completed" ? "✅ Completed" : "⏳ Pending"}
      </div>
    `;
  });

  section.innerHTML = html;
}

/* ================== PASSWORD ================== */
function openChangePassword() {
  hideAll();
  document.getElementById("changePasswordSection").style.display = "block";
}

function submitPasswordChange() {
  const oldPass = document.getElementById("oldPassword").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();
  const confirmPass = document.getElementById("confirmPassword").value.trim();

  const saved = localStorage.getItem("userPassword");

  if (!oldPass || !newPass || !confirmPass) {
    alert("All fields required");
    return;
  }


if (!saved || oldPass !== saved) {
    alert("Original password incorrect");
    return;
  }

  if (newPass.length < 6) {
    alert("Password must be 6+ characters");
    return;
  }

  if (newPass !== confirmPass) {
    alert("Passwords do not match");
    return;
  }

  localStorage.setItem("userPassword", newPass);
  alert("Password changed successfully");

  showMe(document.querySelector(".nav-item:nth-child(4)"));
}

/* ================== LANGUAGE ================== */
function openLanguageSettings(){
  document.getElementById("languageModal").style.display="flex";
}

function closeLanguageModal(){
  document.getElementById("languageModal").style.display="none";
}

function setLanguage(lang){
  localStorage.setItem("appLanguage", lang);

  if(lang==="en") alert("Language set to English");
  if(lang==="hi") alert("Language set to Hindi");
  if(lang==="zh") alert("语言已切换为中文");

  closeLanguageModal();
}
/* ================== LOGOUT ================== */
function logoutUser() {
  localStorage.clear();
  window.location.href = "index.html";
}

/* ================== TELEGRAM ================== */
function joinTelegram() {
  window.location.href = "https://t.me/tr2ue0";
}

/* ================== INIT ================== */

document.addEventListener("DOMContentLoaded", () => {

  // ===== Invite Code =====
  let invite = localStorage.getItem("inviteCode");
  if (!invite) {
    invite = generateInviteCode();
    localStorage.setItem("inviteCode", invite);
  }

  const span = document.getElementById("inviteCode");
  if (span) span.innerText = invite;


  // ===== Default Page =====
  hideAll();
  const home = document.getElementById("homeSection");
  if (home) home.style.display = "block";

  const firstNav = document.querySelector(".nav-item");
  if (firstNav) firstNav.classList.add("active");
});



function setAmount(val) {
  document.getElementById("amount").value = val;
}

/* Show selected bank on exchange */

/* Call when exchange page opens */
const oldShowExchange = showExchange;
showExchange = function(el) {
  oldShowExchange(el);
  setTimeout(showSelectedBank, 50);
};

const RATE = 105.5;

/* open deposit exchange page */
function openDepositExchange() {
  hideAll();
  document.getElementById("depositExchangeSection").style.display = "block";
}

// ================== INR DEPOSIT ==================
function setINR(amount) {
  document.getElementById("inrAmountInput").value = amount;
}

function confirmINRDeposit() {
  const amt = parseFloat(document.getElementById("inrAmountInput").value);

  if (!amt || amt < 100 || amt > 50000) {
    alert("Enter amount between ₹100 and ₹50,000");
    return;
  }

  alert("INR Deposit Requested: ₹" + amt);
  // future: UPI / payment gateway connect here
}

// ================== DEPOSIT TOGGLE ==================
function showUSDTDeposit() {
  const usdt = document.getElementById("usdtDepositPage");
  const inr = document.getElementById("inrDepositPage");
  if (!usdt || !inr) return;

  usdt.style.display = "block";
  inr.style.display = "none";

  document.getElementById("usdtBtn")?.classList.add("active");
  document.getElementById("inrBtn")?.classList.remove("active");
}

function showINRDeposit() {
  const usdt = document.getElementById("usdtDepositPage");
  const inr = document.getElementById("inrDepositPage");
  if (!usdt || !inr) return;

  usdt.style.display = "none";
  inr.style.display = "block";

  document.getElementById("inrBtn")?.classList.add("active");
  document.getElementById("usdtBtn")?.classList.remove("active");
}


/* quick buttons */
function setUSDT(val) {
  document.getElementById("usdtInput").value = val;
  calculateINR();
}

/* calculate INR */
function calculateINR() {
  const usdt = parseFloat(document.getElementById("usdtInput").value) || 0;
  const inr = usdt * RATE;
  document.getElementById("inrOutput").innerText = "₹" + inr.toFixed(2);
}



function confirmExchange() {
  alert("This Feature is not Added");
}


function animateCount(id, end, prefix="") {

  let el = document.getElementById(id);

  // 🔥 SAFE CHECK
  if (!el) return;


let start = 0;
  let step = Math.max(1, Math.floor(end / 60));

  let timer = setInterval(() => {
    start += step;

    if (start >= end) {
      start = end;
      clearInterval(timer);
    }

    el.innerText = prefix + start;

  }, 20);
}

/* Example use */
animateCount("refCount", 0);
animateCount("earnCount", 0, "₹");


function showPopup() {
  document.getElementById("referralPopup").style.display = "flex";
}

function closePopup() {
  document.getElementById("referralPopup").style.display = "none";
}

/* Show popup once after login/register */
window.addEventListener("load", () => {
  if (!localStorage.getItem("referralPopupShown")) {
    setTimeout(showPopup, 800);
    localStorage.setItem("referralPopupShown", "true");
  }
});



// ================== LOAD BALANCE ==================
async function loadBalance() {
  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch("/user/" + userId);
  const data = await res.json();

  if (data.ok) {
    document.querySelector(".balance-row strong").innerText =
      "₹" + data.balance;
  }
}

document.addEventListener("DOMContentLoaded", loadBalance);


// ================== CREATE DEPOSIT ==================
async function exchangeNow() {

  const amount = document.getElementById("usdtInput").value;
  const userId = localStorage.getItem("userId");

  if (!amount || amount < 10) {
    alert("Enter valid USDT amount (Min 10)");
    return;
  }

  if (!userId) {
    alert("User not logged in");
    return;
  }

  try {
    const res = await fetch("/create-deposit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: Number(userId),
        amount: Number(amount)
      })
    });

    const data = await res.json();

    if (data.ok) {

      const dep = document.getElementById("depositSection");
      dep.style.display = "block";
      dep.scrollIntoView({ behavior: "smooth" });

      document.getElementById("usdtAddress").innerText = data.address;

    document.getElementById("orderIdText").innerText = data.orderId;
    document.getElementById("amountText").innerText = data.amount;

    // 🔥 Start status checking
checkOrderStatus(data.orderId);

setInterval(() => {
  checkOrderStatus(data.orderId);
}, 10000);

    } else {
      alert("Order creation failed");
    }

  } catch (err) {
    alert("Server error");
  }
}

async function checkOrderStatus(orderId) {

  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch("/my-orders/" + userId);
  const data = await res.json();

  if (!data.ok) return;

  const order = data.orders.find(o => o.orderId === orderId);
  if (!order) return;

  const statusEl = document.getElementById("orderStatus");

  if (order.status === "completed") {
    statusEl.innerHTML = "Status: ✅ Completed";
    statusEl.style.color = "green";
  } else {
    statusEl.innerHTML = "Status: ⏳ Pending";
    statusEl.style.color = "orange";
  }
}


// ================== USDT Copy Button ==================

function copyUSDT() {

  const addressEl = document.getElementById("usdtAddress");

  if (!addressEl) {
    alert("Address not found");
    return;
  }

  const address = addressEl.innerText.trim();

  // Modern browser method
  if (navigator.clipboard) {

    navigator.clipboard.writeText(address)
      .then(() => {
        alert("USDT Address Copied ✅");
      })
      .catch(() => {
        fallbackCopy(address);
      });

  } else {
    fallbackCopy(address);
  }
}


// Fallback method (for older browsers)
function fallbackCopy(text) {

  const input = document.createElement("input");
  input.value = text;
  document.body.appendChild(input);

  input.select();
  input.setSelectionRange(0, 99999);

  document.execCommand("copy");
  document.body.removeChild(input);

  alert("USDT Address Copied ✅");
}



// ================== TOGGLE SELL ==================
async function toggleSell() {

  const userId = localStorage.getItem("userId");

  if (!userId) return alert("Login required");


const res = await fetch("/toggle-sell", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: Number(userId) })
  });

  const data = await res.json();

  if (!data.ok) {
    alert(data.msg);
    return;
  }

  const btn = document.getElementById("sellBtn");

  if (data.sellMode) {
    btn.innerText = "SELL ON";
    btn.style.background = "green";
  } else {
    btn.innerText = "SELL OFF";
    btn.style.background = "red";
  }
}







// ================== Fetch SELL Mode ==================

async function loadSellStatus() {

  const userId = localStorage.getItem("userId");
  if (!userId) return;

  const res = await fetch("/user/" + userId);
  const data = await res.json();

  if (!data.ok) return;

  const sellBtn = document.getElementById("sellBtn");
  if (!sellBtn) return;

  if (data.sellMode === true) {
    sellBtn.classList.add("active");
    sellBtn.innerText = "SELL ON";
  } else {
    sellBtn.classList.remove("active");
    sellBtn.innerText = "SELL OFF";
  }
}

// ================== SELL Mode =====

document.addEventListener("DOMContentLoaded", () => {
  loadSellStatus();
});


// ================== balance Mode ====
async function loadUserBalance() {
  const res = await fetch("/get-user"); // or your route
  const user = await res.json();

  document.getElementById("userBalance").innerText = user.balance;
}

document.addEventListener("DOMContentLoaded", () => {
  loadUserBalance();
});

function copyAmount() {
  const amount = document.getElementById("amountText").innerText;
  navigator.clipboard.writeText(amount);
  alert("Amount copied!");
}

function copyUSDT() {
  const address = document.getElementById("usdtAddress").innerText;
  navigator.clipboard.writeText(address);
  alert("Address copied!");

}
