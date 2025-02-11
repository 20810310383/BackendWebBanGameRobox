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
const connectDB = require('./config/connectDB');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const cron = require('node-cron');
const moment = require('moment');

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
    // { path: '/api/accadmin', router: adminRouter },   
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
];
  
routes.forEach(route => app.use(route.path, route.router));



// Sử dụng uploadRouter
app.use("/api/upload", uploadRouter); // Đặt đường dẫn cho upload


app.listen(port, () => {
    console.log("backend nodejs is running on the port:", port, `\n http://localhost:${port}`);
});
