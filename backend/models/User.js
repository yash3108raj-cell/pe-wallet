const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userId: Number,
  mobile: String,
  password: String,

  balance: { 
    type: Number, 
    default: 0 
  },

 sellMode: {
 type: Boolean,
 default: false
},

isLiveSell: {
 type: Boolean,
 default: false
},

paymentMethod: {
 type: {
  type: String,
  default: null
 },
 bankName: String,
 acc: String,
 ifsc: String,
 upiId: String
}

});

module.exports = mongoose.model("User", userSchema);
