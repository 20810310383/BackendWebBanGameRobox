const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Secret key cho JWT
const JWT_SECRET = process.env.JWT_SECRET; 
const crypto = require('crypto');
const CongTacVien = require('../../models/CongTacVien');

module.exports = {

    loginCTV: async (req, res) => {
        const {email, password} = req.body
        console.log("email: ", email);
        try {
            // Tìm admin bằng email
            const admin = await CongTacVien.findOne({ email });
            if (!admin) {
                return res.status(401).json({ message: 'Tài khoản không tồn tại' });
            }

            if (!admin.isActive) {
                return res.status(400).json({
                    message: "Tài khoản vi phạm bị khóa hoặc Tài khoản chưa được xác thực. Vui lòng kiểm tra mã OTP."
                });
            }

            let messError = `Tài khoản này vi phạm quy định của trang và đang bị khóa! ` + '\n' + `Vui lòng liên hệ Admin!`
            if(admin.isActive === false) {
                return res.status(401).json({ message: messError });
            }

            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            console.log("admin.password: ",admin.password);
            console.log("password: ",password);
            console.log("hashedPassword: ",hashedPassword);
            console.log('EXPIRESIN:', process.env.EXPIRESIN);


            // So sánh mật khẩu với bcrypt
            const isMatch = await bcrypt.compare(password, admin.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Mật khẩu không chính xác' });
            }            

            // Tạo token JWT
            const token = jwt.sign(
                { adminId: admin._id, email: admin.email },
                JWT_SECRET,
                { expiresIn: '1m' } // Token hết hạn sau 10 phút
            );

             // Lưu token vào cookie
            res.cookie('token', token, {
                httpOnly: true, // Bảo mật hơn khi chỉ có server mới có thể truy cập cookie này
                secure: process.env.NODE_ENV === 'production', // Chỉ cho phép cookie qua HTTPS nếu là production
                maxAge: 1 * 60 * 1000, // Cookie hết hạn sau 10 phút (10 phút x 60 giây x 1000ms)
            });

            // Trả về thông tin admin (có thể trả về thông tin khác tùy nhu cầu)
            res.json({ message: 'Đăng nhập thành công', access_token: token, data: admin });
            console.log(`Đăng nhập thành công với token: ${token}`);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    },

    logoutCTV: async (req, res) => {
        try {
            // Xóa cookie chứa token
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Bảo đảm chỉ xóa cookie qua HTTPS nếu là production
            });
    
            // Trả về phản hồi thành công
            res.status(200).json({ message: 'Bạn đã đăng xuất thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Lỗi máy chủ' });
        }
    },  
    
    doiThongTinctv: async (req, res) => {
        const {_idAcc, password, passwordMoi, image, stk} = req.body 

        console.log("image: ", image);
        
        
        // một chuỗi đã được mã hóa có thể lưu vào cơ sở dữ liệu.
        const hashedPassword = await bcrypt.hash(passwordMoi, 10);

        const updateResult = await CongTacVien.updateOne(
            { _id: _idAcc }, 
            { password: hashedPassword, image, stk }
        );
        
        if(updateResult) {
            // Trả về kết quả thành công
            return res.status(200).json({
                message: "Cập nhật tài khoản khách hàng thành công!",
                data: updateResult
            });
        } else {
            return res.status(404).json({                
                message: "Chỉnh sửa thất bại"
            })
        }  
    }
}