// Shared admin-settings client (main app + dashboard both ship a copy).
// Fetches the single AdminSettings document from the backend and falls
// back to the existing defaults, so the app keeps working exactly as
// before until an admin changes a setting in the dashboard.
export const ADMIN_API_BASE = "https://platform-axon-rust.vercel.app/";

export const DEFAULT_SETTINGS = {
  brandName: "Axon",
  contactChannels: [
    { name: "Live Chat", type: "live-chat", value: "", visible: true },
    { name: "WhatsApp", type: "whatsapp", value: "+1 781-961-7200", visible: true },
  ],
  vipLevels: [
    { level: "VIP1", name: "Bronze Tier", amount: "1000.00 USD", depositRequired: 1000, commission: "0.4%", withdrawalLimit: "1300 USD", features: ["Basic Support", "Standard Processing", "Mobile Access"], badge: "Popular", iconName: "Star", visible: true },
    { level: "VIP2", name: "Silver Tier", amount: "2000.00 USD", depositRequired: 2000, commission: "0.6%", withdrawalLimit: "4,000 USD", features: ["Priority Support", "Fast Processing", "Advanced Tools", "Email Alerts"], badge: "Recommended", iconName: "Crown", visible: true },
    { level: "VIP3", name: "Gold Tier", amount: "3000.00 USD", depositRequired: 3000, commission: "0.8%", withdrawalLimit: "8,000 USD", features: ["VIP Support", "Instant Processing", "Premium Tools", "SMS Alerts", "Personal Manager"], badge: "Best Value", iconName: "Gem", visible: true },
    { level: "VIP4", name: "Diamond Tier", amount: "5,000.00 USD", depositRequired: 5000, commission: "1.0%", withdrawalLimit: "Unlimited", features: ["24/7 Dedicated Support", "Lightning Processing", "Exclusive Tools", "All Notifications", "Personal Manager", "Custom Solutions"], badge: "Elite", iconName: "Diamond", visible: true },
  ],
  workingHours: {
    enabled: true,
    timezone: "America/New_York",
    startMinutes: 570,
    endMinutes: 1290,
    startLabel: "09:30AM",
    endLabel: "09:30PM",
  },
  depositAddresses: [],
  realtimeEvents: { enabled: true },
  cloudinary: { cloudName: "", apiKey: "", configured: false, secretSet: false },
  admin: { username: "", hasPassword: false },
};

let cachedSettings = null;
let cachedAt = 0;

export async function fetchAdminSettings() {
  if (cachedSettings && Date.now() - cachedAt < 60000) return cachedSettings;
  try {
    const res = await fetch(`${ADMIN_API_BASE}api/settings`);
    const data = await res.json();
    if (data?.settings) {
      cachedSettings = { ...DEFAULT_SETTINGS, ...data.settings };
      cachedAt = Date.now();
      return cachedSettings;
    }
  } catch (e) {
    // Fall through to defaults; settings are optional at runtime.
  }
  return DEFAULT_SETTINGS;
}


// Display text for working hours, used everywhere hours are shown.
// When the restriction is OFF, every place must say 24 hours, not the
// old 09:30-21:30 window.
export function workingHoursText(workingHours) {
  if (!workingHours?.enabled) return "24 Hours (Daily)";
  const start = workingHours.startLabel || "09:30AM";
  const end = workingHours.endLabel || "09:30PM";
  return `${start} - ${end} Eastern Time (Daily)`;
}

export function invalidateAdminSettingsCache() {
  cachedSettings = null;
  cachedAt = 0;
}

export function whatsappUrlFromValue(value, fallbackUrl) {
  if (!value) return fallbackUrl;
  const digits = String(value).replace(/[^0-9]/g, "");
  return digits ? `https://wa.me/${digits}` : fallbackUrl;
}

export function formatLocation(location) {
  if (!location) return "";
  const parts = [location.city, location.region, location.country].filter(Boolean);
  if (parts.length) return parts.join(", ");
  // Only an IP is known (lookup failed or pending): show that instead of
  // hiding the location line entirely.
  return location.ip || "";
}
