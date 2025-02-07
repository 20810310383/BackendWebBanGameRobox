const GiaRobux = require("../../models/GiaRobux")

module.exports = {
    findOneGiaRobux: async (req, res) => {
        let findRobux = await GiaRobux.find({})
        if(findRobux) {
            return res.status(200).json({
                message: "Đã tìm ra findRobux",
                errCode: 0,
                data: findRobux,                   
            })
        } else {
            return res.status(500).json({
                message: "Tìm findRobux thất bại!",
                errCode: -1,
            })
        }
    },

    createRobux: async (req, res) => {
        let giaRobux = req.body.giaRobux
        let findRobux = await GiaRobux.create({giaRobux})

        if(findRobux) {
            return res.status(200).json({
                message: "Tạo giá Robux thành công",
                errCode: 0,
                data: findRobux,                   
            })
        } else {
            return res.status(500).json({
                message: "Tạo giá Robux thất bại!",
                errCode: -1,
            })
        }
    },

    updateRobux: async (req, res) => {
        let _id = req.body._id
        let giaRobux = req.body.giaRobux
        
        let findRobux = await GiaRobux.updateOne({_id: _id}, {giaRobux})

        if(findRobux) {
            return res.status(200).json({
                message: "Sửa giá Robux thành công",
                errCode: 0,
                data: findRobux,                   
            })
        } else {
            return res.status(500).json({
                message: "Sửa giá Robux thất bại!",
                errCode: -1,
            })
        }
    },
}