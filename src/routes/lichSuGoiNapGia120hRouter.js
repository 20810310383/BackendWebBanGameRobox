const express = require("express");
const { muaGoiNap120hTuTaiKhoan, editTrangThai120h, getAllLsu120h, deleteLichSuNapGoi120h, updateLichSuNapGoi120h } = require("../controllers/LichSuNapGoiGiaRe/lich.su.nap.goi.120h.controller");

const router = express.Router();

router.post("/create-donhang-120h", muaGoiNap120hTuTaiKhoan);

router.put("/edit-trang-thai-120h", editTrangThai120h);

router.put("/update-ghi-chu-120h", updateLichSuNapGoi120h);

router.get("/get-all-lsu-120h", getAllLsu120h);

router.delete("/delete-lsu-120h/:id", deleteLichSuNapGoi120h);

module.exports = router;
