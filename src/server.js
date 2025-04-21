const express = require('express');
const bodyParser = require('body-parser');
const viewEngine = require('./config/viewEngine');
const uploadRouter = require('./routes/uploadRouter');
const productRouter = require('./routes/productRouter');
const categoryRouter = require('./routes/theLoaiRouter');
const khRouter = require('./routes/loginKHRouter');
const adminRouter = require('./routes/loginAdminRouter');
const muaHangRouter = require('./routes/muaHangRouter');
const hopQuaRouter = require('./routes/hopQuaRouter');
const theDTRouter = require('./routes/theDTRouter');
const goiNapRouter = require('./routes/goiNapRouter');
const lichSuGoiNapGiaReRouter = require('./routes/lichSuGoiNapGiaRe');
const lichSuGoiNapGiaVipRouter = require('./routes/lichSuGoiNapGiaVipRouter');
const lichSuGoiNapGia120hRouter = require('./routes/lichSuGoiNapGia120hRouter');
const giaRobuxRouter = require('./routes/giaRobuxRouter');
const loginCTVRouter = require('./routes/loginCTVRouter');
const rutTienCTVRouter = require('./routes/rutTienCTVRouter');
const giftRouter = require('./routes/giftRouter');
const loaiTuiMuRouter = require('./routes/loaiTuiMuRouter');
const gamepassRouter = require('./routes/gamePassRouter');
const connectDB = require('./config/connectDB');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment');
const AccKH = require('./models/AccKH');
const LichSuNapGoi120h = require('./models/LichSuNapGoi120h');
const LichSuNapGoiVip = require('./models/LichSuNapGoiVip');

require("dotenv").config();

let app = express();
let port = process.env.PORT || 6969;
const hostname = process.env.HOST_NAME;

connectDB();

// Cài đặt CORS
const allowedOrigins = [
    'http://localhost:3032', 
    'http://localhost:3033', // Local development    
    'http://localhost:3034', // Local development    
    'https://www.shoprobux.store',
    'https://adminshopgame.shoprobux.store',   
    'https://ctvshopgame.shoprobux.store',   
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) { // Dùng includes thay cho indexOf
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,    
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],  // Cho phép phương thức OPTIONS (preflight)
    allowedHeaders: ['Content-Type', 'Authorization', 'upload-type'],
}));
app.options('*', cors()); // Enable preflight requests for all routes



// Config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Đặt thư mục public/uploads làm public để có thể truy cập
app.use('/uploads', express.static(path.join(__dirname, './public/uploads')));


// Config app
viewEngine(app);

const routes = [
    { path: '/api/product', router: productRouter }, 
    { path: '/api/category', router: categoryRouter },
    { path: '/api/kh', router: khRouter },
    { path: '/api/admin', router: adminRouter },
    { path: '/api/order', router: muaHangRouter },
    { path: '/api/hopqua', router: hopQuaRouter },
    { path: '/api/thedt', router: theDTRouter },
    { path: '/api/goinap', router: goiNapRouter },
    { path: '/api/lichsugoigiare', router: lichSuGoiNapGiaReRouter },
    { path: '/api/goivip', router: lichSuGoiNapGiaVipRouter },
    { path: '/api/120h', router: lichSuGoiNapGia120hRouter },
    { path: '/api/giarobux', router: giaRobuxRouter },
    { path: '/api/ctv', router: loginCTVRouter },
    { path: '/api/ruttien', router: rutTienCTVRouter },
    { path: '/api/gift', router: giftRouter },
    { path: '/api/loaituimu', router: loaiTuiMuRouter },
    { path: '/api/gamepass', router: gamepassRouter },
];
  
routes.forEach(route => app.use(route.path, route.router));

// Hàm tạo tài khoản tự động
let intervalTime = 60000; // Mặc định 60s
let customName = null;
let interval = null;
function getRandomName() {
    if (!customName) return `user${Date.now()}`; 
    let nameArray = customName.split(",").map(name => name.trim()); // Tách chuỗi thành mảng
    return nameArray[Math.floor(Math.random() * nameArray.length)]; // Chọn ngẫu nhiên 1 tên bot
}

