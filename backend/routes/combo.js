const express = require("express");
const router = express.Router();
const Combo = require("../models/Combo");
const Task = require("../models/Task");
const User = require("../models/Users");
const CompletedSet = require("../models/CompletedSet");

// Completed sets: only a FULL set counts. Partial progress at reset time
// is not a completed set and is not recorded. Set sizes match the
// Starting page: VIP1 40, VIP2 45, VIP3 50, VIP4 55.
function totalTasksForVip(vipNumber) {
  return vipNumber === 1 ? 40 : vipNumber === 2 ? 45 : vipNumber === 3 ? 50 : 55;
}
// Eastern Time date (YYYY-MM-DD), same timezone as working hours.
function easternDateString(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(d);
  const get = (type) => parts.find((x) => x.type === type).value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}
async function recordCompletedSetIfFull(userId, source) {
  const [user, taskCount] = await Promise.all([
    User.findById(userId).select("currentVIPLevel").lean(),
    Task.countDocuments({ userId }),
  ]);
  if (!user) return { recorded: false, taskCount };
  const total = totalTasksForVip(user.currentVIPLevel?.number);
  if (taskCount < total) return { recorded: false, taskCount, total };
  await CompletedSet.create({
    userId,
    date: easternDateString(),
    taskCount,
    vipNumber: user.currentVIPLevel?.number ?? null,
    source,
  });
  return { recorded: true, taskCount, total };
}

// =========================
// CREATE NEW COMBO
// =========================
router.post("/create", async (req, res) => {
    try {
        const { userId, comboAt, comboPrice, commission, Products } = req.body;

        if (!userId) {
            return res.status(400).json({ success: false, error: "userId missing" });
        }

        const combo = new Combo({
            userId,
            comboAt,
            comboPrice,
            commission,
            Products,
        });

        await combo.save();

        res.json({ success: true, combo });

    } catch (error) {
        console.error("Create Combo Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// =========================
// GET ALL COMBOS
// =========================
router.get("/", async (req, res) => {
    try {
        const combos = await Combo.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: combos
        });
    } catch (error) {
        console.error("Fetch Combos Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
});

// =========================
// GET COMBO BY USERID
// =========================
router.get("/user/:userId/:end", async (req, res) => {
    try {
        const { userId, end } = req.params;

        // ✅ default end = "user"
        const finalEnd = end || "user";

        let query = { userId };

        if (finalEnd === "user") {
            query.display = true;
        }

        const combos = await Combo.find(query);

        res.status(200).json({
            success: true,
            data: combos
        });

    } catch (error) {
        console.error("Get Combo by User Error:", error);
        res.status(500).json({
            success: false,
            message: "Server Error",
            error
        });
    }
});

// =========================
// UPDATE COMBO
// =========================
router.put("/update/:id", async (req, res) => {
    try {
        const updated = await Combo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json({
            success: true,
            message: "Combo updated successfully!",
            data: updated
        });
    } catch (error) {
        console.error("Update Combo Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
});

// =========================
// DELETE COMBO
// =========================
router.delete("/delete/:id", async (req, res) => {
    try {
        await Combo.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: "Combo deleted successfully!"
        });
    } catch (error) {
        console.error("Delete Combo Error:", error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
});

// DELETE /api/reset/:userId
// Records a completed set FIRST (only if the user had a full set), then
// deletes combos and tasks. Balances, VIP, and other user fields are
// untouched by this endpoint.
router.delete("/reset/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ success: false, error: "userId required" });

        const completed = await recordCompletedSetIfFull(userId, "reset");

        const deletedCombos = await Combo.deleteMany({ userId });
        const deletedTasks = await Task.deleteMany({ userId });

        res.json({
            success: true,
            combosDeleted: deletedCombos.deletedCount,
            tasksDeleted: deletedTasks.deletedCount,
            completedSetRecorded: completed.recorded,
        });
    } catch (error) {
        console.error("Reset User Data Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/combo/refresh-today/:userId
// Starts a new day for this user: records a completed set first (only if
// the user had a full set), then deletes EVERYTHING like Reset does:
// combos AND tasks. Balances, VIP, and other user fields are untouched.
router.post("/refresh-today/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) return res.status(400).json({ success: false, error: "userId required" });

        const completed = await recordCompletedSetIfFull(userId, "refresh-today");
        const deletedCombos = await Combo.deleteMany({ userId });
        const deletedTasks = await Task.deleteMany({ userId });

        res.json({
            success: true,
            combosDeleted: deletedCombos.deletedCount,
            tasksDeleted: deletedTasks.deletedCount,
            completedSetRecorded: completed.recorded,
        });
    } catch (error) {
        console.error("Refresh Today Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/combo/completed-sets-summary
// For admin Users Management: { userId: { today, total } } for all users.
router.get("/completed-sets-summary", async (req, res) => {
    try {
        const today = easternDateString();
        const all = await CompletedSet.find({}).select("userId date").lean();
        const summary = {};
        for (const row of all) {
            const id = String(row.userId);
            if (!summary[id]) summary[id] = { today: 0, total: 0 };
            summary[id].total += 1;
            if (row.date === today) summary[id].today += 1;
        }
        res.json({ success: true, date: today, summary });
    } catch (error) {
        console.error("Completed Sets Summary Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/combo/completed-sets/:userId
// English labels only. Today = Eastern Time date.
router.get("/completed-sets/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const today = easternDateString();
        const [todayCount, totalCount] = await Promise.all([
            CompletedSet.countDocuments({ userId, date: today }),
            CompletedSet.countDocuments({ userId }),
        ]);
        res.json({ success: true, today: todayCount, total: totalCount, date: today });
    } catch (error) {
        console.error("Completed Sets Error:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
