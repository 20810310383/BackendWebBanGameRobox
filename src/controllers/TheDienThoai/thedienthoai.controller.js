const { default: axios } = require("axios");
const TheDienThoai = require("../../models/TheDienThoai");
const AccKH = require("../../models/AccKH");
const crypto = require("crypto");

const partner_id = "26605232751";
const partner_key = "05e982c2a98a1b2cd86df2e0ae8fdf4c";

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

    createTheDienThoai1: async (req, res) => {
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
        }
    },

    createTheDienThoai: async (req, res) => {
        try {
            let { Seri, MaThe, IdKH, NhaMang, MenhGia } = req.body;  
            const request_id = `${IdKH}_${Date.now()}`;

            // Tạo sign
            const sign = crypto
            .createHash("md5")
            .update(`${partner_key}${MaThe}${Seri}`)
            .digest("hex");

            // Gửi API lên GachThe1s
            const apiRes = await axios.post("https://gachthe1s.com/chargingws/v2", {
                request_id,
                code: MaThe,
                serial: Seri,
                telco: NhaMang,
                amount: MenhGia,
                partner_id,
                sign,
                command: "charging",
            });

            // Lưu vào database
            const saveCard = await TheDienThoai.create({
                Seri,
                MaThe,
                IdKH,
                NhaMang,
                MenhGia,
                request_id,
                response: apiRes.data, // lưu lại response gốc để dễ debug nếu cần
            });
        
            return res.status(200).json({
                message: "Thẻ đã được gửi đi xử lý",
                data: saveCard,
                apiResponse: apiRes.data,
            });

            // let updateTL = await TheDienThoai.create({ Seri, MaThe, IdKH, NhaMang, MenhGia });

            // if (updateTL) {
            //     return res.status(200).json({
            //         data: updateTL,
            //         message: "Gửi duyệt thẻ thành công",
            //     });
            // } else {
            //     return res.status(404).json({
            //         message: "Gửi duyệt thẻ thất bại",
            //     });
            // }
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: "Có lỗi xảy ra.",
                error: error.message,
            });
        }
    },

    tuDongCongTienChoKhach1: async (req, res) => {
        const { request_id, status, declared_value, amount, message } = req.query;

        console.log("🔥 Callback received with query:", req.query); // 👈 THÊM DÒNG NÀY
        console.log("request_id:", request_id);
        console.log("status:", status);
        console.log("amount:", amount);
        console.log("message:", message);
        console.log("declared_value:", declared_value);

      
        try {
            const [userId, timestamp] = request_id.split("_");
        
            if (!userId) return res.status(400).send("Invalid request_id");
        
            let trangThai = "cho-duyet";
            if (status == "1") {
                trangThai = "thanh-cong";
                // Cộng tiền
                await AccKH.findByIdAndUpdate(userId, {
                $inc: {
                    soDu: +amount,
                    soTienNap: +amount,
                },
                });
            } else {
                trangThai = "that-bai";
                console.log("❌ Gạch thẻ lỗi:", message);
            }
        
            // Cập nhật lại trạng thái thẻ
            await TheDienThoai.findOneAndUpdate(
                { request_id },
                {
                trangThai,
                giaTriKhaiBao: declared_value,
                giaTriThucNhan: amount,
                Note: message,
                },
                { new: true } // Trả về bản ghi sau khi update
            );
        
            res.send("OK");
        } catch (error) {
            console.error("❌ Lỗi callback:", error);
            res.status(500).send("Lỗi xử lý");
        }
    },
    tuDongCongTienChoKhach: async (req, res) => {
        const { request_id, status, declared_value, amount, message, code, serial } = req.query;
        console.log("🔍 Tìm thẻ với MaThe:", code, "và Seri:", serial);

        console.log("🔥 Callback received with query:", req.query);
        console.log("request_id:", request_id);
        console.log("status:", status);
        console.log("amount:", amount);
        console.log("message:", message);
        console.log("declared_value:", declared_value);
    
        try {           
            const [userId, timestamp] = request_id.split("_");
            if (!userId) return res.status(400).send("❌ Invalid request_id format");
    
            let trangThai = "cho-duyet";
            let updateData = {
                trangThai,
                giaTriKhaiBao: declared_value,
                giaTriThucNhan: amount,
                Note: message,
                isActive: false, // 👈 Mặc định là false
            };
    
            if (status == "1") {
                trangThai = "thanh-cong";
                updateData.trangThai = trangThai;
                updateData.isActive = true; // 👈 Cập nhật thêm isActive nếu thành công
    
                // ✅ Cộng tiền cho user
                await AccKH.findByIdAndUpdate(userId, {
                    $inc: {
                        soDu: +amount,
                        soTienNap: +amount,
                    },
                });
            } else {
                trangThai = "that-bai";
                updateData.trangThai = trangThai;
                console.log("❌ Gạch thẻ lỗi:", message);
            }
    
            // // ✅ Cập nhật bản ghi thẻ
            // await TheDienThoai.findOneAndUpdate(
            //     { MaThe: code, Seri: serial },
            //     updateData,
            //     { new: true }
            // );
            // const the = await TheDienThoai.findOne({
            //     MaThe: String(code).trim(),
            //     Seri: String(serial).trim(),
            // });
              
            let the = await TheDienThoai.findOne({ MaThe: code.trim(), Seri: serial.trim() });

            if (!the) {
                console.warn("⚠️ Chưa thấy, đợi 1s rồi thử lại...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                the = await TheDienThoai.findOne({ MaThe: code.trim(), Seri: serial.trim() });
            }

            if (!the) {
                console.warn("❌ Vẫn không thấy thẻ sau 2 lần thử:", code, serial);
                return res.status(404).send("Không tìm thấy thẻ");
            }

            // ✅ Nếu tới đây là chắc chắn đã tìm thấy thẻ
            console.log("✅ Tìm thấy thẻ:", the);

            const updated = await TheDienThoai.findByIdAndUpdate(
                the._id,
                updateData,
                { new: true }
            );

            console.log("📝 Đã cập nhật thẻ:", updated);

            res.send("OK");


        } catch (error) {
            console.error("❌ Lỗi callback:", error);
            res.status(500).send("Lỗi xử lý");
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


// // controllers/cardController.js
// const axios = require("axios");

// const sendCard = async (req, res) => {
//   const { userId, telco, amount, code, serial } = req.body;

//   // Tạo mã request riêng để sau biết thẻ này của user nào
//   const request_id = `${userId}_${Date.now()}`;

//   try {
//     const response = await axios.post("https://gachthe1s.com/chargingws/v2", {
//       request_id,
//       code,
//       serial,
//       telco,
//       amount,
//       partner_id: "YOUR_PARTNER_ID",
//       sign: "HASHED_SIGNATURE", // = md5(partner_id + code + serial + amount + partner_key)
//       command: "charging",
//     });

//     res.json(response.data);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Gửi thẻ thất bại" });
//   }
// };

// module.exports = { sendCard };
// // routes/callback.js
// const express = require("express");
// const router = express.Router();

// router.get("/card-callback", async (req, res) => {
//   const { request_id, status, declared_value, amount, message } = req.query;

//   console.log("Callback nhận:", req.query);

//   const [userId] = request_id.split("_");

//   if (status == 1) {
//     // Thành công, cộng tiền cho userId
//     await User.findByIdAndUpdate(userId, {
//       $inc: { balance: +amount },
//     });
//   } else {
//     // Ghi log lỗi
//     console.log("Thẻ lỗi:", message);
//   }

//   res.send("OK");
// });

// module.exports = router;
