const express = require("express");
const { muaGoiNapTuTaiKhoan, editTrangThai, getAllLsuGiaRe, deleteLichSuNapGoiGiaRe, updateLichSuNapGoiGiaRe } = require("../controllers/LichSuNapGoiGiaRe/lich.su.nap.goi.gia.re.controller");

const router = express.Router();

router.post("/create-donhang-giare", muaGoiNapTuTaiKhoan);

router.put("/edit-trang-thai", editTrangThai);

router.put("/update-ghi-chu", updateLichSuNapGoiGiaRe);

router.get("/get-all-lsu-goigiare", getAllLsuGiaRe);

router.delete("/delete-lsu-goigiare/:id", deleteLichSuNapGoiGiaRe);

module.exports = router;
