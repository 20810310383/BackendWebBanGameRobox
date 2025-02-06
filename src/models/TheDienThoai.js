const mongoose = require('mongoose')

const TheDienThoai_Schema = new mongoose.Schema(
    {
        Seri: { type: Number, required: false },
        MaThe: { type: Number, required: false },
        Note: { type: String, required: false, default: "" },
        IdKH: {ref: "AccKH", type: mongoose.SchemaTypes.ObjectId},
        isActive: { type: Boolean, default: false},     
    },
    { 
        timestamps: true,   // createAt, updateAt
    },
);

const TheDienThoai = mongoose.model('TheDienThoai', TheDienThoai_Schema);

module.exports = TheDienThoai;