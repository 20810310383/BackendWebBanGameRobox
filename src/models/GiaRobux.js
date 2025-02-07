const mongoose = require('mongoose')

const GiaRobux_Schema = new mongoose.Schema(
    {               
        giaRobux: { type: Number, default: 0},            
    },
    { 
        timestamps: true,   // createAt, updateAt
    },
);

const GiaRobux = mongoose.model('GiaRobux', GiaRobux_Schema);

module.exports = GiaRobux;