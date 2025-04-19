const mongoose = require("mongoose");

const TheDienThoaiSchema = new mongoose.Schema({
    Seri: String,
    MaThe: String,
    IdKH: { type: mongoose.Schema.Types.ObjectId, ref: "AccKH" },
    NhaMang: String,
    MenhGia: Number,
    request_id: String,
    trangThai: { type: String, default: "cho-duyet" }, // cho-duyet | thanh-cong | that-bai
    giaTriKhaiBao: Number,
    giaTriThucNhan: Number,
    Note: String,
}, { timestamps: true });

module.exports = mongoose.model("TheDienThoai", TheDienThoaiSchema);
