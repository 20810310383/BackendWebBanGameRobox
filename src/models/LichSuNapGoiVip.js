const mongoose = require('mongoose')

const LichSuNapGoiVip_Schema = new mongoose.Schema(
    {        
        IdKH: {ref: "AccKH", type: mongoose.SchemaTypes.ObjectId},  
        SoRobux: { type: String },  
        ThanhTien: { type: Number },  
        TenDangNhap: { type: String },            
        MatKhau: { type: String },          
        TenGamePassCanGift: { type: String }, 
        GhiChu: { type: String, default: "" },  
        isActive: { type: Boolean, default: false},       
    },
    { 
        timestamps: true,   // createAt, updateAt
    },
);

const LichSuNapGoiVip = mongoose.model('LichSuNapGoiVip', LichSuNapGoiVip_Schema);

module.exports = LichSuNapGoiVip;