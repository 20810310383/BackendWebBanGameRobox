const mongoose = require('mongoose');

const giftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },          // Tên quà
    description: { type: String },                     // Mô tả quà (tuỳ chọn)
    imageUrl: { type: String },                        // Link hình ảnh (tuỳ chọn)
    stock: { type: Number, default: 0 },               // Số lượng quà có sẵn trong kho
    IdCTV: {ref: "CongTacVien", type: mongoose.SchemaTypes.ObjectId},
  },
  {
    timestamps: true, // tự động thêm createdAt, updatedAt
  }
);

module.exports = mongoose.model('Gift', giftSchema);
