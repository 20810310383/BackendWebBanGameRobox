const express = require("express");
const { rutTienCTV, deleteLichSuRutTien, khoaLichSuRutTien, getLichSuRutTien } = require("../controllers/RutTien/ruttien.controller");
const { muaTui } = require("../controllers/CongTacVien/tuimu.controller");
const { getAllDonHangMuaTuiMu, deleteDonHangMuaTuiMu, editTrangThaiDonHangMuaTuiMu, getOneLsuMuaTuiMu } = require("../controllers/LichSuNapGoiGiaRe/lich.su.don.hang.tui.mu.controller");

const router = express.Router();

router.post("/rut-tien-ctv", rutTienCTV );

router.delete("/delete-rut-tien-ctv/:id", deleteLichSuRutTien);

router.put("/khoa-rut-tien-ctv", khoaLichSuRutTien);

router.get("/get-rut-tien-ctv", getLichSuRutTien);

router.post("/mua-tui-mu", muaTui);

router.get("/lsu-mua-tui-mu", getAllDonHangMuaTuiMu);

router.get("/get-one-lsu-mua-tui-mu", getOneLsuMuaTuiMu);

router.delete("/delete-ls-mua-tui-mu/:id", deleteDonHangMuaTuiMu);

router.put("/edit-trang-thai-ls-mua-tui-mu", editTrangThaiDonHangMuaTuiMu);

module.exports = router;