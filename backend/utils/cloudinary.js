const cloudinary = require("cloudinary").v2

// Cloudinary credentials are configured by an admin in the dashboard
// (Admin Settings > Cloudinary) and stored in AdminSettings, or supplied
// via CLOUDINARY_* environment variables. No credential is hardcoded here.
// The upload route in routes/users.js configures Cloudinary per request
// from admin settings when they are present.
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

module.exports = cloudinary
