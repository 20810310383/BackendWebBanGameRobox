const express = require("express");
const { rutTienCTV, deleteLichSuRutTien, khoaLichSuRutTien, getLichSuRutTien } = require("../controllers/RutTien/ruttien.controller");

const router = express.Router();

router.post("/rut-tien-ctv", rutTienCTV );

router.delete("/delete-rut-tien-ctv/:id", deleteLichSuRutTien);

router.put("/khoa-rut-tien-ctv", khoaLichSuRutTien);

router.get("/get-rut-tien-ctv", getLichSuRutTien);

module.exports = router;