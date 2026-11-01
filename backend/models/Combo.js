const mongoose = require("mongoose");

const comboSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        comboAt: {
            type: Number,
            required: true,
        },

        comboPrice: {
            type: Number,
            required: true,
        }, 
        commission: { type: Number, default: 9 },
        status: { type: String, default: 'pending' },
        display: { type: Boolean, default: false },
        letClear: { type: Boolean, default: false },
        Products: [
            {
                productName: { type: String, required: true },
                productValue: { type: Number, required: true },

                productImage: {
                    url: { type: String, required: true },
                    publicId: { type: String, required: true },
                },

                taskCode: { type: String, required: true },
            }
        ]
    },
    { timestamps: true }
);

module.exports = mongoose.model("Combo", comboSchema);
