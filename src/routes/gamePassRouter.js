const express = require("express");
const { xoaGamepass, suaGamepass, taoGamepass, getGamepass, getDetailGamepass, muahangGamePass, getLichSuDonHangDetail, getLichSuDonHangByUser, editTrangThaiDonHangDVGamepass } = require("../controllers/GamePass/gamepass.controller");

const router = express.Router();

// find all product
router.get("/get-gamepass", getGamepass );

// tao moi product
router.post("/create-gamepass", taoGamepass );
router.post("/muahang-gamepass", muahangGamePass );

// update product
router.put("/update-gamepass", suaGamepass );

// delete product
router.delete("/delete-gamepass/:id", xoaGamepass );

router.get("/get-detail-gamepass", getDetailGamepass );

router.get("/get-all-lichsumua-gamepass", getLichSuDonHangDetail );
router.get("/get-all-lichsumua-gamepass-byUser", getLichSuDonHangByUser );

router.put("/khoa-lichsumua-gamepass", editTrangThaiDonHangDVGamepass);

module.exports = router;