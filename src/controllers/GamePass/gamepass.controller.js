const Gamepass = require("../../models/Gamepass");

module.exports = {
    getGamepass: async (req, res) => {
        try {
            const { page, limit, TenSP, sort, order,  } = req.query; 

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};            
            
            // tang/giam
            let sortOrder = 1; // tang dn
            if (order === 'desc') {
                sortOrder = -1; 
            }
                        
            
            let sp = await Gamepass.find(query)
                .skip(skip)
                .limit(limitNumber)
                .sort({ [sort]: sortOrder })           

            const totalGamepass = await Gamepass.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalGamepass / limitNumber); // Tính số trang

            if(sp) {
                return res.status(200).json({
                    message: "Đã tìm ra products",
                    errCode: 0,
                    data: sp,
                    totalGamepass,
                    totalPages,
                    currentPage: pageNumber,
                })
            } else {
                return res.status(500).json({
                    message: "Tìm products thất bại!",
                    errCode: -1,
                })
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }        
    },

    taoGamepass: async (req, res) => {
        try {
            const { tenGame, image, goiNap } = req.body;
    
            if (!tenGame || !Array.isArray(goiNap) || goiNap.length === 0) {
                return res.status(400).json({ message: "Vui lòng nhập đầy đủ tên game và danh sách gói nạp." });
            }
    
            const newGamepass = new Gamepass({
                tenGame,
                image,
                goiNap,
                soLuongBan: 0 // mặc định 0 khi mới tạo
            });
    
            const saved = await newGamepass.save();
    
            res.status(201).json({
                message: "✅ Gamepass đã được tạo thành công!",
                data: saved
            });
    
        } catch (err) {
            console.error("❌ Lỗi khi tạo gamepass:", err);
            res.status(500).json({ message: "Lỗi server khi tạo gamepass." });
        }
    },

    suaGamepass: async (req, res) => {
        try {
            const { tenGame, image, goiNap, _id } = req.body;
    
            const gamepass = await Gamepass.findById(_id);
            if (!gamepass) return res.status(404).json({ message: "❌ Không tìm thấy gamepass." });
    
            // Cập nhật trường
            if (tenGame !== undefined) gamepass.tenGame = tenGame;
            if (image !== undefined) gamepass.image = image;
            if (goiNap !== undefined) gamepass.goiNap = goiNap;
    
            const updated = await gamepass.save();
    
            res.status(201).json({
                message: "✅ Đã cập nhật gamepass thành công!",
                data: updated
            });
        } catch (err) {
            console.error("❌ Lỗi khi sửa gamepass:", err);
            res.status(500).json({ message: "Lỗi server khi cập nhật gamepass." });
        }
    },

    xoaGamepass: async (req, res) => {
        try {
            const { id } = req.params;
    
            const deleted = await Gamepass.findByIdAndDelete(id);
            if (!deleted) return res.status(404).json({ message: "❌ Không tìm thấy gamepass để xoá." });
    
            res.json({
                message: "🗑️ Đã xoá gamepass thành công!",
                data: deleted
            });
        } catch (err) {
            console.error("❌ Lỗi khi xoá gamepass:", err);
            res.status(500).json({ message: "Lỗi server khi xoá gamepass." });
        }
    },
}