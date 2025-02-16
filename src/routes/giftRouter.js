const express = require("express");
const { getAllPhanThuong, createGift, updateGift, deleteGift } = require("../controllers/CongTacVien/phanthuong.controller");

const router = express.Router();

router.get("/get-gift", getAllPhanThuong);

router.post("/create-gift", createGift);

router.put("/update-gift", updateGift);

router.delete("/delete-gift/:id", deleteGift);

module.exports = router;
