// models/Task.js
const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  orderType: { type: String, enum: ["Combo", "Normal"], required: true },
  combo: { 
    type: Object, 
    default: null 
  },
  product: {
    productName: { type: String },
    productValue: { type: Number },
    productImage: {
      url: { type: String },
      publicId: { type: String },
    }, 
    taskCode: { type: String },
  },
  status: { type: String, default: "pending" }
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);


module.exports = mongoose.models.Task || mongoose.model("Task", taskSchema);
