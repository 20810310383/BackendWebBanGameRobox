const SePayTransaction = require("../../models/SepayTransaction");
const { default: mongoose } = require("mongoose");
const CongTacVien = require("../../models/CongTacVien");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
// Secret key cho JWT
const JWT_SECRET = process.env.JWT_SECRET; 
const crypto = require('crypto');
require("dotenv").config();

module.exports = {
    getCTV: async (req, res) => {
        try {
            let { page, limit, name, sort, order } = req.query;

            // Chuyển đổi thành số
            const pageNumber = parseInt(page, 10);
            const limitNumber = parseInt(limit, 10);

            // Tính toán số bản ghi bỏ qua
            const skip = (pageNumber - 1) * limitNumber;

            // Tạo query tìm kiếm
            const query = {};
            if (name) {
                const searchKeywords = name || "";
                const keywordsArray = searchKeywords.trim().split(/\s+/);

                const searchConditions = keywordsArray.map((keyword) => ({
                    name: { $regex: keyword, $options: "i" }, // Tìm kiếm không phân biệt chữ hoa chữ thường
                }));

                query.$or = searchConditions;
            }

            let sortOrder = 1; // tang dn
            if (order === "desc") {
                sortOrder = -1;
            }
            console.log("sortOrder: ", sortOrder);

            let kh = await CongTacVien.find(query)
                .skip(skip)
                .limit(limitNumber)
                .sort({ [sort]: sortOrder });

            const totalCTV = await CongTacVien.countDocuments(query); // Đếm tổng số chức vụ

            const totalPages = Math.ceil(totalCTV / limitNumber); // Tính số trang

            if (kh) {
                return res.status(200).json({
                    message: "Đã tìm ra CongTacVien",
                    errCode: 0,
                    data: kh, // Trả về các CongTacVien có kèm tổng số sản phẩm
                    totalCTV,
                    totalPages,
                    currentPage: pageNumber,
                });
            } else {
                return res.status(500).json({
                    message: "Tìm CongTacVien thất bại!",
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

    updatectv: async (req, res) => {
        try {
            let { _id, name, email, soDu, soTienNap, image, stk } = req.body;

            console.log("soDu: ", soDu);
            console.log("soTienNap: ", soTienNap);

            let updateTL = await CongTacVien.updateOne(
                { _id: _id },
                { name, email, soDu, soTienNap, image, stk }
            );

            if (updateTL) {
                return res.status(200).json({
                    data: updateTL,
                    message: "Cập nhật số dư cho khách hàng thành công",
                });
            } else {
                return res.status(404).json({
                    message: "Cập nhật số dư cho khách hàng thất bại",
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

    khoaCTV: async (req, res) => {
        try {
            // const id = req.params.id
            const { id, isActive } = req.body;

            const updatedAccount = await CongTacVien.findByIdAndUpdate(
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

    deleteCTV: async (req, res) => {
        try {
            const _id = req.params.id;
            let xoaTL = await CongTacVien.deleteOne({ _id: _id });

            if (xoaTL) {
                return res.status(200).json({
                    data: xoaTL,
                    message: "Bạn đã xoá account CTV thành công!",
                });
            } else {
                return res.status(500).json({
                    message: "Bạn đã xoá account CTV thất bại!",
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

    getOneCTV: async (req, res) => {
        try {
            const id = req.query.id;
            console.log("id: ", id);

            let accKH = await CongTacVien.find({ _id: id });

            if (accKH) {
                return res.status(200).json({
                    message: "Đã tìm ra acc ctv",
                    errCode: 0,
                    data: accKH,
                });
            } else {
                return res.status(500).json({
                    message: "Tìm ctv thất bại!",
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

    registerCTV: async (req, res) => {
        const { email, password, name, image, stk } = req.body;
            
        try {
            // Kiểm tra xem email đã tồn tại trong cơ sở dữ liệu chưa
            let check = await CongTacVien.findOne({ email: email });
    
            if (check) {
                if (check.name !== name) {
                    return res.status(400).json({
                        success: false,
                        message: `Email ${email} đã được đăng ký với tài khoản khác. Bạn không thể đăng ký lại với tài khoản này!`
                    });
                }
                if (check.isActive) {
                    return res.status(400).json({
                        success: false,
                        message: 'Tài khoản đã tồn tại và đã được kích hoạt. Bạn không thể đăng ký lại!'
                    });
                } else {
                    // Nếu tài khoản tồn tại nhưng chưa kích hoạt, xóa OTP cũ (nếu có) trước khi tạo mã OTP mới
                    check.otp = null;  // Xóa OTP cũ
                    check.otpExpires = null;  // Xóa thời gian hết hạn OTP cũ
                    await check.save();
    
                    console.log("Xóa mã OTP cũ, tạo mã OTP mới");
                }
            } else {
                // Kiểm tra nếu tên đã tồn tại trong cơ sở dữ liệu
                let checkName = await CongTacVien.findOne({ name: name });
                
                if (checkName) {
                    // Nếu tên đã tồn tại và email khác, trả về lỗi
                    if (checkName.email !== email) {
                        return res.status(400).json({
                            success: false,
                            message: `Tài khoản "${name}" đã được đăng ký với email khác. Bạn không thể đăng ký Tài khoản này với email khác!`
                        });
                    }
                }

                // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
                const hashedPassword = await bcrypt.hash(password, 10);
    
                // Tạo tài khoản mới
                check = await CongTacVien.create({
                    email, password: hashedPassword, name, image, stk
                });
            }
               
            await check.save();

            return res.status(200).json({
                success: true,
                data: check,
                message: "Đăng ký tài khoản CTV thành công!"
                // message: "Mã OTP đã được gửi đến email của bạn. Vui lòng xác nhận OTP để xác nhận đăng ký tài khoản!"
            });

        } catch (error) {
            console.error('Lỗi trong quá trình đăng ký tài khoản: ', error);
            return res.status(500).json({ success: false, message: error.message });
        }
    },
};