async function autoRegisterAndPurchase() {
    try {
        console.log("Đang tạo tài khoản tự động...");

        // 1️⃣ Tạo tài khoản mới
        const name = getRandomName();
        const newUser = await AccKH.create({
            name: name, // Tạo tên random
            email: `user${Date.now()}@example.com`,
            password: "123456", // Mật khẩu mặc định
            soDu: 1000, // Tặng 500K vào tài khoản để có thể mua
        });

        console.log(`✅ Tài khoản mới đã được tạo: ${newUser.name} - ID: ${newUser._id}`);

        // 2️⃣ Mua gói nạp ngay lập tức
        const robuxOptions = [77, 154, 385, 769, 1535, 3846, 7692];
        // Hàm chọn số Robux ngẫu nhiên
        function getRandomRobux() {
            return robuxOptions[Math.floor(Math.random() * robuxOptions.length)];
        }
        const ThanhTien = 100; // Số tiền gói nạp
        // Khi khách mua, hệ thống sẽ chọn số Robux ngẫu nhiên
        const SoRobux = getRandomRobux();
        console.log("Số Robux được chọn:", SoRobux);
        const TenDangNhap = newUser.name;
        const TenGamePassCanGift = `Gói Robux ${SoRobux}`;
        const GhiChu = "BOT Tự động mua gói nạp";

        if (newUser.soDu < ThanhTien) {
            console.log("❌ Số dư không đủ để mua gói nạp!");
            return;
        }

        // Trừ tiền từ tài khoản
        let soDuUpdate = newUser.soDu - ThanhTien;
        await AccKH.findByIdAndUpdate(newUser._id, { soDu: soDuUpdate });

        // Lưu giao dịch vào lịch sử
        const luuCSDL = await LichSuNapGoi120h.create({
            IdKH: newUser._id,
            SoRobux: SoRobux,
            ThanhTien: ThanhTien,
            TenDangNhap: TenDangNhap,
            TenGamePassCanGift: TenGamePassCanGift,
            GhiChu: GhiChu,
        });

        let luuCSDL1 = await LichSuNapGoiVip.create({
            IdKH: newUser._id,
            SoRobux: SoRobux, 
            ThanhTien: ThanhTien, 
            TenDangNhap: TenDangNhap,                 
            MatKhau: 'MatKhau BOT', 
            TenGamePassCanGift: TenGamePassCanGift, 
            GhiChu: GhiChu, 
        })

        console.log(`💰 Tự động mua gói nạp: ${SoRobux} Robux với giá ${ThanhTien.toLocaleString('vi-VN')}đ`);

    } catch (error) {
        console.error("❌ Lỗi khi tạo tài khoản hoặc mua gói nạp:", error);
    }
}

// Khởi động lại interval
function restartAutoBot() {
    if (interval) clearInterval(interval);
    interval = setInterval(autoRegisterAndPurchase, intervalTime);
    console.log(`🔄 Đã cập nhật interval thành ${intervalTime / 1000}s`);
}
// API cho admin cập nhật
app.post("/api/set-autobot", (req, res) => {
    const { customName: newCustomName, intervalTime: newIntervalTime } = req.body;

    if (newIntervalTime < 10000) {
        return res.status(400).json({ message: "⛔ Thời gian chạy tối thiểu là 10 giây!" });
    }

    customName = newCustomName || null;
    intervalTime = newIntervalTime;
    restartAutoBot();

    res.status(200).json({ message: "✅ Cập nhật thành công!" });
});
// Chạy mỗi 5 phút (300.000ms = 5 phút) 1p = 60.000 ms
// setInterval(autoRegisterAndPurchase, 60000);

// Sử dụng uploadRouter
app.use("/api/upload", uploadRouter); // Đặt đường dẫn cho upload


app.listen(port, () => {
    console.log("backend nodejs is running on the port:", port, `\n http://localhost:${port}`);
});
