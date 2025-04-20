const mongoose = require('mongoose');

const GoiNapSchema = new mongoose.Schema({
    tenGoi: { type: String},     // VD: "Gói 100K"
    giaTien: { type: Number},    // VD: 100000
    moTa: { type: String },                       // VD: "Tặng thêm 20% giá trị nạp"
    uuDai: { type: String },                      // VD: "Tặng VIP 1 tháng"
});

const GamepassSchema = new mongoose.Schema(
    {
        tenGame: { type: String},
        image: { type: String }, // link ảnh (URL hoặc path)
        goiNap: [GoiNapSchema],
        soLuongBan: { type: Number},
    }, 
    {
        timestamps: true // createdAt, updatedAt
    }
);

module.exports = mongoose.model('Gamepass', GamepassSchema);
