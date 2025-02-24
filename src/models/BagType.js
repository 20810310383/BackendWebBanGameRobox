// models/BagType.js
const mongoose = require("mongoose");

const bagTypeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },         // Ví dụ: "type1", "type2"
    price: { type: Number, required: true },          // Giá mỗi túi
    description: { type: String },                     // Mô tả  (tuỳ chọn)
    winningRate: { type: Number, default: 1 },       // Tỉ lệ trúng thưởng cho loại túi này (ví dụ:  1%)
    IdCTV: {ref: "CongTacVien", type: mongoose.SchemaTypes.ObjectId},
    stock: { type: Number, default: 0 },               // Số lượng quà có sẵn trong kho

    // Danh sách quà có thể trúng thưởng
    prizePool: [{gift: { type: mongoose.SchemaTypes.ObjectId, ref: "Gift" },}],
  },
  { timestamps: true }
);

module.exports = mongoose.model("BagType", bagTypeSchema);
