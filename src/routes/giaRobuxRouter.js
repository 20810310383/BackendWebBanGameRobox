const express = require("express");
const { findOneGiaRobux, createRobux, updateRobux } = require("../controllers/GiaRobux/giaRobux.controller");
const { findThongBaoBanner, createThongBaoBanner, updateThongBaoBanner } = require("../controllers/GiaRobux/thongBao.controller");

const router = express.Router();

router.get("/get-giarobux", findOneGiaRobux);

router.post("/create-giarobux", createRobux);

router.put("/update-giarobux", updateRobux);


router.get("/get-thong-bao-banner", findThongBaoBanner);

router.post("/create-thong-bao-banner", createThongBaoBanner);

router.put("/update-thong-bao-banner", updateThongBaoBanner);


module.exports = router;
