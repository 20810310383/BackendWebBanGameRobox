// models/Purchase.js
const mongoose = require("mongoose");

const LichSuMuaTuiMuSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "AccKH", required: true },
    bagType: { type: mongoose.Schema.Types.ObjectId, ref: "BagType", required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    results: [
        {
            bagId: Number,
            isWinner: Boolean,
            prize: { type: String, default: null },
        }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("LichSuMuaTuiMu", LichSuMuaTuiMuSchema);
