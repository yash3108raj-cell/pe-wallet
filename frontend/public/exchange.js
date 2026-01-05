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