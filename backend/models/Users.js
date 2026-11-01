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

    // Location derived from the user's IP (Req 9). Display only; the IP
    // itself is kept so a stale lookup can be refreshed on next login.
    location: {
      ip: { type: String, default: "" },
      country: { type: String, default: "" },
      city: { type: String, default: "" },
      region: { type: String, default: "" },
      updatedAt: { type: Date, default: null },
      // Admin-set: when true, the next presence heartbeat fetches a fresh
      // location even if one is already saved, then clears this flag.
      refreshRequested: { type: Boolean, default: false },
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

    // Realtime presence (updated by heartbeat, never by a user save).
    // Online = lastSeenAt within the last 2 minutes.
    lastSeenAt: { type: Date, default: null },
    currentPage: { type: String, default: "" },
    currentActivity: { type: String, default: "" },
  },
  { timestamps: true }
);

/* -------------------------------------------
   AUTO UPDATE VIP LEVEL BEFORE SAVE
-------------------------------------------- */
leadSchema.pre("save", async function (next) {
  const vip = this.currentVIPLevel;

  const vipSettings = {
    1: { name: "Bronze Tier", withdraw_limit: 1300, commission: 0.4 },
    2: { name: "Silver Tier", withdraw_limit: 4000, commission: 0.6 },
    3: { name: "Gold Tier", withdraw_limit: 8000, commission: 0.8 },
    4: { name: "Diamond Tier", withdraw_limit: Infinity, commission: 1 },
  };

  // Admin-configured VIP levels (Req 11) take precedence when present.
  // Defaults above are unchanged, so a fresh install behaves exactly as before.
  try {
    const AdminSettings = require("./AdminSettings");
    const adminSettings = await AdminSettings.findOne({ key: "global" }).lean();
    const configured = (adminSettings?.vipLevels || []).find(
      (level) => Number(String(level.level).replace(/[^0-9]/g, "")) === vip.number
    );
    if (configured) {
      if (configured.name) vip.name = configured.name;
      const commission = parseFloat(String(configured.commission).replace("%", ""));
      if (!Number.isNaN(commission)) vip.commission = commission;
      const limit = String(configured.withdrawalLimit || "").toLowerCase();
      if (limit === "unlimited") vip.withdraw_limit = Infinity;
      else {
        const parsed = parseFloat(limit.replace(/[^0-9.]/g, ""));
        if (!Number.isNaN(parsed)) vip.withdraw_limit = parsed;
      }
      return next();
    }
  } catch (e) {
    // Fall through to the built-in defaults if settings cannot be read.
  }

  const settings = vipSettings[vip.number];

  if (settings) {
    vip.name = settings.name;
    vip.withdraw_limit = settings.withdraw_limit;
    vip.commission = settings.commission;
  }

  next();
});

module.exports = mongoose.model("Users", leadSchema);
