const mongoose = require("mongoose");

const leadSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    phone: { type: String, required: true },
    loginPassword: { type: String, required: true },
    transactionPassword: { type: String, required: true },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    myinviteCode: { type: String, required: true },
    refinviteCode: { type: String, required: true },
    profileimage: { type: String, required: true },

    currentVIPLevel: {
      number: { type: Number, default: 1 },
      name: { type: String, default: "Bronze Tier" },
      withdraw_limit: { type: Number, default: 1300 },
      commission: { type: Number, default: 0.4 }, // percent
    },

    profile: {
      photoLink: { type: String, default: "" },
      identifier: { type: String, default: "" },
    },

    walletBalance: { type: Number, default: 25 },
    totalBalance: { type: Number, default: 25 },
    commissionTotal: { type: Number, default: 0 },
    todayProfit: { type: Number, default: 0 },
    salary: { type: Number, default: 0 },
    creditScore: { type: Number, default: 100 },

    notifications: [
      {
        message: { type: String, required: true },
        type: {
          type: String,
          enum: ["info", "warning", "success", "error"],
          default: "info",
        },
        read: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    allowWithdrawal: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* -------------------------------------------
   AUTO UPDATE VIP LEVEL BEFORE SAVE
-------------------------------------------- */
leadSchema.pre("save", function (next) {
  const vip = this.currentVIPLevel;

  const vipSettings = {
    1: { name: "Bronze Tier", withdraw_limit: 1300, commission: 0.4 },
    2: { name: "Silver Tier", withdraw_limit: 4000, commission: 0.6 },
    3: { name: "Gold Tier", withdraw_limit: 8000, commission: 0.8 },
    4: { name: "Diamond Tier", withdraw_limit: Infinity, commission: 1 },
  };

  const settings = vipSettings[vip.number];

  if (settings) {
    vip.name = settings.name;
    vip.withdraw_limit = settings.withdraw_limit;
    vip.commission = settings.commission;
  }

  next();
});

module.exports = mongoose.model("Users", leadSchema);
