const { default: mongoose } = require("mongoose");
const AccKH = require("../../models/AccKH");
const LichSuNapGoi120h = require("../../models/LichSuNapGoi120h");

module.exports = {

    muaGoiNap120hTuTaiKhoan: async (req, res) => {
        try {
            let {IdKH, SoRobux, ThanhTien, TenDangNhap, GhiChu, TenGamePassCanGift} = req.body           

            let kh = await AccKH.findById(IdKH);

            if (!kh) {
                return res.status(404).json({
                    message: "Khách hàng không tồn tại! Vui lòng đăng nhập để tiến hành mua lại nhé!",
                    errCode: 3
                });
            }  
            if (kh.soDu < ThanhTien) {
                return res.status(404).json({
                    message: "Số dư không đủ để mua hàng, Vui lòng nạp thêm vào tài khoản để mua hàng!",
                    errCode: 4
                });
            }    
            
            let soDuUpdate = Math.floor(kh.soDu - ThanhTien);
                
            // Cập nhật số dư tài khoản của khách hàng
            kh = await AccKH.findByIdAndUpdate(
                {_id: IdKH},
                {soDu: soDuUpdate},
                {new: true}
            );

            let luuCSDL = await LichSuNapGoi120h.create({
                IdKH: IdKH, 
                SoRobux: SoRobux, 
                ThanhTien: ThanhTien, 
                TenDangNhap: TenDangNhap,                 
                TenGamePassCanGift: TenGamePassCanGift, 
                GhiChu: GhiChu, 
            })
            let formattedThanhTien = ThanhTien.toLocaleString('vi-VN') + 'đ';            
    
            let mess = `Cảm ơn bạn đã mua số lượng ${SoRobux} robux với số tiền ${formattedThanhTien} thành công! Thông tin đã được gửi đến bạn, vui lòng kiểm tra trong mục tài khoản của tôi!`;
            return res.status(200).json({
                message: mess,
                errCode: 0,
                data: luuCSDL
            });            
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }   
    },

    editTrangThai120h: async (req, res) => {
        try {
            const { id, isActive } = req.body;

            const updatedAccount = await LichSuNapGoi120h.findByIdAndUpdate(
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

    getAllLsu120h: async (req, res) => {
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
                query.IdKH = new mongoose.Types.ObjectId(IdKH);
            }
            if (name) {
                const searchKeywords = name.trim().split(/\s+/).map(keyword => {
                    // Chuyển keyword thành regex để tìm kiếm gần đúng (không phân biệt chữ hoa chữ thường)
                    const normalizedKeyword = keyword.toLowerCase();  // Chuyển tất cả về chữ thường để không phân biệt
                    return {
                        TenDangNhap: { $regex: normalizedKeyword, $options: 'i' } // 'i' giúp tìm kiếm không phân biệt chữ hoa chữ thường
                    };
                });            

                query.$or = searchKeywords;
            }  
            
            if (locTheoLoai) {
                // Chuyển 'locTheoLoai' từ string sang mảng ObjectId
                const locTheoLoaiArray = Array.isArray(locTheoLoai) ? locTheoLoai : JSON.parse(locTheoLoai);

                query.isActive = { $in: locTheoLoaiArray }; // Dùng toán tử $in để lọc theo mảng các ObjectId
            } 

            let sortOrder = -1; // tang dn
            if (order === "desc") {
                sortOrder = 1;
            }

            let orderSP = await LichSuNapGoi120h.find(query).populate("IdKH").skip(skip).limit(limitNumber).sort({ [sort]: sortOrder });       
            
            const totalLichSuNapGoi120h = await LichSuNapGoi120h.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalLichSuNapGoi120h / limitNumber); // Tính số trang

            if(orderSP) {
                return res.status(200).json({
                    errCode: 0,
                    data: orderSP,     
                    totalLichSuNapGoi120h,
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

    deleteLichSuNapGoi120h: async (req, res) => {
        try {
            const _id = req.params.id
            let xoaTL = await LichSuNapGoi120h.deleteOne({_id: _id})

            if(xoaTL) {
                return res.status(200).json({
                    data: xoaTL,
                    message: "Bạn đã xoá đơn hàng thành công!"
                })
            } else {
                return res.status(500).json({
                    message: "Bạn đã xoá đơn hàng thất bại!"
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

    updateLichSuNapGoi120h: async (req, res) => {
        try {
            let {_id, SoRobux, ThanhTien, TenDangNhap, GhiChu, TenGamePassCanGift} = req.body

            let updateTL = await LichSuNapGoi120h.updateOne({_id: _id},{SoRobux, ThanhTien, TenDangNhap, GhiChu, TenGamePassCanGift})

            if(updateTL) {
                return res.status(200).json({
                    data: updateTL,
                    message: "Chỉnh sửa ghi chú thành công"
                })
            } else {
                return res.status(404).json({                
                    message: "Chỉnh sửa ghi chú thất bại"
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