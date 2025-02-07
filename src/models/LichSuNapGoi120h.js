const mongoose = require('mongoose')

const LichSuNapGoi120h_Schema = new mongoose.Schema(
    {        
        IdKH: {ref: "AccKH", type: mongoose.SchemaTypes.ObjectId},  
        SoRobux: { type: String },  
        ThanhTien: { type: Number },  
        TenDangNhap: { type: String },            
        TenGamePassCanGift: { type: String }, 
        GhiChu: { type: String, default: "" },  
        isActive: { type: Boolean, default: false},       
    },
    { 
        timestamps: true,   // createAt, updateAt
    },
);

const LichSuNapGoi120h = mongoose.model('LichSuNapGoi120h', LichSuNapGoi120h_Schema);

module.exports = LichSuNapGoi120h;