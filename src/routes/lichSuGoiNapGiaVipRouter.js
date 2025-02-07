const express = require("express");
const { muaGoiNapVipTuTaiKhoan, editTrangThai, getAllLsuVip, deleteLichSuNapGoiVip, updateLichSuNapGoiVip } = require("../controllers/LichSuNapGoiGiaRe/lich.su.nap.goi.vip.controller");

const router = express.Router();

router.post("/create-donhang-goivip", muaGoiNapVipTuTaiKhoan);

router.put("/edit-trang-thai-goivip", editTrangThai);

router.put("/update-ghi-chu-goivip", updateLichSuNapGoiVip);

router.get("/get-all-lsu-goivip", getAllLsuVip);

router.delete("/delete-lsu-goivip/:id", deleteLichSuNapGoiVip);

module.exports = router;
