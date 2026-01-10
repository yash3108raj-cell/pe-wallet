function setAmount(val) {
  document.getElementById("amount").value = val;
}
document.getElementById("confirmExchangeBtn")
  .addEventListener("click", function () {

    const amount = document.getElementById("amount").value;

    if (!amount || amount < 1000) {
      alert("Minimum exchange amount is ₹1000");
      return;
    }

    alert("Exchange request submitted successfully!");
});
function confirmExchange() {
  alert("Exchange request submitted!");
  
  // later you can call backend API here
  // fetch('/exchange', { method: 'POST', body: ... })
}

function openDeposit() {
  document.getElementById("exchangePage").style.display = "none";
  document.getElementById("depositPage").style.display = "block";
}



function hideAllExchange() {
  document.getElementById("exchangePage").style.display = "none";
  document.getElementById("depositAmountPage").style.display = "none";
  document.getElementById("depositQRPage").style.display = "none";
}

function openDepositAmount() {
  hideAllExchange();
  document.getElementById("depositAmountPage").style.display = "block";
}

function setUSDT(val) {
  document.getElementById("usdtAmount").value = val;
}

function openDepositQR() {
  const amt = document.getElementById("usdtAmount").value;
  if (!amt || amt < 10) {
    alert("Enter valid USDT amount");
    return;
  }

  hideAllExchange();
  document.getElementById("depositQRPage").style.display = "block";
  document.getElementById("showUSDT").innerText = amt + " USDT";
}

function copyAddress() {
  const text = document.getElementById("depositAddress").innerText;
  navigator.clipboard.writeText(text);
  alert("Address copied");
}

function loadSelectedBank() {
  const bank = JSON.parse(localStorage.getItem("selectedBank"));
  const box = document.getElementById("selectedBank");

  if (!bank) {
    box.innerText = "Please select a bank card";
    return;
  }

  box.innerHTML =` 
    <strong>${bank.bankName}</strong><br>
    ${bank.acc} • ${bank.ifsc}
  `;
}

document.addEventListener("DOMContentLoaded", loadSelectedBank);


  function openSelectBank() {
    if (window.parent && window.parent.openSelectBank) {
      window.parent.openSelectBank();
    }
  }

  function showSelectedBank() {
    if (window.parent && window.parent.showSelectedBank) {
      window.parent.showSelectedBank();
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    showSelectedBank();
  });

 // 🔁 show selected bank on exchange page
function showSelectedBank() {
  const bankText = document.getElementById("selectedBankText");
  if (!bankText) return;

  const data = window.localStorage.getItem("selectedBank");

  if (!data) {
    bankText.innerText = "Please select a bank card";
    bankText.style.color = "#999";
    return;
  }

  const selected = JSON.parse(data);

  bankText.innerHTML =` 
    <strong>${selected.bankName}</strong><br>
    ${selected.acc} • ${selected.ifsc}
  ;`
  bankText.style.color = "#000";
}

document.addEventListener("DOMContentLoaded", showSelectedBank);

function showSelectedBank() {
  const bankText = document.getElementById("selectedBankText");
  if (!bankText) return;

  const selected = JSON.parse(localStorage.getItem("selectedBank"));

  if (!selected) {
    bankText.innerText = "Please select a bank card";
    bankText.style.color = "#999";
    return;
  }

  bankText.innerHTML =` 
    <strong>${selected.bankName}</strong><br>
    ${selected.acc} • ${selected.ifsc}
  ;`
  bankText.style.color = "#000";
}

document.addEventListener("DOMContentLoaded", () => {
  showSelectedBank();
});

function exchangeNow() {
  // exchange section hide
  document.getElementById("exchangeSection").style.display = "none";

  // deposit / QR section show
  document.getElementById("depositSection").style.display = "block";
}