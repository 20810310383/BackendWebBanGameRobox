const mongoose = require('mongoose')

const LichSuRutTien_Schema = new mongoose.Schema(
    {
        IdCTV: {ref: "CongTacVien", type: mongoose.SchemaTypes.ObjectId},  
        SoTienCanRut: { type: Number, default: "" },  
        isActive: { type: Boolean, default: false},  
    },
    { 
        timestamps: true,   // createAt, updateAt
    },
);

const LichSuRutTien = mongoose.model('LichSuRutTien', LichSuRutTien_Schema);

module.exports = LichSuRutTien;