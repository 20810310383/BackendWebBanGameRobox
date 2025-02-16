const express = require("express");
const { rutTienCTV, deleteLichSuRutTien, khoaLichSuRutTien, getLichSuRutTien } = require("../controllers/RutTien/ruttien.controller");
const { muaTui } = require("../controllers/CongTacVien/tuimu.controller");

const router = express.Router();

router.post("/rut-tien-ctv", rutTienCTV );

router.delete("/delete-rut-tien-ctv/:id", deleteLichSuRutTien);

router.put("/khoa-rut-tien-ctv", khoaLichSuRutTien);

router.get("/get-rut-tien-ctv", getLichSuRutTien);

router.post("/mua-tui-mu", muaTui);


module.exports = router;