const mongoose = require('mongoose')

const LoaiSP_Schema = new mongoose.Schema(
    {
        Icon: String,
        TenLoaiSP: { type: String, required: false },
        totalProducts: { type: Number, default: 0 },  // Thay đổi từ String sang Number
    },
    { 
        timestamps: true,   // createAt, updateAt
    },

);

const LoaiSP = mongoose.model('LoaiSP', LoaiSP_Schema);

module.exports = LoaiSP;