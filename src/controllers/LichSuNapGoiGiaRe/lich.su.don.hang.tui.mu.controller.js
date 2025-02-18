const { default: mongoose } = require("mongoose");
const AccKH = require("../../models/AccKH");
const LichSuMuaTuiMu = require("../../models/LichSuMuaTuiMu");

module.exports = {

    getOneLsuMuaTuiMu: async (req, res) => {
        try {
            let { id } = req.query

            let orderSP = await LichSuMuaTuiMu.findOne({_id: id})
            .populate("customer bagType IdCTV")
            .populate("results.IdGift")

            if (orderSP) {
                return res.status(200).json({
                    message: "Đã tìm ra orderSP",
                    errCode: 0,
                    data: orderSP,
                });
            } else {
                return res.status(500).json({
                    message: "Tìm orderSP thất bại!",
                    errCode: -1,
                });
            }
            
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }
    },

    getAllDonHangMuaTuiMu: async (req, res) => {
        try {
            let {page, limit, name, sort, order, IdKH, locTheoLoai} = req.query

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);           

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};
            if (IdKH) {
                query.customer = new mongoose.Types.ObjectId(IdKH);
            }
            // if (name) {
            //     const searchKeywords = name.trim().split(/\s+/).map(keyword => {
            //         // Chuyển keyword thành regex để tìm kiếm gần đúng (không phân biệt chữ hoa chữ thường)
            //         const normalizedKeyword = keyword.toLowerCase();  // Chuyển tất cả về chữ thường để không phân biệt
            //         return {
            //             TenDangNhap: { $regex: normalizedKeyword, $options: 'i' } // 'i' giúp tìm kiếm không phân biệt chữ hoa chữ thường
            //         };
            //     });            

            //     query.$or = searchKeywords;
            // }  
            
            // if (locTheoLoai) {
            //     // Chuyển 'locTheoLoai' từ string sang mảng ObjectId
            //     const locTheoLoaiArray = Array.isArray(locTheoLoai) ? locTheoLoai : JSON.parse(locTheoLoai);

            //     query.isActive = { $in: locTheoLoaiArray }; // Dùng toán tử $in để lọc theo mảng các ObjectId
            // } 

            let sortOrder = -1; 
            if (order === "desc") {
                sortOrder = 1;
            }

            let orderSP = await LichSuMuaTuiMu.find(query)
            .populate("customer bagType IdCTV")
            .populate("results.IdGift")
            .skip(skip).limit(limitNumber).sort({ [sort]: sortOrder });       
            
            const totalLichSuMuaTuiMu = await LichSuMuaTuiMu.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalLichSuMuaTuiMu / limitNumber); // Tính số trang

            if(orderSP) {
                return res.status(200).json({
                    errCode: 0,
                    data: orderSP,     
                    totalLichSuMuaTuiMu,
                    totalPages,
                    currentPage: pageNumber,
                })
            } else {
                return res.status(500).json({
                    message: "Tìm thất bại!",
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

    editTrangThaiDonHangMuaTuiMu: async (req, res) => {
        try {
            const { id, isActive } = req.body;

            const updatedAccount = await LichSuMuaTuiMu.findByIdAndUpdate(
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
                    .json({ message: "Tài khoản không tìm thấy" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }
    },

    deleteDonHangMuaTuiMu: async (req, res) => {
        try {
            const _id = req.params.id
            let xoaTL = await LichSuMuaTuiMu.deleteOne({_id: _id})

            if(xoaTL) {
                return res.status(200).json({
                    data: xoaTL,
                    message: "Bạn đã xoá thành công!"
                })
            } else {
                return res.status(500).json({
                    message: "Bạn đã xoá thất bại!"
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

}