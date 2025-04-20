const express = require("express");
const { getTheDienThoai, getOneTheDienThoai, updateTheDienThoai, khoaTheDienThoai, deleteTheDienThoai, createTheDienThoai, tuDongCongTienChoKhach, getLichSuNap } = require("../controllers/TheDienThoai/thedienthoai.controller");

const router = express.Router();

router.get("/get-thedt", getTheDienThoai);
router.get("/get-lichsunap", getLichSuNap);
router.get("/card-callback", tuDongCongTienChoKhach);

router.get("/get-one-thedt", getOneTheDienThoai);

router.post("/create-thedt", createTheDienThoai);

router.put("/update-thedt", updateTheDienThoai);

router.put("/khoa-thedt", khoaTheDienThoai);

router.delete("/delete-thedt/:id", deleteTheDienThoai);

module.exports = router;
