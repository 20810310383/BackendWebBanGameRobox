const AccKH = require("../../models/AccKH");
const Gamepass = require("../../models/Gamepass");
const LichSuDonHangGamePass = require("../../models/LichSuDonHangGamePass");

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

    getDetailGamepass: async (req, res) => {
        try {
            const {idGamepass} = req.query
            console.log("id idGamepass: ", idGamepass);            

            let sp = await Gamepass.findById(idGamepass)
            if(sp) {
                return res.status(200).json({
                    data: sp,
                    message: "Đã có thông tin chi tiết!"
                })
            } else {
                return res.status(500).json({
                    message: "Thông tin chi tiết thất bại!"
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

    muahangGamePass: async (req, res) => {
        try {
            const {
                userId,
                gamepassId,
                goiNap,
                username,
                password,
                ma2fa,
                note
            } = req.body;
    
            // Lấy thông tin người dùng
            const user = await AccKH.findById(userId);
            if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    
            // Lấy thông tin gamepass
            const gamepass = await Gamepass.findById(gamepassId);
            if (!gamepass) return res.status(404).json({ message: 'Không tìm thấy gamepass!' });
    
            // Tìm gói nạp trong danh sách
            const selectedGoi = gamepass.goiNap.find(g => g._id.toString() === goiNap);
            if (!selectedGoi) return res.status(404).json({ message: 'Không tìm thấy gói nạp!' });
    
            const tongTien = selectedGoi.giaTien;
    
            // Kiểm tra số dư
            if (user.soDu < tongTien) {
                return res.status(400).json({ message: 'Số dư không đủ!' });
            }
    
            // Trừ số dư
            user.soDu -= tongTien;
            await user.save();
    
            // Tạo đơn hàng
            const donHang = new LichSuDonHangGamePass({
                user: userId,
                gamepass: gamepassId,
                goiNap: goiNap,
                tenTaiKhoan: username,
                matKhau: password,
                ma2FA: ma2fa,
                ghiChu: note,
                tongTien
            });
            await donHang.save();

            // Tăng số lượng bán
            gamepass.soLuongBan = (gamepass.soLuongBan || 0) + 1;
            await gamepass.save();
    
            return res.status(200).json({
                message: 'Chúc mừng bạn đã mua thành công!',
                data: donHang
            });
        } catch (error) {
            console.error('Lỗi mua gamepass:', error);
            return res.status(500).json({ message: 'Đã có lỗi xảy ra!' });
        }
    },

    getLichSuDonHangDetail: async (req, res) => {
        try {
            // Lấy toàn bộ lịch sử + populate gamepass
            const donHangs = await LichSuDonHangGamePass.find().populate('gamepass').populate('user');
    
            // Map từng đơn để gắn thêm chi tiết gói nạp
            const result = donHangs.map((don) => {
                const selectedGoiNap = don.gamepass?.goiNap?.find(
                    (goi) => goi._id.toString() === don.goiNap
                );
    
                return {
                    _id: don._id,
                    user: {
                        _id: don.user?._id,
                        name: don.user?.name,
                        email: don.user?.email
                    },
                    tenTaiKhoan: don.tenTaiKhoan,
                    matKhau: don.matKhau,
                    ma2FA: don.ma2FA,
                    ghiChu: don.ghiChu,
                    tongTien: don.tongTien,
                    createdAt: don.createdAt,
                    gamepass: {
                        _id: don.gamepass?._id,
                        tenGame: don.gamepass?.tenGame,
                        image: don.gamepass?.image,
                    },
                    goiNap: selectedGoiNap || null
                };
            });
    
            res.status(200).json({
                message: 'Lấy danh sách đơn hàng thành công!',
                data: result
            });
        } catch (error) {
            console.error('Lỗi lấy lịch sử đơn hàng:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy danh sách đơn hàng!' });
        }
    },

    getLichSuDonHangByUser: async (req, res) => {
        try {
            const { userId } = req.query;
    
            if (!userId) {
                return res.status(400).json({ message: 'Thiếu userId!' });
            }
    
            // Tìm các đơn hàng của người dùng
            const donHangs = await LichSuDonHangGamePass.find({ user: userId })
                .populate('gamepass')
                .populate('user');
    
            // Gắn thêm chi tiết gói nạp tương ứng
            const result = donHangs.map((don) => {
                const selectedGoiNap = don.gamepass?.goiNap?.find(
                    (goi) => goi._id.toString() === don.goiNap
                );
    
                return {
                    _id: don._id,
                    user: {
                        _id: don.user?._id,
                        name: don.user?.name,
                        email: don.user?.email
                    },
                    tenTaiKhoan: don.tenTaiKhoan,
                    matKhau: don.matKhau,
                    ma2FA: don.ma2FA,
                    ghiChu: don.ghiChu,
                    tongTien: don.tongTien,
                    createdAt: don.createdAt,
                    gamepass: {
                        _id: don.gamepass?._id,
                        tenGame: don.gamepass?.tenGame,
                        image: don.gamepass?.image,
                    },
                    goiNap: selectedGoiNap || null
                };
            });
    
            res.status(200).json({
                message: 'Lấy đơn hàng theo người dùng thành công!',
                data: result
            });
        } catch (error) {
            console.error('Lỗi lấy đơn hàng theo user:', error);
            res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng!' });
        }
    },

    editTrangThaiDonHangDVGamepass: async (req, res) => {
        try {
            // const id = req.params.id
            const { id, isActive } = req.body;

            const updatedAccount = await LichSuDonHangGamePass.findByIdAndUpdate(
                id,
                { isActive },
                { new: true }
            );

            if (updatedAccount) {
                return res.status(200).json({
                    message: "Cập nhật thành công",
                    data: updatedAccount,
                });
            } else {
                return res
                    .status(404)
                    .json({ message: "Không tìm thấy" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }
    },
    
}