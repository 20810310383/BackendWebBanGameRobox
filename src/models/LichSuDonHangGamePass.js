const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LichSuDonHangSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'AccKH', // liên kết tới người dùng
        required: true
    },
    gamepass: {
        type: Schema.Types.ObjectId,
        ref: 'Gamepass',
    },
    goiNap: {
        type: String,
    },
    tenTaiKhoan: {
        type: String,
    },
    matKhau: {
        type: String,
    },
    ma2FA: {
        type: String,
    },
    ghiChu: {
        type: String,
        default: ''
    },
    tongTien: {
        type: Number,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    isActive: { type: Boolean, default: false},
});

module.exports = mongoose.model('LichSuDonHangGamePass', LichSuDonHangSchema);
