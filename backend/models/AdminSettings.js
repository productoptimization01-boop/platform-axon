const mongoose = require("mongoose");

// Single-document admin settings. Only one row is ever used (key: "global").
// Secrets are stored here but are NEVER returned by the public settings API:
// - cloudinary.apiSecret is write-only (a new value replaces it, an empty
//   value keeps the existing one).
// - admin.passwordHash is never returned; it is only checked by the
//   admin-login endpoint.
const contactChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, default: "custom" },
    value: { type: String, default: "" },
    url: { type: String, default: "" },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const vipLevelSchema = new mongoose.Schema(
  {
    level: { type: String, required: true },
    name: { type: String, default: "" },
    amount: { type: String, default: "" },
    depositRequired: { type: Number, default: 0 },
    commission: { type: String, default: "" },
    withdrawalLimit: { type: String, default: "" },
    features: { type: [String], default: [] },
    badge: { type: String, default: "" },
    iconName: { type: String, default: "Star" },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const depositAddressSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },
    walletName: { type: String, default: "" },
    walletAddress: { type: String, required: true },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const adminSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "global", unique: true },
    brandName: { type: String, default: "Axon" },
    contactChannels: {
      type: [contactChannelSchema],
      default: [
        { name: "Live Chat", type: "live-chat", value: "", visible: true },
        { name: "WhatsApp", type: "whatsapp", value: "+1 781-961-7200", visible: true },
      ],
    },
    vipLevels: {
      type: [vipLevelSchema],
      default: [
        { level: "VIP1", name: "Bronze Tier", amount: "1000.00 USD", depositRequired: 1000, commission: "0.4%", withdrawalLimit: "1300 USD", features: ["Basic Support", "Standard Processing", "Mobile Access"], badge: "Popular", iconName: "Star", visible: true },
        { level: "VIP2", name: "Silver Tier", amount: "2000.00 USD", depositRequired: 2000, commission: "0.6%", withdrawalLimit: "4,000 USD", features: ["Priority Support", "Fast Processing", "Advanced Tools", "Email Alerts"], badge: "Recommended", iconName: "Crown", visible: true },
        { level: "VIP3", name: "Gold Tier", amount: "3000.00 USD", depositRequired: 3000, commission: "0.8%", withdrawalLimit: "8,000 USD", features: ["VIP Support", "Instant Processing", "Premium Tools", "SMS Alerts", "Personal Manager"], badge: "Best Value", iconName: "Gem", visible: true },
        { level: "VIP4", name: "Diamond Tier", amount: "5,000.00 USD", depositRequired: 5000, commission: "1.0%", withdrawalLimit: "Unlimited", features: ["24/7 Dedicated Support", "Lightning Processing", "Exclusive Tools", "All Notifications", "Personal Manager", "Custom Solutions"], badge: "Elite", iconName: "Diamond", visible: true },
      ],
    },
    workingHours: {
      enabled: { type: Boolean, default: true },
      timezone: { type: String, default: "America/New_York" },
      startMinutes: { type: Number, default: 570 },
      endMinutes: { type: Number, default: 1290 },
      startLabel: { type: String, default: "09:30AM" },
      endLabel: { type: String, default: "09:30PM" },
    },
    depositAddresses: { type: [depositAddressSchema], default: [] },
    // Realtime Events master switch. When false, presence heartbeats are
    // ignored and the dashboard should not open the realtime SSE feed,
    // so the admin can cut realtime-server consumption.
    realtimeEvents: { enabled: { type: Boolean, default: true } },
    cloudinary: {
      cloudName: { type: String, default: "" },
      apiKey: { type: String, default: "" },
      apiSecret: { type: String, default: "" },
    },
    admin: {
      username: { type: String, default: "" },
      passwordHash: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

adminSettingsSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.cloudinary;
  obj.cloudinary = {
    cloudName: this.cloudinary?.cloudName || "",
    apiKey: this.cloudinary?.apiKey || "",
    configured: Boolean(this.cloudinary?.cloudName && this.cloudinary?.apiKey && this.cloudinary?.apiSecret),
    secretSet: Boolean(this.cloudinary?.apiSecret),
  };
  delete obj.admin;
  obj.admin = { username: this.admin?.username || "", hasPassword: Boolean(this.admin?.passwordHash) };
  return obj;
};

module.exports = mongoose.models.AdminSettings || mongoose.model("AdminSettings", adminSettingsSchema);
