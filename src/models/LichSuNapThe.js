const mongoose = require('mongoose');

const LichSuNapTheSchema = new mongoose.Schema({
    userId: { type: mongoose.SchemaTypes.ObjectId, ref: "AccKH", required: true },

    maThe: { type: String, required: true },
    seri: { type: String, required: true },
    telco: { type: String }, // Ví dụ: "VIETTEL", "MOBIFONE", v.v.

    request_id: { type: String, required: true },

    giaTriKhaiBao: { type: Number }, // Ví dụ: 10000
    giaTriGachDuoc: { type: Number }, // Ví dụ: 9010
    soTienCongChoKH: { type: Number }, // Ví dụ: 8000 (đã qua chiết khấu)

    message: { type: String }, // Trạng thái trả về từ API (CARD_CORRECT, WRONG_CARD...)

    thoiGian: { type: Date, default: Date.now }
}, {
    timestamps: true // Tự tạo createdAt, updatedAt
});

module.exports = mongoose.model("LichSuNapThe", LichSuNapTheSchema);
