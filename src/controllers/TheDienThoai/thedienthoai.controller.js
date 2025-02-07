const TheDienThoai = require("../../models/TheDienThoai");


module.exports = {
    getTheDienThoai: async (req, res) => {
            try {
                let { page, limit, name, sort, order, idKH, locTheoLoai } = req.query;
    
                // Chuyển đổi thành số
                const pageNumber = parseInt(page, 10);
                const limitNumber = parseInt(limit, 10);
    
                // Tính toán số bản ghi bỏ qua
                const skip = (pageNumber - 1) * limitNumber;
    
                // Tạo query tìm kiếm
                const query = {};
                if (idKH) {
                    query.IdKH = idKH;  
                }
                if (name) {
                    const nameNumber = Number(name); // Chuyển thành số
                    if (!isNaN(nameNumber)) {
                        query.$or = [{ Seri: nameNumber }, { MaThe: nameNumber }];
                    }
                }
                
                if (locTheoLoai) {
                    // Chuyển 'locTheoLoai' từ string sang mảng ObjectId
                    const locTheoLoaiArray = Array.isArray(locTheoLoai) ? locTheoLoai : JSON.parse(locTheoLoai);
    
                    query.isActive = { $in: locTheoLoaiArray }; // Dùng toán tử $in để lọc theo mảng các ObjectId
                }                
    
                let sortOrder = 1; // tang dn
                if (order === "desc") {
                    sortOrder = -1;
                }
                console.log("sortOrder: ", sortOrder);
    
                let theDienThoai = await TheDienThoai.find(query).populate("IdKH")
                    .skip(skip)
                    .limit(limitNumber)
                    .sort({ [sort]: sortOrder });
    
                const totalTheDienThoai = await TheDienThoai.countDocuments(query); // Đếm tổng số chức vụ
    
                const totalPages = Math.ceil(totalTheDienThoai / limitNumber); // Tính số trang
    
                if (theDienThoai) {
                    return res.status(200).json({
                        message: "Đã tìm ra TheDienThoai",
                        errCode: 0,
                        data: theDienThoai, // Trả về các TheDienThoai có kèm tổng số sản phẩm
                        totalTheDienThoai,
                        totalPages,
                        currentPage: pageNumber,
                    });
                } else {
                    return res.status(500).json({
                        message: "Tìm TheDienThoai thất bại!",
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

    createTheDienThoai: async (req, res) => {
        try {
            let { Seri, MaThe, IdKH, NhaMang, MenhGia } = req.body;            

            let updateTL = await TheDienThoai.create({ Seri, MaThe, IdKH, NhaMang, MenhGia });

            if (updateTL) {
                return res.status(200).json({
                    data: updateTL,
                    message: "Gửi duyệt thẻ thành công",
                });
            } else {
                return res.status(404).json({
                    message: "Gửi duyệt thẻ thất bại",
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

    updateTheDienThoai: async (req, res) => {
        try {
            let { _id, Seri, MaThe, IdKH, Note, NhaMang, MenhGia } = req.body;            

            let updateTL = await TheDienThoai.updateOne(
                { _id: _id },
                { Seri, MaThe, IdKH, Note, NhaMang, MenhGia }
            );

            if (updateTL) {
                return res.status(200).json({
                    data: updateTL,
                    message: "Cập nhật thông tin thành công",
                });
            } else {
                return res.status(404).json({
                    message: "Cập nhật thông tin thất bại",
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

    khoaTheDienThoai: async (req, res) => {
        try {
            // const id = req.params.id
            const { id, isActive } = req.body;

            const updatedAccount = await TheDienThoai.findByIdAndUpdate(
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
                    .json({ message: "Không tìm thấy TheDienThoai" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }
    },

    deleteTheDienThoai: async (req, res) => {
        try {
            const _id = req.params.id;
            let xoaTL = await TheDienThoai.deleteOne({ _id: _id });

            if (xoaTL) {
                return res.status(200).json({
                    data: xoaTL,
                    message: "Bạn đã xoá thẻ điện thoại này thành công!",
                });
            } else {
                return res.status(500).json({
                    message: "Bạn đã xoá thẻ điện thoại này thất bại!",
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

    getOneTheDienThoai: async (req, res) => {
        try {
            const id = req.query.id;
            console.log("id: ", id);

            let accKH = await TheDienThoai.find({ _id: id });

            if (accKH) {
                return res.status(200).json({
                    message: "Đã tìm ra TheDienThoai",
                    errCode: 0,
                    data: accKH,
                });
            } else {
                return res.status(500).json({
                    message: "Tìm TheDienThoai thất bại!",
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
}