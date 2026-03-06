// ================== REQUIRE ==================
const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const bcrypt = require("bcryptjs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// ================== CONFIG ==================
const WALLET = "TEWQEA6LKMAudUp9CDqdkvYcrqoNoGcyXq";
const USDT_CONTRACT = "TXLAQ63Xg1NAzckPwKHvzw7CSEmLMEqcdj"; // Official TRC20
const REQUIRED_CONFIRMATIONS = 20;

// ================== MIDDLEWARE ==================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../frontend/public")));

// ================== MONGODB ==================
mongoose.connect("mongodb+srv://admin:Admin123@cluster0.ndfsvoq.mongodb.net/trustpay?retryWrites=true&w=majority")
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));

// ================== USER SCHEMA ==================
const userSchema = new mongoose.Schema({
  userId: { type: Number, unique: true },
  mobile: { type: String, unique: true },
  password: String,
  inviteCode: String,
  balance: { type: Number, default: 0 },

  sellMode: { type: Boolean, default: false },
  isLiveSell:{type:Boolean, default:false },

paymentMethod: {
  type: {
    type: String, // "bank" or "upi"
    default: null
  },
  bankName: String,
  acc: String,
  ifsc: String,
  upiId: String
},

  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);

// ================== ADMIN login SCHEMA ==================

const adminSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Admin = mongoose.model("Admin", adminSchema);

async function createDefaultAdmin() {

  const exist = await Admin.findOne({ username: "admin" });

  if (!exist) {
    const hashed = await bcrypt.hash("Admin@123", 10);

    await Admin.create({
      username: "admin",
      password: hashed
    });

    console.log("Default Admin Created ✅");
  }
}

createDefaultAdmin();

app.post("/admin-login", async (req, res) => {

  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });

  if (!admin) return res.json({ ok: false });

  const match = await bcrypt.compare(password, admin.password);

  if (!match) return res.json({ ok: false });

  res.json({ ok: true });
});

