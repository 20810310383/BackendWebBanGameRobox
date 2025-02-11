const express = require("express");
const { registerCTV, getCTV, updatectv, khoaCTV, deleteCTV, getOneCTV } = require("../controllers/CongTacVien/ctv.controller");
const { loginCTV, logoutCTV, doiThongTinctv } = require("../controllers/Login/login.ctv.controller");

const router = express.Router();

// route đăng nhập ctv
router.post("/login-ctv", loginCTV);

// route register ctv
router.post("/register-ctv", registerCTV);

// route logout  ctv
router.post("/logout-ctv", logoutCTV);


router.get("/get-ctv", getCTV);
router.get("/get-one-ctv", getOneCTV);

router.put("/update-ctv", updatectv);

router.put("/khoa-ctv", khoaCTV);

router.delete("/delete-ctv/:id", deleteCTV);

// // đổi thông tin ctv
router.put("/doi-thong-tin-ctv", doiThongTinctv)

module.exports = router;
