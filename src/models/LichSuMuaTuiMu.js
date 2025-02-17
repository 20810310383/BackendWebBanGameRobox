// models/Purchase.js
const mongoose = require("mongoose");

const LichSuMuaTuiMuSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "AccKH", required: true },
    bagType: { type: mongoose.Schema.Types.ObjectId, ref: "BagType", required: true },
    IdCTV: { type: mongoose.Schema.Types.ObjectId, ref: "CongTacVien", required: true },
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isActive: { type: Boolean, default: false}, 
    results: [
        {
            bagId: Number,
            isWinner: Boolean,
            name: { type: String, default: null },
            description: { type: String, default: null },
            IdGift: { type: mongoose.Schema.Types.ObjectId, ref: "Gift" },
        }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("LichSuMuaTuiMu", LichSuMuaTuiMuSchema);