// ================== ORDER SCHEMA ==================
const orderSchema = new mongoose.Schema({
  userId: Number,
  orderId: String,
  baseAmount: Number,
  uniqueAmount: Number,
  txHash: { type: String, default: null },
  confirmations: { type: Number, default: 0 },
  status: { type: String, default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model("Order", orderSchema);

// ================== CAPTCHA ==================
let captchaStore = {};

app.get("/captcha", (req, res) => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  const id = Date.now().toString();
  captchaStore[id] = a + b;

  res.json({
    id,
    question: `${a} + ${b} = ?`
  });
});

// ================== GENERATE USER ID ==================
async function generateUserId() {
  const lastUser = await User.findOne().sort({ userId: -1 });
  if (!lastUser) return 10001;
  return lastUser.userId + 1;
}

// ================== REGISTER ==================
app.post("/register", async (req, res) => {
  try {
    const { mobile, password, cid, ans } = req.body;

    if (!captchaStore[cid] || captchaStore[cid] != ans) {
      return res.json({ ok: false, msg: "Captcha incorrect" });
    }

    delete captchaStore[cid];

    const exist = await User.findOne({ mobile });
    if (exist) {
      return res.json({ ok: false, msg: "User already exists" });
    }

    const newId = await generateUserId();
    const hashed = await bcrypt.hash(password, 10);

    const newUser = new User({
      userId: newId,
      mobile,
      password: hashed,
      inviteCode: Math.random().toString(36).substring(2, 8).toUpperCase()
    });

    await newUser.save();
    res.json({ ok: true });

  } catch (err) {
    console.log(err);
    res.json({ ok: false, msg: "Server error" });
  }
});

// ================== LOGIN ==================
app.post("/login", async (req, res) => {
  try {
    const { mobile, password } = req.body;

    const user = await User.findOne({ mobile });
    if (!user) return res.json({ ok: false, msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ ok: false, msg: "Wrong password" });

    res.json({
      ok: true,
      userId: user.userId,
      inviteCode: user.inviteCode,
      balance: user.balance
    });

  } catch (err) {
    console.log(err);
    res.json({ ok: false });
  }
});

// ================== CREATE DEPOSIT ==================
app.post("/create-deposit", async (req, res) => {
  try {
    const { userId, amount } = req.body;

    const orderId = "ORD" + Date.now();


// Unique decimal system
    const randomPart = Math.floor(Math.random() * 900) / 1000000;
    const uniqueAmount = Number(amount) + randomPart;

    const newOrder = new Order({
      userId,
      orderId,
      baseAmount: amount,
      uniqueAmount
    });

    await newOrder.save();

    res.json({
      ok: true,
      orderId,
      address: WALLET,
      amount: uniqueAmount
    });

  } catch (err) {
    console.log(err);
    res.json({ ok: false });
  }
});

// ================== UPDATE BALANCE ==================
async function updateUserBalance(userId, amount) {
  const user = await User.findOne({ userId });
  if (!user) return;

  user.balance += amount;
  await user.save();
}

// ================== TRC20 MONITOR ==================
async function checkTransactions() {
  try {

    const pendingOrders = await Order.find({ status: "pending" });
    if (pendingOrders.length === 0) return;

    const response = await axios.get(
      `https://api.trongrid.io/v1/accounts/${WALLET}/transactions/trc20`
    );

    const txs = response.data.data;

    for (let tx of txs) {

      if (tx.token_info.address !== USDT_CONTRACT) continue;

      const amount = Number(tx.value) / 1000000;

      const order = pendingOrders.find(o =>
        Number(o.uniqueAmount.toFixed(6)) === Number(amount.toFixed(6))
      );

      if (!order) continue;
      if (order.status === "completed") continue;

      // 🔥 Duplicate protection
const alreadyUsed = await Order.findOne({
  txHash: tx.transaction_id
});

if (alreadyUsed) continue;

      const txInfo = await axios.get(
        `https://api.trongrid.io/v1/transactions/${tx.transaction_id}`
      );

      const confirmations = txInfo.data.confirmations || 0;
      if (confirmations < REQUIRED_CONFIRMATIONS) continue;

      order.txHash = tx.transaction_id;
      order.confirmations = confirmations;
      order.status = "completed";
      await order.save();

      await updateUserBalance(order.userId, order.baseAmount);

      console.log("Deposit credited:", order.orderId);
    }

  } catch (err) {
    console.log("Monitoring error:", err.message);
  }
}


// ================== AUTO DELETE EXPIRED ORDERS ==================
async function deleteExpiredOrders() {
  try {

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const expiredOrders = await Order.find({
      status: "pending",
      createdAt: { $lt: oneHourAgo }
    });

    if (expiredOrders.length > 0) {
      for (let order of expiredOrders) {
        console.log("Deleting expired order:", order.orderId);
        await Order.deleteOne({ _id: order._id });
      }
    }

  } catch (err) {
    console.log("Expire cleanup error:", err.message);
  }
}

// ================== GET USER ORDERS ==================
app.get("/my-orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({
      userId: Number(req.params.userId)
    }).sort({ createdAt: -1 });

    res.json({ ok: true, orders });
  } catch (err) {
    res.json({ ok: false });
  }
});

// ================== GET USER INFO ==================
app.get("/user/:userId", async (req, res) => {
  try {
    const user = await User.findOne({
      userId: Number(req.params.userId)
    });

    if (!user) return res.json({ ok: false });

    res.json({
      ok: true,
      balance: user.balance,
      sellMode: user.sellMode,
      paymentMethod:user.paymentMethod, 

      isLiveSell:user.isLiveSell
    });
 
  } catch (err) {
    res.json({ ok: false });
  }
});

setInterval(checkTransactions, 30000);
setInterval(deleteExpiredOrders, 60000); // every 1 minute check

// ================== TOGGLE SELL MODE ==================

app.post("/toggle-sell", async (req, res) => {

  try {
    const { userId } = req.body;

    const user = await User.findOne({ userId });
    if (!user) 
      return res.json({ ok: false, msg: "User not found" });

    // 🔒 If Admin locked in Live Sell
    if (user.isLiveSell) {
      return res.json({
        ok: false,
        msg: "You are locked in Live Sell mode by Admin."
      });
    }

    // 🔥 If user trying to turn ON sell
    if (!user.sellMode) {

      if (user.balance < 1000) {
        return res.json({
          ok: false,
          msg: "Minimum ₹1000 balance required to activate Sell Mode."
        });
      }

     if (!user.paymentMethod || !user.paymentMethod.type) {
        return res.json({
          ok: false,
          msg: "Please add bank details first."
        });
      }

    }

    // Toggle sell mode
    user.sellMode = !user.sellMode;
    await user.save();

    res.json({ ok: true, sellMode: user.sellMode });

  } catch (err) {
    res.json({ ok: false, msg: "Server error" });
  }

});
// ================== ADMIN STATS ==================
app.get("/admin-stats", async (req, res) => {

  const totalUsers = await User.countDocuments();

  const completedOrders = await Order.find({ status: "completed" });
  const pendingOrders = await Order.find({ status: "pending" });

  const totalDeposits = completedOrders.length;
  const pendingDeposits = pendingOrders.length;

  const totalRevenue = completedOrders.reduce((sum, o) => sum + o.baseAmount, 0);

  res.json({
    totalUsers,
    totalDeposits,
    pendingDeposits,
    totalRevenue
  });
});

