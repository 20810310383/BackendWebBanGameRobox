const mongoose = require('mongoose');

const CongTacVien_Schema = new mongoose.Schema({   
        name: { type: String },
        email: { type: String },
        fullName: { type: String },
        stk: { type: String },
        password: { type: String,  },        
        tokenAccess: { type: String },                                                       
        image: { type: String },                                                       
        otp: { type: Number },  // Thêm trường lưu mã OTP
        otpExpires: { type: Date },  // Thêm trường lưu thời gian hết hạn mã OTP
        isActive: { type: Boolean, default: true},        // Trạng thái tài khoản
        quayMayManCount: { type: Number, default: 3 },     // Thêm trường quay may mắn
        soDu: { type: Number, default: 0 }, 
        soTienNap: { type: Number, default: 0 }, 

    },
    { 
        timestamps: true,   // createAt, updateAt
    }
);

module.exports = mongoose.model("CongTacVien", CongTacVien_Schema);