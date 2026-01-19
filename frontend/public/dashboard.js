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
   showSelectedBank();
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
function openBankCards() {
  hideAll();
  document.getElementById("bankSection").style.display = "block";
  loadBanks();
}

function openAddBank() {
  document.getElementById("noBank").style.display = "none";
  document.getElementById("bankList").style.display = "none";
  document.getElementById("addBankForm").style.display = "block";
}

function saveBank() {
  const bankName = document.getElementById("bankName").value.trim();
  const acc = document.getElementById("accountNumber").value.trim();
  const ifsc = document.getElementById("ifsc").value.trim();

  if (!bankName || !acc || !ifsc) {
    alert("All fields required");
    return;
  }

  const banks = JSON.parse(localStorage.getItem("banks") || "[]");

  banks.push({ bankName, acc, ifsc });
  localStorage.setItem("banks", JSON.stringify(banks));

localStorage.setItem(
  "selectedBank",
  JSON.stringify(banks[banks.length-1])
)

  document.getElementById("bankName").value = "";
  document.getElementById("accountNumber").value = "";
  document.getElementById("ifsc").value = "";

  alert("Bank saved successfully ✅");
  loadBanks();
}

function loadBanks() {
  const banks = JSON.parse(localStorage.getItem("banks") || "[]");
  const list = document.getElementById("bankList");
  const noBank = document.getElementById("noBank");
  const form = document.getElementById("addBankForm");

  list.innerHTML = "";
  form.style.display = "none";

  if (banks.length === 0) {
    noBank.style.display = "block";
    list.style.display = "none";
    return;
  }

  noBank.style.display = "none";
  list.style.display = "block";

  banks.forEach((b, i) => {
    list.innerHTML += `
      <div class="me-item" onclick="selectBank(${i})" style="cursor:pointer">
        💳
        <div>
          <strong>${b.bankName}</strong>
          <p>${b.acc} • ${b.ifsc}</p>
        </div>
        <span onclick="event.stopPropagation();removeBank(${i})">❌</span>
      </div>
    `;
  });
}

function removeBank(i) {
  const banks = JSON.parse(localStorage.getItem("banks") || "[]");
  banks.splice(i, 1);
  localStorage.setItem("banks", JSON.stringify(banks));
  loadBanks();
}

function selectBank(index) {
  const banks = JSON.parse(localStorage.getItem("banks") || "[]");
  const selected = banks[index];

  localStorage.setItem("selectedBank", JSON.stringify(selected));

  showExchange(document.querySelector(".nav-item:nth-child(2)"));
}

function showSelectedBank() {
  const box = document.getElementById("selectedBankText");
  if (!box) return;

  const bank = JSON.parse(localStorage.getItem("selectedBank"));
  if (!bank) {
    box.innerText = "Please select a bank card";
    box.style.color = "#999";
    return;
  }

  box.innerHTML = `
    <strong>${bank.bankName}</strong><br>
    ${bank.acc} • ${bank.ifsc}
  `;
  box.style.color = "#000";
}

/* ================== ORDERS ================== */
function openMyOrders() {
  hideAll();
  document.getElementById("ordersSection").style.display = "block";
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
  let invite = localStorage.getItem("inviteCode");
  if (!invite) {
    invite = generateInviteCode();
    localStorage.setItem("inviteCode", invite);
    showSelectedBank();
  }

  const span = document.getElementById("inviteCode");
  if (span) span.innerText = invite;

  hideAll();
  document.getElementById("homeSection").style.display = "block";

  const firstNav = document.querySelector(".nav-item");
  if (firstNav) firstNav.classList.add("active");
});


function setAmount(val) {
  document.getElementById("amount").value = val;
}

/* Show selected bank on exchange */
function showSelectedBank() {
  const text = document.getElementById("selectedBankText");
  if (!text) return;

  const bank = JSON.parse(localStorage.getItem("selectedBank"));

  if (!bank) {
    text.innerText = "Please select a bank card";
    text.classList.add("muted");
    return;
  }

  text.innerHTML =` 
    <strong>${bank.bankName}</strong><br>
    ${bank.acc} • ${bank.ifsc}
  ;`
  text.classList.remove("muted");
}

/* Call when exchange page opens */
const oldShowExchange = showExchange;
showExchange = function(el) {
  oldShowExchange(el);
  setTimeout(showSelectedBank, 50);
};

const RATE = 103;

/* open deposit exchange page */
function openDepositExchange() {
  hideAll();
  document.getElementById("depositExchangeSection").style.display = "block";
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

function showSelectedBank() {
  const box = document.getElementById("selectedBankText");
  if (!box) return;

  const selected = JSON.parse(localStorage.getItem("selectedBank"));

  if (!selected) {
    box.innerText = "Please select a bank card";
    box.style.color = "#999";
    return;
  }

  box.innerHTML = `
    <strong>${selected.bankName}</strong><br>
    ${selected.acc} • ${selected.ifsc}
  ;`
  box.style.color = "#000";
}

function confirmExchange() {
  alert("Your balance is too low");
}

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
