// Completed task sets history.
// One document = one fully completed set, recorded at the moment an admin
// resets/refreshes a user who had reached their VIP set size. This is a
// history record only: it never changes balances, VIP, combos, or tasks,
// and deleting tasks/combos after recording does not delete this record.
const mongoose = require("mongoose");

const completedSetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  // Eastern Time date (YYYY-MM-DD), matching the platform working-hours
  // timezone, so "today" means the same day the platform uses.
  date: { type: String, required: true, index: true },
  // Number of tasks in the completed set (40/45/50/55 by VIP at that time).
  taskCount: { type: Number, required: true },
  vipNumber: { type: Number, default: null },
  // How it was recorded: "reset" (Reset All Combos & Tasks) or
  // "refresh-today" (Refresh All Sets of Tasks for Today).
  source: { type: String, enum: ["reset", "refresh-today"], required: true },
}, { timestamps: true });

completedSetSchema.index({ userId: 1, date: 1 });

module.exports = mongoose.models.CompletedSet || mongoose.model("CompletedSet", completedSetSchema);
