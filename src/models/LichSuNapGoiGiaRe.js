const mongoose = require('mongoose')

const LichSuNapGoiGiaRe_Schema = new mongoose.Schema(
    {        
        IdKH: {ref: "AccKH", type: mongoose.SchemaTypes.ObjectId},  
        SoRobux: { type: String },  
        ThanhTien: { type: Number },  
        TenDangNhap: { type: String },  
        MatKhau: { type: String },  
        GhiChu: { type: String, default: "" },  
        isActive: { type: Boolean, default: false},       
    },
    { 
        timestamps: true,   // createAt, updateAt
    },
);

const LichSuNapGoiGiaRe = mongoose.model('LichSuNapGoiGiaRe', LichSuNapGoiGiaRe_Schema);

module.exports = LichSuNapGoiGiaRe;