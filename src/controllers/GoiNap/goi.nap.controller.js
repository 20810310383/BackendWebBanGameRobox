const GoiNap = require("../../models/GoiNap");


module.exports = {
    
    getAllGoiNap: async (req, res) => {
        try {
            let { page, limit, DichVu, sort, order } = req.query;

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};
            if (DichVu) {
                query.DichVu = DichVu;  
            }

            let sortOrder = 1; // tang dn
            if (order === "desc") {
                sortOrder = -1;
            }
            console.log("sortOrder: ", sortOrder);

            let kh = await GoiNap.find(query)
                .skip(skip)
                .limit(limitNumber)
                .sort({ [sort]: sortOrder });

            const totalGoiNap = await GoiNap.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalGoiNap / limitNumber); // Tính số trang

            if (kh) {
                return res.status(200).json({
                    message: "Đã tìm ra Goi Nap",
                    errCode: 0,
                    data: kh, // Trả về các Goi Nap có kèm tổng số sản phẩm
                    totalGoiNap,
                    totalPages,
                    currentPage: pageNumber,
                });
            } else {
                return res.status(500).json({
                    message: "Tìm Goi Nap thất bại!",
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

    createGoiNap: async (req, res) => {
        try {
            let { DichVu, ThanhTien } = req.body;            

            let updateTL = await GoiNap.create({ DichVu, ThanhTien });

            if (updateTL) {
                return res.status(200).json({
                    data: updateTL,
                    message: "Tạo gói nạp thành công",
                });
            } else {
                return res.status(404).json({
                    message: "Tạo gói nạp thất bại",
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

    updateGoiNap: async (req, res) => {
        try {
            let { _id, DichVu, ThanhTien } = req.body;            

            let updateTL = await GoiNap.updateOne(
                { _id: _id },
                { DichVu, ThanhTien }
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

    deleteGoiNap: async (req, res) => {
        try {
            const _id = req.params.id;
            let xoaTL = await GoiNap.deleteOne({ _id: _id });

            if (xoaTL) {
                return res.status(200).json({
                    data: xoaTL,
                    message: "Bạn đã xoá gói nạp này thành công!",
                });
            } else {
                return res.status(500).json({
                    message: "Bạn đã xoá gói nạp này thất bại!",
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