const mongoose = require('mongoose')

const GoiNap_Schema = new mongoose.Schema(
    {
        DichVu: { type: String, required: false },
        ThanhTien: { type: Number, required: false },   
    },
    { 
        timestamps: true,   // createAt, updateAt
    },
);

const GoiNap = mongoose.model('GoiNap', GoiNap_Schema);

module.exports = GoiNap;