// ================== APPROVE SELL ==================
app.post("/approve-sell", async (req, res) => {
  const { userId } = req.body;

  const user = await User.findOne({ userId });
  if (!user) return res.json({ ok: false });

  user.sellMode = true;   // keep sell ON
  user.isLiveSell = false; // remove from live sell

  await user.save();
  res.json({ ok: true });
});

// ================== ADMIN ADD BALANCE ==================
app.post("/admin-add-balance", async (req, res) => {

  const { userId, amount } = req.body;

  const user = await User.findOne({ userId });

  if (!user) return res.json({ ok: false });

  user.balance += Number(amount);
  await user.save();

  res.json({ ok: true });
});


// ================== ADMIN DEDUCT BALANCE ==================
app.post("/admin-deduct-balance", async (req, res) => {

  const { userId, amount } = req.body;

  const user = await User.findOne({ userId });
  if (!user) return res.json({ ok: false, msg: "User not found" });

  const deductAmount = Number(amount);

  if (deductAmount <= 0)
    return res.json({ ok: false, msg: "Invalid amount" });

  if (user.balance < deductAmount)
    return res.json({ ok: false, msg: "Insufficient balance" });

  user.balance -= deductAmount;
  await user.save();

  res.json({ ok: true });

});


// ================== ADMIN SELECT LIVE SELL ==================
app.post("/admin-set-live-sell", async (req, res) => {

  const { userId } = req.body;

  const user = await User.findOne({ userId });
  if (!user) return res.json({ ok: false });

  user.isLiveSell = true;
  user.sellMode = true; // ensure active
  await user.save();

  res.json({ ok: true });

});

// ================== ADMIN REMOVE LIVE SELL ==================
app.post("/admin-remove-live-sell", async (req, res) => {

  const { userId } = req.body;

  const user = await User.findOne({ userId });
  if (!user) return res.json({ ok: false });

  user.isLiveSell = false;
  user.sellMode = false; // optional: sell off also

  await user.save();

  res.json({ ok: true });

});


// ================== SEARCH USER ==================
app.get("/admin-search-user/:id", async (req, res) => {

  const user = await User.findOne({
    userId: Number(req.params.id)
  });

  if (!user) return res.json({ ok: false });

  res.json(user);
});


// ================== ADD PAYMENT METHOD ==================
app.post("/add-payment", async (req, res) => {

  const { userId, type, bankName, acc, ifsc, upiId } = req.body;

  const user = await User.findOne({ userId });
  if (!user) return res.json({ ok: false, msg: "User not found" });

  if (user.paymentMethod && user.paymentMethod.type) {
    return res.json({
      ok: false,
      msg: "Payment method already added. Only one allowed."
    });
  }

  if (type === "bank") {

    user.paymentMethod = {
      type: "bank",
      bankName,
      acc,
      ifsc
    };

  } else if (type === "upi") {

    user.paymentMethod = {
      type: "upi",
      upiId
    };

  } else {
    return res.json({ ok: false, msg: "Invalid type" });
  }

  await user.save();

  res.json({ ok: true });

});

// ================== REMOVE PAYMENT ==================
app.post("/remove-payment", async (req, res) => {
  const { userId } = req.body;

  const user = await User.findOne({ userId });
  if (!user) return res.json({ ok: false });

  user.paymentMethod = {
    type: null,
    bankName: null,
    acc: null,
    ifsc: null,
    upiId: null
  };

  await user.save();
  res.json({ ok: true });
});

// ================== GET LIVE SELL USERS ==================

app.get("/admin-active-sellers", async (req, res) => {
const users = await User.find({ 
  sellMode: true,
  isLiveSell: false
});
  res.json(users);
});

// ================== GET LIVE SELL USERS ==================
app.get("/admin-live-sell-users", async (req, res) => {
  const users = await User.find({ isLiveSell: true });
  res.json(users);
});

// ================== START SERVER ==================
app.listen(PORT, () => {
  console.log("Server running at http://localhost:" + PORT);

});



