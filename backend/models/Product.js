const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    productValue: { type: Number, required: true },

    productImage: {
      url: { type: String, required: true },
      publicId: { type: String, required: true }
    },

    taskCode: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
