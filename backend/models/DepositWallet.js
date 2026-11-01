const mongoose = require('mongoose');

const DepositWalletSchema = new mongoose.Schema(
    {
        walletName: {
            type: String,
            required: true
        },
        walletAddress: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true // adds createdAt & updatedAt by default
    }
);

module.exports = mongoose.model('DepositWallet', DepositWalletSchema);
