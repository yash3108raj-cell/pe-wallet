 // ================= LOAD STATS =================

async function loadStats(){

  try{

    const res = await fetch("/admin-stats");
    const data = await res.json();

    document.getElementById("totalUsers").innerText = data.totalUsers;
    document.getElementById("totalDeposits").innerText = data.totalDeposits;
    document.getElementById("pendingDeposits").innerText = data.pendingDeposits;
    document.getElementById("totalRevenue").innerText = "₹"+data.totalRevenue;

  }catch(err){

    console.log("Stats error",err);

  }

}


// ================= LOAD ACTIVE SELLERS =================

async function loadActiveSellers(){

  try{

    const res = await fetch("/admin-active-sellers");
    const users = await res.json();

    const box = document.getElementById("sellerList");

    if(!users || users.length === 0){

      box.innerHTML = "No active sellers";
      return;

    }

    let html = "";

    users.forEach(u => {

      html += 

      <div class="seller-card">

      <strong>User ID:</strong> ${u.userId}<br>
      <strong>Balance:</strong> ₹${u.balance}<br>

      <strong>Bank:</strong> ${u.paymentMethod?.bankName || "N/A"}<br>
      <strong>Account:</strong> ${u.paymentMethod?.acc || "N/A"}<br>

      <button onclick="approveSell(${u.userId})">
      Approve
      </button>

      <button onclick="setLiveSell(${u.userId})"
      style="background:green;color:white;margin-top:5px;">
      Move to Live Sell
      </button>

      </div>

      ;

    });

    box.innerHTML = html;

  }catch(err){

    console.log("Active seller error",err);

  }

}


// ================= LOAD LIVE SELL USERS =================

async function loadLiveSellers(){

  try{

    const res = await fetch("/admin-live-sell-users");
    const users = await res.json();

    const box = document.getElementById("liveSellUsers");

    if(!users || users.length === 0){

      box.innerHTML = "<p>No live sell users</p>";
      return;

    }

    box.innerHTML = "";

    users.forEach(u => {

      box.innerHTML += 

      <div class="sell-card live">

      <h4>User ID: ${u.userId}</h4>

      <p>Balance: ₹${u.balance}</p>

      <p style="color:green;">LIVE SELL ACTIVE</p>

      <input type="number"
      id="deduct-${u.userId}"
      placeholder="Deduct Amount" />

      <button onclick="deductBalance(${u.userId})"
      style="background:red;color:white;margin-top:5px;">

      Deduct Balance

      </button>

      <button onclick="removeLiveSell(${u.userId})"
      style="background:gray;color:white;margin-top:5px;">

      Free User

      </button>

      </div>

      ;

    });

  }catch(err){

    console.log("Live seller error",err);

  }

}


// ================= APPROVE SELL =================

async function approveSell(userId){

  await fetch("/approve-sell",{

    method:"POST",

    headers:{ "Content-Type":"application/json" },

    body:JSON.stringify({userId})

  });

  loadActiveSellers();

}


// ================= MOVE TO LIVE SELL =================

async function setLiveSell(userId){

  await fetch("/admin-set-live-sell",{

    method:"POST",

    headers:{ "Content-Type":"application/json" },

    body:JSON.stringify({userId})

  });

  loadActiveSellers();
  loadLiveSellers();

}


// ================= REMOVE LIVE SELL =================

async function removeLiveSell(userId){

  await fetch("/admin-remove-live-sell",{

    method:"POST",

    headers:{ "Content-Type":"application/json" },

    body:JSON.stringify({userId})

  });

  loadActiveSellers();
  loadLiveSellers();

}


// ================= SEARCH USER =================

async function searchUser(){

  const id = document.getElementById("searchId").value;

  const res = await fetch("/admin-search-user/"+id);

  const user = await res.json();

  const box = document.getElementById("searchResult");

  if(!user.userId){

    box.innerHTML = "User not found";
    return;

  }

  box.innerHTML = `

  <div class="seller-card">

  <strong>User ID:</strong> ${user.userId}<br>
  <strong>Balance:</strong> ₹${user.balance}<br>
[3/6/2026 11:06 AM] Go: <input type="number"
  id="addAmount"
  placeholder="Add Balance">

  <button onclick="addBalance(${user.userId})">

  Add Balance

  </button>

  <br><br>

  <input type="number"
  id="deductSearchAmount"
  placeholder="Deduct Balance">

  <button onclick="deductSearchBalance(${user.userId})"
  style="background:red;color:white;">

  Deduct Balance

  </button>

  </div>

  `;

}


// ================= ADD BALANCE =================

async function addBalance(userId){

  const amount = document.getElementById("addAmount").value;

  await fetch("/admin-add-balance",{

    method:"POST",

    headers:{ "Content-Type":"application/json" },

    body:JSON.stringify({

      userId,
      amount

    })

  });

  alert("Balance Added");

  loadStats();
  searchUser();

}


// ================= DEDUCT BALANCE LIVE SELL =================

async function deductBalance(userId){

  const amount = document.getElementById("deduct-"+userId).value;

  await fetch("/admin-deduct-balance",{

    method:"POST",

    headers:{ "Content-Type":"application/json" },

    body:JSON.stringify({

      userId,
      amount

    })

  });

  alert("Balance Deducted");

  loadStats();
  loadLiveSellers();

}


// ================= DEDUCT BALANCE SEARCH USER =================

async function deductSearchBalance(userId){

  const amount = document.getElementById("deductSearchAmount").value;

  await fetch("/admin-deduct-balance",{

    method:"POST",

    headers:{ "Content-Type":"application/json" },

    body:JSON.stringify({

      userId,
      amount

    })

  });

  alert("Balance Deducted");

  searchUser();
  loadStats();

}


// ================= PAGE LOAD =================

document.addEventListener("DOMContentLoaded",()=>{

  loadStats();
  loadActiveSellers();
  loadLiveSellers();

  setInterval(()=>{

    loadStats();
    loadActiveSellers();
    loadLiveSellers();

  },10000);

});
