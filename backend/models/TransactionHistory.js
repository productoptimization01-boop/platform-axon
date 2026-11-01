const mongoose = require("mongoose");

const TransactionHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        walletId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "WalletAddress",
            required: false,
        },

        transactionAmount: {
            type: Number,
            required: true,
        },

        status: {
            type: String,
            enum: ["Pending", "Successful", "Failed"],
            default: "Pending",
        },

        type: {
            type: String,
            enum: ["Debit", "Credit"],
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model(
    "TransactionHistory",
    TransactionHistorySchema
);
