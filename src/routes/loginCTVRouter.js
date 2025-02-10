const express = require("express");
const { registerCTV, getCTV, updatectv, khoaCTV, deleteCTV, getOneCTV } = require("../controllers/CongTacVien/ctv.controller");

const router = express.Router();

// route đăng nhập ctv
// router.post("/login-ctv", loginAccctv);

// route register ctv
router.post("/register-ctv", registerCTV);

// route logout  ctv
// router.post("/logout-ctv", logoutctv);

// router.post("/quen-mat-ctvau", quenMatctvauctv);

router.get("/get-ctv", getCTV);
router.get("/get-one-ctv", getOneCTV);

router.put("/update-ctv", updatectv);

router.put("/khoa-ctv", khoaCTV);

router.delete("/delete-ctv/:id", deleteCTV);

// // đổi thông tin ctvách hàng
// router.put("/doi-thong-tin", doiThongTinctv)

module.exports = router;
