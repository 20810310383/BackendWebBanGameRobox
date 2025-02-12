const CongTacVien = require("../../models/CongTacVien");
const LichSuRutTien = require("../../models/LichSuRutTien");

module.exports = {
    getLichSuRutTien: async (req, res) => {
        try {
            let { page, limit, name, sort, order, IdCTV, locTheoLoai } = req.query;

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};     
            
            if (locTheoLoai) {
                // Chuyển 'locTheoLoai' từ string sang mảng ObjectId
                const locTheoLoaiArray = Array.isArray(locTheoLoai) ? locTheoLoai : JSON.parse(locTheoLoai);

                query.isActive = { $in: locTheoLoaiArray }; // Dùng toán tử $in để lọc theo mảng các ObjectId
            } 

            if (IdCTV) {
                query.IdCTV = IdCTV; // Lọc theo IdCTV bằng
            }

            let sortOrder = 1; // tang dn
            if (order === "desc") {
                sortOrder = -1;
            }
            console.log("sortOrder: ", sortOrder);

            let kh = await LichSuRutTien.find(query).populate("IdCTV")
                .skip(skip)
                .limit(limitNumber)
                .sort({ [sort]: sortOrder });

            const totalLichSuRutTien = await LichSuRutTien.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalLichSuRutTien / limitNumber); // Tính số trang

            if (kh) {
                return res.status(200).json({
                    message: "Đã tìm ra yêu cầu rút tiền",
                    errCode: 0,
                    data: kh, // Trả về các yêu cầu rút tiền có kèm tổng số sản phẩm
                    totalLichSuRutTien,
                    totalPages,
                    currentPage: pageNumber,
                });
            } else {
                return res.status(500).json({
                    message: "Tìm khách hàng thất bại!",
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

    deleteLichSuRutTien: async (req, res) => {
        try {
            const _id = req.params.id;

            let timLichSu = await LichSuRutTien.findOne({_id: _id}).populate("IdCTV")
            if (!timLichSu) {
                return res.status(404).json({ message: "Lịch sử rút tiền không tồn tại!" });
            }

            let soTienDeHoan = timLichSu.SoTienCanRut

            // Lấy thông tin CTV và số dư hiện tại
            let timCTV = await CongTacVien.findById(timLichSu.IdCTV._id);
            if (!timCTV) {
                return res.status(404).json({ message: "Không tìm thấy CTV!" });
            }

            // Cập nhật số dư (hoàn lại tiền)
            timCTV.soDu += soTienDeHoan;
            await timCTV.save();

            let xoaTL = await LichSuRutTien.deleteOne({ _id: _id });

            if (xoaTL) {
                return res.status(200).json({
                    data: xoaTL,
                    message: "Bạn đã xoá yêu cầu rút tiền thành công và đã hoàn lại số tiền đó cho ctv!",
                });
            } else {
                return res.status(500).json({
                    message: "Bạn đã xoá yêu cầu rút tiền thất bại!",
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

    khoaLichSuRutTien: async (req, res) => {
        try {
            // const id = req.params.id
            const { id, isActive } = req.body;

            const updatedAccount = await LichSuRutTien.findByIdAndUpdate(
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

    rutTienCTV: async (req, res) => {
        try {
            let {IdCTV, SoTienCanRut} = req.body
            
            let ctv = await CongTacVien.findOne({_id: IdCTV})

            let soDuUpdate = Math.floor(ctv.soDu - SoTienCanRut);

            ctv = await CongTacVien.findByIdAndUpdate(
                {_id: IdCTV},
                {soDu: soDuUpdate},
                {new: true}
            );
            
            let luuCSDL = await LichSuRutTien.create({
                IdCTV: IdCTV, 
                SoTienCanRut: SoTienCanRut, 
            })
                
            return res.status(200).json({
                message: 'Bạn đã yêu cầu rút tiền thành công, Hãy chờ admin duyệt nhé!',
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
}