const mongoose = require("mongoose");

const WalletAddressSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        walletLabel: {
            type: String,
            required: true,
            trim: true,
        },

        walletAddress: {
            type: String,
            required: true,
            trim: true,
            unique: true,
        },
    },
    {
        timestamps: true, // adds createdAt & updatedAt
    }
);

module.exports =
    mongoose.models.WalletAddress ||
    mongoose.model("WalletAddress", WalletAddressSchema);
