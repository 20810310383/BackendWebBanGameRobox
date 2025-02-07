const mongoose = require('mongoose')

const GiaRobux_Schema = new mongoose.Schema(
    {               
        GiaRobux: { type: Number },            
    },
    { 
        timestamps: true,   // createAt, updateAt
    },
);

const GiaRobux = mongoose.model('GiaRobux', GiaRobux_Schema);

module.exports = GiaRobux;